import type { EntityType, GeneratedEntity, Locale, ResolvedRelation } from "./model";
import { getEntityById, getPublishedEntitiesByType, getRelationsForEntity } from "./repository";
import { ENTITY_ROUTE_SEGMENTS } from "./routing";

export interface DiscoveryCategory {
  type: EntityType;
  route_segment: string;
  title: string;
  description: string;
  context_label: string | null;
  context_all_label: string | null;
}

export interface DiscoveryEntry {
  entity: GeneratedEntity;
  contexts: GeneratedEntity[];
  initial: string;
}

export interface DiscoveryFilters {
  query: string;
  context: string;
  initial: string;
}

export interface DiscoveryContextOption {
  slug: string;
  label: string;
  count: number;
}

export const DISCOVERY_PAGE_SIZE = 36;
export const DISCOVERY_FILTER_THRESHOLD = 24;

export const DISCOVERY_CATEGORIES: DiscoveryCategory[] = [
  {
    type: "region",
    route_segment: ENTITY_ROUTE_SEGMENTS.region,
    title: "Regio's",
    description: "Wijngebieden als geografische en culturele context.",
    context_label: "Bovenliggende regio",
    context_all_label: "Alle regio's",
  },
  {
    type: "appellation",
    route_segment: ENTITY_ROUTE_SEGMENTS.appellation,
    title: "Appellaties",
    description: "Beschermde herkomsten en hun plaats in het grotere geheel.",
    context_label: "Deelregio",
    context_all_label: "Alle deelregio's",
  },
  {
    type: "site",
    route_segment: ENTITY_ROUTE_SEGMENTS.site,
    title: "Wijngaardsites",
    description: "Afgebakende wijngaarden en lieux-dits binnen hun geografische context.",
    context_label: "Herkomst",
    context_all_label: "Alle herkomsten",
  },
  {
    type: "producer",
    route_segment: ENTITY_ROUTE_SEGMENTS.producer,
    title: "Producenten",
    description: "Châteaux, domeinen, estates en andere producenten.",
    context_label: "Appellation",
    context_all_label: "Alle appellations",
  },
  {
    type: "grape",
    route_segment: ENTITY_ROUTE_SEGMENTS.grape,
    title: "Druiven",
    description: "Druivenrassen, synoniemen en relevante relaties.",
    context_label: null,
    context_all_label: null,
  },
  {
    type: "vintage",
    route_segment: ENTITY_ROUTE_SEGMENTS.vintage,
    title: "Jaargangen",
    description: "Jaargangen binnen een expliciete regionale scope.",
    context_label: "Gebied",
    context_all_label: "Alle gebieden",
  },
  {
    type: "classification",
    route_segment: ENTITY_ROUTE_SEGMENTS.classification,
    title: "Classificaties",
    description: "Classificatiesystemen met duidelijke geldigheid en bronvermelding.",
    context_label: "Toepassingsgebied",
    context_all_label: "Alle toepassingsgebieden",
  },
  {
    type: "concept",
    route_segment: ENTITY_ROUTE_SEGMENTS.concept,
    title: "Concepten",
    description: "Wijnbouw, vinificatie, geologie, chemie en sensoriek.",
    context_label: null,
    context_all_label: null,
  },
];

const DISCOVERY_CATEGORY_BY_TYPE = new Map(
  DISCOVERY_CATEGORIES.map((category) => [category.type, category]),
);
const DISCOVERY_CATEGORY_BY_SEGMENT = new Map(
  DISCOVERY_CATEGORIES.map((category) => [category.route_segment, category]),
);

const CONTEXT_RELATIONS: Partial<
  Record<
    EntityType,
    {
      relations: ResolvedRelation["type"][];
      targetTypes: EntityType[];
    }
  >
> = {
  region: { relations: ["part_of"], targetTypes: ["region"] },
  appellation: { relations: ["part_of"], targetTypes: ["region"] },
  site: { relations: ["located_in", "part_of"], targetTypes: ["appellation", "region"] },
  producer: { relations: ["located_in"], targetTypes: ["appellation", "region"] },
  vintage: { relations: ["scope"], targetTypes: ["appellation", "region"] },
  classification: { relations: ["scope"], targetTypes: ["appellation", "region"] },
};

function normalizeDiscoveryValue(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("nl")
    .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function discoveryInitial(value: string): string {
  return normalizeDiscoveryValue(value).charAt(0).toLocaleUpperCase("nl") || "#";
}

function hasPartOfAncestor(entityId: string, ancestorId: string): boolean {
  const pending = [entityId];
  const visited = new Set<string>();
  while (pending.length > 0) {
    const current = pending.pop()!;
    if (visited.has(current)) continue;
    visited.add(current);
    const parents = getRelationsForEntity(current)
      .filter((relation) => relation.source === current && relation.type === "part_of")
      .map((relation) => relation.target);
    if (parents.includes(ancestorId)) return true;
    pending.push(...parents);
  }
  return false;
}

function contextEntitiesFor(entity: GeneratedEntity): GeneratedEntity[] {
  const config = CONTEXT_RELATIONS[entity.type];
  if (!config) return [];

  const contexts = getRelationsForEntity(entity.id)
    .filter((relation) => relation.source === entity.id && config.relations.includes(relation.type))
    .map((relation) => getEntityById(relation.target))
    .filter((target): target is GeneratedEntity => target !== undefined)
    .filter((target) => target.status === "active" && config.targetTypes.includes(target.type))
    .filter(
      (context, index, allContexts) =>
        allContexts.findIndex((candidate) => candidate.id === context.id) === index,
    );

  if (entity.type !== "appellation") return contexts;

  return contexts.filter((candidate) => {
    return !contexts.some(
      (other) => other.id !== candidate.id && hasPartOfAncestor(other.id, candidate.id),
    );
  });
}

const discoveryEntryCache = new Map<string, DiscoveryEntry[]>();

export function getDiscoveryCategoryByType(
  type: EntityType,
  locale: Locale = "nl",
): DiscoveryCategory {
  return localizeCategory(DISCOVERY_CATEGORY_BY_TYPE.get(type)!, locale);
}

export function getDiscoveryCategoryBySegment(
  segment: string,
  locale: Locale = "nl",
): DiscoveryCategory | undefined {
  const category = DISCOVERY_CATEGORY_BY_SEGMENT.get(segment);
  return category ? localizeCategory(category, locale) : undefined;
}

export function getDiscoveryEntries(type: EntityType, locale: Locale = "nl"): DiscoveryEntry[] {
  const cached = discoveryEntryCache.get(`${locale}:${type}`);
  if (cached) return cached;

  const entries = getPublishedEntitiesByType(type)
    .toSorted((left, right) =>
      left.names[locale].localeCompare(right.names[locale], locale, { sensitivity: "base" }),
    )
    .map((entity) => ({
      entity,
      contexts: contextEntitiesFor(entity).toSorted((left, right) =>
        left.names[locale].localeCompare(right.names[locale], locale, { sensitivity: "base" }),
      ),
      initial: discoveryInitial(entity.names[locale]),
    }));

  discoveryEntryCache.set(`${locale}:${type}`, entries);
  return entries;
}

export function discoveryContextOptions(
  entries: DiscoveryEntry[],
  locale: Locale = "nl",
): DiscoveryContextOption[] {
  const contexts = new Map<string, DiscoveryContextOption>();
  for (const entry of entries) {
    for (const context of entry.contexts) {
      const existing = contexts.get(context.slugs.en);
      contexts.set(context.slugs.en, {
        slug: context.slugs.en,
        label: context.names[locale],
        count: (existing?.count ?? 0) + 1,
      });
    }
  }
  return [...contexts.values()].toSorted((left, right) =>
    left.label.localeCompare(right.label, locale, { sensitivity: "base" }),
  );
}

export function discoveryInitials(entries: DiscoveryEntry[]): string[] {
  return [...new Set(entries.map((entry) => entry.initial))].toSorted((left, right) =>
    left.localeCompare(right, "nl", { sensitivity: "base" }),
  );
}

export function filterDiscoveryEntries(
  entries: DiscoveryEntry[],
  filters: DiscoveryFilters,
): DiscoveryEntry[] {
  const query = normalizeDiscoveryValue(filters.query);
  const tokens = query.split(" ").filter(Boolean);
  const requestedInitial = filters.initial.toLocaleUpperCase("nl");

  return entries.filter((entry) => {
    const values = [
      entry.entity.canonical_name,
      entry.entity.names.nl,
      entry.entity.names.en,
      ...(entry.entity.aliases?.nl ?? []),
      ...(entry.entity.aliases?.en ?? []),
    ].map(normalizeDiscoveryValue);
    const matchesQuery =
      tokens.length === 0 || tokens.every((token) => values.some((value) => value.includes(token)));
    const matchesContext =
      !filters.context || entry.contexts.some((context) => context.slugs.en === filters.context);
    const matchesInitial = !requestedInitial || entry.initial === requestedInitial;
    return matchesQuery && matchesContext && matchesInitial;
  });
}

const ENGLISH_CATEGORIES: Record<EntityType, Omit<DiscoveryCategory, "type" | "route_segment">> = {
  region: {
    title: "Regions",
    description: "Wine regions as geographic and cultural context.",
    context_label: "Parent region",
    context_all_label: "All regions",
  },
  appellation: {
    title: "Appellations",
    description: "Protected origins and their place in the wider landscape.",
    context_label: "Subregion",
    context_all_label: "All subregions",
  },
  site: {
    title: "Vineyard sites",
    description: "Defined vineyards and lieux-dits in their geographic context.",
    context_label: "Origin",
    context_all_label: "All origins",
  },
  producer: {
    title: "Producers",
    description: "Châteaux, domaines, estates and other wine producers.",
    context_label: "Appellation",
    context_all_label: "All appellations",
  },
  grape: {
    title: "Grapes",
    description: "Grape varieties, synonyms and their connections.",
    context_label: null,
    context_all_label: null,
  },
  vintage: {
    title: "Vintages",
    description: "Vintages within an explicit regional scope.",
    context_label: "Area",
    context_all_label: "All areas",
  },
  classification: {
    title: "Classifications",
    description: "Classification systems with clear scope and sources.",
    context_label: "Scope",
    context_all_label: "All scopes",
  },
  concept: {
    title: "Concepts",
    description: "Viticulture, winemaking, geology, chemistry and sensory science.",
    context_label: null,
    context_all_label: null,
  },
};
function localizeCategory(category: DiscoveryCategory, locale: Locale): DiscoveryCategory {
  return locale === "nl" ? category : { ...category, ...ENGLISH_CATEGORIES[category.type] };
}
export function getDiscoveryCategories(locale: Locale): DiscoveryCategory[] {
  return DISCOVERY_CATEGORIES.map((category) => localizeCategory(category, locale));
}

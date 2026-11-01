import type {
  AtlasPortal,
  AtlasPortalNode,
  AtlasPortalState,
  AtlasSceneSummary,
  Entity,
  EntityType,
  Locale,
} from "./model";

/**
 * Entity types in the Atlas portal and the relations that nest them. Today: regions nested by
 * part_of. When REG-001 decides a place level above regions (for example countries), add its
 * type here and, if it differs, its relation; it then becomes the top level of the portal.
 */
export const PORTAL_ENTITY_TYPES: EntityType[] = ["region"];
export const PORTAL_HIERARCHY_RELATIONS = ["part_of"] as const;

export interface AtlasPortalInput {
  locale: Locale;
  /** Published entities of the portal types; drafts are neither named nor counted. */
  entities: Entity[];
  /** Any entity, drafts included, to climb past a draft parent to a published ancestor. */
  getEntityById: (id: string) => Entity | undefined;
  /**
   * The repository's single rule for the scene that shows an entity (its own, or the one its
   * page embeds). The portal names that scene only when its owner is published and it draws
   * areas; otherwise it says nothing about a map it cannot honestly point to.
   */
  sceneFor: (entityId: string) => AtlasSceneSummary | undefined;
  sceneHref: (summary: AtlasSceneSummary, locale: Locale) => string;
  /** Published appellation names a scene draws, for the name filter. */
  areaNames: (summary: AtlasSceneSummary) => string[];
  pageHref: (entity: Entity, locale: Locale) => string;
}

function hierarchyTargets(entity: Entity): string[] {
  return entity.relations
    .filter((relation) => (PORTAL_HIERARCHY_RELATIONS as readonly string[]).includes(relation.type))
    .map((relation) => relation.target);
}

/**
 * Each published node's candidate parents: its nearest published ancestors through the
 * hierarchy relations, skipping drafts in between. Sorted, so everything below is independent
 * of input order.
 */
function candidateParents(
  entities: Entity[],
  published: Map<string, Entity>,
  lookup: (id: string) => Entity | undefined,
): Map<string, string[]> {
  function nearest(id: string, seen: Set<string>): string[] {
    const entity = published.get(id) ?? lookup(id);
    return (entity ? hierarchyTargets(entity) : []).flatMap((target) => {
      if (seen.has(target)) return [];
      seen.add(target);
      return published.has(target) ? [target] : nearest(target, seen);
    });
  }
  return new Map(
    entities.map((entity) => [
      entity.id,
      Array.from(new Set(nearest(entity.id, new Set([entity.id])))).sort(),
    ]),
  );
}

/** Ids on a cycle of the graph (strongly connected components larger than one node). */
function cycleMembers(graph: Map<string, string[]>): string[][] {
  const ids = Array.from(graph.keys()).sort();
  const order = new Map<string, number>();
  const low = new Map<string, number>();
  const stack: string[] = [];
  const onStack = new Set<string>();
  const components: string[][] = [];
  let counter = 0;
  function visit(id: string) {
    order.set(id, counter);
    low.set(id, counter);
    counter += 1;
    stack.push(id);
    onStack.add(id);
    for (const next of graph.get(id) ?? []) {
      if (!order.has(next)) {
        visit(next);
        low.set(id, Math.min(low.get(id)!, low.get(next)!));
      } else if (onStack.has(next)) {
        low.set(id, Math.min(low.get(id)!, order.get(next)!));
      }
    }
    if (low.get(id) === order.get(id)) {
      const component: string[] = [];
      let member: string;
      do {
        member = stack.pop()!;
        onStack.delete(member);
        component.push(member);
      } while (member !== id);
      if (component.length > 1) components.push(component.sort());
    }
  }
  for (const id of ids) if (!order.has(id)) visit(id);
  return components;
}

/**
 * Parent per node: the deepest candidate, ties by id. A containment cycle is broken
 * deterministically: in each cycle the member with the smallest id loses its edges into the
 * cycle (and is placed by its other candidates, or becomes top level), repeated until no cycle
 * remains. Nodes outside the cycle keep their place.
 */
export function placePortalNodes(candidates: Map<string, string[]>): Map<string, string> {
  const graph = new Map(
    Array.from(candidates, ([id, parents]) => [
      id,
      parents.filter((parent) => candidates.has(parent)).sort(),
    ]),
  );
  for (let cycles = cycleMembers(graph); cycles.length > 0; cycles = cycleMembers(graph)) {
    for (const cycle of cycles) {
      const detached = cycle[0];
      graph.set(
        detached,
        (graph.get(detached) ?? []).filter((parent) => !cycle.includes(parent)),
      );
    }
  }
  const depth = new Map<string, number>();
  const parentOf = new Map<string, string>();
  function depthOf(id: string): number {
    const known = depth.get(id);
    if (known !== undefined) return known;
    const parents = graph.get(id) ?? [];
    let best: string | undefined;
    let bestDepth = -1;
    for (const parent of parents) {
      const candidateDepth = depthOf(parent);
      if (candidateDepth > bestDepth) {
        best = parent;
        bestDepth = candidateDepth;
      }
    }
    if (best !== undefined) parentOf.set(id, best);
    depth.set(id, bestDepth + 1);
    return bestDepth + 1;
  }
  for (const id of Array.from(graph.keys()).sort()) depthOf(id);
  return parentOf;
}

/**
 * Assembles the portal tree from published entities and scene summaries only. A node goes under
 * its most specific published ancestor (the deepest one, ties by id) and appears once; order is
 * alphabetical per language.
 */
export function buildAtlasPortal(input: AtlasPortalInput): AtlasPortal {
  const {
    locale,
    entities,
    getEntityById: lookup,
    sceneFor,
    sceneHref,
    areaNames,
    pageHref,
  } = input;
  const published = new Map(entities.map((entity) => [entity.id, entity]));
  const parentOf = placePortalNodes(candidateParents(entities, published, lookup));

  function resolve(entity: Entity): {
    state: AtlasPortalState;
    href: string;
    pageHref?: string;
    areas: string[];
  } {
    const page = pageHref(entity, locale);
    const scene = sceneFor(entity.id);
    if (scene && scene.owner === entity.id) {
      if (scene.coverage.shown.length === 0) {
        return { state: { kind: "preparing" }, href: page, areas: [] };
      }
      return {
        state: {
          kind: "map",
          shown: scene.coverage.shown.length,
          intended: scene.coverage.intended.length,
          ...(scene.thumbnail ? { thumbnail: scene.thumbnail } : {}),
        },
        href: sceneHref(scene, locale),
        pageHref: page,
        areas: areaNames(scene),
      };
    }
    // Another region's map: named only when its owner is published and it draws areas.
    const owner = scene ? published.get(scene.owner) : undefined;
    if (scene && owner && scene.coverage.shown.length > 0) {
      return {
        state: { kind: "parent-map", parentName: owner.names[locale], sceneId: scene.id },
        href: page,
        areas: [],
      };
    }
    return { state: { kind: "text" }, href: page, areas: [] };
  }

  const collator = new Intl.Collator(locale === "nl" ? "nl-NL" : "en-GB");
  const childrenOf = new Map<string | undefined, Entity[]>();
  for (const entity of entities) {
    const parent = parentOf.get(entity.id);
    childrenOf.set(parent, [...(childrenOf.get(parent) ?? []), entity]);
  }

  let mapCount = 0;
  function node(entity: Entity): AtlasPortalNode {
    const resolved = resolve(entity);
    if (resolved.state.kind === "map") mapCount += 1;
    return {
      id: entity.id,
      name: entity.names[locale],
      matchNames: Array.from(new Set([...Object.values(entity.names), entity.canonical_name])),
      areaNames: Array.from(new Set(resolved.areas)),
      href: resolved.href,
      ...(resolved.pageHref ? { pageHref: resolved.pageHref } : {}),
      state: resolved.state,
      children: nodes(childrenOf.get(entity.id) ?? []),
    };
  }
  function nodes(list: Entity[]): AtlasPortalNode[] {
    return [...list]
      .sort(
        (left, right) =>
          collator.compare(left.names[locale], right.names[locale]) ||
          left.id.localeCompare(right.id),
      )
      .map(node);
  }

  const sections = nodes(childrenOf.get(undefined) ?? []);
  return { sections, regionCount: entities.length, mapCount };
}

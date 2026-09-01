import type { Entity, EntityType } from "./model";
import { ENTITY_TYPE_LABELS_NL } from "./routing";

export type EntityTypeFilter = EntityType | "all";

export function firstSearchParam(value: string | string[] | undefined, fallback = ""): string {
  return Array.isArray(value) ? (value[0] ?? fallback) : (value ?? fallback);
}

export function parseEntityTypeFilter(value: string): EntityTypeFilter {
  return Object.prototype.hasOwnProperty.call(ENTITY_TYPE_LABELS_NL, value)
    ? (value as EntityType)
    : "all";
}

function normalizeSearchValue(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLocaleLowerCase("nl");
}

export function filterEntities(
  entities: Entity[],
  query: string,
  type: EntityTypeFilter = "all",
): Entity[] {
  const normalizedQuery = normalizeSearchValue(query);

  return entities.filter((entity) => {
    const searchableValues = [
      entity.id,
      entity.canonical_name,
      entity.names.nl,
      entity.names.en,
      entity.slugs.nl,
      entity.slugs.en,
    ];
    const matchesQuery =
      normalizedQuery.length === 0 ||
      searchableValues.some((value) => normalizeSearchValue(value).includes(normalizedQuery));
    const matchesType = type === "all" || entity.type === type;
    return matchesQuery && matchesType;
  });
}

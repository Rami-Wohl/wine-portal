import knowledgeBaseJson from "../generated/content/knowledge-base.json";
import type {
  Entity,
  EntityType,
  GeneratedKnowledgeBase,
  GeneratedNarrative,
  ResolvedRelation,
} from "./model";
import {
  NARRATIVE_ROUTE_SEGMENTS,
  entityTypeFromRouteSegment,
} from "./routing";

const knowledgeBase = knowledgeBaseJson as GeneratedKnowledgeBase;
const entitiesById = new Map(
  knowledgeBase.entities.map((entity) => [entity.id, entity]),
);
const narrativesById = new Map(
  knowledgeBase.narratives.map((narrative) => [narrative.id, narrative]),
);
const narrativesByRoute = new Map(
  knowledgeBase.narratives.map((narrative) => [
    `${NARRATIVE_ROUTE_SEGMENTS[narrative.type]}:${narrative.slugs.nl}`,
    narrative,
  ]),
);
const forwardRelationsByEntity = new Map<string, ResolvedRelation[]>();
for (const relation of knowledgeBase.relations.forward) {
  const relations = forwardRelationsByEntity.get(relation.source) ?? [];
  relations.push(relation);
  forwardRelationsByEntity.set(relation.source, relations);
}

export function getEntities(): Entity[] {
  return knowledgeBase.entities;
}

export function getEntityById(id: string): Entity | undefined {
  return entitiesById.get(id);
}

export function getEntitiesByType(type: EntityType): Entity[] {
  return knowledgeBase.indexes.entities_by_type[type]
    .map(getEntityById)
    .filter((entity): entity is Entity => Boolean(entity));
}

export function getEntityByRoute(
  routeSegment: string,
  slug: string,
): Entity | undefined {
  const type = entityTypeFromRouteSegment(routeSegment);
  if (!type) return undefined;
  const id = knowledgeBase.indexes.localized_slugs.nl[`${type}:${slug}`];
  return id ? getEntityById(id) : undefined;
}

export function getNarratives(): GeneratedNarrative[] {
  return knowledgeBase.narratives;
}

export function getNarrativeById(id: string): GeneratedNarrative | undefined {
  return narrativesById.get(id);
}

export function getNarrativeByRoute(
  routeSegment: string,
  slug: string,
): GeneratedNarrative | undefined {
  return narrativesByRoute.get(`${routeSegment}:${slug}`);
}

export function getRelationsForEntity(entityId: string): ResolvedRelation[] {
  const forward = forwardRelationsByEntity.get(entityId) ?? [];
  const inverse = knowledgeBase.relations.inverse[entityId] ?? [];
  return [...forward, ...inverse];
}

export function getNarrativeBacklinks(entityId: string): GeneratedNarrative[] {
  return (knowledgeBase.backlinks[entityId] ?? [])
    .map(getNarrativeById)
    .filter((narrative): narrative is GeneratedNarrative => Boolean(narrative));
}

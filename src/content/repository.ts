import knowledgeBaseJson from "../generated/content/knowledge-base.json";
import type {
  EntityType,
  GeneratedEntity,
  GeneratedKnowledgeBase,
  GeneratedNarrative,
  MediaAsset,
  ResolvedRelation,
  Source,
} from "./model";
import { NARRATIVE_ROUTE_SEGMENTS, entityTypeFromRouteSegment } from "./routing";

const knowledgeBase = knowledgeBaseJson as GeneratedKnowledgeBase;
const entitiesById = new Map(knowledgeBase.entities.map((entity) => [entity.id, entity]));
const narrativesById = new Map(
  knowledgeBase.narratives.map((narrative) => [narrative.id, narrative]),
);
const sourcesById = new Map(knowledgeBase.sources.map((source) => [source.id, source]));
const mediaById = new Map(knowledgeBase.media.map((asset) => [asset.id, asset]));
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

export function getAllEntities(): GeneratedEntity[] {
  return knowledgeBase.entities;
}

export function getPublishedEntities(): GeneratedEntity[] {
  return knowledgeBase.entities.filter((entity) => entity.status === "active");
}

export function getEntityById(id: string): GeneratedEntity | undefined {
  return entitiesById.get(id);
}

export function getAllEntitiesByType(type: EntityType): GeneratedEntity[] {
  return knowledgeBase.indexes.entities_by_type[type]
    .map(getEntityById)
    .filter((entity): entity is GeneratedEntity => Boolean(entity));
}

export function getPublishedEntitiesByType(type: EntityType): GeneratedEntity[] {
  return getAllEntitiesByType(type).filter((entity) => entity.status === "active");
}

export function getEntityByRoute(routeSegment: string, slug: string): GeneratedEntity | undefined {
  const type = entityTypeFromRouteSegment(routeSegment);
  if (!type) return undefined;
  const id = knowledgeBase.indexes.localized_slugs.nl[`${type}:${slug}`];
  return id ? getEntityById(id) : undefined;
}

export function getAllNarratives(): GeneratedNarrative[] {
  return knowledgeBase.narratives;
}

export function getPublishedNarratives(): GeneratedNarrative[] {
  return knowledgeBase.narratives.filter((narrative) => narrative.status === "active");
}

export function getNarrativeById(id: string): GeneratedNarrative | undefined {
  return narrativesById.get(id);
}

export function getSourcesByIds(ids: string[]): Source[] {
  return ids.map((id) => sourcesById.get(id)).filter((source): source is Source => Boolean(source));
}

export function getMediaByIds(ids: string[]): MediaAsset[] {
  return ids.map((id) => mediaById.get(id)).filter((asset): asset is MediaAsset => Boolean(asset));
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

export function getAllNarrativeBacklinks(entityId: string): GeneratedNarrative[] {
  return (knowledgeBase.backlinks[entityId] ?? [])
    .map(getNarrativeById)
    .filter((narrative): narrative is GeneratedNarrative => Boolean(narrative));
}

export function getPublishedNarrativeBacklinks(entityId: string): GeneratedNarrative[] {
  return getAllNarrativeBacklinks(entityId).filter((narrative) => narrative.status === "active");
}

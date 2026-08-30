import knowledgeBaseJson from "../generated/content/knowledge-base.json";
import type {
  Entity,
  GeneratedKnowledgeBase,
  Narrative,
  NarrativeMention,
  ResolvedRelation,
} from "./model";

type GeneratedNarrative = Narrative & { mentions: NarrativeMention[] };

const knowledgeBase = knowledgeBaseJson as GeneratedKnowledgeBase;

export function getKnowledgeBase(): GeneratedKnowledgeBase {
  return knowledgeBase;
}

export function getEntities(): Entity[] {
  return knowledgeBase.entities;
}

export function getEntityById(id: string): Entity | undefined {
  return knowledgeBase.entities.find((entity) => entity.id === id);
}

export function getNarratives(): GeneratedNarrative[] {
  return knowledgeBase.narratives;
}

export function getNarrativeById(id: string): GeneratedNarrative | undefined {
  return knowledgeBase.narratives.find((narrative) => narrative.id === id);
}

export function getRelationsForEntity(entityId: string): ResolvedRelation[] {
  const forward = knowledgeBase.relations.forward.filter(
    (relation) => relation.source === entityId,
  );
  const inverse = knowledgeBase.relations.inverse[entityId] ?? [];
  return [...forward, ...inverse];
}

export function getNarrativeBacklinks(entityId: string): GeneratedNarrative[] {
  return (knowledgeBase.backlinks[entityId] ?? [])
    .map(getNarrativeById)
    .filter((narrative): narrative is GeneratedNarrative => Boolean(narrative));
}

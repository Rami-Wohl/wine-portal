import {
  ENTITY_TYPES,
  LOCALES,
  type EntityType,
  type Locale,
  type GeneratedEntity,
  type GeneratedKnowledgeBase,
  type LearningPath,
  type ResolvedRelation,
} from "../../../src/content/model";
import { buildSearchIndex } from "./search";
import type { LoadedContentRecords, ParsedContent } from "./types";

export function buildKnowledgeGraph(
  records: LoadedContentRecords,
  parsed: ParsedContent,
): GeneratedKnowledgeBase {
  const { entityRecords, narrativeRecords, learningPathRecords, sourceRecords, mediaRecords } =
    records;
  const { entityIds, entityContentMap, narrativeContentMap, mentionMap } = parsed;
  const entities: GeneratedEntity[] = entityRecords
    .map(({ value }) => ({
      ...value,
      content: entityContentMap.get(value.id) ?? { nl: { blocks: [] }, en: { blocks: [] } },
    }))
    .sort((left, right) => left.id.localeCompare(right.id));
  const sources = sourceRecords
    .map(({ value }) => value)
    .sort((left, right) => left.id.localeCompare(right.id));
  const media = mediaRecords
    .map(({ value }) => value)
    .sort((left, right) => left.id.localeCompare(right.id));
  const narratives = narrativeRecords
    .map(({ value }) => ({
      ...value,
      mentions: mentionMap.get(value.id) ?? [],
      content: narrativeContentMap.get(value.id) ?? { nl: { blocks: [] }, en: { blocks: [] } },
    }))
    .sort((left, right) => left.id.localeCompare(right.id));
  const learningPaths: LearningPath[] = learningPathRecords
    .map(({ value }) => value)
    .sort((left, right) => left.id.localeCompare(right.id));
  const forward: ResolvedRelation[] = entities
    .flatMap((entity) => entity.relations.map((relation) => ({ source: entity.id, ...relation })))
    .sort(
      (left, right) =>
        left.source.localeCompare(right.source) ||
        left.type.localeCompare(right.type) ||
        left.target.localeCompare(right.target),
    );
  const inverse = Object.fromEntries(
    entityIds.map((id) => [id, forward.filter((relation) => relation.target === id)]),
  );
  const backlinks = Object.fromEntries(
    entityIds.map((id) => [
      id,
      narratives
        .filter(
          (narrative) =>
            narrative.mentions.some((mention) => mention.entity_id === id) ||
            narrative.primary_entity === id ||
            narrative.related_entities.includes(id),
        )
        .map((narrative) => narrative.id),
    ]),
  );
  const entitiesByType = Object.fromEntries(
    ENTITY_TYPES.map((type) => [
      type,
      entities.filter((entity) => entity.type === type).map((entity) => entity.id),
    ]),
  ) as Record<EntityType, string[]>;
  const localizedSlugs = Object.fromEntries(
    LOCALES.map((locale) => [
      locale,
      Object.fromEntries(
        entities.map((entity) => [`${entity.type}:${entity.slugs[locale]}`, entity.id]),
      ),
    ]),
  ) as Record<Locale, Record<string, string>>;
  const learningPathSlugs = Object.fromEntries(
    LOCALES.map((locale) => [
      locale,
      Object.fromEntries(
        learningPaths.map((learningPath) => [learningPath.slugs[locale], learningPath.id]),
      ),
    ]),
  ) as Record<Locale, Record<string, string>>;
  const lessonMemberships = Object.fromEntries(
    narratives
      .filter((narrative) => narrative.type === "lesson")
      .map((narrative) => [
        narrative.id,
        learningPaths.flatMap((learningPath) =>
          learningPath.steps
            .filter((step) => step.target === narrative.id)
            .map((step) => ({ path_id: learningPath.id, step_id: step.id })),
        ),
      ]),
  );
  const geography = Object.fromEntries(
    entities
      .filter((entity) => entity.geography_id)
      .map((entity) => [entity.geography_id as string, entity.id]),
  );
  const knowledgeBase: GeneratedKnowledgeBase = {
    entities,
    narratives,
    learning_paths: learningPaths,
    sources,
    media,
    relations: { forward, inverse },
    backlinks,
    indexes: {
      entity_ids: entityIds,
      entities_by_type: entitiesByType,
      localized_slugs: localizedSlugs,
      learning_path_ids: learningPaths.map(({ id }) => id),
      learning_path_slugs: learningPathSlugs,
      lesson_memberships: lessonMemberships,
      geography,
      search: buildSearchIndex(entities, narratives, media),
    },
  };
  return knowledgeBase;
}

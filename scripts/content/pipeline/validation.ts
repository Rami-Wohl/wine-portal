import {
  LOCALES,
  type Locale,
  type ContentDocument,
  type NarrativeMention,
} from "../../../src/content/model";
import {
  findDuplicates,
  findDuplicatesWithinRecord,
  findDuplicateRelations,
  unknownReferenceMessage,
} from "./diagnostics";
import { validateMediaFiles } from "./files";
import {
  validateLocaleFiles,
  parseLocalizedContent,
  validateEntityPresentations,
} from "./documents";
import { validateContentPlans } from "./plans";
import { validateRenderedRelationUniqueness } from "./relations";
import type { LoadedContentRecords, ParsedContent } from "./types";

export async function validateContentRecords(
  records: LoadedContentRecords,
  root: string,
  requireLocalMedia: boolean,
  issues: string[],
): Promise<ParsedContent> {
  const {
    entityRecords,
    narrativeRecords,
    learningPathRecords,
    planRecords,
    sourceRecords,
    mediaRecords,
  } = records;
  findDuplicates(
    entityRecords.map(({ file, value }) => ({ key: value.id, file })),
    "entity ID",
    issues,
  );
  findDuplicates(
    narrativeRecords.map(({ file, value }) => ({ key: value.id, file })),
    "narrative ID",
    issues,
  );
  findDuplicates(
    learningPathRecords.map(({ file, value }) => ({ key: value.id, file })),
    "learning path ID",
    issues,
  );
  findDuplicates(
    sourceRecords.map(({ file, value }) => ({ key: value.id, file })),
    "source ID",
    issues,
  );
  findDuplicates(
    mediaRecords.map(({ file, value }) => ({ key: value.id, file })),
    "media ID",
    issues,
  );
  findDuplicates(
    mediaRecords.map(({ file, value }) => ({ key: value.storage_key, file })),
    "media storage key",
    issues,
  );
  await validateMediaFiles(mediaRecords, root, requireLocalMedia, issues);
  findDuplicates(
    entityRecords.flatMap(({ file, value }) =>
      value.assertions.map((assertion) => ({
        key: assertion.id,
        file,
      })),
    ),
    "assertion ID",
    issues,
  );
  findDuplicates(
    entityRecords.flatMap(({ file, value }) =>
      value.geography_id ? [{ key: value.geography_id, file }] : [],
    ),
    "geography ID",
    issues,
  );
  for (const locale of LOCALES) {
    findDuplicates(
      entityRecords.map(({ file, value }) => ({
        key: `${value.type}:${locale}:${value.slugs[locale]}`,
        file,
      })),
      `${locale} entity slug`,
      issues,
    );
    findDuplicates(
      narrativeRecords.map(({ file, value }) => ({
        key: `${value.type}:${locale}:${value.slugs[locale]}`,
        file,
      })),
      `${locale} narrative slug`,
      issues,
    );
    findDuplicates(
      learningPathRecords.map(({ file, value }) => ({
        key: `${locale}:${value.slugs[locale]}`,
        file,
      })),
      `${locale} learning path slug`,
      issues,
    );
  }
  findDuplicates(
    entityRecords.flatMap(({ file, value }) =>
      Array.from(new Set(LOCALES.map((locale) => value.slugs[locale]))).map((slug) => ({
        key: `${value.type}:${slug}`,
        file,
      })),
    ),
    "entity route slug",
    issues,
  );
  findDuplicates(
    narrativeRecords.flatMap(({ file, value }) =>
      Array.from(new Set(LOCALES.map((locale) => value.slugs[locale]))).map((slug) => ({
        key: `${value.type}:${slug}`,
        file,
      })),
    ),
    "narrative route slug",
    issues,
  );
  findDuplicates(
    learningPathRecords.flatMap(({ file, value }) =>
      Array.from(new Set(LOCALES.map((locale) => value.slugs[locale]))).map((slug) => ({
        key: slug,
        file,
      })),
    ),
    "learning path route slug",
    issues,
  );

  const entityIds = entityRecords.map(({ value }) => value.id).sort();
  const entityIdSet = new Set(entityIds);
  const narrativeById = new Map(narrativeRecords.map(({ value }) => [value.id, value]));
  const sourceIdSet = new Set(sourceRecords.map(({ value }) => value.id));
  const mediaIdSet = new Set(mediaRecords.map(({ value }) => value.id));
  const mentionMap = new Map<string, NarrativeMention[]>();
  const entityMentionMap = new Map<string, NarrativeMention[]>();
  const entityContentMap = new Map<string, Record<Locale, ContentDocument>>();
  const narrativeContentMap = new Map<string, Record<Locale, ContentDocument>>();

  for (const record of entityRecords) {
    if (!record.value.id.startsWith(`${record.value.type}.`)) {
      issues.push(
        `${record.file}: ID '${record.value.id}' does not match entity type '${record.value.type}'`,
      );
    }
    const markdownByLocale = await validateLocaleFiles(record, issues);
    findDuplicatesWithinRecord(record.value.source_refs, "source reference", record.file, issues);
    findDuplicateRelations(record, issues);
    for (const relation of record.value.relations) {
      if (!entityIdSet.has(relation.target))
        issues.push(
          `${record.file}: relation '${relation.type}': ${unknownReferenceMessage(relation.target, entityIds)}`,
        );
    }
    for (const assertion of record.value.assertions) {
      findDuplicatesWithinRecord(
        assertion.sources,
        `source reference on assertion '${assertion.id}'`,
        record.file,
        issues,
      );
    }
    for (const sourceRef of [
      ...record.value.source_refs,
      ...record.value.assertions.flatMap((assertion) => assertion.sources),
    ]) {
      if (!sourceIdSet.has(sourceRef))
        issues.push(`${record.file}: Unknown source reference '${sourceRef}'.`);
    }
    const parsed = parseLocalizedContent(
      record,
      markdownByLocale,
      "entity",
      entityIds,
      entityIdSet,
      sourceIdSet,
      mediaIdSet,
      issues,
    );
    entityContentMap.set(record.value.id, parsed.content);
    entityMentionMap.set(record.value.id, parsed.mentions);
  }

  validateRenderedRelationUniqueness(entityRecords, issues);

  for (const record of narrativeRecords) {
    const markdownByLocale = await validateLocaleFiles(record, issues);
    findDuplicatesWithinRecord(
      record.value.related_entities,
      "related entity reference",
      record.file,
      issues,
    );
    findDuplicatesWithinRecord(record.value.source_refs, "source reference", record.file, issues);
    if (
      record.value.primary_entity &&
      record.value.related_entities.includes(record.value.primary_entity)
    ) {
      issues.push(
        `${record.file}: primary entity '${record.value.primary_entity}' must not be repeated in related_entities`,
      );
    }
    const references = [record.value.primary_entity, ...record.value.related_entities].filter(
      (id): id is string => Boolean(id),
    );
    for (const reference of references) {
      if (!entityIdSet.has(reference))
        issues.push(`${record.file}: ${unknownReferenceMessage(reference, entityIds)}`);
    }
    for (const sourceRef of record.value.source_refs) {
      if (!sourceIdSet.has(sourceRef))
        issues.push(`${record.file}: Unknown source reference '${sourceRef}'.`);
    }
    const parsed = parseLocalizedContent(
      record,
      markdownByLocale,
      "narrative",
      entityIds,
      entityIdSet,
      sourceIdSet,
      mediaIdSet,
      issues,
    );
    const mentions = parsed.mentions;
    narrativeContentMap.set(record.value.id, parsed.content);
    mentionMap.set(
      record.value.id,
      mentions.sort(
        (left, right) =>
          left.locale.localeCompare(right.locale) || left.entity_id.localeCompare(right.entity_id),
      ),
    );
  }

  const knownTargets = [
    ...entityRecords.map(({ value }) => value.id),
    ...narrativeRecords.map(({ value }) => value.id),
    ...learningPathRecords.map(({ value }) => value.id),
  ].sort();
  const targetStatuses = new Map<string, "draft" | "active" | "deprecated">([
    ...entityRecords.map(({ value }) => [value.id, value.status] as const),
    ...narrativeRecords.map(({ value }) => [value.id, value.status] as const),
    ...learningPathRecords.map(({ value }) => [value.id, value.status] as const),
  ]);

  for (const record of learningPathRecords) {
    findDuplicatesWithinRecord(
      record.value.steps.map((step) => step.id),
      "step ID",
      record.file,
      issues,
    );
    findDuplicatesWithinRecord(
      record.value.steps.map((step) => step.target),
      "lesson target",
      record.file,
      issues,
    );
    findDuplicatesWithinRecord(
      record.value.completion.suggestions.map((suggestion) => suggestion.id),
      "completion suggestion ID",
      record.file,
      issues,
    );
    findDuplicatesWithinRecord(
      record.value.completion.suggestions.map((suggestion) => suggestion.target),
      "completion suggestion target",
      record.file,
      issues,
    );

    for (const step of record.value.steps) {
      const target = narrativeById.get(step.target);
      if (!target) {
        issues.push(
          `${record.file}: step '${step.id}': ${unknownReferenceMessage(step.target, knownTargets, "")}`,
        );
        continue;
      }
      if (target.type !== "lesson") {
        issues.push(
          `${record.file}: step '${step.id}' target '${step.target}' must be a narrative of type 'lesson', found '${target.type}'.`,
        );
      }
      if (record.value.status === "active" && target.status !== "active") {
        issues.push(
          `${record.file}: active learning path step '${step.id}' requires active lesson '${step.target}', found '${target.status}'.`,
        );
      }
    }

    for (const suggestion of record.value.completion.suggestions) {
      if (suggestion.target === record.value.id) {
        issues.push(
          `${record.file}: completion suggestion '${suggestion.id}' must not target its own learning path '${record.value.id}'.`,
        );
        continue;
      }
      const targetStatus = targetStatuses.get(suggestion.target);
      if (!targetStatus) {
        issues.push(
          `${record.file}: completion suggestion '${suggestion.id}': ${unknownReferenceMessage(suggestion.target, knownTargets, "")}`,
        );
        continue;
      }
      if (record.value.status === "active" && targetStatus !== "active") {
        issues.push(
          `${record.file}: active learning path completion suggestion '${suggestion.id}' requires active target '${suggestion.target}', found '${targetStatus}'.`,
        );
      }
    }
  }

  validateEntityPresentations(entityRecords, entityContentMap, issues);

  validateContentPlans(
    planRecords,
    entityRecords,
    narrativeRecords,
    entityContentMap,
    entityMentionMap,
    sourceIdSet,
    issues,
  );

  return { entityIds, entityContentMap, narrativeContentMap, mentionMap };
}

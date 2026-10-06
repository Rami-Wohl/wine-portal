import path from "node:path";
import {
  APPELLATION_OVERVIEW_DIMENSIONS,
  CONCEPT_FOCUSED_OVERVIEW_DIMENSIONS,
  CONCEPT_SYSTEM_OVERVIEW_DIMENSIONS,
  CONTENT_PLAN_SECTION_HEADINGS,
  GRAPE_OVERVIEW_DIMENSIONS,
  REGION_OVERVIEW_DIMENSIONS,
  LOCALES,
  SYMMETRIC_RELATION_TYPES,
  type Entity,
  type Narrative,
  type ContentPlan,
  type Locale,
  type ContentDocument,
  type NarrativeMention,
} from "../../../src/content/model";
import { inlineText } from "./content-text";
import { findDuplicates, findDuplicatesWithinRecord } from "./diagnostics";
import type { LoadedRecord } from "./types";

const CONTENT_PLAN_REQUIREMENTS = {
  "region-overview": {
    entityType: "region",
    dimensions: REGION_OVERVIEW_DIMENSIONS,
  },
  "appellation-overview": {
    entityType: "appellation",
    dimensions: APPELLATION_OVERVIEW_DIMENSIONS,
  },
  "grape-overview": {
    entityType: "grape",
    dimensions: GRAPE_OVERVIEW_DIMENSIONS,
  },
  "concept-system-overview": {
    entityType: "concept",
    dimensions: CONCEPT_SYSTEM_OVERVIEW_DIMENSIONS,
  },
  "concept-focused-overview": {
    entityType: "concept",
    dimensions: CONCEPT_FOCUSED_OVERVIEW_DIMENSIONS,
  },
} as const;

const symmetricRelationTypes = new Set<Entity["relations"][number]["type"]>(
  SYMMETRIC_RELATION_TYPES,
);

function hasPlannedRelation(
  records: Array<LoadedRecord<Entity>>,
  source: LoadedRecord<Entity>,
  targetId: string,
): boolean {
  if (source.value.relations.some((relation) => relation.target === targetId)) return true;

  return records.some(
    (record) =>
      record.value.id === targetId &&
      record.value.relations.some(
        (relation) =>
          relation.target === source.value.id && symmetricRelationTypes.has(relation.type),
      ),
  );
}

export function validateContentPlans(
  planRecords: Array<LoadedRecord<ContentPlan>>,
  entityRecords: Array<LoadedRecord<Entity>>,
  narrativeRecords: Array<LoadedRecord<Narrative>>,
  entityContentMap: Map<string, Record<Locale, ContentDocument>>,
  entityMentionMap: Map<string, NarrativeMention[]>,
  sourceIdSet: Set<string>,
  issues: string[],
): void {
  const entitiesById = new Map(entityRecords.map((record) => [record.value.id, record]));
  const plansByEntityId = new Map(planRecords.map((record) => [record.value.package_id, record]));
  const knownTargets = new Set([
    ...entityRecords.map((record) => record.value.id),
    ...narrativeRecords.map((record) => record.value.id),
  ]);

  findDuplicates(
    planRecords.map(({ file, value }) => ({ key: value.package_id, file })),
    "content plan package ID",
    issues,
  );

  for (const entityRecord of entityRecords) {
    if (
      entityRecord.value.status === "active" &&
      (entityRecord.value.type === "region" ||
        entityRecord.value.type === "appellation" ||
        entityRecord.value.type === "grape") &&
      !plansByEntityId.has(entityRecord.value.id)
    ) {
      issues.push(
        `${entityRecord.file}: active ${entityRecord.value.type} requires a package-local content-plan.yaml`,
      );
    }
  }

  for (const planRecord of planRecords) {
    const plan = planRecord.value;
    const entityRecord = entitiesById.get(plan.package_id);
    if (!entityRecord) {
      issues.push(
        `${planRecord.file}: package_id '${plan.package_id}' does not match a known entity`,
      );
      continue;
    }
    if (path.resolve(planRecord.directory) !== path.resolve(entityRecord.directory)) {
      issues.push(`${planRecord.file}: content plan must live beside ${entityRecord.file}`);
    }

    const requirements = CONTENT_PLAN_REQUIREMENTS[plan.archetype];
    if (entityRecord.value.type !== requirements.entityType) {
      issues.push(
        `${planRecord.file}: archetype '${plan.archetype}' requires entity type '${requirements.entityType}'`,
      );
    }

    const coverageKeys = plan.coverage.map((item) => item.key);
    findDuplicatesWithinRecord(coverageKeys, "coverage key", planRecord.file, issues);
    for (const dimension of requirements.dimensions) {
      if (!coverageKeys.includes(dimension)) {
        issues.push(`${planRecord.file}: ${plan.archetype} is missing coverage '${dimension}'`);
      }
    }
    for (const coverageKey of coverageKeys) {
      if (!(requirements.dimensions as readonly string[]).includes(coverageKey)) {
        issues.push(
          `${planRecord.file}: ${plan.archetype} does not allow coverage '${coverageKey}'`,
        );
      }
    }

    const isActive = entityRecord.value.status === "active";
    if (isActive) {
      for (const [field, status] of Object.entries(plan.review)) {
        if (status !== "complete") {
          issues.push(`${planRecord.file}: active entity requires review.${field} to be complete`);
        }
      }
    }

    const content = entityContentMap.get(plan.package_id);
    const blockIds = new Set(content?.nl.blocks.map((block) => block.id) ?? []);
    const sectionHeadingLabels = CONTENT_PLAN_SECTION_HEADINGS[plan.archetype] as Record<
      string,
      Record<Locale, string>
    >;
    for (const item of plan.coverage) {
      if (
        isActive &&
        (item.disposition === "research-gap" || item.disposition === "omitted-with-reason")
      ) {
        issues.push(
          `${planRecord.file}: active ${entityRecord.value.type} cannot leave required coverage '${item.key}' as '${item.disposition}'`,
        );
      }
      if (
        (item.disposition === "research-gap" || item.disposition === "omitted-with-reason") &&
        !item.reason
      ) {
        issues.push(`${planRecord.file}: coverage '${item.key}' requires a reason`);
      }
      if (item.disposition === "on-page" && item.block_ids.length === 0) {
        issues.push(`${planRecord.file}: on-page coverage '${item.key}' requires block_ids`);
      }
      if (
        (item.disposition === "child-entity" || item.disposition === "dated-narrative") &&
        item.target_ids.length === 0
      ) {
        issues.push(`${planRecord.file}: coverage '${item.key}' requires target_ids`);
      }
      for (const blockId of item.block_ids) {
        if (!blockIds.has(blockId)) {
          issues.push(
            `${planRecord.file}: coverage '${item.key}' references unknown block '${blockId}'`,
          );
        }
      }
      for (const locale of LOCALES) {
        const expectedLabel = sectionHeadingLabels[item.key][locale];
        for (const blockId of item.block_ids) {
          const block = content?.[locale].blocks.find((candidate) => candidate.id === blockId);
          if (block?.type !== "section") continue;
          const heading = block.nodes[0];
          if (heading?.type !== "heading") continue;
          const title = inlineText(heading.children);
          if (title !== expectedLabel && !title.startsWith(`${expectedLabel} — `)) {
            issues.push(
              `${planRecord.file}: ${locale} section '${blockId}' for coverage '${item.key}' must use '${expectedLabel}' or start with '${expectedLabel} — '`,
            );
          }
        }
      }
      for (const targetId of item.target_ids) {
        if (!knownTargets.has(targetId)) {
          issues.push(
            `${planRecord.file}: coverage '${item.key}' references unknown target '${targetId}'`,
          );
        }
      }
      if (isActive) {
        for (const [field, status] of Object.entries(item.review)) {
          if (status !== "complete") {
            issues.push(
              `${planRecord.file}: active coverage '${item.key}' requires review.${field} to be complete`,
            );
          }
        }
      }

      const evidenceSourceRefs = [
        ...item.evidence.general_synthesis.source_refs,
        ...item.evidence.specific_claims.flatMap((claim) => claim.source_refs),
      ];
      findDuplicatesWithinRecord(
        evidenceSourceRefs,
        `evidence source reference for coverage '${item.key}'`,
        planRecord.file,
        issues,
      );
      for (const sourceRef of evidenceSourceRefs) {
        if (!sourceIdSet.has(sourceRef)) {
          issues.push(`${planRecord.file}: Unknown source reference '${sourceRef}'.`);
        }
        if (!entityRecord.value.source_refs.includes(sourceRef)) {
          issues.push(
            `${planRecord.file}: evidence source '${sourceRef}' must appear in ${entityRecord.file} source_refs`,
          );
        }
      }
      for (const claim of item.evidence.specific_claims) {
        if (claim.status === "supported" && claim.source_refs.length === 0) {
          issues.push(
            `${planRecord.file}: supported specific claim '${claim.claim}' requires source_refs`,
          );
        }
        if (isActive && claim.status === "open") {
          issues.push(`${planRecord.file}: active coverage '${item.key}' contains an open claim`);
        }
      }
    }

    const dependencyIds = plan.entity_dependencies.map((dependency) => dependency.id);
    findDuplicatesWithinRecord(dependencyIds, "entity dependency", planRecord.file, issues);
    const mentions = entityMentionMap.get(plan.package_id) ?? [];
    const producerDependencyIds = new Set(
      dependencyIds.filter((dependencyId) => dependencyId.startsWith("producer.")),
    );
    for (const producerId of new Set(
      mentions
        .map((mention) => mention.entity_id)
        .filter((entityId) => entityId.startsWith("producer.")),
    )) {
      if (!producerDependencyIds.has(producerId)) {
        issues.push(
          `${planRecord.file}: linked producer '${producerId}' must be declared in entity_dependencies with its presentation`,
        );
      }
    }
    for (const dependency of plan.entity_dependencies) {
      const targetRecord = entitiesById.get(dependency.id);
      if (!targetRecord) {
        issues.push(`${planRecord.file}: Unknown entity dependency '${dependency.id}'.`);
        continue;
      }
      for (const locale of LOCALES) {
        if (targetRecord.value.names[locale] !== dependency.names[locale]) {
          issues.push(
            `${planRecord.file}: dependency '${dependency.id}' ${locale} name differs from its entity`,
          );
        }
        if (targetRecord.value.slugs[locale] !== dependency.slugs[locale]) {
          issues.push(
            `${planRecord.file}: dependency '${dependency.id}' ${locale} slug differs from its entity`,
          );
        }
      }
      if (
        dependency.presentation &&
        JSON.stringify(targetRecord.value.presentation) !== JSON.stringify(dependency.presentation)
      ) {
        issues.push(
          `${planRecord.file}: dependency '${dependency.id}' presentation differs from its entity`,
        );
      }
      if (dependency.disposition === "link" || dependency.disposition === "link-and-relation") {
        for (const locale of LOCALES) {
          if (
            !mentions.some(
              (mention) => mention.entity_id === dependency.id && mention.locale === locale,
            )
          ) {
            issues.push(
              `${planRecord.file}: dependency '${dependency.id}' must be linked in ${locale} content`,
            );
          }
        }
      }
      if (
        (dependency.disposition === "relation" || dependency.disposition === "link-and-relation") &&
        !hasPlannedRelation(entityRecords, entityRecord, dependency.id)
      ) {
        issues.push(
          `${planRecord.file}: dependency '${dependency.id}' requires an explicit relation`,
        );
      }
    }
  }
}

import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  LOCALES,
  entityPresentationMode,
  type Entity,
  type Narrative,
  type Locale,
  type ContentDocument,
  type NarrativeMention,
} from "../../../src/content/model";
import {
  parseContentDocument,
  validateLocaleParity,
  validatePublicationStructure,
} from "../markdown";
import { unknownReferenceMessage } from "./diagnostics";
import { isNodeError } from "./files";
import type { LoadedRecord } from "./types";

export async function validateLocaleFiles<T extends Entity | Narrative>(
  record: LoadedRecord<T>,
  issues: string[],
): Promise<Record<Locale, string>> {
  const markdownByLocale = {} as Record<Locale, string>;
  for (const locale of LOCALES) {
    const configuredPath = record.value.locales[locale];
    if (path.basename(configuredPath) !== configuredPath) {
      issues.push(`${record.file}: locales.${locale} must name a file inside its content package`);
      continue;
    }
    const contentPath = path.join(record.directory, configuredPath);
    try {
      markdownByLocale[locale] = await readFile(contentPath, "utf8");
    } catch (error) {
      if (isNodeError(error) && error.code === "ENOENT") {
        issues.push(
          `${record.file}: locales.${locale} references missing file '${configuredPath}'`,
        );
      } else {
        throw error;
      }
    }
  }
  return markdownByLocale;
}

export function parseLocalizedContent<T extends Entity | Narrative>(
  record: LoadedRecord<T>,
  markdownByLocale: Record<Locale, string>,
  kind: "entity" | "narrative",
  entityIds: string[],
  entityIdSet: Set<string>,
  sourceIdSet: Set<string>,
  mediaIdSet: Set<string>,
  issues: string[],
): { content: Record<Locale, ContentDocument>; mentions: NarrativeMention[] } {
  const content: Record<Locale, ContentDocument> = {
    nl: { blocks: [] },
    en: { blocks: [] },
  };
  const mentions: NarrativeMention[] = [];

  for (const locale of LOCALES) {
    if (!(locale in markdownByLocale)) continue;
    const file = `${record.file}:${record.value.locales[locale]}`;
    const parsed = parseContentDocument(markdownByLocale[locale], file, locale);
    content[locale] = parsed.document;
    mentions.push(...parsed.mentions);
    issues.push(...parsed.issues);

    for (const mention of parsed.mentions) {
      if (!entityIdSet.has(mention.entity_id)) {
        issues.push(`${file}: ${unknownReferenceMessage(mention.entity_id, entityIds)}`);
      }
    }
    for (const block of parsed.document.blocks) {
      if (block.media_id && !mediaIdSet.has(block.media_id)) {
        issues.push(`${file}: Unknown media reference '${block.media_id}'.`);
      }
      for (const sourceRef of block.source_refs) {
        if (!sourceIdSet.has(sourceRef)) {
          issues.push(`${file}: Unknown source reference '${sourceRef}'.`);
        }
        if (!record.value.source_refs.includes(sourceRef)) {
          issues.push(
            `${file}: block '${block.id}' source '${sourceRef}' must also appear in package source_refs`,
          );
        }
      }
    }
    const requiresStandalonePublication =
      kind === "narrative" || entityPresentationMode(record.value as Entity) === "monograph";
    if (record.value.status === "active" && requiresStandalonePublication) {
      issues.push(
        ...validatePublicationStructure(
          parsed.document,
          file,
          kind,
          kind === "narrative" ? (record.value as Narrative).type : undefined,
        ),
      );
    }
  }

  issues.push(...validateLocaleParity(content, record.file));
  return { content, mentions };
}

export function validateEntityPresentations(
  entityRecords: Array<LoadedRecord<Entity>>,
  entityContentMap: Map<string, Record<Locale, ContentDocument>>,
  issues: string[],
): void {
  const entitiesById = new Map(entityRecords.map((record) => [record.value.id, record]));
  const embeddedTargets = new Map<string, string>();
  const allowedOwnerTypes = new Set<Entity["type"]>(["region", "appellation", "classification"]);

  for (const record of entityRecords) {
    const entity = record.value;
    if (entity.presentation && entity.type !== "producer") {
      issues.push(`${record.file}: presentation is only supported for producer entities`);
      continue;
    }

    const mode = entityPresentationMode(entity);
    if (mode === "monograph") continue;
    const presentation = entity.presentation;
    if (!presentation || presentation.mode === "monograph") continue;

    const ownerRecord = entitiesById.get(presentation.owner);
    if (!ownerRecord) {
      issues.push(
        `${record.file}: presentation.owner references unknown entity '${presentation.owner}'`,
      );
      continue;
    }
    if (!allowedOwnerTypes.has(ownerRecord.value.type)) {
      issues.push(
        `${record.file}: ${mode} owner must be a region, appellation, or classification entity`,
      );
    }
    if (!entity.relations.some((relation) => relation.target === presentation.owner)) {
      issues.push(
        `${record.file}: ${mode} requires a canonical relation to owner '${presentation.owner}'`,
      );
    }

    const targetKey = `${presentation.owner}#${presentation.anchor}`;
    const existingTarget = embeddedTargets.get(targetKey);
    if (existingTarget) {
      issues.push(
        `${record.file}: presentation target '${targetKey}' is already used by '${existingTarget}'`,
      );
    } else {
      embeddedTargets.set(targetKey, entity.id);
    }

    const ownContent = entityContentMap.get(entity.id);
    if (ownContent && LOCALES.some((locale) => ownContent[locale].blocks.length > 0)) {
      issues.push(
        `${record.file}: ${mode} keeps prose on its owner page; its own overview files must stay empty`,
      );
    }

    if (entity.status !== "active") continue;
    if (ownerRecord.value.status !== "active") {
      issues.push(`${record.file}: active ${mode} requires active owner '${presentation.owner}'`);
    }
    const ownerContent = entityContentMap.get(presentation.owner);
    for (const locale of LOCALES) {
      if (!ownerContent?.[locale].blocks.some((block) => block.id === presentation.anchor)) {
        issues.push(
          `${record.file}: active ${mode} requires block '${presentation.anchor}' in ${presentation.owner}:${locale}`,
        );
      }
    }
  }
}

import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { z } from "zod";
import {
  ENTITY_TYPES,
  LOCALES,
  entitySchema,
  mediaAssetSchema,
  narrativeSchema,
  sourceSchema,
  type Entity,
  type EntityType,
  type ContentDocument,
  type GeneratedEntity,
  type GeneratedKnowledgeBase,
  type Locale,
  type MediaAsset,
  type Narrative,
  type NarrativeMention,
  type ResolvedRelation,
} from "../../src/content/model";
import {
  parseContentDocument,
  validateLocaleParity,
  validatePublicationStructure,
} from "./markdown";

export class ContentValidationError extends Error {
  constructor(public readonly issues: string[]) {
    super(`Content validation failed with ${issues.length} issue${issues.length === 1 ? "" : "s"}:\n\n${issues.map((issue) => `- ${issue}`).join("\n")}`);
    this.name = "ContentValidationError";
  }
}

interface LoadedRecord<T> {
  file: string;
  directory: string;
  value: T;
}

export interface BuildOptions {
  root?: string;
  write?: boolean;
  outputDirectory?: string;
  requireLocalMedia?: boolean;
}

export interface BuildResult {
  knowledgeBase: GeneratedKnowledgeBase;
  outputs: Record<string, string>;
}

const GENERATED_BUNDLE_FILENAME = "knowledge-base.json";
const RETIRED_GENERATED_FILENAMES = [
  "entities.json",
  "narratives.json",
  "sources.json",
  "relations.json",
  "backlinks.json",
  "indexes.json",
] as const;

async function discoverFiles(directory: string, filename: string): Promise<string[]> {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    const nested = await Promise.all(entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return discoverFiles(entryPath, filename);
      return entry.isFile() && entry.name === filename ? [entryPath] : [];
    }));
    return nested.flat().sort();
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") return [];
    throw error;
  }
}

async function discoverYamlFiles(directory: string): Promise<string[]> {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    const nested = await Promise.all(entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return discoverYamlFiles(entryPath);
      return entry.isFile() && /\.ya?ml$/.test(entry.name) && entry.name !== "entity.yaml" && entry.name !== "narrative.yaml" ? [entryPath] : [];
    }));
    return nested.flat().sort();
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") return [];
    throw error;
  }
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return typeof error === "object" && error !== null && "code" in error;
}

function formatZodIssues(file: string, error: z.ZodError): string[] {
  return error.issues.map((issue) => `${file}: ${issue.path.join(".") || "record"} ${issue.message}`);
}

async function loadYamlRecords<T>(files: string[], schema: z.ZodType<T>, root: string, issues: string[]): Promise<Array<LoadedRecord<T>>> {
  const records: Array<LoadedRecord<T>> = [];
  for (const file of files) {
    const relativeFile = path.relative(root, file);
    try {
      const raw: unknown = parseYaml(await readFile(file, "utf8"));
      const result = schema.safeParse(raw);
      if (!result.success) {
        issues.push(...formatZodIssues(relativeFile, result.error));
        continue;
      }
      records.push({ file: relativeFile, directory: path.dirname(file), value: result.data });
    } catch (error) {
      issues.push(`${relativeFile}: invalid YAML (${error instanceof Error ? error.message : String(error)})`);
    }
  }
  return records;
}

function levenshtein(left: string, right: string): number {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1),
      );
    }
    previous.splice(0, previous.length, ...current);
  }
  return previous[right.length];
}

function unknownReferenceMessage(reference: string, knownIds: string[]): string {
  const suggestion = knownIds
    .map((id) => ({ id, distance: levenshtein(reference, id) }))
    .sort((left, right) => left.distance - right.distance || left.id.localeCompare(right.id))[0];
  const hint = suggestion && suggestion.distance <= 4 ? ` Did you mean '${suggestion.id}'?` : "";
  return `Unknown entity reference '${reference}'.${hint}`;
}

async function validateLocaleFiles<T extends Entity | Narrative>(record: LoadedRecord<T>, issues: string[]): Promise<Record<Locale, string>> {
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
        issues.push(`${record.file}: locales.${locale} references missing file '${configuredPath}'`);
      } else {
        throw error;
      }
    }
  }
  return markdownByLocale;
}

function parseLocalizedContent<T extends Entity | Narrative>(
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
    if (record.value.status === "active") {
      issues.push(...validatePublicationStructure(
        parsed.document,
        file,
        kind,
        kind === "narrative" ? (record.value as Narrative).type : undefined,
      ));
    }
  }

  issues.push(...validateLocaleParity(content, record.file));
  return { content, mentions };
}

async function validateMediaFiles(
  records: Array<LoadedRecord<MediaAsset>>,
  root: string,
  requireLocalMedia: boolean,
  issues: string[],
): Promise<void> {
  if (!requireLocalMedia) return;
  await Promise.all(records.map(async ({ file, value }) => {
    const assetPath = path.join(root, "public", "media", value.storage_key);
    try {
      const bytes = await readFile(assetPath);
      const checksum = createHash("sha256").update(bytes).digest("hex");
      if (checksum !== value.checksum_sha256) {
        issues.push(
          `${file}: checksum_sha256 does not match public/media/${value.storage_key}`,
        );
      }
    } catch (error) {
      if (isNodeError(error) && error.code === "ENOENT") {
        issues.push(
          `${file}: storage_key '${value.storage_key}' is missing under public/media; ` +
          "set MEDIA_BASE_URL only when the same key exists in remote storage",
        );
        return;
      }
      throw error;
    }
  }));
}

function findDuplicates(values: Array<{ key: string; file: string }>, label: string, issues: string[]): void {
  const firstByKey = new Map<string, string>();
  for (const { key, file } of values) {
    const first = firstByKey.get(key);
    if (first) issues.push(`Duplicate ${label} '${key}' in ${first} and ${file}`);
    else firstByKey.set(key, file);
  }
}

function findDuplicatesWithinRecord(
  values: string[],
  label: string,
  file: string,
  issues: string[],
): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) issues.push(`${file}: Duplicate ${label} '${value}'`);
    seen.add(value);
  }
}

function findDuplicateRelations(record: LoadedRecord<Entity>, issues: string[]): void {
  const seen = new Set<string>();
  for (const relation of record.value.relations) {
    const key = JSON.stringify(relation);
    if (seen.has(key)) {
      issues.push(
        `${record.file}: Duplicate relation '${relation.type}' to '${relation.target}'`,
      );
    }
    seen.add(key);
  }
}

async function removeRetiredGeneratedFiles(outputDirectory: string): Promise<void> {
  await Promise.all(RETIRED_GENERATED_FILENAMES.map(async (filename) => {
    try {
      await unlink(path.join(outputDirectory, filename));
    } catch (error) {
      if (!isNodeError(error) || error.code !== "ENOENT") throw error;
    }
  }));
}

function stableJson(value: object): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export async function buildContent(options: BuildOptions = {}): Promise<BuildResult> {
  const root = path.resolve(options.root ?? process.cwd());
  const issues: string[] = [];
  const [entityFiles, narrativeFiles, sourceFiles, mediaFiles] = await Promise.all([
    discoverFiles(path.join(root, "content", "entities"), "entity.yaml"),
    discoverFiles(path.join(root, "content", "narratives"), "narrative.yaml"),
    discoverYamlFiles(path.join(root, "data", "sources")),
    discoverYamlFiles(path.join(root, "data", "media")),
  ]);
  const [entityRecords, narrativeRecords, sourceRecords, mediaRecords] = await Promise.all([
    loadYamlRecords(entityFiles, entitySchema, root, issues),
    loadYamlRecords(narrativeFiles, narrativeSchema, root, issues),
    loadYamlRecords(sourceFiles, sourceSchema, root, issues),
    loadYamlRecords(mediaFiles, mediaAssetSchema, root, issues),
  ]);

  findDuplicates(entityRecords.map(({ file, value }) => ({ key: value.id, file })), "entity ID", issues);
  findDuplicates(narrativeRecords.map(({ file, value }) => ({ key: value.id, file })), "narrative ID", issues);
  findDuplicates(sourceRecords.map(({ file, value }) => ({ key: value.id, file })), "source ID", issues);
  findDuplicates(mediaRecords.map(({ file, value }) => ({ key: value.id, file })), "media ID", issues);
  findDuplicates(mediaRecords.map(({ file, value }) => ({ key: value.storage_key, file })), "media storage key", issues);
  await validateMediaFiles(
    mediaRecords,
    root,
    options.requireLocalMedia ?? true,
    issues,
  );
  findDuplicates(
    entityRecords.flatMap(({ file, value }) => value.assertions.map((assertion) => ({
      key: assertion.id,
      file,
    }))),
    "assertion ID",
    issues,
  );
  findDuplicates(
    entityRecords.flatMap(({ file, value }) => value.geography_id
      ? [{ key: value.geography_id, file }]
      : []),
    "geography ID",
    issues,
  );
  for (const locale of LOCALES) {
    findDuplicates(entityRecords.map(({ file, value }) => ({ key: `${value.type}:${locale}:${value.slugs[locale]}`, file })), `${locale} entity slug`, issues);
    findDuplicates(narrativeRecords.map(({ file, value }) => ({ key: `${value.type}:${locale}:${value.slugs[locale]}`, file })), `${locale} narrative slug`, issues);
  }

  const entityIds = entityRecords.map(({ value }) => value.id).sort();
  const entityIdSet = new Set(entityIds);
  const sourceIdSet = new Set(sourceRecords.map(({ value }) => value.id));
  const mediaIdSet = new Set(mediaRecords.map(({ value }) => value.id));
  const mentionMap = new Map<string, NarrativeMention[]>();
  const entityContentMap = new Map<string, Record<Locale, ContentDocument>>();
  const narrativeContentMap = new Map<string, Record<Locale, ContentDocument>>();

  for (const record of entityRecords) {
    if (!record.value.id.startsWith(`${record.value.type}.`)) {
      issues.push(`${record.file}: ID '${record.value.id}' does not match entity type '${record.value.type}'`);
    }
    const markdownByLocale = await validateLocaleFiles(record, issues);
    findDuplicatesWithinRecord(
      record.value.source_refs,
      "source reference",
      record.file,
      issues,
    );
    findDuplicateRelations(record, issues);
    for (const relation of record.value.relations) {
      if (!entityIdSet.has(relation.target)) issues.push(`${record.file}: relation '${relation.type}': ${unknownReferenceMessage(relation.target, entityIds)}`);
    }
    for (const assertion of record.value.assertions) {
      findDuplicatesWithinRecord(
        assertion.sources,
        `source reference on assertion '${assertion.id}'`,
        record.file,
        issues,
      );
    }
    for (const sourceRef of [...record.value.source_refs, ...record.value.assertions.flatMap((assertion) => assertion.sources)]) {
      if (!sourceIdSet.has(sourceRef)) issues.push(`${record.file}: Unknown source reference '${sourceRef}'.`);
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
  }

  for (const record of narrativeRecords) {
    const markdownByLocale = await validateLocaleFiles(record, issues);
    findDuplicatesWithinRecord(
      record.value.related_entities,
      "related entity reference",
      record.file,
      issues,
    );
    findDuplicatesWithinRecord(
      record.value.source_refs,
      "source reference",
      record.file,
      issues,
    );
    if (
      record.value.primary_entity &&
      record.value.related_entities.includes(record.value.primary_entity)
    ) {
      issues.push(
        `${record.file}: primary entity '${record.value.primary_entity}' must not be repeated in related_entities`,
      );
    }
    const references = [record.value.primary_entity, ...record.value.related_entities].filter((id): id is string => Boolean(id));
    for (const reference of references) {
      if (!entityIdSet.has(reference)) issues.push(`${record.file}: ${unknownReferenceMessage(reference, entityIds)}`);
    }
    for (const sourceRef of record.value.source_refs) {
      if (!sourceIdSet.has(sourceRef)) issues.push(`${record.file}: Unknown source reference '${sourceRef}'.`);
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
    mentionMap.set(record.value.id, mentions.sort((left, right) => left.locale.localeCompare(right.locale) || left.entity_id.localeCompare(right.entity_id)));
  }

  if (issues.length > 0) throw new ContentValidationError(issues.sort());

  const entities: GeneratedEntity[] = entityRecords.map(({ value }) => ({
    ...value,
    content: entityContentMap.get(value.id) ?? { nl: { blocks: [] }, en: { blocks: [] } },
  })).sort((left, right) => left.id.localeCompare(right.id));
  const sources = sourceRecords.map(({ value }) => value).sort((left, right) => left.id.localeCompare(right.id));
  const media = mediaRecords.map(({ value }) => value).sort((left, right) => left.id.localeCompare(right.id));
  const narratives = narrativeRecords.map(({ value }) => ({
    ...value,
    mentions: mentionMap.get(value.id) ?? [],
    content: narrativeContentMap.get(value.id) ?? { nl: { blocks: [] }, en: { blocks: [] } },
  })).sort((left, right) => left.id.localeCompare(right.id));
  const forward: ResolvedRelation[] = entities.flatMap((entity) => entity.relations.map((relation) => ({ source: entity.id, ...relation })))
    .sort((left, right) => left.source.localeCompare(right.source) || left.type.localeCompare(right.type) || left.target.localeCompare(right.target));
  const inverse = Object.fromEntries(entityIds.map((id) => [id, forward.filter((relation) => relation.target === id)]));
  const backlinks = Object.fromEntries(entityIds.map((id) => [id, narratives.filter((narrative) => narrative.mentions.some((mention) => mention.entity_id === id) || narrative.primary_entity === id || narrative.related_entities.includes(id)).map((narrative) => narrative.id)]));
  const entitiesByType = Object.fromEntries(ENTITY_TYPES.map((type) => [type, entities.filter((entity) => entity.type === type).map((entity) => entity.id)])) as Record<EntityType, string[]>;
  const localizedSlugs = Object.fromEntries(LOCALES.map((locale) => [locale, Object.fromEntries(entities.map((entity) => [`${entity.type}:${entity.slugs[locale]}`, entity.id]))])) as Record<Locale, Record<string, string>>;
  const geography = Object.fromEntries(entities.filter((entity) => entity.geography_id).map((entity) => [entity.geography_id as string, entity.id]));
  const search = entities.map(({ id, type, canonical_name, names, slugs }) => ({ id, type, canonical_name, names, slugs }));
  const knowledgeBase: GeneratedKnowledgeBase = {
    entities,
    narratives,
    sources,
    media,
    relations: { forward, inverse },
    backlinks,
    indexes: { entity_ids: entityIds, entities_by_type: entitiesByType, localized_slugs: localizedSlugs, geography, search },
  };
  const outputs = {
    [GENERATED_BUNDLE_FILENAME]: stableJson(knowledgeBase),
  };
  if (options.write !== false) {
    const outputDirectory = path.resolve(options.outputDirectory ?? path.join(root, "src", "generated", "content"));
    await mkdir(outputDirectory, { recursive: true });
    await removeRetiredGeneratedFiles(outputDirectory);
    await Promise.all(Object.entries(outputs).map(([filename, contents]) => writeFile(path.join(outputDirectory, filename), contents, "utf8")));
  }
  return { knowledgeBase, outputs };
}

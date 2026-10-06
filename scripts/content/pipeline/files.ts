import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { z } from "zod";
import {
  entitySchema,
  narrativeSchema,
  learningPathSchema,
  contentPlanSchema,
  sourceSchema,
  mediaAssetSchema,
  type MediaAsset,
} from "../../../src/content/model";
import type { LoadedRecord, LoadedContentRecords } from "./types";

export const GENERATED_BUNDLE_FILENAME = "knowledge-base.json";
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
    const nested = await Promise.all(
      entries.map(async (entry) => {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) return discoverFiles(entryPath, filename);
        return entry.isFile() && entry.name === filename ? [entryPath] : [];
      }),
    );
    return nested.flat().sort();
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") return [];
    throw error;
  }
}

async function discoverYamlFiles(directory: string): Promise<string[]> {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    const nested = await Promise.all(
      entries.map(async (entry) => {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) return discoverYamlFiles(entryPath);
        return entry.isFile() &&
          /\.ya?ml$/.test(entry.name) &&
          entry.name !== "entity.yaml" &&
          entry.name !== "narrative.yaml"
          ? [entryPath]
          : [];
      }),
    );
    return nested.flat().sort();
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") return [];
    throw error;
  }
}

export function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return typeof error === "object" && error !== null && "code" in error;
}

function formatZodIssues(file: string, error: z.ZodError): string[] {
  return error.issues.map(
    (issue) => `${file}: ${issue.path.join(".") || "record"} ${issue.message}`,
  );
}

async function loadYamlRecords<T>(
  files: string[],
  schema: z.ZodType<T>,
  root: string,
  issues: string[],
): Promise<Array<LoadedRecord<T>>> {
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
      issues.push(
        `${relativeFile}: invalid YAML (${error instanceof Error ? error.message : String(error)})`,
      );
    }
  }
  return records;
}

export async function loadContentRecords(
  root: string,
  issues: string[],
): Promise<LoadedContentRecords> {
  const [entityFiles, narrativeFiles, learningPathFiles, planFiles, sourceFiles, mediaFiles] =
    await Promise.all([
      discoverFiles(path.join(root, "content", "entities"), "entity.yaml"),
      discoverFiles(path.join(root, "content", "narratives"), "narrative.yaml"),
      discoverFiles(path.join(root, "content", "learning-paths"), "learning-path.yaml"),
      discoverFiles(path.join(root, "content", "entities"), "content-plan.yaml"),
      discoverYamlFiles(path.join(root, "data", "sources")),
      discoverYamlFiles(path.join(root, "data", "media")),
    ]);
  const [
    entityRecords,
    narrativeRecords,
    learningPathRecords,
    planRecords,
    sourceRecords,
    mediaRecords,
  ] = await Promise.all([
    loadYamlRecords(entityFiles, entitySchema, root, issues),
    loadYamlRecords(narrativeFiles, narrativeSchema, root, issues),
    loadYamlRecords(learningPathFiles, learningPathSchema, root, issues),
    loadYamlRecords(planFiles, contentPlanSchema, root, issues),
    loadYamlRecords(sourceFiles, sourceSchema, root, issues),
    loadYamlRecords(mediaFiles, mediaAssetSchema, root, issues),
  ]);

  return {
    entityRecords,
    narrativeRecords,
    learningPathRecords,
    planRecords,
    sourceRecords,
    mediaRecords,
  };
}
export async function validateMediaFiles(
  records: Array<LoadedRecord<MediaAsset>>,
  root: string,
  requireLocalMedia: boolean,
  issues: string[],
): Promise<void> {
  if (!requireLocalMedia) return;
  await Promise.all(
    records.map(async ({ file, value }) => {
      const assetPath = path.join(root, "public", "media", value.storage_key);
      try {
        const bytes = await readFile(assetPath);
        const checksum = createHash("sha256").update(bytes).digest("hex");
        if (checksum !== value.checksum_sha256) {
          issues.push(`${file}: checksum_sha256 does not match public/media/${value.storage_key}`);
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
    }),
  );
}

async function removeRetiredGeneratedFiles(outputDirectory: string): Promise<void> {
  await Promise.all(
    RETIRED_GENERATED_FILENAMES.map(async (filename) => {
      try {
        await unlink(path.join(outputDirectory, filename));
      } catch (error) {
        if (!isNodeError(error) || error.code !== "ENOENT") throw error;
      }
    }),
  );
}

export async function writeGeneratedFiles(
  outputDirectory: string,
  outputs: Record<string, string>,
): Promise<void> {
  await mkdir(outputDirectory, { recursive: true });
  await removeRetiredGeneratedFiles(outputDirectory);
  await Promise.all(
    Object.entries(outputs).map(([filename, contents]) =>
      writeFile(path.join(outputDirectory, filename), contents, "utf8"),
    ),
  );
}

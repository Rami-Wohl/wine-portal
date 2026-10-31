import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { GeographyKind } from "../../../src/content/model";
import { isNodeError } from "../../content/pipeline/files";
import { writeAtomically } from "./output";
import { FEATURES_RELATIVE_PATH, type BuiltRecord, type Logger } from "./record";

export { writeAtomically };

// Writing canonical record pairs atomically and reporting files no mapping produces.

export interface ImportOptions {
  dryRun?: boolean;
  log?: Logger;
}

export interface WrittenRecord {
  id: string;
  outcome: "created" | "updated" | "unchanged";
}

async function readIfExists(file: string): Promise<string | undefined> {
  try {
    return await readFile(file, "utf8");
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") return undefined;
    throw error;
  }
}

export async function writeRecords(
  root: string,
  built: BuiltRecord[],
  options: ImportOptions,
  log: Logger,
): Promise<WrittenRecord[]> {
  const written: WrittenRecord[] = [];
  for (const item of built) {
    const directory = path.join(root, FEATURES_RELATIVE_PATH, item.kind);
    const geojsonFile = path.join(directory, `${item.id}.geojson`);
    const yamlFile = path.join(directory, `${item.id}.yaml`);
    const [existingGeojson, existingYaml] = await Promise.all([
      readIfExists(geojsonFile),
      readIfExists(yamlFile),
    ]);
    const outcome: WrittenRecord["outcome"] =
      existingGeojson === undefined && existingYaml === undefined
        ? "created"
        : existingGeojson === item.geojsonText && existingYaml === item.yamlText
          ? "unchanged"
          : "updated";
    if (!options.dryRun && outcome !== "unchanged") {
      await writeAtomically(geojsonFile, item.geojsonText);
      await writeAtomically(yamlFile, item.yamlText);
    }
    written.push({ id: item.id, outcome });
    log(`${options.dryRun ? "would " : ""}${outcome.padEnd(9)} ${path.relative(root, yamlFile)}`);
  }
  return written;
}

export async function findStaleFiles(
  root: string,
  kinds: readonly GeographyKind[],
  built: BuiltRecord[],
  log: Logger,
): Promise<string[]> {
  const produced = new Set(built.flatMap((item) => [`${item.id}.geojson`, `${item.id}.yaml`]));
  const stale: string[] = [];
  for (const kind of kinds) {
    const directory = path.join(root, FEATURES_RELATIVE_PATH, kind);
    try {
      for (const name of (await readdir(directory)).sort()) {
        if (/\.(?:geojson|ya?ml)$/.test(name) && !produced.has(name)) {
          stale.push(path.join(directory, name));
        }
      }
    } catch (error) {
      if (!isNodeError(error) || error.code !== "ENOENT") throw error;
    }
  }
  for (const file of stale) {
    log(
      `stale     ${path.relative(root, file)} has no mapping entry; review and remove it by hand`,
    );
  }
  return stale;
}

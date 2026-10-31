import { mkdir, readdir, unlink } from "node:fs/promises";
import path from "node:path";
import { isNodeError, writeAtomically } from "../../content/pipeline/files";
import type { AtlasBuildOutput } from "./display";

export { writeAtomically };

export const ATLAS_INDEX_FILENAME = "index.json";
export const ATLAS_SCENES_DIRECTORY = "scenes";

async function removeStaleFiles(directory: string, keep: Set<string>): Promise<void> {
  let entries: string[];
  try {
    entries = await readdir(directory);
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") return;
    throw error;
  }
  await Promise.all(
    entries
      .filter((name) => !keep.has(name) && (name.endsWith(".json") || name.endsWith(".tmp")))
      .map((name) => unlink(path.join(directory, name))),
  );
}

/**
 * Write scene files first and the index last, each atomically, then remove outputs that
 * no current scene produced. The index therefore never references a missing scene file.
 */
export async function writeAtlasDisplay(
  outputDirectory: string,
  output: AtlasBuildOutput,
): Promise<void> {
  const scenesDirectory = path.join(outputDirectory, ATLAS_SCENES_DIRECTORY);
  await mkdir(scenesDirectory, { recursive: true });
  const sceneFiles = Object.entries(output.files).filter(([filename]) =>
    filename.startsWith(`${ATLAS_SCENES_DIRECTORY}/`),
  );
  await Promise.all(
    sceneFiles.map(([filename, contents]) =>
      writeAtomically(path.join(outputDirectory, filename), contents),
    ),
  );
  await writeAtomically(
    path.join(outputDirectory, ATLAS_INDEX_FILENAME),
    output.files[ATLAS_INDEX_FILENAME],
  );
  await removeStaleFiles(
    scenesDirectory,
    new Set(sceneFiles.map(([filename]) => path.basename(filename))),
  );
  await removeStaleFiles(outputDirectory, new Set([ATLAS_INDEX_FILENAME]));
}

import path from "node:path";
import type { GeneratedKnowledgeBase } from "../../src/content/model";
import { buildAtlasDisplay, type AtlasBuildOutput } from "../geography/lib/display";
import { writeAtlasDisplay } from "../geography/lib/output";
import { ContentValidationError } from "./pipeline/diagnostics";
import {
  GENERATED_BUNDLE_FILENAME,
  loadContentRecords,
  writeGeneratedFiles,
} from "./pipeline/files";
import { buildKnowledgeGraph } from "./pipeline/graph";
import type { ParsedGeography } from "./pipeline/types";
import { validateContentRecords } from "./pipeline/validation";

export { ContentValidationError } from "./pipeline/diagnostics";

export interface BuildOptions {
  root?: string;
  write?: boolean;
  outputDirectory?: string;
  /** Defaults to <root>/src/generated/geography; written together with the bundle. */
  geographyOutputDirectory?: string;
  requireLocalMedia?: boolean;
}

export interface BuildResult {
  knowledgeBase: GeneratedKnowledgeBase;
  outputs: Record<string, string>;
  /** Always built, so content:check covers scene fitting, budgets and credits too. */
  atlas: AtlasBuildOutput;
}

function atlasInput(geography: ParsedGeography, knowledgeBase: GeneratedKnowledgeBase) {
  return {
    records: Array.from(geography.features.values()).map(({ record, feature }) => ({
      file: record.file,
      record: record.value,
      feature,
    })),
    scenes: geography.scenes.map(({ file, value }) => ({ file, scene: value })),
    entities: knowledgeBase.entities,
    sources: knowledgeBase.sources,
  };
}

/** Load authored packages, validate them together, then derive and optionally write the bundle. */
export async function buildContent(options: BuildOptions = {}): Promise<BuildResult> {
  const root = path.resolve(options.root ?? process.cwd());
  const issues: string[] = [];
  const records = await loadContentRecords(root, issues);
  const parsed = await validateContentRecords(
    records,
    root,
    options.requireLocalMedia ?? true,
    issues,
  );
  if (issues.length > 0) throw new ContentValidationError(issues.sort());

  const knowledgeBase = buildKnowledgeGraph(records, parsed);
  const outputs = { [GENERATED_BUNDLE_FILENAME]: `${JSON.stringify(knowledgeBase)}\n` };
  // Geometry never enters the bundle; the Atlas display is a separate generated directory.
  // The display build is pure and offline, so a check run validates scenes as well.
  const atlas = buildAtlasDisplay(atlasInput(parsed.geography, knowledgeBase));
  if (options.write !== false) {
    const outputDirectory = path.resolve(
      options.outputDirectory ?? path.join(root, "src", "generated", "content"),
    );
    await writeGeneratedFiles(outputDirectory, outputs);
    const geographyOutputDirectory = path.resolve(
      options.geographyOutputDirectory ?? path.join(root, "src", "generated", "geography"),
    );
    await writeAtlasDisplay(geographyOutputDirectory, atlas);
  }
  return { knowledgeBase, outputs, atlas };
}

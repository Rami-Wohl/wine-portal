import path from "node:path";
import type { GeneratedKnowledgeBase } from "../../src/content/model";
import { ContentValidationError } from "./pipeline/diagnostics";
import {
  GENERATED_BUNDLE_FILENAME,
  loadContentRecords,
  writeGeneratedFiles,
} from "./pipeline/files";
import { buildKnowledgeGraph } from "./pipeline/graph";
import { validateContentRecords } from "./pipeline/validation";

export { ContentValidationError } from "./pipeline/diagnostics";

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
  const outputs = { [GENERATED_BUNDLE_FILENAME]: `${JSON.stringify(knowledgeBase, null, 2)}\n` };
  if (options.write !== false) {
    const outputDirectory = path.resolve(
      options.outputDirectory ?? path.join(root, "src", "generated", "content"),
    );
    await writeGeneratedFiles(outputDirectory, outputs);
  }
  return { knowledgeBase, outputs };
}

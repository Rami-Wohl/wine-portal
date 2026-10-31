import path from "node:path";
import { buildContent, ContentValidationError } from "../content/pipeline";
import { AtlasBuildError } from "./lib/errors";
import { writeAtlasDisplay } from "./lib/output";

/**
 * Standalone Atlas display build: validate the whole corpus (geography included) without
 * rewriting the knowledge bundle, then write src/generated/geography/ atomically.
 * `npm run content:build` runs the same build at the end of every bundle write.
 */
async function main(): Promise<void> {
  if (process.argv.length > 2) throw new Error("Usage: npm run geography:build");
  const result = await buildContent({ write: false });
  const outputDirectory = path.join(process.cwd(), "src", "generated", "geography");
  await writeAtlasDisplay(outputDirectory, result.atlas);
  for (const line of result.atlas.report) console.log(line);
  console.log(
    `Generated Atlas display: ${result.atlas.scenes.length} scene${
      result.atlas.scenes.length === 1 ? "" : "s"
    } in ${path.relative(process.cwd(), outputDirectory)}.`,
  );
}

main().catch((error: Error) => {
  console.error(
    error instanceof ContentValidationError || error instanceof AtlasBuildError
      ? error.message
      : `Geography build failed: ${error.message}`,
  );
  process.exitCode = 1;
});

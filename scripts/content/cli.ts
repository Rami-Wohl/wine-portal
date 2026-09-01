import path from "node:path";
import { buildContent, ContentValidationError } from "./pipeline";
import { generateEntityPackage } from "./generator";

async function main(): Promise<void> {
  const [command, type, slug] = process.argv.slice(2);
  if (command === "check") {
    const result = await buildContent({ write: false });
    console.log(`Content is valid: ${result.knowledgeBase.entities.length} entities, ${result.knowledgeBase.narratives.length} narratives, ${result.knowledgeBase.sources.length} sources, ${result.knowledgeBase.media.length} media assets.`);
    return;
  }
  if (command === "build") {
    const result = await buildContent();
    console.log(`Generated content graph: ${result.knowledgeBase.entities.length} entities, ${result.knowledgeBase.narratives.length} narratives, ${result.knowledgeBase.media.length} media assets, ${result.knowledgeBase.relations.forward.length} forward relations.`);
    return;
  }
  if (command === "new") {
    if (!type || !slug) throw new Error("Usage: npm run content:new -- <entity-type> <slug>");
    const generatedPath = await generateEntityPackage({ type, slug });
    console.log(`Created ${path.relative(process.cwd(), generatedPath)}`);
    return;
  }
  throw new Error("Usage: npm run content:check | npm run content:build | npm run content:new -- <entity-type> <slug>");
}

main().catch((error: Error) => {
  console.error(error instanceof ContentValidationError ? error.message : `Content command failed: ${error.message}`);
  process.exitCode = 1;
});

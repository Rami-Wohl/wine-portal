import path from "node:path";
import type { EntityPresentation } from "../../src/content/model";
import { buildContent, ContentValidationError } from "./pipeline";
import { generateEntityPackage } from "./generator";
import { auditEntityLinks, scaffoldPlanDependencies } from "./dependencies";
import { writeEntityStatus } from "./status";

async function main(): Promise<void> {
  const [command, first, second, third, fourth, fifth] = process.argv.slice(2);
  if (command === "check") {
    const result = await buildContent({ write: false });
    console.log(
      `Content is valid: ${result.knowledgeBase.entities.length} entities, ${result.knowledgeBase.narratives.length} narratives, ${result.knowledgeBase.sources.length} sources, ${result.knowledgeBase.media.length} media assets.`,
    );
    return;
  }
  if (command === "build") {
    const result = await buildContent();
    await writeEntityStatus(result.knowledgeBase.entities);
    console.log(
      `Generated content graph: ${result.knowledgeBase.entities.length} entities, ${result.knowledgeBase.narratives.length} narratives, ${result.knowledgeBase.media.length} media assets, ${result.knowledgeBase.relations.forward.length} forward relations.`,
    );
    return;
  }
  if (command === "status") {
    const result = await buildContent({ write: false });
    const outputPath = await writeEntityStatus(result.knowledgeBase.entities);
    console.log(`Updated ${path.relative(process.cwd(), outputPath)}`);
    return;
  }
  if (command === "new") {
    if (!first || !second) {
      throw new Error(
        "Usage: npm run content:new -- <entity-type> <slug> [monograph | <collection-profile|register-entry> <owner-id> <anchor>]",
      );
    }
    let presentation: EntityPresentation | undefined;
    if (first === "producer") {
      if (third === "monograph") presentation = { mode: "monograph" };
      else if (third === "collection-profile" || third === "register-entry") {
        if (!fourth || !fifth) {
          throw new Error(
            `Producer ${third} requires an owner entity ID and stable content anchor.`,
          );
        }
        presentation = { mode: third, owner: fourth, anchor: fifth };
      } else {
        throw new Error(
          "Producer creation requires an explicit presentation. Prefer content:deps scaffolding from a validated content plan, or pass 'monograph'.",
        );
      }
    }
    const generatedPath = await generateEntityPackage({
      type: first,
      slug: second,
      presentation,
    });
    console.log(`Created ${path.relative(process.cwd(), generatedPath)}`);
    return;
  }
  if (command === "deps") {
    if (first !== "scaffold" || !second) {
      throw new Error("Usage: npm run content:deps -- scaffold <entity-id>");
    }
    const result = await scaffoldPlanDependencies(second);
    console.log(
      `Dependency scaffold complete: ${result.created.length} created, ${result.existing.length} already existed.`,
    );
    for (const id of result.created) console.log(`Created ${id}`);
    return;
  }
  if (command === "link-audit") {
    const findings = await auditEntityLinks();
    if (findings.length === 0) console.log("Link audit found no unlinked known entity names.");
    else {
      console.log(`Link audit found ${findings.length} candidate mention(s):`);
      for (const finding of findings) console.log(`- ${finding}`);
    }
    return;
  }
  throw new Error(
    "Usage: npm run content:check | npm run content:build | npm run content:status | npm run content:new -- <entity-type> <slug> [producer-presentation] | npm run content:deps -- scaffold <entity-id> | npm run content:link-audit",
  );
}

main().catch((error: Error) => {
  console.error(
    error instanceof ContentValidationError
      ? error.message
      : `Content command failed: ${error.message}`,
  );
  process.exitCode = 1;
});

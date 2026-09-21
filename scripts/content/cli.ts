import path from "node:path";
import type { EntityPresentation } from "../../src/content/model";
import { buildContent, ContentValidationError } from "./pipeline";
import { generateEntityPackage } from "./generator";
import { auditEntityLinks, scaffoldPlanDependencies } from "./dependencies";
import { auditActiveRelationCoverage } from "./relation-audit";
import { writeEntityStatus } from "./status";
import {
  auditEditorialLanguage,
  rankEditorialLanguageCandidates,
} from "./editorial-language-audit";

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
  if (command === "relation-audit") {
    const result = await buildContent({ write: false });
    const activeEntities = result.knowledgeBase.entities.filter(
      ({ status }) => status === "active",
    );
    const findings = auditActiveRelationCoverage(result.knowledgeBase.entities);
    if (findings.length === 0) {
      console.log(
        `Relation audit passed: ${activeEntities.length} active entities meet the structural coverage minimums.`,
      );
    } else {
      console.log(`Relation audit found ${findings.length} issue(s):`);
      for (const finding of findings) {
        console.log(`- ${finding.entityId}: ${finding.message}`);
      }
      process.exitCode = 1;
    }
    return;
  }
  if (command === "language-audit") {
    const result = await auditEditorialLanguage();
    console.log(
      `Editorial language inventory: ${result.activePackages} active packages, ${result.documents.length} localized documents, ${result.totalMarkers} possible defensive markers, ${result.summaryCandidates} summaries and ${result.headingCandidates} headings to consider.`,
    );
    console.log(
      "These are review candidates, not errors; retain negation where scope, law, safety or a real distinction requires it.",
    );
    for (const document of rankEditorialLanguageCandidates(result.documents).slice(0, 20)) {
      const rate = document.words === 0 ? 0 : (document.markers / document.words) * 1_000;
      console.log(
        `- ${document.path}: ${document.markers} markers (${rate.toFixed(1)} per 1,000 words), ${document.summaryCandidates} summary, ${document.headingCandidates} headings`,
      );
    }
    return;
  }
  throw new Error(
    "Usage: npm run content:check | npm run content:build | npm run content:status | npm run content:new -- <entity-type> <slug> [producer-presentation] | npm run content:deps -- scaffold <entity-id> | npm run content:link-audit | npm run content:relation-audit | npm run content:language-audit",
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

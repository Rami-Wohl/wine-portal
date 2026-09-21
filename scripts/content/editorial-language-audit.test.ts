import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  auditEditorialLanguage,
  rankEditorialLanguageCandidates,
} from "./editorial-language-audit";

async function writePackage(
  root: string,
  name: string,
  status: "active" | "draft",
  body: string,
): Promise<void> {
  const directory = path.join(root, "content", "entities", "concepts", name);
  await mkdir(directory, { recursive: true });
  await writeFile(
    path.join(directory, "entity.yaml"),
    `status: ${status}\nlocales:\n  nl: overview.nl.md\n`,
  );
  await writeFile(path.join(directory, "overview.nl.md"), body);
}

describe("editorial language audit", () => {
  it("inventories active localized content without treating candidates as errors", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "oenocademy-language-audit-"));
    await mkdir(path.join(root, "content", "narratives"), { recursive: true });
    await writePackage(
      root,
      "active-example",
      "active",
      ":::summary{#orientatie}\nDit is geen ranglijst.\n:::\n\n:::section{#uitleg}\n## Uitleg — niet alleen regels\n\nEen positieve uitleg.\n:::\n",
    );
    await writePackage(
      root,
      "draft-example",
      "draft",
      ":::summary{#orientatie}\nDit telt niet mee.\n:::\n",
    );

    const result = await auditEditorialLanguage(root);

    expect(result.activePackages).toBe(1);
    expect(result.documents).toHaveLength(1);
    expect(result.totalMarkers).toBe(2);
    expect(result.summaryCandidates).toBe(1);
    expect(result.headingCandidates).toBe(1);
  });

  it("ranks denser candidate documents first", () => {
    const ranked = rankEditorialLanguageCandidates([
      { path: "a.md", words: 100, markers: 1, summaryCandidates: 0, headingCandidates: 0 },
      { path: "b.md", words: 100, markers: 3, summaryCandidates: 0, headingCandidates: 0 },
    ]);

    expect(ranked.map(({ path: filePath }) => filePath)).toEqual(["b.md", "a.md"]);
  });
});

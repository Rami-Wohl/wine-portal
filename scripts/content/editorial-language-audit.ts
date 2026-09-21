import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";

const DEFENSIVE_MARKER = /\b(?:niet|geen|nooit|not|never|without|no)\b/giu;

type PackageManifest = {
  status?: string;
  locales?: Record<string, string>;
};

export type EditorialLanguageDocument = {
  path: string;
  words: number;
  markers: number;
  summaryCandidates: number;
  headingCandidates: number;
};

export type EditorialLanguageAudit = {
  activePackages: number;
  documents: EditorialLanguageDocument[];
  totalMarkers: number;
  summaryCandidates: number;
  headingCandidates: number;
};

async function manifestPaths(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return manifestPaths(entryPath);
      return entry.name === "entity.yaml" || entry.name === "narrative.yaml" ? [entryPath] : [];
    }),
  );
  return nested.flat();
}

function markerCount(value: string): number {
  return Array.from(value.matchAll(DEFENSIVE_MARKER)).length;
}

function documentResult(
  root: string,
  filePath: string,
  markdown: string,
): EditorialLanguageDocument {
  const summary = markdown.match(/:::summary\{[^\n]*\}\n([\s\S]*?)\n:::/u)?.[1] ?? "";
  const headings = markdown
    .split("\n")
    .filter((line) => /^#{2,3} /u.test(line) && markerCount(line) > 0).length;
  const plainText = markdown.replace(/\[\[[^\]]+\|/gu, "").replace(/[@#:{}*\[\]]/gu, " ");
  const words = plainText.split(/\s+/u).filter(Boolean).length;

  return {
    path: path.relative(root, filePath),
    words,
    markers: markerCount(plainText),
    summaryCandidates: summary && markerCount(summary) > 0 ? 1 : 0,
    headingCandidates: headings,
  };
}

export async function auditEditorialLanguage(
  root = process.cwd(),
): Promise<EditorialLanguageAudit> {
  const contentRoots = [
    path.join(root, "content", "entities"),
    path.join(root, "content", "narratives"),
  ];
  const manifests = (await Promise.all(contentRoots.map(manifestPaths))).flat();
  const documents: EditorialLanguageDocument[] = [];
  let activePackages = 0;

  for (const manifestPath of manifests) {
    const manifest = YAML.parse(await readFile(manifestPath, "utf8")) as PackageManifest;
    if (manifest.status !== "active") continue;
    activePackages += 1;
    for (const localePath of Object.values(manifest.locales ?? {})) {
      const filePath = path.join(path.dirname(manifestPath), localePath);
      documents.push(documentResult(root, filePath, await readFile(filePath, "utf8")));
    }
  }

  return {
    activePackages,
    documents,
    totalMarkers: documents.reduce((total, document) => total + document.markers, 0),
    summaryCandidates: documents.reduce((total, document) => total + document.summaryCandidates, 0),
    headingCandidates: documents.reduce((total, document) => total + document.headingCandidates, 0),
  };
}

export function rankEditorialLanguageCandidates(
  documents: EditorialLanguageDocument[],
): EditorialLanguageDocument[] {
  return [...documents].sort((left, right) => {
    const leftRate = left.words === 0 ? 0 : left.markers / left.words;
    const rightRate = right.words === 0 ? 0 : right.markers / right.words;
    return (
      rightRate - leftRate || right.markers - left.markers || left.path.localeCompare(right.path)
    );
  });
}

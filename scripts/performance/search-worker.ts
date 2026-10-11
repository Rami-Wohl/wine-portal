import { readFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import type { GeneratedKnowledgeBase, Locale } from "../../src/content/model";
import { searchKnowledge } from "../../src/content/search";

export const SEARCH_CASES = [
  { query: "Cabernet Sauvignon", type: "all" },
  { query: "ÉLEVAGE", type: "all" },
  { query: "water", type: "all" },
  { query: "biologie en wortelschade", type: "all" },
  { query: "nonexistent-query-82719", type: "all" },
  { query: "bordeaux", type: "region" },
  { query: "", type: "classification" },
] as const;

export function percentile(values: number[], fraction: number): number {
  return [...values].sort((a, b) => a - b)[Math.ceil(values.length * fraction) - 1] ?? 0;
}

export async function measureSearch(bundleFile: string, referenceModule?: string) {
  const search: typeof searchKnowledge = referenceModule
    ? (await import(pathToFileURL(referenceModule).href)).searchKnowledge
    : searchKnowledge;
  global.gc?.();
  const beforeLoad = process.memoryUsage();
  const started = performance.now();
  const bundle: GeneratedKnowledgeBase = JSON.parse(await readFile(bundleFile, "utf8"));
  const parseAndReadMs = performance.now() - started;
  const entries = bundle.indexes.search.filter(({ status }) => status === "active");
  global.gc?.();
  const afterLoad = process.memoryUsage();
  const cold = [];
  for (const locale of ["nl", "en"] as Locale[]) {
    const start = performance.now();
    search(entries, "nonexistent-query-82719", "all", locale);
    cold.push({ locale, ms: performance.now() - start });
  }
  global.gc?.();
  const afterPreparation = process.memoryUsage();
  const results = [];
  for (const locale of ["nl", "en"] as Locale[]) {
    for (const sample of SEARCH_CASES) {
      const times = [];
      let fingerprint = "";
      let hits = 0;
      for (let round = 0; round < 5; round += 1) {
        const start = performance.now();
        const found = search(entries, sample.query, sample.type, locale);
        times.push(performance.now() - start);
        hits = found.length;
        // Include ranking, original snippets, block anchors and match kinds in parity checks.
        fingerprint = createHash("sha256")
          .update(
            JSON.stringify(
              found.map(({ entry, passage, ...result }) => ({
                id: entry.id,
                block: passage?.block_id,
                depth: passage?.depth,
                ...result,
              })),
            ),
          )
          .digest("hex");
      }
      results.push({
        ...sample,
        locale,
        hits,
        p50Ms: percentile(times, 0.5),
        p95Ms: percentile(times, 0.95),
        samplesMs: times,
        fingerprint,
      });
    }
  }
  global.gc?.();
  return {
    publishedDocuments: entries.length,
    parseAndReadMs,
    beforeLoad,
    afterLoad,
    afterPreparation,
    afterWarm: process.memoryUsage(),
    maxRssKiB: process.resourceUsage().maxRSS,
    cold,
    results,
  };
}

export type SearchMeasurement = Awaited<ReturnType<typeof measureSearch>>;

// Kept separate from the orchestrator so each scale/implementation has a fresh process/cache.
if (process.argv[1]?.endsWith("search-worker.ts")) {
  measureSearch(process.argv[2], process.argv[3])
    .then((result) => console.log(JSON.stringify(result)))
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}

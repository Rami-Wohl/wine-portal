import type { ContentBuildMeasurement } from "./build-worker";
import type { SearchMeasurement } from "./search-worker";
import type { measureBuildArtifacts, measureServer } from "./production";

export interface ScaleMeasurement {
  scale: number;
  fixtureMs: number;
  content: ContentBuildMeasurement & { processMs: number };
  transportEstimate: { gzipBytes: number; brotliBytes: number };
  search: SearchMeasurement;
  referenceSearch?: SearchMeasurement;
  referenceParity?: boolean;
  productionBuildMs?: number;
  artifacts?: Awaited<ReturnType<typeof measureBuildArtifacts>>;
  server?: Awaited<ReturnType<typeof measureServer>>;
}

export interface BudgetMeasurements {
  method?: { production: boolean; scales?: number[] };
  scales: ScaleMeasurement[];
  inventory: { media: { bytes: number }; gitObjectBytes: number };
  localClone?: { ms: number; method: string };
}

export interface BudgetCheck {
  scenario: string;
  metric: string;
  actual: number;
  limit: number;
  unit: "ms" | "bytes";
  passed: boolean;
}

// Local reference-machine guardrails, not promises about cloud performance.
// See docs/performance-budgets.md for scope, cold/warm distinctions and triggers.
export function evaluateBudgets(measurements: BudgetMeasurements): BudgetCheck[] {
  const checks: BudgetCheck[] = [];
  if (
    measurements.method?.scales?.some(
      (scale) => !measurements.scales.some((result) => result.scale === scale),
    )
  ) {
    throw new Error("Incomplete benchmark: a requested scale has no measurements.");
  }
  for (const scale of measurements.scales) {
    if (
      measurements.method?.production &&
      (!scale.artifacts || !scale.server || scale.productionBuildMs === undefined)
    ) {
      throw new Error(`Incomplete production measurements at ${scale.scale}x.`);
    }
    if (
      !scale.search?.results?.length ||
      !scale.search?.cold?.length ||
      (scale.server && !scale.server.searches.length)
    ) {
      throw new Error(`Incomplete search measurements at ${scale.scale}x.`);
    }
  }
  const check = (
    scenario: string,
    metric: string,
    actual: number,
    limit: number,
    unit: BudgetCheck["unit"],
  ) => {
    checks.push({ scenario, metric, actual, limit, unit, passed: actual <= limit });
  };
  for (const scale of measurements.scales) {
    const scenario = `${scale.scale}x`;
    check(scenario, "content build", scale.content.ms, 15_000, "ms");
    check(
      scenario,
      "content build peak RSS",
      scale.content.maxRssKiB * 1024,
      1.5 * 1024 ** 3,
      "bytes",
    );
    check(
      scenario,
      "warm search worst case p95",
      Math.max(...scale.search.results.map(({ p95Ms }) => p95Ms)),
      50,
      "ms",
    );
    check(
      scenario,
      "first search per locale",
      Math.max(...scale.search.cold.map(({ ms }) => ms)),
      1_000,
      "ms",
    );
    check(
      scenario,
      "normalized passage heap",
      Math.max(0, scale.search.afterPreparation.heapUsed - scale.search.afterLoad.heapUsed),
      64 * 1024 ** 2,
      "bytes",
    );
    if (scale.productionBuildMs !== undefined)
      check(scenario, "production build", scale.productionBuildMs, 120_000, "ms");
    if (scale.artifacts)
      check(
        scenario,
        "largest local traced closure",
        Math.max(...scale.artifacts.largestTracedClosures.map(({ bytes }) => bytes)),
        150 * 1024 ** 2,
        "bytes",
      );
    if (scale.server) {
      check(
        scenario,
        "process to first search response",
        scale.server.cold.processToFirstResponseMs,
        2_000,
        "ms",
      );
      check(scenario, "warm server RSS", scale.server.warmRssBytes, 1024 ** 3, "bytes");
      check(
        scenario,
        "warm HTTP search worst case p95",
        Math.max(...scale.server.searches.map(({ p95Ms }) => p95Ms)),
        200,
        "ms",
      );
      check(
        scenario,
        "article referenced JS transfer",
        scale.server.article.jsWireBytes,
        220 * 1024,
        "bytes",
      );
      check(
        scenario,
        "article HTML transfer",
        scale.server.article.htmlWireBytes,
        64 * 1024,
        "bytes",
      );
      for (const image of scale.server.images)
        check(
          scenario,
          `sampled image ${image.id} at ${image.width}px`,
          image.wireBytes,
          (image.width <= 828 ? 250 : 500) * 1024,
          "bytes",
        );
    }
  }
  check(
    "repository",
    "raw media review trigger",
    measurements.inventory.media.bytes,
    500 * 1024 ** 2,
    "bytes",
  );
  check(
    "repository",
    "git objects review trigger",
    measurements.inventory.gitObjectBytes,
    512 * 1024 ** 2,
    "bytes",
  );
  return checks;
}

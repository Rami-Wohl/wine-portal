import path from "node:path";
import { fileURLToPath } from "node:url";
import { ImportError } from "./lib/import-error";
import { importAppellationAreas, prepareAppellationAreas } from "./lib/appellations";
import { APPELLATION_AREA_KIND, ORIENTATION_KINDS } from "./lib/mapping-schemas";
import { importOrientationFeatures, prepareOrientationFeatures } from "./lib/orientation";
import type { Logger } from "./lib/record";
import { findStaleFiles, writeRecords, type ImportOptions, type WrittenRecord } from "./lib/write";

/**
 * Import reviewed geography into canonical records (docs/atlas-plan.md §4 and §6).
 *
 * Two mapping tables drive the import: data/geography/mappings/inao-appellations.yaml (kind
 * appellation-area, owner required) and data/geography/mappings/ign-orientation.yaml (rivers,
 * water bodies, coastline and populated places with `names`). Both tables are prepared in full
 * before anything is written, so a failure in either leaves every record untouched. The pieces
 * live in scripts/geography/lib/: mapping-schemas, validate, record, shapefile, register,
 * appellations, orientation and write.
 */

export { importAppellationAreas, prepareAppellationAreas } from "./lib/appellations";
export { importOrientationFeatures, prepareOrientationFeatures } from "./lib/orientation";

export interface ImportAllSummary {
  appellations: {
    recordCount: number;
    counts: Record<"published" | "reviewed" | "held", number>;
    written: WrittenRecord[];
  };
  orientation: { perKind: Map<string, number>; written: WrittenRecord[] };
  stale: string[];
}

/** Prepare both tables, then write both; nothing is written when either table fails. */
export async function importAll(
  root: string,
  options: ImportOptions = {},
): Promise<ImportAllSummary> {
  const log: Logger = options.log ?? (() => {});
  const appellations = await prepareAppellationAreas(root, log);
  const orientation = await prepareOrientationFeatures(root, log);
  const writtenAppellations = await writeRecords(root, appellations.features, options, log);
  const writtenOrientation = await writeRecords(root, orientation.features, options, log);
  const stale = [
    ...(await findStaleFiles(root, [APPELLATION_AREA_KIND], appellations.features, log)),
    ...(await findStaleFiles(root, ORIENTATION_KINDS, orientation.features, log)),
  ];
  const counts = { published: 0, reviewed: 0, held: 0 };
  for (const imported of appellations.features) counts[imported.entry.review.status] += 1;
  const perKind = new Map<string, number>();
  for (const imported of orientation.features) {
    perKind.set(imported.kind, (perKind.get(imported.kind) ?? 0) + 1);
  }
  return {
    appellations: { recordCount: appellations.recordCount, counts, written: writtenAppellations },
    orientation: { perKind, written: writtenOrientation },
    stale,
  };
}

function summariseOutcomes(written: WrittenRecord[]): string {
  const outcomes = written.reduce<Record<string, number>>((acc, item) => {
    acc[item.outcome] = (acc[item.outcome] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(outcomes)
    .map(([outcome, count]) => `${count} ${outcome}`)
    .join(", ");
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run");
  const onlyArgument = argv.find((argument) => argument.startsWith("--only="));
  const only = onlyArgument?.slice("--only=".length);
  const unknown = argv.filter((argument) => argument !== "--dry-run" && argument !== onlyArgument);
  if (
    unknown.length > 0 ||
    (only !== undefined && only !== "appellations" && only !== "orientation")
  ) {
    throw new ImportError(
      `Usage: npm run geography:import -- [--dry-run] [--only=appellations|orientation]\nUnknown argument(s): ${unknown.join(" ")}`,
    );
  }
  const log: Logger = (line) => console.log(line);
  const suffix = dryRun ? " (dry run, nothing written)" : "";
  let stale = 0;
  if (only === "appellations") {
    const summary = await importAppellationAreas(process.cwd(), { dryRun, log });
    const counts = { published: 0, reviewed: 0, held: 0 };
    for (const imported of summary.features) counts[imported.entry.review.status] += 1;
    console.log(
      `Imported ${summary.features.length} appellation areas from ${summary.resource.id} (${summary.recordCount} source records): ${counts.published} published, ${counts.reviewed} reviewed, ${counts.held} held; ${summariseOutcomes(summary.written)}${suffix}`,
    );
    stale = summary.stale.length;
  } else if (only === "orientation") {
    const summary = await importOrientationFeatures(process.cwd(), { dryRun, log });
    console.log(
      `Imported ${summary.features.length} orientation features: ${summariseOutcomes(summary.written)}${suffix}`,
    );
    stale = summary.stale.length;
  } else {
    const summary = await importAll(process.cwd(), { dryRun, log });
    const { counts } = summary.appellations;
    console.log(
      `Imported ${summary.appellations.written.length} appellation areas (${summary.appellations.recordCount} source records): ${counts.published} published, ${counts.reviewed} reviewed, ${counts.held} held; ${summariseOutcomes(summary.appellations.written)}${suffix}`,
    );
    console.log(
      `Imported ${summary.orientation.written.length} orientation features (${Array.from(
        summary.orientation.perKind.entries(),
      )
        .map(([kind, count]) => `${count} ${kind}`)
        .join(", ")}): ${summariseOutcomes(summary.orientation.written)}${suffix}`,
    );
    stale = summary.stale.length;
  }
  if (stale > 0) {
    console.error(`${stale} stale file(s) need attention`);
    process.exitCode = 1;
  }
}

const isDirectRun =
  typeof process.argv[1] === "string" &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}

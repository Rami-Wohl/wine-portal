// Een budget is hier een afgesproken bovengrens, bijvoorbeeld 50 ms voor zoeken.
// Dit bestand ontvangt meetgegevens en geeft per grens 'geslaagd' of 'te hoog' terug.
// Het start zelf geen benchmark en leest geen bestanden. Daardoor kunnen we dezelfde
// regels ook toepassen op een eerder bewaard JSON-rapport.
// Eerst controleren we volledigheid: geen meting hebben is niet hetzelfde als snel zijn.
import type { ContentBuildMeasurement } from "./build-worker";
import type { SearchMeasurement } from "./search-worker";
import type { measureBuildArtifacts, measureServer } from "./production";
import { SEARCH_CASES } from "./search-worker";

// Een interface is TypeScripts beschrijving van een object. Een ? betekent:
// dit onderdeel kan ontbreken, bijvoorbeeld omdat --production niet is gekozen.
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

// Oudere rapporten zonder method kunnen nog worden gelezen, maar moeten wel
// echte schalen en volledige meetgevallen bevatten. Geen metadata is geen vrijstelling.
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

// Dit zijn lokale grenzen voor onze referentiecomputer, geen cloudbeloftes.
export function evaluateBudgets(measurements: BudgetMeasurements): BudgetCheck[] {
  const checks: BudgetCheck[] = [];
  // Een onderbroken run mist soms een aangevraagde schaal. Dat is een fout,
  // niet een gunstige uitkomst doordat de zwaarste meting ontbreekt.
  if (
    measurements.method?.scales?.some(
      (scale) => !measurements.scales.some((result) => result.scale === scale),
    )
  ) {
    throw new Error("Incomplete benchmark: a requested scale has no measurements.");
  }
  // Ook zonder method-veld mag een rapport zonder metingen nooit slagen.
  if (!measurements.scales.length) throw new Error("Incomplete benchmark: no scales measured.");
  const scales = measurements.scales.map(({ scale }) => scale);
  if (
    scales.some((scale) => !Number.isInteger(scale) || scale < 1 || scale > 8) ||
    new Set(scales).size !== scales.length
  )
    throw new Error("Invalid benchmark scales.");
  if (
    measurements.method?.scales &&
    (new Set(measurements.method.scales).size !== measurements.method.scales.length ||
      scales.some((scale) => !measurements.method!.scales!.includes(scale)))
  )
    throw new Error("Invalid benchmark: requested and recorded scales differ.");

  // NaN betekent 'geen bruikbaar getal'; Infinity betekent oneindig.
  // Geen van beide is een meting, en negatieve tijden/groottes zijn ook ongeldig.
  const validNumber = (value: number) => Number.isFinite(value) && value >= 0;
  // Een niet-lege lijst kan alsnog zoekgevallen missen. Controleer beide talen,
  // alle afgesproken voorbeelden en alle herhalingen voordat we grenzen vergelijken.
  // Bij lijsten maakt map een nieuwe lijst; some vraagt 'geldt dit voor minstens
  // één onderdeel?', every vraagt 'voor allemaal?'. Hieronder zoeken we naar
  // ontbrekende voorbeelden: zodra er één ontbreekt, is het verslag onvolledig.
  const requireSearchCases = (
    results: SearchMeasurement["results"] | NonNullable<ScaleMeasurement["server"]>["searches"],
    http: boolean,
  ) => {
    const cases = SEARCH_CASES.filter(({ query }) => !http || query);
    if (
      results.length !== cases.length * 2 ||
      ["nl", "en"].some((locale) =>
        cases.some(
          ({ query, type }) =>
            !results.some(
              (result) =>
                result.locale === locale && result.query === query && result.type === type,
            ),
        ),
      ) ||
      results.some(
        ({ samplesMs, p50Ms, p95Ms }) =>
          samplesMs.length !== (http ? 3 : 5) ||
          !samplesMs.every(validNumber) ||
          !validNumber(p50Ms) ||
          !validNumber(p95Ms),
      )
    )
      throw new Error("Incomplete or invalid search cases/samples.");
  };
  for (const scale of measurements.scales) {
    // Een productierun is pas compleet met build-, bestanden- en servermetingen.
    if (
      (measurements.method?.production ||
        scale.artifacts ||
        scale.server ||
        scale.productionBuildMs !== undefined) &&
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
    requireSearchCases(scale.search.results, false);
    if (
      scale.search.cold.length !== 2 ||
      ["nl", "en"].some(
        (locale) =>
          !scale.search.cold.some((result) => result.locale === locale && validNumber(result.ms)),
      )
    )
      throw new Error(`Incomplete cold search measurements at ${scale.scale}x.`);
    if (scale.server) requireSearchCases(scale.server.searches, true);
    if (
      !validNumber(scale.search.afterLoad.heapUsed) ||
      !validNumber(scale.search.afterPreparation.heapUsed)
    )
      throw new Error(`Invalid heap measurements at ${scale.scale}x.`);
    if (
      scale.server &&
      (!scale.server.article.resources.some(({ path }) => path.endsWith(".js")) ||
        !scale.server.article.resources.some(({ path }) => path.endsWith(".css")) ||
        (scale.scale === 1 &&
          (scale.server.images.length !== 4 ||
            new Set(scale.server.images.map(({ id, width }) => `${id}:${width}`)).size !== 4 ||
            [828, 1920].some(
              (width) => scale.server!.images.filter((image) => image.width === width).length !== 2,
            ))))
    )
      throw new Error(`Incomplete article/image measurements at ${scale.scale}x.`);
    // Math.max over een lege lijst geeft -Infinity. Dat zou onder elke grens
    // vallen. Daarom moeten traces werkelijk aanwezig zijn en geldige groottes bevatten.
    if (
      scale.artifacts &&
      (!scale.artifacts.generatedBundleTraced ||
        !scale.artifacts.largestTracedClosures.length ||
        scale.artifacts.largestTracedClosures.some(({ bytes }) => !validNumber(bytes)))
    )
      throw new Error(`Incomplete or invalid trace measurements at ${scale.scale}x.`);
  }
  // Leg elke vergelijking op dezelfde manier vast. Gelijk aan de grens is toegestaan.
  // Een ongeldig getal is een meetfout; een geldig te hoog getal is een budgetoverschrijding.
  const check = (
    scenario: string,
    metric: string,
    actual: number,
    limit: number,
    unit: BudgetCheck["unit"],
  ) => {
    if (!validNumber(actual)) throw new Error(`Invalid measurement: ${scenario} ${metric}.`);
    checks.push({ scenario, metric, actual, limit, unit, passed: actual <= limit });
  };
  for (const scale of measurements.scales) {
    const scenario = `${scale.scale}x`;
    // Een milliseconde is 1/1000 seconde; KiB/MiB/GiB gebruiken stappen van 1024.
    // Dezelfde grens geldt bij elke schaal: we willen weten of ook 8× er nog binnen past.
    check(scenario, "content build", scale.content.ms, 15_000, "ms");
    check(
      scenario,
      "content build peak RSS",
      scale.content.maxRssKiB * 1024,
      1.5 * 1024 ** 3,
      "bytes",
    );
    // Kies het slechtste resultaat van alle voorbeelden. Een gemiddelde zou
    // kunnen verbergen dat één soort zoekopdracht te langzaam is.
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
    // Heap is geheugen voor JavaScript-objecten. Het verschil voor/na de eerste
    // zoekacties benadert cachekosten. Door opruiming kan het licht dalen: tel dan nul.
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
  // Deze twee grenzen zijn reviewtriggers: groei van beelden of Git-historie
  // vraagt eerst een opslagbesluit, niet automatisch een andere database.
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

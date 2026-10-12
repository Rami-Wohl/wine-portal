// Deze worker meet zoeken, zonder een webpagina te openen. Hij draait per meting
// in een apart Node-proces: een programma met eigen geheugen (zie processes.ts).
// Een cache bewaart eerder berekend werk voor hergebruik. De zoekfunctie bewaart
// bijvoorbeeld een vereenvoudigde versie van teksten. Een vers proces heeft die niet.
// We meten zowel de eerste zoekactie als zoeken nadat die voorbereiding is gedaan.
import { readFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import type { GeneratedKnowledgeBase, Locale } from "../../src/content/model";
import { searchKnowledge } from "../../src/content/search";

// Een vaste mix maakt runs vergelijkbaar: namen, accenten, veel/weinig treffers
// en een typefilter. Beide talen krijgen dezelfde voorbeelden. Dit is een steekproef,
// geen bewijs voor alle denkbare zoekopdrachten.
export const SEARCH_CASES = [
  { query: "Cabernet Sauvignon", type: "all" },
  { query: "ÉLEVAGE", type: "all" },
  { query: "water", type: "all" },
  { query: "biologie en wortelschade", type: "all" },
  { query: "nonexistent-query-82719", type: "all" },
  { query: "bordeaux", type: "region" },
  { query: "", type: "classification" },
] as const;

// Sorteer meettijden van snel naar langzaam. p50 ligt in het midden; p95 ligt
// rond de grens waar 95% onder valt. Bij slechts vijf metingen is p95 de langzaamste.
// Dat is bruikbaar als lokale controle, niet als stabiele statistiek voor echte gebruikers.
export function percentile(values: number[], fraction: number): number {
  return [...values].sort((a, b) => a - b)[Math.ceil(values.length * fraction) - 1] ?? 0;
}

export async function measureSearch(bundleFile: string, referenceModule?: string) {
  // Gebruik onze huidige zoekfunctie, of de uit Git opgehaalde vergelijkingsversie.
  const search: typeof searchKnowledge = referenceModule
    ? (await import(pathToFileURL(referenceModule).href)).searchKnowledge
    : searchKnowledge;
  // GC (garbage collection) ruimt objecten op die niet meer gebruikt worden.
  // We vragen dit vóór snapshots zodat rondslingerend afval de vergelijking minder kleurt.
  // ?. betekent: alleen uitvoeren als gc beschikbaar is (--expose-gc).
  global.gc?.();
  const beforeLoad = process.memoryUsage();
  const started = performance.now();
  // JSON is opgeslagen tekst. JSON.parse maakt daarvan JavaScript-objecten,
  // waarvoor extra geheugen nodig is. Lezen en parsen timen we samen.
  const bundle: GeneratedKnowledgeBase = JSON.parse(await readFile(bundleFile, "utf8"));
  const parseAndReadMs = performance.now() - started;
  // Alleen actieve onderwerpen zijn publiek doorzoekbaar; drafts zijn proefcontent.
  const entries = bundle.indexes.search.filter(({ status }) => status === "active");
  global.gc?.();
  const afterLoad = process.memoryUsage();
  // De eerste zoekactie per taal bouwt ook de tekstcache. We meten die apart.
  // 'Koud' gaat hier over de zoekfunctie, niet over een compleet koude cloudserver.
  const cold = [];
  for (const locale of ["nl", "en"] as Locale[]) {
    const start = performance.now();
    search(entries, "nonexistent-query-82719", "all", locale);
    cold.push({ locale, ms: performance.now() - start });
  }
  global.gc?.();
  // Vergelijk dit met afterLoad: het verschil benadert de extra cachekosten.
  const afterPreparation = process.memoryUsage();
  const results = [];
  for (const locale of ["nl", "en"] as Locale[]) {
    for (const sample of SEARCH_CASES) {
      const times = [];
      let fingerprint = "";
      let hits = 0;
      // Meet ieder voorbeeld vijf keer. Alleen zoeken staat tussen de klokmetingen;
      // het berekenen van de vingerafdruk eronder telt dus niet mee als zoektijd.
      for (let round = 0; round < 5; round += 1) {
        const start = performance.now();
        const found = search(entries, sample.query, sample.type, locale);
        times.push(performance.now() - start);
        hits = found.length;
        // SHA-256 maakt een vingerafdruk van de resultaten, inclusief volgorde, score,
        // snippet, sectieanker en diepte. We vervangen grote objecten door hun identiteit.
        // De bestuurder vergelijkt per voorbeeld de laatste ronde met de oude functie.
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
        // Bewaar ook de losse tijden: daarmee kan een lezer uitschieters herkennen.
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

// Leid het type af uit de functie; Awaited haalt het antwoord uit de Promise.
// Dit helpt TypeScript, maar valideert geen JSON die later van schijf wordt gelezen.
export type SearchMeasurement = Awaited<ReturnType<typeof measureSearch>>;

// Alleen rechtstreeks uitvoeren start de worker. argv[2] is het bundelbestand;
// argv[3] is optioneel de oude zoekfunctie. De bestuurder leest ons JSON-antwoord.
if (process.argv[1]?.endsWith("search-worker.ts")) {
  measureSearch(process.argv[2], process.argv[3])
    .then((result) => console.log(JSON.stringify(result)))
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}

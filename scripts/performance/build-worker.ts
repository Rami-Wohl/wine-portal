// Deze worker is een apart Node-programma voor één contentbuild.
// 'Build' betekent hier: bronbestanden lezen, controleren en samenvoegen tot JSON.
// Zie benchmark.ts voor de besturing en processes.ts voor het begrip kindproces.
// De proefmap komt binnen via argv[2]; het antwoord gaat als JSON naar stdout.
// stdout is het uitvoerkanaal dat de bestuurder uitleest. Extra console.log-tekst
// zou dat JSON-antwoord ongeldig maken: tijdens de meting dus geen losse berichten.
import { performance } from "node:perf_hooks";
import { buildContent } from "../content/pipeline";

// performance.now is een stopwatch die niet verspringt bij een gewijzigde klok.
// De pipeline doet hetzelfde werk als bij een normale contentbuild, inclusief
// controleren van beeldchecksums (vingerafdrukken van de beeldbestanden).
export async function measureContentBuild(root: string) {
  const started = performance.now();
  const { knowledgeBase, outputs } = await buildContent({ root });
  return {
    ms: performance.now() - started,
    // RSS is geheugen dat het hele programma in RAM gebruikt, niet alleen objecten.
    // maxRSS is de hoogste waarde sinds de processtart; KiB is 1024 bytes.
    maxRssKiB: process.resourceUsage().maxRSS,
    // Dit is een momentopname na de build. Hier forceren we geen geheugenopruiming;
    // dat gebeurt wel bij de vergelijkbare zoekmetingen in search-worker.ts.
    memory: process.memoryUsage(),
    counts: {
      entities: knowledgeBase.entities.length,
      activeEntities: knowledgeBase.entities.filter(({ status }) => status === "active").length,
      narratives: knowledgeBase.narratives.length,
      paths: knowledgeBase.learning_paths.length,
      sources: knowledgeBase.sources.length,
      media: knowledgeBase.media.length,
    },
    // Tel UTF-8-bytes, niet tekens. Een accent kan meer dan één byte innemen.
    bundleBytes: Buffer.byteLength(outputs["knowledge-base.json"]),
  };
}

// ReturnType vraagt TypeScript naar het antwoordtype van de functie.
// Awaited haalt het antwoord uit de Promise-verpakking: zie processes.ts.
// Deze regel beschrijft data voor de editor; hij meet of controleert niets tijdens uitvoering.
export type ContentBuildMeasurement = Awaited<ReturnType<typeof measureContentBuild>>;

// Bij rechtstreeks starten staat de scriptnaam in argv[1]. Bij importeren door
// een ander bestand willen we alleen de functie delen, niet meteen een meting starten.
if (process.argv[1]?.endsWith("build-worker.ts")) {
  measureContentBuild(process.argv[2])
    .then((result) => console.log(JSON.stringify(result)))
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}

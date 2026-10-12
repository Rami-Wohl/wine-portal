// Dit bestand bestuurt de meting. Start: npm run benchmark -- --scales=1
// Node voert JavaScript buiten de browser uit; hier gebruiken we het als meetprogramma.
// Een 'proces' is één draaiend programma met eigen geheugen. We starten aparte
// processen voor bouwen en zoeken, zodat een vorige meting geen geheugen achterlaat.
//
// Leesvolgorde: fixtures.ts (proefdata), build-worker.ts (bouwen), search-worker.ts
// (zoeken), production.ts (website), budgets.ts (grenzen), daarna dit bestand.
// processes.ts legt starten, uitvoer lezen en stoppen van programma's uit.
//
// Kleine taalsleutel: const bewaart een waarde, een functie bundelt stappen.
// import haalt functies of typen uit andere bestanden. Een type beschrijft welke
// gegevens TypeScript verwacht; het controleert geen ingelezen JSON tijdens uitvoering.
// async/await laat een functie wachten op bijvoorbeeld een bestand of ander programma.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpus, platform, release, tmpdir, totalmem } from "node:os";
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { brotliCompressSync, constants, gzipSync } from "node:zlib";
import ts from "typescript";
import type { MediaAsset } from "../../src/content/model";
import {
  addApplicationFixture,
  withCorpusFixture,
  filesUnder,
  prepareOutputDirectory,
} from "./fixtures";
import { command } from "./processes";
import { measureBuildArtifacts, measureServer } from "./production";
import { evaluateBudgets, type BudgetMeasurements, type ScaleMeasurement } from "./budgets";
import type { SearchMeasurement } from "./search-worker";
import type { ContentBuildMeasurement } from "./build-worker";

// Tel bestanden en bytes: een byte is een eenheid van opgeslagen gegevens.
// Deze inventaris verandert niet met de schaal, omdat beelden niet worden gekopieerd.
async function inventory(repository: string) {
  const mediaFiles = await filesUnder(path.join(repository, "public/media"));
  const media = await Promise.all(
    mediaFiles.map(async (file) => ({
      key: path.relative(path.join(repository, "public/media"), file),
      bytes: (await stat(file)).size,
    })),
  );
  // Git bewaart ook eerdere versies. Vraag de echte opslagmap op: bij een
  // worktree (extra checkout) hoeft die niet onder de lokale .git-map te staan.
  const gitObjectDirectory = execFileSync("git", ["rev-parse", "--git-path", "objects"], {
    cwd: repository,
    encoding: "utf8",
  }).trim();
  const gitFiles = await filesUnder(path.resolve(repository, gitObjectDirectory));
  const gitObjectBytes = (
    await Promise.all(gitFiles.map(async (file) => (await stat(file)).size))
  ).reduce((sum, size) => sum + size, 0);
  // Alleen door Git bijgehouden beelden tellen mee voor trackedBytes.
  // -z scheidt namen met een nulbyte; daardoor zijn spaties in bestandsnamen veilig.
  const tracked = new Set(
    execFileSync("git", ["ls-files", "-z", "public/media"], { cwd: repository, encoding: "utf8" })
      .split("\0")
      .filter(Boolean),
  );
  return {
    media: {
      files: media.length,
      bytes: media.reduce((sum, file) => sum + file.bytes, 0),
      trackedBytes: media
        .filter(({ key }) => tracked.has(`public/media/${key}`))
        .reduce((sum, file) => sum + file.bytes, 0),
      over2MiB: media.filter(({ bytes }) => bytes > 2 * 1024 ** 2).length,
      largest: media.sort((a, b) => b.bytes - a.bytes).slice(0, 5),
    },
    gitObjectBytes,
  };
}

// Voor een vergelijking halen we alleen de oude zoekfunctie uit Git.
// De data en hulpfuncties blijven die van nu: dit is geen volledige oude website.
async function referenceModule(repository: string, output: string, revision: string) {
  // Los eerst een branch of tag op naar een vaste commit: één opgeslagen Git-versie.
  const commit = execFileSync(
    "git",
    ["rev-parse", "--verify", "--end-of-options", `${revision}^{commit}`],
    { cwd: repository, encoding: "utf8" },
  ).trim();
  const original = execFileSync("git", ["show", `${commit}:src/content/search.ts`], {
    cwd: repository,
    encoding: "utf8",
  });
  // TypeScript bevat extra type-informatie. Transpileren verwijdert die zodat
  // Node de code kan uitvoeren. Dit is geen volledige typecontrole.
  const javascript = ts.transpileModule(original, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  // De oude functie staat straks in een tijdelijke map. Relatieve imports zoals
  // './routing' moeten daarom naar het huidige project wijzen, niet naar die map.
  const relocated = javascript.replace(
    /from (["'])\.\/([^"']+)\1/g,
    (_match, _quote, file) =>
      `from ${JSON.stringify(pathToFileURL(path.join(repository, "src/content", `${file}.ts`)).href)}`,
  );
  const filename = path.join(output, "reference-search.mjs");
  await writeFile(filename, relocated);
  return filename;
}

// gzip en Brotli verkleinen bytes door herhaling slimmer op te slaan.
// Dit is een schatting: de browser downloadt deze bundel nooit in zijn geheel.
// Brotli-kwaliteit 4 is sneller dan 11; de gekozen waarde staat ook in het rapport.
// Deze functie houdt de grote bytebuffer alleen vast zolang hij hier nodig is.
async function estimateTransport(bundleFile: string) {
  const bytes = await readFile(bundleFile);
  return {
    gzipBytes: gzipSync(bytes).length,
    brotliBytes: brotliCompressSync(bytes, { params: { [constants.BROTLI_PARAM_QUALITY]: 4 } })
      .length,
  };
}

async function main() {
  // process.argv bevat de opdracht waarmee Node is gestart. De eerste twee
  // onderdelen zijn Node en het script; daarna komen onze opties, zoals --production.
  const arguments_ = process.argv.slice(2);
  const allowed = ["--production", "--clone", "--keep-fixtures", "--enforce", "--help"];
  for (const argument of arguments_) {
    if (!allowed.includes(argument) && !/^--(?:output|scales|reference|check)=.+$/.test(argument))
      throw new Error(`Unknown option: ${argument}`);
  }
  if (arguments_.includes("--help")) {
    console.log(
      "npm run benchmark -- [--production] [--clone] [--scales=1,3,8] [--reference=<git-ref>] [--output=<new-directory-outside-repo>] [--keep-fixtures] [--enforce] | --check=<results.json>",
    );
    return;
  }
  const repository = process.cwd();
  // Zoek bijvoorbeeld in '--scales=1,3' de waarde '1,3'. Een ontbrekende optie
  // levert undefined op: JavaScript voor 'er is geen waarde'.
  const option = (name: string) =>
    arguments_.find((argument) => argument.startsWith(`--${name}=`))?.slice(name.length + 3);
  // --check beoordeelt een bestaand rapport opnieuw. Er wordt niets gebouwd.
  // JSON.parse zet opgeslagen tekst om in objecten; budgets.ts controleert de inhoud.
  if (option("check")) {
    const saved: BudgetMeasurements = JSON.parse(
      await readFile(path.resolve(option("check")!), "utf8"),
    );
    const checks = evaluateBudgets(saved);
    console.table(
      checks.map(({ actual, limit, ...check }) => ({
        ...check,
        actual: Math.round(actual),
        limit,
      })),
    );
    if (checks.some(({ passed }) => !passed)) process.exitCode = 1;
    return;
  }
  // 1× is de echte hoeveelheid content. 3× en 8× zijn synthetische kopieën.
  // Ongeldige of dubbele schalen wijzen we af, zodat de opdracht eenduidig blijft.
  const scales = (option("scales") ?? "1,3,8").split(",").map(Number);
  if (
    !scales.length ||
    scales.some((scale) => !Number.isInteger(scale) || scale < 1 || scale > 8) ||
    new Set(scales).size !== scales.length
  )
    throw new Error("Scales must be distinct integers from 1 through 8.");
  // Gebruik een lege tijdelijke map buiten het project. prepareOutputDirectory
  // controleert ook symlinks. Bestaande resultaten overschrijven we niet.
  const output = option("output")
    ? path.resolve(option("output")!)
    : await mkdtemp(path.join(tmpdir(), "oenocademy-performance-"));
  await prepareOutputDirectory(repository, output);
  const logs = path.join(output, "logs");
  await mkdir(logs);
  const reference = option("reference");
  const referenceFile = reference
    ? await referenceModule(repository, output, reference)
    : undefined;
  const results: ScaleMeasurement[] = [];
  // Dit object is het verslag: codeversie, computer, methode en resultaten.
  // results en report.scales wijzen naar dezelfde lijst. Nieuwe meetregels komen
  // daardoor bij de volgende save() automatisch in het bestand terecht.
  const report = {
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    revision: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
    dirty: Boolean(execFileSync("git", ["status", "--porcelain"], { encoding: "utf8" }).trim()),
    // Een hash is een korte vingerafdruk van bytes. Hiermee herkennen we later
    // welke zoekcode bij deze meting hoorde, ook als er ongecommitte werk was.
    searchSourceSha256: createHash("sha256")
      .update(await readFile(path.join(repository, "src/content/search.ts")))
      .digest("hex"),
    reference,
    environment: {
      node: process.version,
      platform: platform(),
      release: release(),
      cpu: cpus()[0]?.model,
      logicalCpus: cpus().length,
      totalMemoryBytes: totalmem(),
    },
    // Getallen hebben alleen betekenis met hun methode erbij. 'Cold' betekent
    // hier een vers programma; het besturingssysteem kan bestanden nog in zijn cache hebben.
    method: {
      production: arguments_.includes("--production"),
      scales,
      searchRounds: 5,
      httpRounds: 3,
      sharedSourcesAndMedia: true,
      cold: "fresh process, warm OS filesystem; not a cloud cold start",
      compression: "JSON gzip/Brotli estimates; HTTP values are actual compressed body bytes",
      brotliQuality: 4,
    },
    inventory: await inventory(repository),
    scales: results,
  };

  // Schrijf tussenresultaten. Bij een latere fout blijft het eerdere werk leesbaar.
  // Dat maakt een onderbroken rapport nog niet compleet: budgets.ts bewaakt dat.
  const save = () =>
    writeFile(path.join(output, "results.json"), `${JSON.stringify(report, null, 2)}\n`);
  // tsx laat Node onze .ts-bestanden uitvoeren. We geven het bestandspad expliciet
  // mee, zodat dit ook werkt wanneer het kindproces vanuit een proefmap draait.
  const loader = path.join(repository, "node_modules/tsx/dist/loader.mjs");
  for (const scale of scales) {
    const fixture = path.join(output, `fixture-${scale}x`);
    console.log(`[${scale}x] Creating isolated corpus`);
    // Eerst proefdata maken, daarna deze meetstappen uitvoeren. De helper ruimt
    // ook op als het aanmaken of een meting faalt; --keep-fixtures bewaart de map bewust.
    await withCorpusFixture(
      repository,
      fixture,
      scale,
      arguments_.includes("--keep-fixtures"),
      async (fixtureMs) => {
        // Stap 1: laat een apart programma de echte contentpipeline uitvoeren.
        // Zijn stdout is één JSON-antwoord; command wacht tot alle uitvoer binnen is.
        const built = await command(
          [
            "--import",
            loader,
            path.join(repository, "scripts/performance/build-worker.ts"),
            fixture,
          ],
          repository,
          path.join(logs, `${scale}x-content.log`),
        );
        const content: ContentBuildMeasurement = JSON.parse(built.stdout);
        const bundleFile = path.join(fixture, "src/generated/content/knowledge-base.json");
        const transportEstimate = await estimateTransport(bundleFile);
        const result = {
          scale,
          fixtureMs,
          content: { ...content, processMs: built.elapsedMs },
          transportEstimate,
        };
        // Stap 2: meet zoeken in een nieuw programma. --expose-gc geeft ons toegang
        // tot geheugenopruiming; search-worker.ts legt uit waarom we die hier gebruiken.
        const searchArgs = [
          "--expose-gc",
          "--import",
          loader,
          path.join(repository, "scripts/performance/search-worker.ts"),
          bundleFile,
        ];
        const current: SearchMeasurement = JSON.parse(
          (await command(searchArgs, repository, path.join(logs, `${scale}x-search.log`))).stdout,
        );
        const measured: ScaleMeasurement = { ...result, search: current };
        // Vergelijk dezelfde zoekvoorbeelden met de oude functie. We vergelijken
        // vingerafdrukken van resultaten: alleen sneller worden is niet genoeg als de
        // volgorde of tekst verandert. Dit bewijst gelijkheid voor deze voorbeelden.
        if (referenceFile) {
          const previous: SearchMeasurement = JSON.parse(
            (
              await command(
                [...searchArgs, referenceFile],
                repository,
                path.join(logs, `${scale}x-reference.log`),
              )
            ).stdout,
          );
          measured.referenceSearch = previous;
          const fingerprint = (measurements: typeof current) =>
            measurements.results.map(({ fingerprint }: { fingerprint: string }) => fingerprint);
          if (JSON.stringify(fingerprint(current)) !== JSON.stringify(fingerprint(previous)))
            throw new Error(`Search ranking/snippet parity failed at ${scale}x`);
          measured.referenceParity = true;
        }
        // Bewaar eerst content en zoeken. De productiegegevens worden hierna aan
        // hetzelfde object toegevoegd, en vervolgens opnieuw opgeslagen.
        results.push(measured);
        await save();
        console.log(
          `[${scale}x] Content validated; ${content.counts.entities} entities; search measured`,
        );
        // Stap 3 is optioneel: bouw en start de echte Next-app in de proefmap.
        // De PostCSS-configuratie gaat mee zodat de CSS op dezelfde manier wordt gebouwd.
        if (arguments_.includes("--production")) {
          await addApplicationFixture(repository, fixture);
          const production = await command(
            [path.join(repository, "node_modules/next/dist/bin/next"), "build", "--webpack"],
            fixture,
            path.join(logs, `${scale}x-next-build.log`),
          );
          measured.productionBuildMs = production.elapsedMs;
          measured.artifacts = await measureBuildArtifacts(fixture);
          // Alleen beeldmetingen hebben de mediametadata nodig. Parse daarom pas hier
          // en bewaar alleen media; houd niet de volledige kennisbundel naast de bytes vast.
          const { media }: { media: MediaAsset[] } = JSON.parse(await readFile(bundleFile, "utf8"));
          measured.server = await measureServer(fixture, 3310 + scale, media, scale === 1);
          await save();
          console.log(`[${scale}x] Production build and HTTP workload measured`);
        }
      },
    );
  }
  // --clone meet een lokale Git-kopie met volledige historie. --no-hardlinks
  // dwingt echte bytekopieën af. Dit zegt niets over downloaden via internet.
  if (arguments_.includes("--clone")) {
    const cloneDirectory = path.join(output, "local-clone");
    try {
      const cloned = await command(
        ["clone", "--local", "--no-hardlinks", repository, cloneDirectory],
        repository,
        path.join(logs, "clone.log"),
        "git",
      );
      Object.assign(report, {
        localClone: {
          ms: cloned.elapsedMs,
          method: "local full-history copy with checkout and no hardlinks; not a network clone",
        },
      });
    } finally {
      await rm(cloneDirectory, { recursive: true, force: true });
    }
  }
  // Tot slot: registreer alle grenscontroles. Met --enforce zorgt een overschrijding
  // voor exitcode 1: het signaal waarmee de shell of CI een mislukte opdracht herkent.
  const checks = evaluateBudgets(report);
  Object.assign(report, { budgets: checks });
  if (arguments_.includes("--enforce") && checks.some(({ passed }) => !passed))
    process.exitCode = 1;
  await save();
  console.log(`Budgets: ${checks.filter(({ passed }) => passed).length}/${checks.length} passed`);
  console.log(`Results: ${path.join(output, "results.json")}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

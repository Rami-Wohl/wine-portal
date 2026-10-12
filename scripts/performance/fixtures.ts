// Een fixture is een tijdelijke proefopstelling. Hier bouwen we een proefmap met
// dezelfde content als het project. Alleen die map wordt tijdens metingen gewijzigd.
// Bij 3× maken we drie versies van elk onderwerp, met verschillende IDs en webnamen.
// Dat test groei in hoeveelheid; het voorspelt niet hoe echte nieuwe content eruitziet.
// Bronnen en beelden blijven gedeeld. Een symlink is een doorverwijzing naar hun
// echte map: we lezen die bestanden, maar schrijven ze hier niet over.
import { cp, mkdir, readFile, readdir, realpath, rm, symlink, writeFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import path from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

// Lees een map en alle submappen. De functie roept zichzelf aan: dat heet recursie.
// Promise.all wacht op meerdere leesopdrachten; sort maakt de bestandsvolgorde vast.
export async function filesUnder(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const filename = path.join(directory, entry.name);
      return entry.isDirectory() ? filesUnder(filename) : Promise.resolve([filename]);
    }),
  );
  return nested.flat().sort();
}

interface Package {
  directory: string;
  metadata: Record<string, unknown>;
}

// Een slug is de leesbare naam in een URL. Elke kopie krijgt een achtervoegsel,
// bijvoorbeeld merlot-bench-2. We lopen ook door geneste objecten en lijsten:
// contentplannen herhalen die namen en moeten naar de juiste kopie blijven wijzen.
function suffixSlugs(value: unknown, suffix: string): unknown {
  if (Array.isArray(value)) return value.map((item) => suffixSlugs(item, suffix));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [
      key,
      key === "slugs"
        ? Object.fromEntries(
            Object.entries(child as Record<string, string>).map(([locale, slug]) => [
              locale,
              `${slug}${suffix}`,
            ]),
          )
        : suffixSlugs(child, suffix),
    ]),
  );
}

/** Synthetic copies are valid isolated packages, never additions to canonical content. */
// Maak eerst één ongewijzigde contentkopie. Maak daarna zo nodig extra versies.
// Bronrecords en beeldbestanden delen we via symlinks; hun identiteit blijft gelijk.
export async function createCorpusFixture(
  repository: string,
  destination: string,
  scale: number,
): Promise<void> {
  const content = path.join(repository, "content");
  await mkdir(destination, { recursive: true });
  await cp(content, path.join(destination, "content"), { recursive: true });
  await symlink(path.join(repository, "data"), path.join(destination, "data"), "dir");
  await symlink(path.join(repository, "public"), path.join(destination, "public"), "dir");
  const metadataFiles = (await filesUnder(content)).filter((file) =>
    ["entity.yaml", "narrative.yaml", "learning-path.yaml"].includes(path.basename(file)),
  );
  const packages: Package[] = await Promise.all(
    metadataFiles.map(async (file) => ({
      directory: path.dirname(file),
      metadata: parseYaml(await readFile(file, "utf8")),
    })),
  );
  // Geografische identiteit mogen we niet verzinnen. Zodra echte geodata meedoen,
  // moet eerst worden afgesproken wat een geldige schaalproef daarvan betekent.
  if (scale > 1 && packages.some(({ metadata }) => metadata.geography_id)) {
    throw new Error(
      "Geographic fixtures need an explicit cloning contract; never invent geography.",
    );
  }

  for (let copy = 2; copy <= scale; copy += 1) {
    const suffix = `-bench-${copy}`;
    // Een Map is een opzoektabel: oude ID -> ID van deze kopie.
    // Alleen onderwerpen en assertions (los vastgelegde claims) krijgen nieuwe IDs.
    // Bronnen, beelden en sectieankers blijven bewust hetzelfde.
    const identifiers = new Map<string, string>();
    for (const { metadata } of packages) {
      const id = String(metadata.id);
      identifiers.set(id, `${id}${suffix}`);
      for (const assertion of (metadata.assertions ?? []) as Array<{ id: string }>) {
        identifiers.set(assertion.id, `${assertion.id}${suffix}`);
      }
    }
    // Een reguliere expressie is een zoekpatroon voor tekst. Dit patroon vindt
    // complete bekende IDs in YAML én Markdown. Langste eerst voorkomt dat een
    // korte ID een langere opsplitst; grenscontroles voorkomen halve treffers.
    const idPattern = new RegExp(
      `(?<![a-zA-Z0-9_.-])(?:${[...identifiers.keys()]
        .sort((a, b) => b.length - a.length)
        .map((id) => id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("|")})(?![a-zA-Z0-9_.-])`,
      "g",
    );
    const replaceIds = (text: string) => text.replace(idPattern, (id) => identifiers.get(id)!);
    for (const item of packages) {
      // Zet elke kopie in een eigen map naast de oorspronkelijke proefkopie.
      const target = path.join(
        destination,
        "content",
        `${path.relative(content, item.directory)}${suffix}`,
      );
      await mkdir(target, { recursive: true });
      for (const filename of await filesUnder(item.directory)) {
        const relative = path.relative(item.directory, filename);
        let text = replaceIds(await readFile(filename, "utf8"));
        // YAML is leesbare gestructureerde tekst. Na het aanpassen van IDs passen we
        // ook slugs aan. Opmaak mag veranderen: de betekenis van de proefdata telt.
        if (relative.endsWith(".yaml")) {
          text = stringifyYaml(suffixSlugs(parseYaml(text), suffix));
        }
        await mkdir(path.dirname(path.join(target, relative)), { recursive: true });
        await writeFile(path.join(target, relative), text);
      }
    }
  }
}

// Voeg de appcode en bouwinstellingen toe. src/generated slaan we over:
// daar staat al de bundel van de zojuist gebouwde, mogelijk vergrote proefdata.
// node_modules bevat geïnstalleerde libraries; een symlink voorkomt opnieuw installeren.
// Geheime lokale .env-bestanden worden niet meegenomen.
export async function addApplicationFixture(
  repository: string,
  destination: string,
): Promise<void> {
  await cp(path.join(repository, "src"), path.join(destination, "src"), {
    recursive: true,
    filter: (filename) => filename !== path.join(repository, "src/generated"),
  });
  for (const filename of [
    "package.json",
    "package-lock.json",
    "next.config.ts",
    "tsconfig.json",
    "postcss.config.mjs",
  ]) {
    await cp(path.join(repository, filename), path.join(destination, filename));
  }
  await symlink(
    path.join(repository, "node_modules"),
    path.join(destination, "node_modules"),
    "dir",
  );
}

// Controleer de echte bestemming vóór we mappen aanmaken. Een symlink kan
// buiten het project lijken te staan maar toch naar binnen verwijzen.
// Als de map nog niet bestaat, zoeken we de dichtstbijzijnde bestaande bovenliggende map.
export async function prepareOutputDirectory(repository: string, output: string) {
  let ancestor = path.resolve(output);
  const missing: string[] = [];
  let physical: string;
  for (;;) {
    try {
      physical = path.join(await realpath(ancestor), ...missing);
      break;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      missing.unshift(path.basename(ancestor));
      const parent = path.dirname(ancestor);
      if (parent === ancestor) throw error;
      ancestor = parent;
    }
  }
  const relative = path.relative(await realpath(repository), physical);
  if (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative))
  )
    throw new Error("Benchmark output must be outside the repository.");
  await mkdir(output, { recursive: true });
  if ((await readdir(output)).length) throw new Error("Benchmark output directory must be empty.");
}

// try voert het werk uit; finally ruimt daarna op, ook bij een fout.
// Het aanmaken staat óók binnen try: een halve proefmap moet eveneens verdwijnen.
// measure is een meegegeven functie: de bestuurder bepaalt welke metingen volgen.
export async function withCorpusFixture<T>(
  repository: string,
  destination: string,
  scale: number,
  keep: boolean,
  measure: (fixtureMs: number) => Promise<T>,
): Promise<T> {
  try {
    const started = performance.now();
    await createCorpusFixture(repository, destination, scale);
    return await measure(performance.now() - started);
  } finally {
    if (!keep) await rm(destination, { recursive: true, force: true });
  }
}

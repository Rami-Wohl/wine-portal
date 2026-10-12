// Een test beschrijft wat de code moet doen en controleert de uitkomst met expect.
// We maken hier kleine tijdelijke projecten. Daarmee kunnen we fouten uitlokken
// zonder de echte wijncontent te veranderen. describe groepeert tests; it is één test.
// Zie fixtures.ts voor het maken van proefdata en het begrip symlink.
import { mkdtemp, mkdir, readFile, rm, writeFile, symlink, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { buildContent } from "../content/pipeline";
import {
  createCorpusFixture,
  addApplicationFixture,
  prepareOutputDirectory,
  withCorpusFixture,
} from "./fixtures";

const roots: string[] = [];
const localized = { nl: "Fixture", en: "Fixture" };

// Maak alleen wat de contentpipeline nodig heeft: een bronrecord en een
// beeldmap. Bewaar de proefmapnaam om later ook na een mislukte test op te ruimen.
async function repositoryFixture() {
  const root = await mkdtemp(path.join(tmpdir(), "oeno-performance-test-"));
  roots.push(root);
  await mkdir(path.join(root, "data/sources"), { recursive: true });
  await mkdir(path.join(root, "public/media"), { recursive: true });
  await writeFile(
    path.join(root, "data/sources/fixture.yaml"),
    stringifyYaml({
      id: "source.fixture",
      source_type: "dataset",
      publisher: "Fixture",
      title: "Fixture",
      language: "en",
      status: "active",
    }),
  );
  return root;
}

// Een package is één onderwerp met metadata en eventueel NL/EN-tekst.
// De korte proeftekst is gelijk in beide talen omdat we hier structuur testen.
async function writePackage(
  root: string,
  relative: string,
  filename: string,
  metadata: object,
  markdown?: string,
) {
  const directory = path.join(root, "content", relative);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), stringifyYaml(metadata));
  if (markdown !== undefined) {
    const prefix = filename === "entity.yaml" ? "overview" : "article";
    for (const locale of ["nl", "en"])
      await writeFile(path.join(directory, `${prefix}.${locale}.md`), markdown);
  }
  return path.join(directory, filename);
}

// Draft voorkomt publicatieregels die voor deze technische proef niet relevant zijn.
function entity(id: string, type: string) {
  return {
    id,
    type,
    status: "draft",
    canonical_name: "Fixture",
    names: localized,
    slugs: { nl: id.split(".")[1], en: id.split(".")[1] },
    locales: { nl: "overview.nl.md", en: "overview.en.md" },
    relations: [],
    assertions: [],
    source_refs: [],
  };
}

// afterEach draait na iedere test. splice haalt de namen uit de lijst;
// Promise.all wacht tot alle proefmappen zijn verwijderd.
afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("isolated scale fixtures", () => {
  it("preserves provenance and anchors while remapping graph, article, producer and path references", async () => {
    const root = await repositoryFixture();
    const originalFile = await writePackage(
      root,
      "entities/regions/example",
      "entity.yaml",
      {
        ...entity("region.example", "region"),
        source_refs: ["source.fixture"],
        assertions: [
          {
            id: "assertion.example.fixture",
            predicate: "example",
            value: "Fixture",
            status: "provisional",
            sources: ["source.fixture"],
          },
        ],
      },
      ":::summary{#core}\nFixture.\n:::\n",
    );
    // Bewaar de oorspronkelijke bytes om te bewijzen dat het echte bronbestand
    // niet verandert wanneer we de proefdata vermenigvuldigen.
    const before = await readFile(originalFile);
    await writePackage(
      root,
      "entities/producers/example",
      "entity.yaml",
      {
        ...entity("producer.example", "producer"),
        presentation: { mode: "register-entry", owner: "region.example", anchor: "core" },
        relations: [{ type: "located_in", target: "region.example" }],
      },
      "",
    );
    await writePackage(
      root,
      "narratives/lessons/example",
      "narrative.yaml",
      {
        id: "narrative.lesson.example",
        type: "lesson",
        status: "draft",
        title: localized,
        slugs: { nl: "example", en: "example" },
        locales: { nl: "article.nl.md", en: "article.en.md" },
        primary_entity: "region.example",
        related_entities: [],
        source_refs: [],
      },
      ":::summary{#intro}\n[[producer.example|Fixture]] in [[region.example|Fixture]].\n:::\n",
    );
    await writePackage(root, "learning-paths/example", "learning-path.yaml", {
      schema_version: 1,
      id: "learning-path.example",
      status: "draft",
      curriculum_level: "understand",
      title: localized,
      slugs: { nl: "example", en: "example" },
      summary: localized,
      audience: localized,
      prerequisites: { nl: [], en: [] },
      objectives: { nl: ["Fixture"], en: ["Fixture"] },
      steps: [{ id: "step", target: "narrative.lesson.example", context: localized }],
      completion: {
        recap: { nl: ["Fixture"], en: ["Fixture"] },
        encouragement: localized,
        suggestions: [{ id: "next", target: "region.example", context: localized }],
      },
    });
    const destination = path.join(root, "isolated");
    await createCorpusFixture(root, destination, 3);
    // Laat de echte pipeline de proef beoordelen. Alleen namen controleren zou
    // bijvoorbeeld een kapotte relatie kunnen missen; de pipeline wijst die af.
    const { knowledgeBase: bundle } = await buildContent({ root: destination, write: false });

    expect(bundle.entities).toHaveLength(6);
    expect(bundle.narratives).toHaveLength(3);
    expect(bundle.learning_paths).toHaveLength(3);
    expect(bundle.sources).toHaveLength(1);
    expect(
      bundle.entities.find(({ id }) => id === "region.example-bench-3")?.assertions[0],
    ).toMatchObject({ id: "assertion.example.fixture-bench-3", sources: ["source.fixture"] });
    expect(
      bundle.entities.find(({ id }) => id === "producer.example-bench-3")?.presentation,
    ).toEqual({ mode: "register-entry", owner: "region.example-bench-3", anchor: "core" });
    expect(
      bundle.narratives
        .find(({ id }) => id === "narrative.lesson.example-bench-3")
        ?.mentions.map(({ entity_id }) => entity_id),
    ).toContain("producer.example-bench-3");
    expect(
      bundle.learning_paths.find(({ id }) => id === "learning-path.example-bench-3")?.steps[0],
    ).toMatchObject({ id: "step", target: "narrative.lesson.example-bench-3" });
    expect(await readFile(originalFile)).toEqual(before);
  });

  it("keeps dependency slugs in plan metadata aligned with cloned entity routes", async () => {
    const root = await repositoryFixture();
    const original = await writePackage(
      root,
      "entities/regions/example",
      "entity.yaml",
      entity("region.example", "region"),
      "",
    );
    await writeFile(
      path.join(path.dirname(original), "content-plan.yaml"),
      stringifyYaml({
        package_id: "region.example",
        entity_dependencies: [{ id: "region.example", slugs: { nl: "example", en: "example" } }],
      }),
    );
    const destination = path.join(root, "isolated");
    await createCorpusFixture(root, destination, 3);
    const plan = parseYaml(
      await readFile(
        path.join(destination, "content/entities/regions/example-bench-3/content-plan.yaml"),
        "utf8",
      ),
    );
    expect(plan.entity_dependencies[0]).toEqual({
      id: "region.example-bench-3",
      slugs: { nl: "example-bench-3", en: "example-bench-3" },
    });
  });

  it("refuses to multiply geographic identities without a verified fixture contract", async () => {
    const root = await repositoryFixture();
    await writePackage(
      root,
      "entities/regions/example",
      "entity.yaml",
      { ...entity("region.example", "region"), geography_id: "geo.example" },
      "",
    );
    await expect(createCorpusFixture(root, path.join(root, "isolated"), 3)).rejects.toThrow(
      /never invent geography/,
    );
  });
});

// Deze tests bewaken de randvoorwaarden: dezelfde bouwinstellingen gebruiken
// en opruimen wanneer het aanmaken of meten halverwege mislukt.
describe("application configuration and fixture cleanup", () => {
  it("copies the real PostCSS configuration and preserves the generated content", async () => {
    const root = await repositoryFixture();
    await mkdir(path.join(root, "src/generated"), { recursive: true });
    await mkdir(path.join(root, "node_modules"));
    await writeFile(path.join(root, "src/generated/knowledge-base.json"), "original");
    await writeFile(path.join(root, "src/example.ts"), "export const example = true;");
    const configs = [
      "package.json",
      "package-lock.json",
      "next.config.ts",
      "tsconfig.json",
      "postcss.config.mjs",
    ];
    for (const file of configs) await writeFile(path.join(root, file), `fixture ${file}`);
    const destination = path.join(root, "isolated");
    await mkdir(path.join(destination, "src/generated"), { recursive: true });
    await writeFile(path.join(destination, "src/generated/knowledge-base.json"), "scaled");
    await addApplicationFixture(root, destination);
    for (const file of configs)
      expect(await readFile(path.join(destination, file), "utf8")).toBe(`fixture ${file}`);
    expect(
      await readFile(path.join(destination, "src/generated/knowledge-base.json"), "utf8"),
    ).toBe("scaled");
  });
  it("removes partial fixtures when setup fails", async () => {
    const root = await repositoryFixture();
    await writePackage(
      root,
      "entities/regions/example",
      "entity.yaml",
      { ...entity("region.example", "region"), geography_id: "geo.example" },
      "",
    );
    const destination = path.join(root, "isolated");
    await expect(withCorpusFixture(root, destination, 3, false, async () => {})).rejects.toThrow(
      /never invent geography/,
    );
    await expect(stat(destination)).rejects.toMatchObject({ code: "ENOENT" });
    expect(await readFile(path.join(root, "data/sources/fixture.yaml"), "utf8")).toContain(
      "source.fixture",
    );
  });
  it("removes a fixture on measurement failure and respects explicit keep", async () => {
    const root = await repositoryFixture();
    await mkdir(path.join(root, "content"));
    const destination = path.join(root, "isolated");
    await expect(
      withCorpusFixture(root, destination, 1, false, async () => {
        throw new Error("measurement failed");
      }),
    ).rejects.toThrow(/measurement failed/);
    await expect(stat(destination)).rejects.toMatchObject({ code: "ENOENT" });
    await withCorpusFixture(root, destination, 1, true, async () => {});
    expect((await stat(destination)).isDirectory()).toBe(true);
  });
});

// Controleer ook een pad dat via een symlink terugwijst naar het project.
// Een gewone tekstvergelijking van paden zou dat missen.
describe("benchmark output location", () => {
  it("rejects direct and symlinked paths inside the repository before creating directories", async () => {
    const root = await repositoryFixture();
    const outside = await repositoryFixture();
    const alias = path.join(outside, "alias");
    await symlink(root, alias, "dir");
    for (const output of [root, path.join(root, "results"), path.join(alias, "new", "results")])
      await expect(prepareOutputDirectory(root, output)).rejects.toThrow(/outside the repository/);
    await expect(stat(path.join(root, "new"))).rejects.toMatchObject({ code: "ENOENT" });
  });
  it("accepts an external empty directory and refuses reused output", async () => {
    const root = await repositoryFixture();
    const outside = await repositoryFixture();
    const output = path.join(outside, "new", "results");
    await prepareOutputDirectory(root, output);
    await writeFile(path.join(output, "results.json"), "{}");
    await expect(prepareOutputDirectory(root, output)).rejects.toThrow(/must be empty/);
  });
});

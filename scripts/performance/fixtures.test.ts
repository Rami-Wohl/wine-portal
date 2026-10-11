import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { buildContent } from "../content/pipeline";
import { createCorpusFixture } from "./fixtures";

const roots: string[] = [];
const localized = { nl: "Fixture", en: "Fixture" };

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
    // A focused metadata excerpt: the complete schema is exercised by corpus builds.
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

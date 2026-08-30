import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { stringify as stringifyYaml } from "yaml";
import { generateEntityPackage } from "./generator";
import { buildContent, ContentValidationError } from "./pipeline";

const temporaryRoots: string[] = [];

async function temporaryRoot(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "wine-content-test-"));
  temporaryRoots.push(root);
  return root;
}

async function addEntity(root: string, options: { id: string; type?: string; slug?: string; relations?: Array<{ type: string; target: string }> }): Promise<void> {
  const [idType, idSlug] = options.id.split(".");
  const type = options.type ?? idType;
  const slug = options.slug ?? idSlug;
  const directory = path.join(root, "content", "entities", `${type}s`, `${slug}-${Math.random().toString(16).slice(2)}`);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "entity.yaml"), stringifyYaml({
    id: options.id,
    type,
    status: "draft",
    canonical_name: slug,
    names: { nl: slug, en: slug },
    slugs: { nl: slug, en: slug },
    locales: { nl: "overview.nl.md", en: "overview.en.md" },
    relations: options.relations ?? [],
    assertions: [],
    source_refs: [],
  }));
  await writeFile(path.join(directory, "overview.nl.md"), `# ${slug}\n`);
  await writeFile(path.join(directory, "overview.en.md"), `# ${slug}\n`);
}

async function addNarrative(root: string, markdown: string): Promise<void> {
  const directory = path.join(root, "content", "narratives", "explainers", "proof");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "narrative.yaml"), stringifyYaml({
    id: "narrative.proof",
    type: "explainer",
    status: "draft",
    title: { nl: "Proef", en: "Proof" },
    slugs: { nl: "proef", en: "proof" },
    locales: { nl: "article.nl.md", en: "article.en.md" },
    related_entities: [],
    source_refs: [],
  }));
  await writeFile(path.join(directory, "article.nl.md"), markdown);
  await writeFile(path.join(directory, "article.en.md"), markdown);
}

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("content pipeline", () => {
  it("builds valid content successfully", async () => {
    const root = await temporaryRoot();
    await addEntity(root, { id: "region.example" });
    const result = await buildContent({ root, write: false });
    expect(result.knowledgeBase.entities.map((entity) => entity.id)).toEqual(["region.example"]);
  });

  it("rejects duplicate IDs", async () => {
    const root = await temporaryRoot();
    await addEntity(root, { id: "region.example", slug: "first" });
    await addEntity(root, { id: "region.example", slug: "second" });
    await expect(buildContent({ root, write: false })).rejects.toThrow(/Duplicate entity ID 'region\.example'/);
  });

  it("rejects unknown references with a suggestion", async () => {
    const root = await temporaryRoot();
    await addEntity(root, { id: "region.bordeaux" });
    await addEntity(root, { id: "appellation.pauillac", relations: [{ type: "part_of", target: "region.bordeax" }] });
    await expect(buildContent({ root, write: false })).rejects.toThrow(/Did you mean 'region\.bordeaux'/);
  });

  it("generates inverse relations", async () => {
    const root = await temporaryRoot();
    await addEntity(root, { id: "region.bordeaux" });
    await addEntity(root, { id: "appellation.pauillac", relations: [{ type: "part_of", target: "region.bordeaux" }] });
    const result = await buildContent({ root, write: false });
    expect(result.knowledgeBase.relations.inverse["region.bordeaux"]).toEqual([
      expect.objectContaining({ source: "appellation.pauillac", type: "part_of", target: "region.bordeaux" }),
    ]);
  });

  it("turns narrative entity links into backlinks", async () => {
    const root = await temporaryRoot();
    await addEntity(root, { id: "producer.example" });
    await addNarrative(root, "Read [[producer.example|Example]].");
    const result = await buildContent({ root, write: false });
    expect(result.knowledgeBase.backlinks["producer.example"]).toEqual(["narrative.proof"]);
  });

  it("rejects malformed narrative entity links", async () => {
    const root = await temporaryRoot();
    await addEntity(root, { id: "producer.example" });
    await addNarrative(root, "Read [[producer.example|]].");
    await expect(buildContent({ root, write: false })).rejects.toBeInstanceOf(ContentValidationError);
  });

  it("produces deterministic generated output", async () => {
    const root = await temporaryRoot();
    await addEntity(root, { id: "region.example" });
    const first = await buildContent({ root, write: false });
    const second = await buildContent({ root, write: false });
    expect(second.outputs).toEqual(first.outputs);
  });

  it("generates a valid new entity package", async () => {
    const root = await temporaryRoot();
    const packageDirectory = await generateEntityPackage({ root, type: "producer", slug: "example-estate" });
    expect(await readFile(path.join(packageDirectory, "entity.yaml"), "utf8")).toContain("id: producer.example-estate");
    const result = await buildContent({ root, write: false });
    expect(result.knowledgeBase.entities[0].id).toBe("producer.example-estate");
  });
});

import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { stringify as stringifyYaml } from "yaml";
import { REGION_OVERVIEW_DIMENSIONS, type ContentPlan, type Entity } from "../../src/content/model";
import { auditEntityLinks, scaffoldPlanDependencies } from "./dependencies";
import { generateEntityPackage } from "./generator";
import { buildContent, ContentValidationError } from "./pipeline";

const temporaryRoots: string[] = [];

interface AddEntityOptions {
  id: string;
  type?: string;
  slug?: string;
  nlSlug?: string;
  enSlug?: string;
  geographyId?: string;
  relations?: Entity["relations"];
  assertions?: Entity["assertions"];
  sourceRefs?: string[];
  locales?: { nl: string; en: string };
  omitLocale?: "nl" | "en";
  status?: "draft" | "active";
}

interface AddNarrativeOptions {
  markdown?: string;
  englishMarkdown?: string;
  primaryEntity?: string;
  relatedEntities?: string[];
  sourceRefs?: string[];
  status?: "draft" | "active";
  type?: "lesson" | "explainer";
}

async function temporaryRoot(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "oenocademy-content-test-"));
  temporaryRoots.push(root);
  return root;
}

async function addEntity(root: string, options: AddEntityOptions): Promise<string> {
  const [idType, idSlug] = options.id.split(".");
  const type = options.type ?? idType;
  const slug = options.slug ?? idSlug;
  const directory = path.join(
    root,
    "content",
    "entities",
    `${type}s`,
    `${slug}-${Math.random().toString(16).slice(2)}`,
  );
  const locales = options.locales ?? {
    nl: "overview.nl.md",
    en: "overview.en.md",
  };
  await mkdir(directory, { recursive: true });
  await writeFile(
    path.join(directory, "entity.yaml"),
    stringifyYaml({
      id: options.id,
      type,
      status: options.status ?? "draft",
      canonical_name: slug,
      names: { nl: slug, en: slug },
      slugs: {
        nl: options.nlSlug ?? slug,
        en: options.enSlug ?? slug,
      },
      locales,
      relations: options.relations ?? [],
      assertions: options.assertions ?? [],
      source_refs: options.sourceRefs ?? [],
      ...(options.geographyId ? { geography_id: options.geographyId } : {}),
    }),
  );
  if (options.omitLocale !== "nl" && path.basename(locales.nl) === locales.nl) {
    await writeFile(path.join(directory, locales.nl), "");
  }
  if (options.omitLocale !== "en" && path.basename(locales.en) === locales.en) {
    await writeFile(path.join(directory, locales.en), "");
  }
  return directory;
}

function regionPlan(
  packageId: string,
  dependencies: ContentPlan["entity_dependencies"] = [],
): ContentPlan {
  return {
    schema_version: 1,
    package_id: packageId,
    archetype: "region-overview",
    coverage: REGION_OVERVIEW_DIMENSIONS.map((key) => ({
      key,
      disposition: "on-page" as const,
      block_ids: ["orientatie"],
      target_ids: [],
      completeness_questions: [`Is ${key} voldoende afgedekt?`],
      layers: {
        foundation: ["De noodzakelijke hoofdlijn."],
        intermediate: [],
        advanced: [],
        specialist: [],
      },
      evidence: {
        general_synthesis: { topics: [], source_refs: [] },
        specific_claims: [],
      },
      review: { outline: "complete", nl: "complete", en: "complete" },
    })),
    entity_dependencies: dependencies,
    review: {
      outline: "complete",
      dependencies: "complete",
      nl: "complete",
      en: "complete",
    },
  };
}

async function addRegionPlan(
  directory: string,
  packageId: string,
  dependencies: ContentPlan["entity_dependencies"] = [],
): Promise<void> {
  await writeFile(
    path.join(directory, "content-plan.yaml"),
    stringifyYaml(regionPlan(packageId, dependencies)),
  );
}

async function addNarrative(root: string, options: AddNarrativeOptions = {}): Promise<void> {
  const directory = path.join(root, "content", "narratives", "explainers", "proof");
  await mkdir(directory, { recursive: true });
  await writeFile(
    path.join(directory, "narrative.yaml"),
    stringifyYaml({
      id: "narrative.proof",
      type: options.type ?? "explainer",
      status: options.status ?? "draft",
      title: { nl: "Proef", en: "Proof" },
      slugs: { nl: "proef", en: "proof" },
      locales: { nl: "article.nl.md", en: "article.en.md" },
      ...(options.primaryEntity ? { primary_entity: options.primaryEntity } : {}),
      related_entities: options.relatedEntities ?? [],
      source_refs: options.sourceRefs ?? [],
    }),
  );
  const wrap = (body: string) => {
    if (body.trimStart().startsWith(":::")) return body;
    return body.length > 0 ? `:::summary{#test-content}\n${body}\n:::\n` : "";
  };
  await writeFile(path.join(directory, "article.nl.md"), wrap(options.markdown ?? ""));
  await writeFile(
    path.join(directory, "article.en.md"),
    wrap(options.englishMarkdown ?? options.markdown ?? ""),
  );
}

async function addSource(
  root: string,
  id = "source.example",
  options: { url?: string } = {},
): Promise<void> {
  const directory = path.join(root, "data", "sources");
  await mkdir(directory, { recursive: true });
  await writeFile(
    path.join(directory, `${id.slice("source.".length)}.yaml`),
    stringifyYaml({
      id,
      source_type: "book",
      publisher: "Example Publisher",
      title: "Example source",
      ...(options.url ? { url: options.url } : {}),
      language: "en",
      status: "active",
    }),
  );
}

async function addMedia(
  root: string,
  options: { checksum?: string; sourceUrl?: string; writeAsset?: boolean } = {},
): Promise<void> {
  const bytes = Buffer.from("test image bytes");
  const metadataDirectory = path.join(root, "data", "media", "example");
  const assetDirectory = path.join(root, "public", "media", "example");
  await mkdir(metadataDirectory, { recursive: true });
  await mkdir(assetDirectory, { recursive: true });
  if (options.writeAsset !== false) {
    await writeFile(path.join(assetDirectory, "photo.jpg"), bytes);
  }
  await writeFile(
    path.join(metadataDirectory, "photo.yaml"),
    stringifyYaml({
      id: "media.example.photo",
      kind: "photo",
      role: "documentary",
      status: "active",
      storage_key: "example/photo.jpg",
      mime_type: "image/jpeg",
      width: 1200,
      height: 800,
      checksum_sha256: options.checksum ?? createHash("sha256").update(bytes).digest("hex"),
      alt: { nl: "Voorbeeldfoto", en: "Example photo" },
      caption: { nl: "Een onderschrift.", en: "A caption." },
      rights: {
        status: "open-licensed",
        creator: "Example Photographer",
        source_url: options.sourceUrl ?? "https://example.com/photo",
        license_name: "CC BY 4.0",
        license_url: "https://creativecommons.org/licenses/by/4.0/",
        credit_line: "Example Photographer",
      },
      acquired_at: "2026-09-01",
    }),
  );
}

afterEach(async () => {
  await Promise.all(
    temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});

describe("content pipeline validation", () => {
  it("builds valid content and its lookup indexes", async () => {
    const root = await temporaryRoot();
    await addEntity(root, {
      id: "region.example",
      nlSlug: "voorbeeld",
      geographyId: "geo.example",
    });

    const { knowledgeBase } = await buildContent({ root, write: false });

    expect(knowledgeBase.indexes.entity_ids).toEqual(["region.example"]);
    expect(knowledgeBase.indexes.entities_by_type.region).toEqual(["region.example"]);
    expect(knowledgeBase.indexes.localized_slugs.nl["region:voorbeeld"]).toBe("region.example");
    expect(knowledgeBase.indexes.geography["geo.example"]).toBe("region.example");
    expect(knowledgeBase.indexes.search[0]).toMatchObject({
      id: "region.example",
      type: "region",
    });
  });

  it("rejects duplicate entity IDs", async () => {
    const root = await temporaryRoot();
    await addEntity(root, { id: "region.example", slug: "first" });
    await addEntity(root, { id: "region.example", slug: "second" });

    await expect(buildContent({ root, write: false })).rejects.toThrow(
      /Duplicate entity ID 'region\.example'/,
    );
  });

  it("rejects route-colliding localized slugs", async () => {
    const root = await temporaryRoot();
    await addEntity(root, { id: "region.first", nlSlug: "gedeeld" });
    await addEntity(root, { id: "region.second", nlSlug: "gedeeld" });

    await expect(buildContent({ root, write: false })).rejects.toThrow(
      /Duplicate nl entity slug 'region:nl:gedeeld'/,
    );
  });

  it("rejects an ID whose prefix does not match its entity type", async () => {
    const root = await temporaryRoot();
    await addEntity(root, { id: "region.example", type: "producer" });

    await expect(buildContent({ root, write: false })).rejects.toThrow(
      /does not match entity type 'producer'/,
    );
  });

  it("rejects duplicate geography and assertion identities", async () => {
    const root = await temporaryRoot();
    await addSource(root);
    const assertion = {
      id: "assertion.example.fact",
      predicate: "example_fact",
      value: true,
      status: "verified" as const,
      sources: ["source.example"],
    };
    await addEntity(root, {
      id: "region.first",
      geographyId: "geo.shared",
      assertions: [assertion],
    });
    await addEntity(root, {
      id: "region.second",
      geographyId: "geo.shared",
      assertions: [assertion],
    });

    await expect(buildContent({ root, write: false })).rejects.toThrow(
      /Duplicate assertion ID 'assertion\.example\.fact'/,
    );
    await expect(buildContent({ root, write: false })).rejects.toThrow(
      /Duplicate geography ID 'geo\.shared'/,
    );
  });

  it("rejects duplicate relations and references within a record", async () => {
    const root = await temporaryRoot();
    await addEntity(root, { id: "region.parent" });
    await addEntity(root, {
      id: "appellation.child",
      relations: [
        { type: "part_of", target: "region.parent" },
        { type: "part_of", target: "region.parent" },
      ],
      sourceRefs: ["source.missing", "source.missing"],
    });

    await expect(buildContent({ root, write: false })).rejects.toThrow(
      /Duplicate relation 'part_of' to 'region\.parent'/,
    );
    await expect(buildContent({ root, write: false })).rejects.toThrow(
      /Duplicate source reference 'source\.missing'/,
    );
  });

  it("rejects unknown entity references with a close-ID suggestion", async () => {
    const root = await temporaryRoot();
    await addEntity(root, { id: "region.bordeaux" });
    await addEntity(root, {
      id: "appellation.pauillac",
      relations: [{ type: "part_of", target: "region.bordeax" }],
    });

    await expect(buildContent({ root, write: false })).rejects.toThrow(
      /Did you mean 'region\.bordeaux'/,
    );
  });

  it("rejects unknown source references on assertions", async () => {
    const root = await temporaryRoot();
    await addEntity(root, {
      id: "region.example",
      assertions: [
        {
          id: "assertion.example.fact",
          predicate: "example_fact",
          value: "Example",
          status: "verified",
          sources: ["source.missing"],
        },
      ],
    });

    await expect(buildContent({ root, write: false })).rejects.toThrow(
      /Unknown source reference 'source\.missing'/,
    );
  });

  it("rejects missing and out-of-package locale files", async () => {
    const missingRoot = await temporaryRoot();
    await addEntity(missingRoot, { id: "region.missing", omitLocale: "en" });
    await expect(buildContent({ root: missingRoot, write: false })).rejects.toThrow(
      /references missing file 'overview\.en\.md'/,
    );

    const escapedRoot = await temporaryRoot();
    await addEntity(escapedRoot, {
      id: "region.escaped",
      locales: { nl: "../outside.nl.md", en: "overview.en.md" },
    });
    await expect(buildContent({ root: escapedRoot, write: false })).rejects.toThrow(
      /locales\.nl must name a file inside its content package/,
    );
  });

  it("reports malformed YAML with its file", async () => {
    const root = await temporaryRoot();
    const directory = await addEntity(root, { id: "region.example" });
    await writeFile(path.join(directory, "entity.yaml"), "id: [not valid\n");

    await expect(buildContent({ root, write: false })).rejects.toThrow(
      /entity\.yaml: invalid YAML/,
    );
  });

  it("requires and validates a complete plan for an active region", async () => {
    const missingRoot = await temporaryRoot();
    const missingDirectory = await addEntity(missingRoot, {
      id: "region.example",
      status: "active",
    });
    const summary = ':::summary{#orientatie depth="foundation"}\nOriëntatie.\n:::\n';
    await writeFile(path.join(missingDirectory, "overview.nl.md"), summary);
    await writeFile(path.join(missingDirectory, "overview.en.md"), summary);
    await expect(buildContent({ root: missingRoot, write: false })).rejects.toThrow(
      /active region requires a package-local content-plan\.yaml/,
    );

    await addRegionPlan(missingDirectory, "region.example");
    await expect(buildContent({ root: missingRoot, write: false })).resolves.toBeDefined();
  });

  it("requires planned link dependencies in both locales", async () => {
    const root = await temporaryRoot();
    const directory = await addEntity(root, { id: "region.example" });
    await addEntity(root, { id: "grape.merlot" });
    await addRegionPlan(directory, "region.example", [
      {
        id: "grape.merlot",
        names: { nl: "merlot", en: "Merlot" },
        slugs: { nl: "merlot", en: "merlot" },
        disposition: "link",
      },
    ]);

    await expect(buildContent({ root, write: false })).rejects.toThrow(
      /dependency 'grape\.merlot' must be linked in en content/,
    );
  });

  it("registers media and resolves figure blocks by stable media ID", async () => {
    const root = await temporaryRoot();
    const directory = await addEntity(root, { id: "region.example" });
    await addMedia(root);
    const markdown = ':::figure{#voorbeeldfoto media_id="media.example.photo"}\n:::\n';
    await writeFile(path.join(directory, "overview.nl.md"), markdown);
    await writeFile(path.join(directory, "overview.en.md"), markdown);

    const { knowledgeBase } = await buildContent({ root, write: false });

    expect(knowledgeBase.media).toHaveLength(1);
    expect(knowledgeBase.entities[0].content.nl.blocks[0]).toMatchObject({
      type: "figure",
      media_id: "media.example.photo",
      nodes: [],
    });
  });

  it("rejects unknown, missing, and changed media assets", async () => {
    const unknownRoot = await temporaryRoot();
    const unknownDirectory = await addEntity(unknownRoot, { id: "region.example" });
    const markdown = ':::figure{#voorbeeldfoto media_id="media.example.photo"}\n:::\n';
    await writeFile(path.join(unknownDirectory, "overview.nl.md"), markdown);
    await writeFile(path.join(unknownDirectory, "overview.en.md"), markdown);
    await expect(buildContent({ root: unknownRoot, write: false })).rejects.toThrow(
      /Unknown media reference 'media\.example\.photo'/,
    );

    const missingRoot = await temporaryRoot();
    await addMedia(missingRoot, { writeAsset: false });
    await expect(buildContent({ root: missingRoot, write: false })).rejects.toThrow(
      /is missing under public\/media/,
    );

    const changedRoot = await temporaryRoot();
    await addMedia(changedRoot, { checksum: "0".repeat(64) });
    await expect(buildContent({ root: changedRoot, write: false })).rejects.toThrow(
      /checksum_sha256 does not match/,
    );
  });
});

describe("content dependency tooling", () => {
  it("scaffolds every missing planned entity without overwriting existing packages", async () => {
    const root = await temporaryRoot();
    const directory = await addEntity(root, { id: "region.example" });
    await addRegionPlan(directory, "region.example", [
      {
        id: "grape.merlot",
        names: { nl: "Merlot", en: "Merlot" },
        slugs: { nl: "merlot", en: "merlot" },
        disposition: "link",
      },
    ]);

    const first = await scaffoldPlanDependencies("region.example", root);
    const second = await scaffoldPlanDependencies("region.example", root);

    expect(first.created).toEqual(["grape.merlot"]);
    expect(second.existing).toEqual(["grape.merlot"]);
    const generated = await readFile(
      path.join(root, "content", "entities", "grapes", "merlot", "entity.yaml"),
      "utf8",
    );
    expect(generated).toContain("id: grape.merlot");
    expect(generated).toContain("status: draft");
  });

  it("reports known entity names that appear without a canonical link", async () => {
    const root = await temporaryRoot();
    const regionDirectory = await addEntity(root, { id: "region.example" });
    await addEntity(root, { id: "grape.merlot" });
    const plain = ":::summary{#orientatie}\nMerlot speelt hier een rol.\n:::\n";
    await writeFile(path.join(regionDirectory, "overview.nl.md"), plain);
    await writeFile(path.join(regionDirectory, "overview.en.md"), plain);

    const findings = await auditEntityLinks(root);

    expect(findings).toContain("region.example:en mentions 'merlot' without linking grape.merlot");
    expect(findings).toContain("region.example:nl mentions 'merlot' without linking grape.merlot");
  });
});

describe("content pipeline derivation", () => {
  it("generates inverse relations", async () => {
    const root = await temporaryRoot();
    await addEntity(root, { id: "region.bordeaux" });
    await addEntity(root, {
      id: "appellation.pauillac",
      relations: [{ type: "part_of", target: "region.bordeaux" }],
    });

    const result = await buildContent({ root, write: false });

    expect(result.knowledgeBase.relations.inverse["region.bordeaux"]).toEqual([
      expect.objectContaining({
        source: "appellation.pauillac",
        type: "part_of",
        target: "region.bordeaux",
      }),
    ]);
  });

  it("turns localized narrative links into mentions and backlinks", async () => {
    const root = await temporaryRoot();
    await addEntity(root, { id: "producer.example" });
    await addNarrative(root, {
      markdown: "Lees [[producer.example|Voorbeeld]].",
      englishMarkdown: "Read [[producer.example]].",
    });

    const { knowledgeBase } = await buildContent({ root, write: false });

    expect(knowledgeBase.narratives[0].mentions).toEqual([
      { entity_id: "producer.example", label: null, locale: "en" },
      { entity_id: "producer.example", label: "Voorbeeld", locale: "nl" },
    ]);
    expect(knowledgeBase.backlinks["producer.example"]).toEqual(["narrative.proof"]);
  });

  it("rejects unknown and malformed narrative entity links", async () => {
    const unknownRoot = await temporaryRoot();
    await addEntity(unknownRoot, { id: "producer.example" });
    await addNarrative(unknownRoot, { markdown: "Lees [[producer.exemple]]." });
    await expect(buildContent({ root: unknownRoot, write: false })).rejects.toThrow(
      /Did you mean 'producer\.example'/,
    );

    const malformedRoot = await temporaryRoot();
    await addEntity(malformedRoot, { id: "producer.example" });
    await addNarrative(malformedRoot, { markdown: "Lees [[producer.example|]]." });
    await expect(buildContent({ root: malformedRoot, write: false })).rejects.toBeInstanceOf(
      ContentValidationError,
    );

    const unclosedRoot = await temporaryRoot();
    await addEntity(unclosedRoot, { id: "producer.example" });
    await addNarrative(unclosedRoot, { markdown: "Lees [[producer.example." });
    await expect(buildContent({ root: unclosedRoot, write: false })).rejects.toThrow(
      /unclosed entity link/,
    );
  });

  it("parses semantic blocks, citations, and entity links into generated content", async () => {
    const root = await temporaryRoot();
    await addEntity(root, { id: "region.example" });
    await addSource(root);
    const dutch = `:::summary{#orientatie depth="foundation"}\nKorte oriëntatie.\n:::\n\n:::section{#uitleg depth="intermediate" source_refs="source.example"}\n## Uitleg\n\nLees [[region.example|de regio]]. [@source.example; p. 42]\n:::\n`;
    const english = `:::summary{#orientatie depth="foundation"}\nShort orientation.\n:::\n\n:::section{#uitleg depth="intermediate" source_refs="source.example"}\n## Explanation\n\nRead [[region.example|the region]]. [@source.example; p. 42]\n:::\n`;
    await addNarrative(root, {
      markdown: dutch,
      englishMarkdown: english,
      sourceRefs: ["source.example"],
      status: "active",
    });

    const { knowledgeBase } = await buildContent({ root, write: false });

    expect(knowledgeBase.narratives[0].content.nl.blocks).toHaveLength(2);
    expect(knowledgeBase.narratives[0].content.nl.blocks[1]).toMatchObject({
      id: "uitleg",
      type: "section",
      depth: "intermediate",
      source_refs: ["source.example"],
    });
    expect(JSON.stringify(knowledgeBase.narratives[0].content.nl)).toContain('"type":"citation"');
  });

  it("keeps deeper detail blocks attached to a foundation section", async () => {
    const root = await temporaryRoot();
    const directory = await addEntity(root, { id: "region.example" });
    const dutch = `:::summary{#orientatie depth="foundation"}\nKorte oriëntatie.\n:::\n\n:::section{#geschiedenis depth="foundation"}\n## Geschiedenis\n\nDe hoofdlijn.\n:::\n\n:::detail{#geschiedenis-handel parent="geschiedenis" depth="intermediate"}\n### Handel\n\nMeer samenhang.\n:::\n`;
    const english = `:::summary{#orientatie depth="foundation"}\nShort orientation.\n:::\n\n:::section{#geschiedenis depth="foundation"}\n## History\n\nThe main line.\n:::\n\n:::detail{#geschiedenis-handel parent="geschiedenis" depth="intermediate"}\n### Trade\n\nMore context.\n:::\n`;
    await writeFile(path.join(directory, "overview.nl.md"), dutch);
    await writeFile(path.join(directory, "overview.en.md"), english);

    const { knowledgeBase } = await buildContent({ root, write: false });

    expect(knowledgeBase.entities[0].content.nl.blocks[2]).toMatchObject({
      id: "geschiedenis-handel",
      type: "detail",
      depth: "intermediate",
      parent: "geschiedenis",
    });
  });

  it("rejects orphaned, misplaced, and non-progressive detail blocks", async () => {
    const orphanRoot = await temporaryRoot();
    const orphanDirectory = await addEntity(orphanRoot, { id: "region.example" });
    const orphan = `:::detail{#handel parent="geschiedenis" depth="intermediate"}\n### Handel\n\nTekst.\n:::\n`;
    await writeFile(path.join(orphanDirectory, "overview.nl.md"), orphan);
    await writeFile(path.join(orphanDirectory, "overview.en.md"), orphan);
    await expect(buildContent({ root: orphanRoot, write: false })).rejects.toThrow(
      /refers to unknown parent 'geschiedenis'/,
    );

    const shallowRoot = await temporaryRoot();
    const shallowDirectory = await addEntity(shallowRoot, { id: "region.example" });
    const shallow = `:::section{#geschiedenis depth="intermediate"}\n## Geschiedenis\n\nTekst.\n:::\n\n:::detail{#handel parent="geschiedenis" depth="foundation"}\n### Handel\n\nTekst.\n:::\n`;
    await writeFile(path.join(shallowDirectory, "overview.nl.md"), shallow);
    await writeFile(path.join(shallowDirectory, "overview.en.md"), shallow);
    await expect(buildContent({ root: shallowRoot, write: false })).rejects.toThrow(
      /must be deeper than parent 'geschiedenis'/,
    );
  });

  it("rejects unsafe Markdown and mismatched locale block structures", async () => {
    const unsafeRoot = await temporaryRoot();
    await addNarrative(unsafeRoot, {
      markdown: ":::section{#uitleg}\n## Uitleg\n\n<div>Niet toegestaan</div>\n:::\n",
      englishMarkdown: ":::section{#uitleg}\n## Explanation\n\nSafe text.\n:::\n",
    });
    await expect(buildContent({ root: unsafeRoot, write: false })).rejects.toThrow(
      /unsupported Markdown node 'html'/,
    );

    const parityRoot = await temporaryRoot();
    await addNarrative(parityRoot, {
      markdown: ":::summary{#orientatie}\nNederlands.\n:::\n",
      englishMarkdown: ":::summary{#orientation}\nEnglish.\n:::\n",
    });
    await expect(buildContent({ root: parityRoot, write: false })).rejects.toThrow(/differs in id/);
  });

  it("rejects bracketed citation locators", async () => {
    const root = await temporaryRoot();
    await addSource(root);
    const markdown =
      ':::summary{#orientatie source_refs="source.example"}\nClaim. [@source.example; fig. [A]]\n:::\n';
    await addNarrative(root, {
      markdown,
      sourceRefs: ["source.example"],
    });

    await expect(buildContent({ root, write: false })).rejects.toThrow(/invalid citation/);
  });

  it("rejects headings nested inside semantic block content", async () => {
    const root = await temporaryRoot();
    const markdown =
      ":::section{#uitleg}\n## Uitleg\n\n- Een punt\n\n  ### Verborgen tussenkop\n:::\n";
    await addNarrative(root, { markdown });

    await expect(buildContent({ root, write: false })).rejects.toThrow(
      /must keep headings at the top level/,
    );
  });

  it("rejects non-http URLs in source and media metadata", async () => {
    const sourceRoot = await temporaryRoot();
    await addSource(sourceRoot, "source.example", { url: "javascript:alert(1)" });
    await expect(buildContent({ root: sourceRoot, write: false })).rejects.toThrow(
      /must use an http or https URL/,
    );

    const mediaRoot = await temporaryRoot();
    await addMedia(mediaRoot, { sourceUrl: "data:text/plain,example" });
    await expect(buildContent({ root: mediaRoot, write: false })).rejects.toThrow(
      /must use an http or https URL/,
    );
  });

  it("requires citations in both block and package source inventories", async () => {
    const root = await temporaryRoot();
    await addSource(root);
    const markdown = ":::summary{#orientatie}\nClaim. [@source.example]\n:::\n";
    await addNarrative(root, { markdown });

    await expect(buildContent({ root, write: false })).rejects.toThrow(
      /without listing it in source_refs/,
    );
  });

  it("enforces active lesson block requirements", async () => {
    const root = await temporaryRoot();
    const markdown =
      ":::summary{#orientatie}\nSamenvatting.\n:::\n\n:::section{#uitleg}\n## Uitleg\n\nTekst.\n:::\n";
    await addNarrative(root, {
      markdown,
      status: "active",
      type: "lesson",
    });

    await expect(buildContent({ root, write: false })).rejects.toThrow(
      /requires one objectives block/,
    );
    await expect(buildContent({ root, write: false })).rejects.toThrow(
      /requires at least one key-idea block/,
    );
  });

  it("rejects a primary entity repeated as a related entity", async () => {
    const root = await temporaryRoot();
    await addEntity(root, { id: "region.example" });
    await addNarrative(root, {
      primaryEntity: "region.example",
      relatedEntities: ["region.example"],
    });

    await expect(buildContent({ root, write: false })).rejects.toThrow(
      /must not be repeated in related_entities/,
    );
  });

  it("produces one deterministic runtime bundle", async () => {
    const root = await temporaryRoot();
    await addEntity(root, { id: "region.example" });

    const first = await buildContent({ root, write: false });
    const second = await buildContent({ root, write: false });

    expect(Object.keys(first.outputs)).toEqual(["knowledge-base.json"]);
    expect(second.outputs).toEqual(first.outputs);
  });

  it("removes retired generated fragments without touching unrelated files", async () => {
    const root = await temporaryRoot();
    const outputDirectory = path.join(root, "generated");
    await addEntity(root, { id: "region.example" });
    await mkdir(outputDirectory, { recursive: true });
    await writeFile(path.join(outputDirectory, "entities.json"), "stale\n");
    await writeFile(path.join(outputDirectory, "notes.txt"), "keep\n");

    await buildContent({ root, outputDirectory });

    expect(await readdir(outputDirectory)).toEqual(["knowledge-base.json", "notes.txt"]);
  });
});

describe("entity package generator", () => {
  it("generates a valid new entity package", async () => {
    const root = await temporaryRoot();
    const packageDirectory = await generateEntityPackage({
      root,
      type: "producer",
      slug: "example-estate",
    });

    expect(await readFile(path.join(packageDirectory, "entity.yaml"), "utf8")).toContain(
      "id: producer.example-estate",
    );
    const result = await buildContent({ root, write: false });
    expect(result.knowledgeBase.entities[0].id).toBe("producer.example-estate");
  });

  it("rejects unknown types and unsafe slugs", async () => {
    const root = await temporaryRoot();
    await expect(generateEntityPackage({ root, type: "estate", slug: "example" })).rejects.toThrow(
      /Unknown entity type/,
    );
    await expect(
      generateEntityPackage({ root, type: "producer", slug: "../Example" }),
    ).rejects.toThrow(/Invalid slug/);
  });

  it("does not overwrite an existing content package", async () => {
    const root = await temporaryRoot();
    const options = { root, type: "producer", slug: "example-estate" };
    await generateEntityPackage(options);

    await expect(generateEntityPackage(options)).rejects.toThrow(/Content package already exists/);
  });
});

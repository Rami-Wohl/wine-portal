import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { stringify as stringifyYaml } from "yaml";
import {
  APPELLATION_OVERVIEW_DIMENSIONS,
  GRAPE_OVERVIEW_DIMENSIONS,
  REGION_OVERVIEW_DIMENSIONS,
  type ContentPlan,
  type Entity,
  type EntityPresentation,
  type LearningPath,
} from "../../src/content/model";
import { auditEntityLinks, loadContentPlans, scaffoldPlanDependencies } from "./dependencies";
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
  presentation?: EntityPresentation;
}

interface AddNarrativeOptions {
  id?: string;
  slug?: string;
  markdown?: string;
  englishMarkdown?: string;
  primaryEntity?: string;
  relatedEntities?: string[];
  sourceRefs?: string[];
  status?: "draft" | "active";
  type?: "lesson" | "explainer";
}

interface AddLearningPathOptions {
  id?: string;
  status?: LearningPath["status"];
  nlSlug?: string;
  enSlug?: string;
  steps: LearningPath["steps"];
  suggestions?: LearningPath["completion"]["suggestions"];
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
      ...(type === "producer"
        ? { presentation: options.presentation ?? { mode: "monograph" as const } }
        : {}),
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
    schema_version: 2,
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

function appellationPlan(packageId: string): ContentPlan {
  return {
    ...regionPlan(packageId),
    archetype: "appellation-overview",
    coverage: APPELLATION_OVERVIEW_DIMENSIONS.map((key) => ({
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
  };
}

function grapePlan(packageId: string): ContentPlan {
  return {
    ...regionPlan(packageId),
    archetype: "grape-overview",
    coverage: GRAPE_OVERVIEW_DIMENSIONS.map((key) => ({
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
  const id = options.id ?? "narrative.proof";
  const slug = options.slug ?? id.split(".").at(-1) ?? "proof";
  const directory = path.join(
    root,
    "content",
    "narratives",
    options.type === "lesson" ? "lessons" : "explainers",
    slug,
  );
  await mkdir(directory, { recursive: true });
  await writeFile(
    path.join(directory, "narrative.yaml"),
    stringifyYaml({
      id,
      type: options.type ?? "explainer",
      status: options.status ?? "draft",
      title: { nl: "Proef", en: "Proof" },
      slugs: { nl: slug, en: slug },
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

async function addLearningPath(root: string, options: AddLearningPathOptions): Promise<void> {
  const id = options.id ?? "learning-path.example";
  const slug = id.slice("learning-path.".length);
  const directory = path.join(root, "content", "learning-paths", slug);
  await mkdir(directory, { recursive: true });
  await writeFile(
    path.join(directory, "learning-path.yaml"),
    stringifyYaml({
      schema_version: 1,
      id,
      status: options.status ?? "draft",
      curriculum_level: "understand",
      title: { nl: "Voorbeeldleerpad", en: "Example learning path" },
      slugs: {
        nl: options.nlSlug ?? slug,
        en: options.enSlug ?? slug,
      },
      summary: { nl: "Een korte samenvatting.", en: "A short summary." },
      audience: { nl: "Nieuwsgierige wijnliefhebbers.", en: "Curious wine lovers." },
      prerequisites: { nl: [], en: [] },
      objectives: {
        nl: ["Leg de hoofdroute uit."],
        en: ["Explain the main route."],
      },
      steps: options.steps,
      completion: {
        recap: {
          nl: ["Je kunt de hoofdroute uitleggen."],
          en: ["You can explain the main route."],
        },
        encouragement: { nl: "Mooi werk.", en: "Well done." },
        suggestions: options.suggestions ?? [
          {
            id: "review-first-lesson",
            target: options.steps[0]?.target,
            context: { nl: "Bekijk de eerste les opnieuw.", en: "Review the first lesson." },
          },
        ],
      },
    }),
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
      kind: "entity",
      id: "region.example",
      entity_type: "region",
      passages: { nl: [], en: [] },
    });
  });

  it("indexes localized narrative passages with their stable block anchor", async () => {
    const root = await temporaryRoot();
    await addNarrative(root, {
      markdown: "Een unieke narratieve passage.",
      englishMarkdown: "A unique narrative passage.",
    });

    const { knowledgeBase } = await buildContent({ root, write: false });
    const narrativeEntry = knowledgeBase.indexes.search.find((entry) => entry.kind === "narrative");

    expect(narrativeEntry).toMatchObject({
      kind: "narrative",
      id: "narrative.proof",
      passages: {
        nl: [
          {
            block_id: "test-content",
            kind: "content",
            text: "Een unieke narratieve passage.",
          },
        ],
      },
    });
  });

  it("builds a seven-lesson learning path and its lookup indexes", async () => {
    const root = await temporaryRoot();
    const steps: LearningPath["steps"] = [];
    for (let index = 1; index <= 7; index += 1) {
      const id = `narrative.lesson.pilot-${index}`;
      await addNarrative(root, { id, slug: `pilot-${index}`, type: "lesson" });
      steps.push({
        id: `lesson-${index}`,
        target: id,
        context: { nl: `Context ${index}.`, en: `Context ${index}.` },
      });
    }
    await addLearningPath(root, {
      id: "learning-path.from-grape-to-still-wine",
      nlSlug: "van-druif-naar-stille-wijn",
      enSlug: "from-grape-to-still-wine",
      steps,
    });

    const first = await buildContent({ root, write: false });
    const second = await buildContent({ root, write: false });
    const { knowledgeBase } = first;

    expect(knowledgeBase.learning_paths).toHaveLength(1);
    expect(knowledgeBase.learning_paths[0]?.steps).toHaveLength(7);
    expect(knowledgeBase.indexes.learning_path_ids).toEqual([
      "learning-path.from-grape-to-still-wine",
    ]);
    expect(knowledgeBase.indexes.learning_path_slugs.en["from-grape-to-still-wine"]).toBe(
      "learning-path.from-grape-to-still-wine",
    );
    expect(knowledgeBase.indexes.lesson_memberships["narrative.lesson.pilot-1"]).toEqual([
      {
        path_id: "learning-path.from-grape-to-still-wine",
        step_id: "lesson-1",
      },
    ]);
    expect(second.outputs).toEqual(first.outputs);
  });

  it("requires every learning path step to target a known lesson narrative", async () => {
    const explainerRoot = await temporaryRoot();
    await addNarrative(explainerRoot, {
      id: "narrative.explainer-proof",
      slug: "explainer-proof",
      type: "explainer",
    });
    await addLearningPath(explainerRoot, {
      steps: [
        {
          id: "wrong-kind",
          target: "narrative.explainer-proof",
          context: { nl: "Context.", en: "Context." },
        },
      ],
    });
    await expect(buildContent({ root: explainerRoot, write: false })).rejects.toThrow(
      /must be a narrative of type 'lesson'/,
    );

    const missingRoot = await temporaryRoot();
    await addLearningPath(missingRoot, {
      steps: [
        {
          id: "missing",
          target: "narrative.lesson.missing",
          context: { nl: "Context.", en: "Context." },
        },
      ],
    });
    await expect(buildContent({ root: missingRoot, write: false })).rejects.toThrow(
      /step 'missing': Unknown reference 'narrative\.lesson\.missing'/,
    );
  });

  it("prevents active learning paths from targeting draft content", async () => {
    const lessonRoot = await temporaryRoot();
    await addNarrative(lessonRoot, {
      id: "narrative.lesson.draft-proof",
      slug: "draft-proof",
      type: "lesson",
      status: "draft",
    });
    await addLearningPath(lessonRoot, {
      status: "active",
      steps: [
        {
          id: "draft-lesson",
          target: "narrative.lesson.draft-proof",
          context: { nl: "Context.", en: "Context." },
        },
      ],
    });
    await expect(buildContent({ root: lessonRoot, write: false })).rejects.toThrow(
      /requires active lesson 'narrative\.lesson\.draft-proof', found 'draft'/,
    );

    const suggestionRoot = await temporaryRoot();
    const activeLesson =
      ":::summary{#orientatie}\nSamenvatting.\n:::\n\n:::objectives{#leerdoelen}\n- Leg dit uit.\n:::\n\n:::section{#uitleg}\n## Uitleg\n\nTekst.\n:::\n\n:::key-idea{#kern}\nKern.\n:::\n";
    await addNarrative(suggestionRoot, {
      id: "narrative.lesson.active-proof",
      slug: "active-proof",
      type: "lesson",
      status: "active",
      markdown: activeLesson,
    });
    await addEntity(suggestionRoot, { id: "concept.draft-reference", status: "draft" });
    await addLearningPath(suggestionRoot, {
      status: "active",
      steps: [
        {
          id: "active-lesson",
          target: "narrative.lesson.active-proof",
          context: { nl: "Context.", en: "Context." },
        },
      ],
      suggestions: [
        {
          id: "draft-reference",
          target: "concept.draft-reference",
          context: { nl: "Lees verder.", en: "Read more." },
        },
      ],
    });
    await expect(buildContent({ root: suggestionRoot, write: false })).rejects.toThrow(
      /requires active target 'concept\.draft-reference', found 'draft'/,
    );
  });

  it("rejects duplicate learning path steps and route slugs", async () => {
    const duplicateStepRoot = await temporaryRoot();
    await addNarrative(duplicateStepRoot, {
      id: "narrative.lesson.proof",
      slug: "proof",
      type: "lesson",
    });
    const duplicateStep = {
      id: "same-step",
      target: "narrative.lesson.proof",
      context: { nl: "Context.", en: "Context." },
    };
    await addLearningPath(duplicateStepRoot, { steps: [duplicateStep, duplicateStep] });
    await expect(buildContent({ root: duplicateStepRoot, write: false })).rejects.toThrow(
      /Duplicate step ID 'same-step'/,
    );

    const slugRoot = await temporaryRoot();
    await addNarrative(slugRoot, {
      id: "narrative.lesson.proof",
      slug: "proof",
      type: "lesson",
    });
    const steps = [
      {
        id: "proof",
        target: "narrative.lesson.proof",
        context: { nl: "Context.", en: "Context." },
      },
    ];
    await addLearningPath(slugRoot, { id: "learning-path.first", enSlug: "shared", steps });
    await addLearningPath(slugRoot, { id: "learning-path.second", nlSlug: "shared", steps });
    await expect(buildContent({ root: slugRoot, write: false })).rejects.toThrow(
      /Duplicate learning path route slug 'shared'/,
    );
  });

  it("rejects invalid learning path identity and self-referential completion", async () => {
    const duplicateRoot = await temporaryRoot();
    await addNarrative(duplicateRoot, {
      id: "narrative.lesson.proof",
      slug: "proof",
      type: "lesson",
    });
    const steps = [
      {
        id: "proof",
        target: "narrative.lesson.proof",
        context: { nl: "Context.", en: "Context." },
      },
    ];
    await addLearningPath(duplicateRoot, { id: "learning-path.same", steps });
    const duplicateDirectory = path.join(duplicateRoot, "content", "learning-paths", "same-copy");
    await mkdir(duplicateDirectory, { recursive: true });
    await writeFile(
      path.join(duplicateDirectory, "learning-path.yaml"),
      await readFile(
        path.join(duplicateRoot, "content", "learning-paths", "same", "learning-path.yaml"),
        "utf8",
      ),
    );
    await expect(buildContent({ root: duplicateRoot, write: false })).rejects.toThrow(
      /Duplicate learning path ID 'learning-path\.same'/,
    );

    const selfRoot = await temporaryRoot();
    await addNarrative(selfRoot, {
      id: "narrative.lesson.proof",
      slug: "proof",
      type: "lesson",
    });
    await addLearningPath(selfRoot, {
      id: "learning-path.self",
      steps,
      suggestions: [
        {
          id: "repeat-path",
          target: "learning-path.self",
          context: { nl: "Herhaal het pad.", en: "Repeat the path." },
        },
      ],
    });
    await expect(buildContent({ root: selfRoot, write: false })).rejects.toThrow(
      /must not target its own learning path 'learning-path\.self'/,
    );
  });

  it("rejects an entity as a learning path core step at schema validation", async () => {
    const root = await temporaryRoot();
    await addEntity(root, { id: "concept.reference" });
    const directory = path.join(root, "content", "learning-paths", "entity-step");
    await mkdir(directory, { recursive: true });
    await writeFile(
      path.join(directory, "learning-path.yaml"),
      stringifyYaml({
        schema_version: 1,
        id: "learning-path.entity-step",
        status: "draft",
        curriculum_level: "understand",
        title: { nl: "Entitystap", en: "Entity step" },
        slugs: { nl: "entitystap", en: "entity-step" },
        summary: { nl: "Samenvatting.", en: "Summary." },
        audience: { nl: "Doelgroep.", en: "Audience." },
        prerequisites: { nl: [], en: [] },
        objectives: { nl: ["Leer iets."], en: ["Learn something."] },
        steps: [
          {
            id: "entity",
            target: "concept.reference",
            context: { nl: "Context.", en: "Context." },
          },
        ],
        completion: {
          recap: { nl: ["Geleerd."], en: ["Learned."] },
          encouragement: { nl: "Mooi.", en: "Well done." },
          suggestions: [
            {
              id: "reference",
              target: "concept.reference",
              context: { nl: "Naslag.", en: "Reference." },
            },
          ],
        },
      }),
    );

    await expect(buildContent({ root, write: false })).rejects.toThrow(
      /steps\.0\.target must start with 'narrative\.'/,
    );
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

  it("rejects route collisions across localized entity slugs", async () => {
    const root = await temporaryRoot();
    await addEntity(root, { id: "region.first", enSlug: "shared" });
    await addEntity(root, { id: "region.second", nlSlug: "shared" });

    await expect(buildContent({ root, write: false })).rejects.toThrow(
      /Duplicate entity route slug 'region:shared'/,
    );
  });

  it("rejects an ID whose prefix does not match its entity type", async () => {
    const root = await temporaryRoot();
    await addEntity(root, { id: "region.example", type: "producer" });

    await expect(buildContent({ root, write: false })).rejects.toThrow(
      /does not match entity type 'producer'/,
    );
  });

  it("validates lightweight producer presentations and their canonical owner relation", async () => {
    const root = await temporaryRoot();
    await addEntity(root, { id: "appellation.example" });
    await addEntity(root, {
      id: "producer.example-estate",
      presentation: {
        mode: "collection-profile",
        owner: "appellation.example",
        anchor: "producent-example-estate",
      },
      relations: [{ type: "located_in", target: "appellation.example" }],
    });

    const result = await buildContent({ root, write: false });
    expect(
      result.knowledgeBase.entities.find((entity) => entity.type === "producer")?.presentation,
    ).toEqual({
      mode: "collection-profile",
      owner: "appellation.example",
      anchor: "producent-example-estate",
    });

    const invalidRoot = await temporaryRoot();
    await addEntity(invalidRoot, { id: "appellation.example" });
    await addEntity(invalidRoot, {
      id: "producer.example-estate",
      presentation: {
        mode: "collection-profile",
        owner: "appellation.example",
        anchor: "producent-example-estate",
      },
    });
    await expect(buildContent({ root: invalidRoot, write: false })).rejects.toThrow(
      /requires a canonical relation to owner 'appellation\.example'/,
    );
  });

  it("rejects a producer record without an explicit presentation", async () => {
    const root = await temporaryRoot();
    const directory = await addEntity(root, { id: "producer.undecided-estate" });
    const entityPath = path.join(directory, "entity.yaml");
    const metadata = await readFile(entityPath, "utf8");
    await writeFile(entityPath, metadata.replace("presentation:\n  mode: monograph\n", ""));

    await expect(buildContent({ root, write: false })).rejects.toThrow(
      /presentation is required for every producer entity/,
    );
  });

  it("requires an active embedded producer to target a localized owner block", async () => {
    const root = await temporaryRoot();
    const ownerDirectory = await addEntity(root, {
      id: "appellation.example",
      status: "active",
    });
    const ownerContent =
      ':::summary{#orientatie depth="foundation"}\nOriëntatie.\n:::\n\n:::section{#producent-example-estate depth="foundation"}\n## Producent\n\nProfiel.\n:::\n';
    await writeFile(path.join(ownerDirectory, "overview.nl.md"), ownerContent);
    await writeFile(path.join(ownerDirectory, "overview.en.md"), ownerContent);
    await writeFile(
      path.join(ownerDirectory, "content-plan.yaml"),
      stringifyYaml(appellationPlan("appellation.example")),
    );
    await addEntity(root, {
      id: "producer.example-estate",
      status: "active",
      presentation: {
        mode: "collection-profile",
        owner: "appellation.example",
        anchor: "producent-example-estate",
      },
      relations: [{ type: "located_in", target: "appellation.example" }],
    });

    await expect(buildContent({ root, write: false })).resolves.toBeDefined();

    const missingAnchorRoot = await temporaryRoot();
    const missingOwnerDirectory = await addEntity(missingAnchorRoot, {
      id: "appellation.example",
      status: "active",
    });
    const summary = ':::summary{#orientatie depth="foundation"}\nOriëntatie.\n:::\n';
    await writeFile(path.join(missingOwnerDirectory, "overview.nl.md"), summary);
    await writeFile(path.join(missingOwnerDirectory, "overview.en.md"), summary);
    await writeFile(
      path.join(missingOwnerDirectory, "content-plan.yaml"),
      stringifyYaml(appellationPlan("appellation.example")),
    );
    await addEntity(missingAnchorRoot, {
      id: "producer.example-estate",
      status: "active",
      presentation: {
        mode: "register-entry",
        owner: "appellation.example",
        anchor: "producent-example-estate",
      },
      relations: [{ type: "located_in", target: "appellation.example" }],
    });
    await expect(buildContent({ root: missingAnchorRoot, write: false })).rejects.toThrow(
      /requires block 'producent-example-estate'/,
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

  it("rejects relations that become duplicate items in a related-topics group", async () => {
    const root = await temporaryRoot();
    await addEntity(root, {
      id: "concept.first",
      relations: [{ type: "related_to", target: "concept.second" }],
    });
    await addEntity(root, {
      id: "concept.second",
      relations: [{ type: "related_to", target: "concept.first" }],
    });

    await expect(buildContent({ root, write: false })).rejects.toThrow(
      /Related topics for 'concept\.first' would list 'concept\.second' more than once under 'Gerelateerd aan' \(nl\)/,
    );
  });

  it("accepts an inverse symmetric relation for a planned relation dependency", async () => {
    const root = await temporaryRoot();
    const firstDirectory = await addEntity(root, { id: "region.first" });
    await addEntity(root, {
      id: "region.second",
      relations: [{ type: "associated_with", target: "region.first" }],
    });
    const markdown = ':::summary{#orientatie depth="foundation"}\nA complete orientation.\n:::\n';
    await writeFile(path.join(firstDirectory, "overview.nl.md"), markdown);
    await writeFile(path.join(firstDirectory, "overview.en.md"), markdown);
    await addRegionPlan(firstDirectory, "region.first", [
      {
        id: "region.second",
        names: { nl: "second", en: "second" },
        slugs: { nl: "second", en: "second" },
        disposition: "relation",
      },
    ]);

    await expect(buildContent({ root, write: false })).resolves.toBeDefined();
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

  it("requires and validates an appellation plan for an active appellation", async () => {
    const root = await temporaryRoot();
    const directory = await addEntity(root, {
      id: "appellation.example",
      status: "active",
    });
    const summary = ':::summary{#orientatie depth="foundation"}\nOriëntatie.\n:::\n';
    await writeFile(path.join(directory, "overview.nl.md"), summary);
    await writeFile(path.join(directory, "overview.en.md"), summary);
    await expect(buildContent({ root, write: false })).rejects.toThrow(
      /active appellation requires a package-local content-plan\.yaml/,
    );

    await writeFile(
      path.join(directory, "content-plan.yaml"),
      stringifyYaml(appellationPlan("appellation.example")),
    );
    await expect(buildContent({ root, write: false })).resolves.toBeDefined();
  });

  it("requires and validates a grape plan for an active grape", async () => {
    const root = await temporaryRoot();
    const directory = await addEntity(root, {
      id: "grape.example",
      status: "active",
    });
    const summary = ':::summary{#orientatie depth="foundation"}\nOriëntatie.\n:::\n';
    await writeFile(path.join(directory, "overview.nl.md"), summary);
    await writeFile(path.join(directory, "overview.en.md"), summary);
    await expect(buildContent({ root, write: false })).rejects.toThrow(
      /active grape requires a package-local content-plan\.yaml/,
    );

    await writeFile(
      path.join(directory, "content-plan.yaml"),
      stringifyYaml(grapePlan("grape.example")),
    );
    await expect(buildContent({ root, write: false })).resolves.toBeDefined();
  });

  it("requires planned overview section headings to use their localized category label", async () => {
    const root = await temporaryRoot();
    const directory = await addEntity(root, { id: "region.example" });
    const plan = regionPlan("region.example");
    const history = plan.coverage.find((item) => item.key === "historical-development");
    if (!history) throw new Error("history coverage missing from test plan");
    history.block_ids = ["geschiedenis"];
    await writeFile(path.join(directory, "content-plan.yaml"), stringifyYaml(plan));

    await writeFile(
      path.join(directory, "overview.nl.md"),
      ':::summary{#orientatie depth="foundation"}\nOriëntatie.\n:::\n\n:::section{#geschiedenis depth="foundation"}\n## Geschiedenis\n\nDe hoofdlijn.\n:::\n',
    );
    await writeFile(
      path.join(directory, "overview.en.md"),
      ':::summary{#orientatie depth="foundation"}\nOrientation.\n:::\n\n:::section{#geschiedenis depth="foundation"}\n## History — a free editorial addition\n\nThe main line.\n:::\n',
    );
    await expect(buildContent({ root, write: false })).resolves.toBeDefined();

    await writeFile(
      path.join(directory, "overview.nl.md"),
      ':::summary{#orientatie depth="foundation"}\nOriëntatie.\n:::\n\n:::section{#geschiedenis depth="foundation"}\n## Een streek in beweging\n\nDe hoofdlijn.\n:::\n',
    );
    await expect(buildContent({ root, write: false })).rejects.toThrow(
      /nl section 'geschiedenis'.*must use 'Geschiedenis'/,
    );
  });

  it("validates the localized category labels of grape sections", async () => {
    const root = await temporaryRoot();
    const directory = await addEntity(root, { id: "grape.example" });
    const plan = grapePlan("grape.example");
    const styles = plan.coverage.find((item) => item.key === "wine-styles-and-sensory-profile");
    if (!styles) throw new Error("style coverage missing from grape test plan");
    styles.block_ids = ["wijnstijlen"];
    await writeFile(path.join(directory, "content-plan.yaml"), stringifyYaml(plan));

    await writeFile(
      path.join(directory, "overview.nl.md"),
      ':::summary{#orientatie depth="foundation"}\nOriëntatie.\n:::\n\n:::section{#wijnstijlen depth="foundation"}\n## Wijnstijlen en smaakprofiel — geen vast recept\n\nDe hoofdlijn.\n:::\n',
    );
    await writeFile(
      path.join(directory, "overview.en.md"),
      ':::summary{#orientatie depth="foundation"}\nOrientation.\n:::\n\n:::section{#wijnstijlen depth="foundation"}\n## Wine styles and sensory profile — no fixed recipe\n\nThe main line.\n:::\n',
    );

    await expect(buildContent({ root, write: false })).resolves.toBeDefined();
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
    expect(knowledgeBase.indexes.search[0]).toMatchObject({
      kind: "entity",
      passages: {
        nl: [
          {
            block_id: "voorbeeldfoto",
            kind: "media-caption",
            text: "Een onderschrift.",
          },
        ],
      },
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
  it("requires producer publication decisions in schema-v2 plans", async () => {
    const root = await temporaryRoot();
    const directory = await addEntity(root, { id: "region.example" });
    const plan = regionPlan("region.example", [
      {
        id: "producer.example-estate",
        names: { nl: "Example Estate", en: "Example Estate" },
        slugs: { nl: "example-estate", en: "example-estate" },
        disposition: "link",
      },
    ]);
    await writeFile(path.join(directory, "content-plan.yaml"), stringifyYaml(plan));

    await expect(loadContentPlans(root)).rejects.toThrow(
      /requires a publication decision for every producer dependency/,
    );
  });

  it("rejects schema-v1 plans and producer targets outside the dependency decision", async () => {
    const legacyRoot = await temporaryRoot();
    const legacyDirectory = await addEntity(legacyRoot, { id: "region.legacy" });
    await writeFile(
      path.join(legacyDirectory, "content-plan.yaml"),
      stringifyYaml(regionPlan("region.legacy")).replace("schema_version: 2", "schema_version: 1"),
    );
    await expect(loadContentPlans(legacyRoot)).rejects.toThrow(
      /schema_version Invalid input: expected 2/,
    );

    const targetRoot = await temporaryRoot();
    const targetDirectory = await addEntity(targetRoot, { id: "region.example" });
    const plan = regionPlan("region.example");
    plan.coverage[0].target_ids = ["producer.example-estate"];
    await writeFile(path.join(targetDirectory, "content-plan.yaml"), stringifyYaml(plan));

    await expect(loadContentPlans(targetRoot)).rejects.toThrow(
      /producer targets must also be declared in entity_dependencies/,
    );
  });

  it("rejects a linked producer outside the content-plan dependency decision", async () => {
    const root = await temporaryRoot();
    const directory = await addEntity(root, { id: "region.example" });
    await addEntity(root, { id: "producer.example-estate" });
    const markdown =
      ':::summary{#orientatie depth="foundation"}\nLees [[producer.example-estate|Example Estate]].\n:::\n';
    await writeFile(path.join(directory, "overview.nl.md"), markdown);
    await writeFile(path.join(directory, "overview.en.md"), markdown);
    await addRegionPlan(directory, "region.example");

    await expect(buildContent({ root, write: false })).rejects.toThrow(
      /linked producer 'producer\.example-estate' must be declared in entity_dependencies/,
    );
  });

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

    expect(findings).toEqual([
      {
        id: "region.example:en->grape.merlot",
        ownerId: "region.example",
        locale: "en",
        matchedText: "merlot",
        targetId: "grape.merlot",
      },
      {
        id: "region.example:nl->grape.merlot",
        ownerId: "region.example",
        locale: "nl",
        matchedText: "merlot",
        targetId: "grape.merlot",
      },
    ]);
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
      presentation: { mode: "monograph" },
    });

    expect(await readFile(path.join(packageDirectory, "entity.yaml"), "utf8")).toContain(
      "id: producer.example-estate",
    );
    const result = await buildContent({ root, write: false });
    expect(result.knowledgeBase.entities[0].id).toBe("producer.example-estate");
  });

  it("rejects producer generation without an explicit presentation", async () => {
    const root = await temporaryRoot();
    await expect(
      generateEntityPackage({ root, type: "producer", slug: "undecided-estate" }),
    ).rejects.toThrow(/requires an explicit presentation mode/);
  });

  it("preserves a planned producer presentation in a generated package", async () => {
    const root = await temporaryRoot();
    const packageDirectory = await generateEntityPackage({
      root,
      type: "producer",
      slug: "example-estate",
      presentation: {
        mode: "collection-profile",
        owner: "appellation.example",
        anchor: "producent-example-estate",
      },
    });

    const generated = await readFile(path.join(packageDirectory, "entity.yaml"), "utf8");
    expect(generated).toContain("mode: collection-profile");
    expect(generated).toContain("owner: appellation.example");
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
    const options = {
      root,
      type: "producer",
      slug: "example-estate",
      presentation: { mode: "monograph" as const },
    };
    await generateEntityPackage(options);

    await expect(generateEntityPackage(options)).rejects.toThrow(/Content package already exists/);
  });
});

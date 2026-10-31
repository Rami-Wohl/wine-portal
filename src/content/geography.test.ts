import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { fixtureEntity } from "../../scripts/content/fixtures/geography";
import { atlasSceneHref, createAtlasRepository, type AtlasEntityLookups } from "./geography";
import type { AtlasSceneView, Entity, ResolvedRelation } from "./model";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

const entity = (id: string, options: Partial<Entity> = {}): Entity =>
  fixtureEntity(id, {
    status: "active",
    names: { nl: id.split(".")[1], en: id.split(".")[1] },
    ...options,
  });

const entities = [
  entity("region.bordeaux"),
  entity("region.medoc", { relations: [{ type: "part_of", target: "region.bordeaux" }] }),
  entity("region.libournais", { relations: [{ type: "part_of", target: "region.bordeaux" }] }),
  entity("region.champagne", { status: "draft" }),
  entity("region.graves-sauternais", {
    slugs: { nl: "graves-sauternais", en: "graves-and-sauternais" },
    relations: [{ type: "part_of", target: "region.bordeaux" }],
  }),
  entity("appellation.pauillac", {
    geography_id: "geo.appellation-area.pauillac",
    relations: [
      { type: "part_of", target: "region.bordeaux" },
      { type: "part_of", target: "region.medoc" },
    ],
  }),
  entity("appellation.bordeaux-wide", {
    geography_id: "geo.appellation-area.bordeaux-wide",
    relations: [{ type: "part_of", target: "region.bordeaux" }],
  }),
  entity("appellation.unmapped", {
    relations: [
      { type: "part_of", target: "region.medoc" },
      { type: "part_of", target: "region.bordeaux" },
    ],
  }),
  // Part of Bordeaux only, yet listed by the Libournais scene: the scene definition decides.
  entity("appellation.saint-emilion", {
    geography_id: "geo.appellation-area.saint-emilion",
    relations: [{ type: "part_of", target: "region.bordeaux" }],
  }),
  // Held geometry: listed only by the Bordeaux scene, drawn nowhere.
  entity("appellation.cotes-de-bordeaux", {
    relations: [{ type: "part_of", target: "region.bordeaux" }],
  }),
  // Listed by two scenes of equal size; the part_of owner breaks the tie over the scene id.
  entity("appellation.tied", { relations: [{ type: "part_of", target: "region.medoc" }] }),
  entity("appellation.champagne", { relations: [{ type: "part_of", target: "region.champagne" }] }),
  entity("grape.merlot"),
];

const lookups: AtlasEntityLookups = {
  getEntityById: (id) => entities.find((candidate) => candidate.id === id),
  getRelationsForEntity: (entityId) =>
    entities.flatMap((candidate) =>
      candidate.relations
        .filter((relation) => candidate.id === entityId || relation.target === entityId)
        .map((relation): ResolvedRelation => ({ source: candidate.id, ...relation })),
    ),
};

function sceneView(
  id: string,
  owner: string,
  layers: AtlasSceneView["layers"],
  intended: string[],
  slug = owner.split(".")[1],
): AtlasSceneView {
  return {
    id,
    owner,
    slug,
    viewBox: { width: 1000, height: 800 },
    bbox: [0, 44, 1, 45],
    projection: { name: "mercator", scale: 1, translate: [0, 0] },
    layers,
    coverage: { intended, shown: [], missing: [] },
    credits: [],
    simplification: {
      method: "fixture",
      tolerance: 0,
      pixels: 0,
      vertexCountBefore: 0,
      vertexCountAfter: 0,
      droppedParts: [],
    },
  };
}

const area = (id: string, owner: string) => ({
  id,
  kind: "appellation-area" as const,
  owner,
  names: { nl: owner, en: owner },
  geometryType: "area" as const,
  path: "M0 0L10 0L10 10Z",
});

const scenes: AtlasSceneView[] = [
  sceneView(
    "scene.bordeaux",
    "region.bordeaux",
    [
      {
        id: "appellations",
        role: "selectable",
        features: [
          area("geo.appellation-area.pauillac", "appellation.pauillac"),
          area("geo.appellation-area.bordeaux-wide", "appellation.bordeaux-wide"),
          area("geo.appellation-area.saint-emilion", "appellation.saint-emilion"),
        ],
      },
    ],
    [
      "appellation.pauillac",
      "appellation.bordeaux-wide",
      "appellation.saint-emilion",
      "appellation.cotes-de-bordeaux",
    ],
  ),
  sceneView(
    "scene.medoc",
    "region.medoc",
    [
      {
        id: "context",
        role: "context",
        features: [area("geo.appellation-area.bordeaux-wide", "appellation.bordeaux-wide")],
      },
      {
        id: "appellations",
        role: "selectable",
        features: [area("geo.appellation-area.pauillac", "appellation.pauillac")],
      },
    ],
    ["appellation.pauillac", "appellation.tied"],
  ),
  sceneView(
    "scene.libournais",
    "region.libournais",
    [
      {
        id: "context",
        role: "context",
        features: [area("geo.appellation-area.bordeaux-wide", "appellation.bordeaux-wide")],
      },
      {
        id: "appellations",
        role: "selectable",
        features: [area("geo.appellation-area.saint-emilion", "appellation.saint-emilion")],
      },
    ],
    ["appellation.saint-emilion"],
  ),
  sceneView(
    "scene.graves-sauternais",
    "region.graves-sauternais",
    [{ id: "appellations", role: "selectable", features: [] }],
    ["appellation.tied", "appellation.other"],
    "graves-and-sauternais",
  ),
  sceneView(
    "scene.champagne",
    "region.champagne",
    [{ id: "appellations", role: "selectable", features: [] }],
    ["appellation.champagne"],
  ),
];

async function fixtureRepository() {
  const directory = await mkdtemp(path.join(os.tmpdir(), "oenocademy-atlas-repository-"));
  temporaryDirectories.push(directory);
  await mkdir(path.join(directory, "scenes"), { recursive: true });
  const summaries = scenes.map(({ layers, ...rest }) => ({
    ...rest,
    featureCount: layers.reduce((sum, layer) => sum + layer.features.length, 0),
    selectableEntities: Array.from(
      new Set(
        layers
          .filter((layer) => layer.role === "selectable")
          .flatMap((layer) => layer.features.map((feature) => feature.owner as string)),
      ),
    ).sort(),
  }));
  await writeFile(path.join(directory, "index.json"), JSON.stringify({ scenes: summaries }));
  for (const scene of scenes) {
    await writeFile(path.join(directory, "scenes", `${scene.id}.json`), JSON.stringify(scene));
  }
  return { directory, repository: createAtlasRepository({ directory, hotReload: false, lookups }) };
}

describe("Atlas repository", () => {
  it("lists every scene but publishes only scenes with an active owner", async () => {
    const { repository } = await fixtureRepository();
    expect(repository.getAtlasSceneSummaries().map((scene) => scene.id)).toEqual([
      "scene.bordeaux",
      "scene.medoc",
      "scene.libournais",
      "scene.graves-sauternais",
      "scene.champagne",
    ]);
    expect(repository.getPublishedAtlasSceneSummaries().map((scene) => scene.id)).toEqual([
      "scene.bordeaux",
      "scene.medoc",
      "scene.libournais",
      "scene.graves-sauternais",
    ]);
    expect(repository.getAtlasSceneSummaries()[0]).not.toHaveProperty("layers");
    expect(repository.getAtlasSceneSummaries()[0].featureCount).toBe(3);
  });

  it("loads a scene lazily by id or slug and caches it", async () => {
    const { directory, repository } = await fixtureRepository();
    expect(repository.getAtlasSceneById("scene.unknown")).toBeUndefined();
    expect(repository.getAtlasSceneBySlug("nowhere")).toBeUndefined();
    const medoc = repository.getAtlasSceneBySlug("medoc");
    expect(medoc?.id).toBe("scene.medoc");
    expect(medoc?.layers).toHaveLength(2);
    await rm(path.join(directory, "scenes", "scene.medoc.json"));
    expect(repository.getAtlasSceneById("scene.medoc")).toBe(medoc);
    expect(() => repository.getAtlasSceneById("scene.champagne")).not.toThrow();
  });

  it("resolves the owner's Dutch slug as an alias of the English route slug", async () => {
    const { repository } = await fixtureRepository();
    expect(repository.getAtlasSceneSummaryBySlug("graves-and-sauternais")?.id).toBe(
      "scene.graves-sauternais",
    );
    expect(repository.getAtlasSceneSummaryBySlug("graves-sauternais")?.id).toBe(
      "scene.graves-sauternais",
    );
    expect(repository.getAtlasSceneBySlug("graves-sauternais")?.slug).toBe("graves-and-sauternais");
    expect(repository.getAtlasSceneSummaryBySlug("medoc")?.id).toBe("scene.medoc");
    expect(repository.getAtlasSceneSummaryBySlug("region.medoc")).toBeUndefined();
  });

  it("returns a region's own scene without a highlighted feature", async () => {
    const { repository } = await fixtureRepository();
    expect(repository.getAtlasSceneForEntity("region.medoc")).toMatchObject({
      scene: { id: "scene.medoc" },
      featureId: undefined,
    });
    expect(repository.getAtlasSceneForEntity("region.champagne")?.scene.id).toBe("scene.champagne");
  });

  it("picks the scene that lists the entity with the fewest intended entities", async () => {
    const { repository } = await fixtureRepository();
    // Libournais lists Saint-Émilion although its only part_of target is Bordeaux.
    expect(repository.getAtlasSceneForEntity("appellation.saint-emilion")).toMatchObject({
      scene: { id: "scene.libournais" },
      featureId: "geo.appellation-area.saint-emilion",
    });
    expect(repository.getAtlasSceneForEntity("appellation.pauillac")?.scene.id).toBe("scene.medoc");
    // Held: listed only by the Bordeaux overview and drawn nowhere.
    expect(repository.getAtlasSceneForEntity("appellation.cotes-de-bordeaux")).toMatchObject({
      scene: { id: "scene.bordeaux" },
      featureId: undefined,
    });
    expect(repository.getAtlasSceneForEntity("appellation.champagne")).toMatchObject({
      scene: { id: "scene.champagne" },
      featureId: undefined,
    });
    // Equal list sizes: the scene whose owner the entity is part_of wins over the scene id.
    expect(repository.getAtlasSceneForEntity("appellation.tied")?.scene.id).toBe("scene.medoc");
  });

  it("prefers the most specific parent scene that draws an appellation as selectable", async () => {
    const { repository } = await fixtureRepository();
    expect(repository.getAtlasSceneForEntity("appellation.pauillac")).toMatchObject({
      scene: { id: "scene.medoc" },
      featureId: "geo.appellation-area.pauillac",
    });
    expect(repository.getAtlasFeatureForEntity("appellation.pauillac")).toMatchObject({
      sceneId: "scene.medoc",
      feature: { id: "geo.appellation-area.pauillac", owner: "appellation.pauillac" },
    });
    // Drawn only as context in Médoc and Libournais, listed by Bordeaux: the listing scene wins.
    expect(repository.getAtlasSceneForEntity("appellation.bordeaux-wide")).toMatchObject({
      scene: { id: "scene.bordeaux" },
      featureId: "geo.appellation-area.bordeaux-wide",
    });
  });

  it("returns the parent scene without a feature for an appellation without geometry", async () => {
    const { repository } = await fixtureRepository();
    expect(repository.getAtlasSceneForEntity("appellation.unmapped")).toMatchObject({
      scene: { id: "scene.medoc" },
      featureId: undefined,
    });
    expect(repository.getAtlasFeatureForEntity("appellation.unmapped")).toBeUndefined();
    expect(repository.getAtlasSceneForEntity("appellation.champagne")?.scene.id).toBe(
      "scene.champagne",
    );
    expect(repository.getAtlasSceneForEntity("grape.merlot")).toBeUndefined();
    expect(repository.getAtlasSceneForEntity("region.nowhere")).toBeUndefined();
  });

  it("explains a missing generated index", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "oenocademy-atlas-empty-"));
    temporaryDirectories.push(directory);
    expect(() => createAtlasRepository({ directory, hotReload: false, lookups })).toThrow(
      /Generated Atlas index is missing at .*index\.json; run npm run content:build/,
    );
  });

  it("builds localized scene routes from the English region slug", () => {
    expect(atlasSceneHref("medoc")).toBe("/atlas/medoc");
    expect(atlasSceneHref("medoc", "en")).toBe("/en/atlas/medoc");
  });
});

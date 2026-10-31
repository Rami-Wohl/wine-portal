// Fixture-based tests for geography validation (docs/atlas-plan.md §4, §5, §10).
// Shapes are synthetic squares and triangles, never published geography.
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { stringify as stringifyYaml } from "yaml";
import type { Entity } from "../../src/content/model";
import { addGeographyRecord, addScene, addSource, line, point, square } from "./fixtures/geography";
import { buildContent, ContentValidationError } from "./pipeline";

const temporaryRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});

async function temporaryRoot(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "oenocademy-geography-test-"));
  temporaryRoots.push(root);
  return root;
}

interface EntityOptions {
  id: string;
  status?: Entity["status"];
  geographyId?: string;
  relations?: Entity["relations"];
}

async function addEntity(root: string, options: EntityOptions): Promise<void> {
  const [type, slug] = options.id.split(".");
  const directory = path.join(root, "content", "entities", `${type}s`, slug);
  await mkdir(directory, { recursive: true });
  await writeFile(
    path.join(directory, "entity.yaml"),
    stringifyYaml({
      id: options.id,
      type,
      status: options.status ?? "draft",
      canonical_name: slug,
      names: { nl: `${slug} (nl)`, en: `${slug} (en)` },
      slugs: { nl: slug, en: slug },
      locales: { nl: "overview.nl.md", en: "overview.en.md" },
      relations: options.relations ?? [],
      assertions: [],
      source_refs: [],
      ...(options.geographyId ? { geography_id: options.geographyId } : {}),
    }),
  );
  await writeFile(path.join(directory, "overview.nl.md"), "");
  await writeFile(path.join(directory, "overview.en.md"), "");
}

/** A minimal valid corpus: one region, one appellation with a published square, one scene. */
export async function validFixture(root: string): Promise<void> {
  await addSource(root, "source.fixture-dataset");
  await addEntity(root, { id: "region.fixture" });
  await addEntity(root, {
    id: "appellation.alpha",
    geographyId: "geo.appellation-area.alpha",
    relations: [{ type: "part_of", target: "region.fixture" }],
  });
  await addGeographyRecord(root, {
    id: "geo.appellation-area.alpha",
    owner: "appellation.alpha",
    geometry: square(0, 45, 0.5),
  });
  await addScene(root);
}

async function expectIssues(root: string, ...expected: Array<string | RegExp>): Promise<string[]> {
  try {
    await buildContent({ root, write: false, requireLocalMedia: false });
  } catch (error) {
    if (!(error instanceof ContentValidationError)) throw error;
    for (const matcher of expected) {
      expect(error.issues.join("\n")).toMatch(matcher);
    }
    return error.issues;
  }
  throw new Error(`Expected validation to fail with: ${expected.map(String).join("; ")}`);
}

describe("geography validation", () => {
  it("passes without any geography data and writes an empty Atlas index", async () => {
    const root = await temporaryRoot();
    await addEntity(root, { id: "region.fixture" });
    const checked = await buildContent({ root, write: false, requireLocalMedia: false });
    expect(checked.atlas.index).toEqual({ scenes: [] });
    expect(checked.atlas.files["index.json"]).toBe('{"scenes":[]}\n');
    expect(checked.atlas.report).toEqual(["index: 0 scenes, 0.0 KiB gzip"]);
  });

  it("accepts a valid record and scene and keeps geometry out of the bundle", async () => {
    const root = await temporaryRoot();
    await validFixture(root);
    const result = await buildContent({ root, write: false, requireLocalMedia: false });
    expect(result.knowledgeBase.indexes.geography).toEqual({
      "geo.appellation-area.alpha": "appellation.alpha",
    });
    expect(result.outputs["knowledge-base.json"]).not.toContain("coordinates");
    expect(result.atlas?.scenes.map((scene) => scene.id)).toEqual(["scene.fixture"]);
    expect(result.atlas?.scenes[0].coverage).toEqual({
      intended: ["appellation.alpha"],
      shown: ["appellation.alpha"],
      missing: [],
    });
  });

  it("reports schema failures with the record file", async () => {
    const root = await temporaryRoot();
    await validFixture(root);
    const file = await addGeographyRecord(root, {
      id: "geo.river.beta",
      names: { nl: "Beta", en: "Beta" },
      geometry: line([
        [0, 45],
        [1, 46],
      ]),
      patch: (record) => {
        delete (record.geometry as Record<string, unknown>).sha256;
        (record.licence as Record<string, unknown>).id = "unknown-licence";
        record.meaning = "Not A Slug";
      },
    });
    await expectIssues(
      root,
      `${file}: geometry.sha256 Invalid input`,
      `${file}: licence.id Invalid input`,
      `${file}: meaning must be a lowercase kebab-case slug`,
    );
  });

  it("requires an owner for appellation areas and names for orientation features", async () => {
    const root = await temporaryRoot();
    await validFixture(root);
    const area = await addGeographyRecord(root, {
      id: "geo.appellation-area.gamma",
      geometry: square(1, 45, 0.5),
      patch: (record) => {
        delete record.owner;
      },
    });
    const river = await addGeographyRecord(root, {
      id: "geo.river.delta",
      geometry: line([
        [0, 45],
        [1, 46],
      ]),
    });
    const owned = await addGeographyRecord(root, {
      id: "geo.river.owned",
      owner: "appellation.alpha",
      names: { nl: "Eigen", en: "Owned" },
      geometry: line([
        [0, 45],
        [1, 46],
      ]),
    });
    await expectIssues(
      root,
      `${area}: owner is required for an appellation-area record`,
      `${river}: names is required when the record has no owner`,
      `${owned}: owner is only supported for appellation-area records; a river is an orientation feature`,
    );
  });

  it("rejects an ID whose kind segment, file name or directory disagree with the record", async () => {
    const root = await temporaryRoot();
    await validFixture(root);
    const file = await addGeographyRecord(root, {
      id: "geo.river.epsilon",
      names: { nl: "Epsilon", en: "Epsilon" },
      geometry: line([
        [0, 45],
        [1, 46],
      ]),
      directoryKind: "water-body",
      filename: "epsilon.yaml",
    });
    await expectIssues(
      root,
      `${file}: must be named 'geo.river.epsilon.yaml'`,
      `${file}: must live in data/geography/features/river/`,
    );
    const mismatch = await addGeographyRecord(root, {
      id: "geo.river.zeta",
      names: { nl: "Zeta", en: "Zeta" },
      geometry: line([
        [0, 45],
        [1, 46],
      ]),
      patch: (record) => {
        record.kind = "coastline";
      },
    });
    await expectIssues(root, `${mismatch}: id must use the record kind 'coastline'`);
  });

  it("rejects a checksum that does not match the committed GeoJSON", async () => {
    const root = await temporaryRoot();
    await validFixture(root);
    const file = await addGeographyRecord(root, {
      id: "geo.appellation-area.alpha",
      owner: "appellation.alpha",
      geometry: square(0, 45, 0.5),
      patch: (record) => {
        (record.geometry as Record<string, unknown>).sha256 = "b".repeat(64);
      },
    });
    await expectIssues(root, new RegExp(`${file}: geometry.sha256 does not match .*alpha.geojson`));
  });

  it("rejects geometry type, vertex count and bbox mismatches", async () => {
    const root = await temporaryRoot();
    await validFixture(root);
    const typeFile = await addGeographyRecord(root, {
      id: "geo.water-body.lake",
      names: { nl: "Meer", en: "Lake" },
      geometry: square(2, 45, 0.2),
      patch: (record) => {
        (record.geometry as Record<string, unknown>).type = "MultiPolygon";
      },
    });
    const countFile = await addGeographyRecord(root, {
      id: "geo.water-body.pond",
      names: { nl: "Vijver", en: "Pond" },
      geometry: square(3, 45, 0.2),
      patch: (record) => {
        (record.geometry as Record<string, unknown>).vertex_count = 99;
        (record.geometry as Record<string, unknown>).bbox = [3, 45, 3.2, 45.5];
      },
    });
    await expectIssues(
      root,
      `${typeFile}: geometry.type 'MultiPolygon' does not match`,
      `${countFile}: geometry.vertex_count 99 does not match`,
      `${countFile}: geometry.bbox [3, 45, 3.2, 45.5] does not match`,
    );
  });

  it("rejects missing, malformed and non-Feature GeoJSON files", async () => {
    const root = await temporaryRoot();
    await validFixture(root);
    const missing = await addGeographyRecord(root, {
      id: "geo.populated-place.one",
      names: { nl: "Een", en: "One" },
      geometry: point(0.1, 45.1),
    });
    await rm(path.join(root, path.dirname(missing), "geo.populated-place.one.geojson"));
    const malformed = await addGeographyRecord(root, {
      id: "geo.populated-place.two",
      names: { nl: "Twee", en: "Two" },
      geometry: point(0.2, 45.2),
      geojsonText: "{ not json",
    });
    await addGeographyRecord(root, {
      id: "geo.populated-place.three",
      names: { nl: "Drie", en: "Three" },
      geometry: point(0.3, 45.3),
      geojsonText: JSON.stringify({ type: "FeatureCollection", features: [] }),
    });
    await expectIssues(
      root,
      `${missing}: geometry.file 'geo.populated-place.one.geojson' is missing`,
      /geo\.populated-place\.two\.geojson: invalid JSON/,
      /geo\.populated-place\.three\.geojson: must contain exactly one GeoJSON Feature, found 'FeatureCollection'/,
    );
    // A file that does not parse is reported once, not also as a checksum failure.
    expect(await expectIssues(root, /malformed|invalid JSON/)).not.toContainEqual(
      expect.stringContaining(`${malformed}: geometry.sha256`),
    );
  });

  it("rejects coordinates that are not finite longitude/latitude pairs in range", async () => {
    const root = await temporaryRoot();
    await validFixture(root);
    await addGeographyRecord(root, {
      id: "geo.populated-place.far",
      names: { nl: "Ver", en: "Far" },
      geometry: point(200, 45),
      patch: (record) => {
        (record.geometry as Record<string, unknown>).bbox = [179, 45, 180, 45];
      },
    });
    const farBbox = await addGeographyRecord(root, {
      id: "geo.populated-place.far-bbox",
      names: { nl: "Ver", en: "Far" },
      geometry: point(200, 45),
    });
    await addGeographyRecord(root, {
      id: "geo.populated-place.text",
      names: { nl: "Tekst", en: "Text" },
      geometry: point(0, 45),
      geojsonText: JSON.stringify({
        type: "Feature",
        properties: {},
        geometry: { type: "Point", coordinates: ["0", 45] },
      }),
    });
    await addGeographyRecord(root, {
      id: "geo.populated-place.triple",
      names: { nl: "Drievoud", en: "Triple" },
      geometry: point(0, 45),
      geojsonText: JSON.stringify({
        type: "Feature",
        properties: {},
        geometry: { type: "Point", coordinates: [0, 45, 12] },
      }),
    });
    await expectIssues(
      root,
      /far\.geojson: Point \[200, 45\] is outside longitude/,
      `${farBbox}: geometry.bbox must stay within longitude [-180, 180]`,
      /text\.geojson: Point must contain finite numbers/,
      /triple\.geojson: Point must be a \[longitude, latitude\] pair/,
    );
  });

  it("rejects unclosed rings and rings against RFC 7946 orientation", async () => {
    const root = await temporaryRoot();
    await validFixture(root);
    const open = square(1, 45, 0.5);
    (open as { coordinates: number[][][] }).coordinates[0].pop();
    await addGeographyRecord(root, {
      id: "geo.water-body.open",
      names: { nl: "Open", en: "Open" },
      geometry: open,
    });
    const clockwise = square(2, 45, 0.5);
    (clockwise as { coordinates: number[][][] }).coordinates[0].reverse();
    await addGeographyRecord(root, {
      id: "geo.water-body.clockwise",
      names: { nl: "Met de klok mee", en: "Clockwise" },
      geometry: clockwise,
    });
    const holed = square(3, 45, 1);
    (holed as { coordinates: number[][][] }).coordinates.push(
      (square(3.2, 45.2, 0.2) as { coordinates: number[][][] }).coordinates[0],
    );
    await addGeographyRecord(root, {
      id: "geo.water-body.holed",
      names: { nl: "Met gat", en: "Holed" },
      geometry: holed,
    });
    await expectIssues(
      root,
      /open\.geojson: Polygon ring 0 is not closed/,
      /clockwise\.geojson: Polygon ring 0 must run counterclockwise/,
      /holed\.geojson: Polygon ring 1 must run clockwise/,
    );
  });

  it("links owners and geography_id references in both directions", async () => {
    const root = await temporaryRoot();
    await validFixture(root);
    await addEntity(root, { id: "appellation.beta" });
    await addEntity(root, { id: "appellation.gamma", geographyId: "geo.appellation-area.nowhere" });
    await addEntity(root, { id: "appellation.delta", geographyId: "geo.appellation-area.alpha" });
    const unknownOwner = await addGeographyRecord(root, {
      id: "geo.appellation-area.ghost",
      owner: "appellation.ghost",
      geometry: square(1, 45, 0.5),
    });
    const unlinkedOwner = await addGeographyRecord(root, {
      id: "geo.appellation-area.beta",
      owner: "appellation.beta",
      geometry: square(2, 45, 0.5),
    });
    await expectIssues(
      root,
      `${unknownOwner}: owner: Unknown entity reference 'appellation.ghost'`,
      `${unlinkedOwner}: owner 'appellation.beta' must declare geography_id 'geo.appellation-area.beta'`,
      /gamma\/entity\.yaml: geography_id 'geo.appellation-area.nowhere' has no record/,
      /delta\/entity\.yaml: geography_id 'geo.appellation-area.alpha' belongs to 'appellation.alpha'/,
    );
  });

  it("requires the source record and rejects duplicate record IDs", async () => {
    const root = await temporaryRoot();
    await validFixture(root);
    const file = await addGeographyRecord(root, {
      id: "geo.river.nosource",
      names: { nl: "Zonder bron", en: "No source" },
      geometry: line([
        [0, 45],
        [1, 46],
      ]),
      sourceId: "source.unknown-dataset",
    });
    const duplicate = await addGeographyRecord(root, {
      id: "geo.appellation-area.alpha",
      owner: "appellation.alpha",
      geometry: square(0, 45, 0.5),
      filename: "geo.appellation-area.alpha-copy.yaml",
    });
    await expectIssues(
      root,
      `${file}: source.source_id: Unknown source reference 'source.unknown-dataset'`,
      `Duplicate geography record ID 'geo.appellation-area.alpha'`,
      `${duplicate}: must be named`,
    );
  });

  it("validates scene references, kinds, roles, owners and intended entities", async () => {
    const root = await temporaryRoot();
    await validFixture(root);
    await addEntity(root, { id: "region.other" });
    await addGeographyRecord(root, {
      id: "geo.river.stream",
      names: { nl: "Beek", en: "Stream" },
      geometry: line([
        [0, 45],
        [1, 46],
      ]),
    });
    await addGeographyRecord(root, {
      id: "geo.river.brook",
      names: { nl: "Beekje", en: "Brook" },
      geometry: line([
        [0, 45],
        [1, 46],
      ]),
    });
    const scene = await addScene(root, {
      id: "scene.other",
      owner: "region.other",
      layers: [
        { id: "water", kinds: ["river"], features: ["geo.river.stream", "geo.river.missing"] },
        {
          id: "mixed",
          kinds: ["appellation-area"],
          features: ["geo.river.brook"],
          role: "selectable",
        },
      ],
      intended: ["appellation.alpha", "appellation.nobody"],
    });
    await expectIssues(
      root,
      `${scene}: layer 'water': Unknown geography record reference 'geo.river.missing'`,
      `${scene}: layer 'mixed' lists 'geo.river.brook' of kind 'river', but allows appellation-area`,
      `${scene}: intended_entities: Unknown entity reference 'appellation.nobody'`,
      `${scene}: intended entity 'appellation.alpha' has the published record 'geo.appellation-area.alpha', which no layer of this scene includes`,
    );
  });

  it("rejects scene layers that repeat a feature, mix kind groups or lack a role", async () => {
    const root = await temporaryRoot();
    await validFixture(root);
    const scene = await addScene(root, {
      layers: [
        { id: "first", kinds: ["appellation-area"], features: ["geo.appellation-area.alpha"] },
        {
          id: "second",
          kinds: ["river", "appellation-area"],
          features: ["geo.appellation-area.alpha"],
          role: "selectable",
        },
        { id: "water", kinds: ["river"], features: ["geo.river.none"], role: "context" },
      ],
    });
    await expectIssues(
      root,
      `${scene}: layers.0.role is required for an appellation-area layer: 'context' or 'selectable'`,
      `${scene}: layers.1.kinds must stay within one group`,
      `${scene}: layers.1.features.0 feature 'geo.appellation-area.alpha' appears more than once`,
      `${scene}: layers.2.role is only supported for appellation-area layers`,
    );
  });

  it("rejects a scene that omits the published record of an intended entity", async () => {
    const root = await temporaryRoot();
    await validFixture(root);
    await addEntity(root, {
      id: "appellation.beta",
      geographyId: "geo.appellation-area.beta",
    });
    await addGeographyRecord(root, {
      id: "geo.appellation-area.beta",
      owner: "appellation.beta",
      geometry: square(1, 45, 0.5),
    });
    const scene = await addScene(root, { intended: ["appellation.alpha", "appellation.beta"] });
    await expectIssues(
      root,
      `${scene}: intended entity 'appellation.beta' has the published record 'geo.appellation-area.beta', which no layer of this scene includes`,
    );
  });

  it("rejects scene identity problems: non-region owner, ID mismatch, duplicate owner", async () => {
    const root = await temporaryRoot();
    await validFixture(root);
    const wrongOwner = await addScene(root, {
      id: "scene.alpha",
      owner: "appellation.alpha",
      filename: "scene.alpha.yaml",
    });
    const mismatch = await addScene(root, { id: "scene.elsewhere", owner: "region.fixture" });
    const copy = await addScene(root, { filename: "scene.fixture-copy.yaml" });
    await expectIssues(
      root,
      `${wrongOwner}: owner must be a region entity`,
      `${mismatch}: id must be 'scene.fixture' for owner 'region.fixture'`,
      `Duplicate scene owner 'region.fixture'`,
      `Duplicate scene ID 'scene.fixture'`,
      `${copy}: must be named 'scene.fixture.yaml'`,
    );
  });

  it("validates held records and reports them as coverage gaps instead of display features", async () => {
    const root = await temporaryRoot();
    await validFixture(root);
    await addEntity(root, { id: "appellation.held", geographyId: "geo.appellation-area.held" });
    await addEntity(root, {
      id: "appellation.reviewed",
      geographyId: "geo.appellation-area.reviewed",
    });
    await addEntity(root, { id: "appellation.unmapped" });
    await addGeographyRecord(root, {
      id: "geo.appellation-area.held",
      owner: "appellation.held",
      geometry: square(1, 45, 0.5),
      status: "held",
    });
    await addGeographyRecord(root, {
      id: "geo.appellation-area.reviewed",
      owner: "appellation.reviewed",
      geometry: square(2, 45, 0.5),
      status: "reviewed",
    });
    await addScene(root, {
      layers: [
        {
          id: "appellations",
          kinds: ["appellation-area"],
          features: [
            "geo.appellation-area.alpha",
            "geo.appellation-area.held",
            "geo.appellation-area.reviewed",
          ],
          role: "selectable",
        },
      ],
      intended: [
        "appellation.alpha",
        "appellation.held",
        "appellation.reviewed",
        "appellation.unmapped",
      ],
    });
    const result = await buildContent({ root, write: false, requireLocalMedia: false });
    const scene = result.atlas?.scenes[0];
    expect(scene?.layers[0].features.map((feature) => feature.id)).toEqual([
      "geo.appellation-area.alpha",
    ]);
    expect(scene?.coverage).toEqual({
      intended: [
        "appellation.alpha",
        "appellation.held",
        "appellation.reviewed",
        "appellation.unmapped",
      ],
      shown: ["appellation.alpha"],
      missing: [
        { entity: "appellation.held", reason: "held" },
        { entity: "appellation.reviewed", reason: "unpublished" },
        { entity: "appellation.unmapped", reason: "no-record" },
      ],
    });
    expect(result.atlas?.report.join("\n")).toContain("'geo.appellation-area.held' is held");
  });

  it("requires a held record to explain itself and a reviewed record to carry a date", async () => {
    const root = await temporaryRoot();
    await validFixture(root);
    const held = await addGeographyRecord(root, {
      id: "geo.river.held",
      names: { nl: "Vast", en: "Held" },
      geometry: line([
        [0, 45],
        [1, 46],
      ]),
      status: "held",
      patch: (record) => {
        delete (record.review as Record<string, unknown>).notes;
      },
    });
    const undated = await addGeographyRecord(root, {
      id: "geo.river.undated",
      names: { nl: "Zonder datum", en: "Undated" },
      geometry: line([
        [0, 45],
        [1, 46],
      ]),
      patch: (record) => {
        delete (record.review as Record<string, unknown>).reviewed_at;
      },
    });
    await expectIssues(
      root,
      `${held}: review.notes must explain why the record is held`,
      `${undated}: review.reviewed_at is required once a record is published`,
    );
  });
});

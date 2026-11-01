// Display build tests on synthetic shapes (squares, a U shape, a jagged ring); never geography.
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { GeographyRecord, Scene, Source } from "../../src/content/model";
import { fixtureEntity as entity, square } from "../content/fixtures/geography";
import {
  AtlasBuildError,
  buildAtlasDisplay,
  fitProjection,
  rankAreas,
  gzipSize,
  labelAnchorForPolygons,
  VIEWBOX_WIDTH,
  type AtlasBuildInput,
  type AtlasBuildRecord,
} from "./lib/display";
import type { GeoProjection } from "d3-geo";
import {
  countVertices,
  geometryBbox,
  planarSignedArea,
  sha256Hex,
  type GeographyGeometry,
} from "./lib/geometry";
import { projectShape } from "./lib/projection";
import { clipRing, encodeRings, thumbnailPath } from "./lib/thumbnail";
import {
  ATLAS_THUMBNAIL_PATH_BUDGET_BYTES,
  atlasThumbnailSchema,
} from "../../src/content/model/geography";
import { writeAtlasDisplay } from "./lib/output";

const temporaryRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});

function source(id: string, overrides: Partial<Source> = {}): Source {
  return {
    id,
    source_type: "dataset",
    publisher: "Fixture publisher",
    title: "Fixture dataset",
    url: "https://example.org/fixture-dataset",
    language: "fr",
    status: "active",
    ...overrides,
  };
}

interface RecordInput {
  id: string;
  geometry: GeographyGeometry;
  owner?: string;
  names?: { nl: string; en: string };
  status?: GeographyRecord["review"]["status"];
  sourceId?: string;
  release?: string;
  attribution?: string;
}

function record(input: RecordInput): AtlasBuildRecord {
  const kind = input.id.split(".")[1] as GeographyRecord["kind"];
  const text = JSON.stringify({ type: "Feature", properties: {}, geometry: input.geometry });
  return {
    file: `data/geography/features/${kind}/${input.id}.yaml`,
    feature: { type: "Feature", properties: {}, geometry: input.geometry },
    record: {
      id: input.id,
      kind,
      ...(input.owner ? { owner: input.owner } : {}),
      ...(input.names ? { names: input.names } : {}),
      geometry: {
        file: `${input.id}.geojson`,
        type: input.geometry.type,
        sha256: sha256Hex(text),
        vertex_count: countVertices(input.geometry),
        bbox: geometryBbox(input.geometry),
      },
      source: {
        source_id: input.sourceId ?? "source.fixture-dataset",
        dataset_id: "fixture-dataset",
        resource_id: "fixture-resource",
        release: input.release ?? "2026-10-12",
        retrieved_at: "2026-10-30",
        resource_sha256: "a".repeat(64),
        crs: "EPSG:2154",
        encoding: "UTF-8",
        feature_key: { id_app: 1 },
      },
      licence: {
        id: "etalab-2.0",
        attribution: input.attribution ?? "Fixture publisher, fixture dataset, edition 2026-10-12",
      },
      transformation: [],
      meaning: "fixture-shape",
      precision: "regional-orientation",
      limitations: "Synthetic test fixture, not geography.",
      review: {
        status: input.status ?? "published",
        reviewed_at: "2026-10-30",
        ...(input.status === "held" ? { notes: "fixture hold" } : {}),
      },
      supersedes: null,
    },
  };
}

function scene(overrides: Partial<Scene> = {}): { file: string; scene: Scene } {
  const value: Scene = {
    id: "scene.fixture",
    owner: "region.fixture",
    extent: { mode: "fit", padding: 0.1 },
    projection: "mercator",
    layers: [
      {
        id: "appellations",
        kinds: ["appellation-area"],
        features: ["geo.appellation-area.alpha"],
        role: "selectable",
      },
    ],
    intended_entities: ["appellation.alpha"],
    ...overrides,
  };
  return { file: `data/geography/scenes/${value.id}.yaml`, scene: value };
}

function baseInput(overrides: Partial<AtlasBuildInput> = {}): AtlasBuildInput {
  return {
    records: [
      record({
        id: "geo.appellation-area.alpha",
        owner: "appellation.alpha",
        geometry: square(0, 0, 1),
      }),
    ],
    scenes: [scene()],
    entities: [
      entity("region.fixture", { status: "active" }),
      entity("appellation.alpha", { geography_id: "geo.appellation-area.alpha" }),
    ],
    sources: [source("source.fixture-dataset")],
    ...overrides,
  };
}

function pathNumbers(d: string): number[][] {
  return d
    .split("Z")
    .filter(Boolean)
    .flatMap((ring) =>
      ring
        .slice(1)
        .split("L")
        .map((pair) => pair.split(" ").map(Number)),
    );
}

describe("Atlas scene fitting", () => {
  it("fits the selectable areas into a 1000-wide viewBox with padding on every side", () => {
    const output = buildAtlasDisplay(baseInput());
    const view = output.scenes[0];
    expect(view.viewBox.width).toBe(VIEWBOX_WIDTH);
    expect(view.viewBox.height).toBeGreaterThan(990);
    expect(view.viewBox.height).toBeLessThan(1010);
    const points = pathNumbers(view.layers[0].features[0].path as string);
    const xs = points.map(([x]) => x);
    const ys = points.map(([, y]) => y);
    expect(Math.min(...xs)).toBeCloseTo(1000 / 12, 0);
    expect(Math.max(...xs)).toBeCloseTo(1000 - 1000 / 12, 0);
    expect(Math.min(...ys)).toBeGreaterThan(80);
    expect(Math.max(...ys)).toBeLessThan(view.viewBox.height - 80);
    expect(view.bbox[0]).toBeCloseTo(-0.1, 3);
    expect(view.bbox[2]).toBeCloseTo(1.1, 3);
    expect(view.bbox[1]).toBeLessThan(0);
    expect(view.bbox[3]).toBeGreaterThan(1);
    expect(view.projection).toMatchObject({ name: "mercator" });
    expect(view.projection.scale).toBeGreaterThan(0);
    expect(view.slug).toBe("fixture");
    expect(view.owner).toBe("region.fixture");
  });

  it("uses an explicit bbox extent without padding and derives the height from its aspect", () => {
    const output = buildAtlasDisplay(
      baseInput({ scenes: [scene({ extent: { mode: "bbox", bbox: [-1, 0, 3, 1] } })] }),
    );
    const view = output.scenes[0];
    expect(view.viewBox.height).toBeGreaterThan(245);
    expect(view.viewBox.height).toBeLessThan(255);
    expect(view.bbox[0]).toBeCloseTo(-1, 4);
    expect(view.bbox[2]).toBeCloseTo(3, 4);
    const xs = pathNumbers(view.layers[0].features[0].path as string).map(([x]) => x);
    expect(Math.min(...xs)).toBeCloseTo(250, 0);
    expect(Math.max(...xs)).toBeCloseTo(500, 0);
  });

  it("refuses to fit a scene without published appellation areas", () => {
    const input = baseInput({
      records: [
        record({
          id: "geo.appellation-area.alpha",
          owner: "appellation.alpha",
          geometry: square(0, 0, 1),
          status: "held",
        }),
        record({
          id: "geo.river.r",
          names: { nl: "R", en: "R" },
          geometry: {
            type: "LineString",
            coordinates: [
              [0, 0],
              [1, 1],
            ],
          },
        }),
      ],
      scenes: [
        scene({
          layers: [
            { id: "water", kinds: ["river"], features: ["geo.river.r"] },
            {
              id: "appellations",
              kinds: ["appellation-area"],
              features: ["geo.appellation-area.alpha"],
              role: "selectable",
            },
          ],
        }),
      ],
    });
    expect(() => buildAtlasDisplay(input)).toThrow(
      /scene\.fixture\.yaml: has no published selectable appellation areas to fit; publish a record or set extent\.mode to bbox/,
    );
  });

  it("does not widen the fitted extent for a large context area", () => {
    const fitted = buildAtlasDisplay(baseInput()).scenes[0];
    const output = buildAtlasDisplay(
      baseInput({
        records: [
          record({
            id: "geo.appellation-area.alpha",
            owner: "appellation.alpha",
            geometry: square(0, 0, 1),
          }),
          record({
            id: "geo.appellation-area.umbrella",
            owner: "appellation.umbrella",
            geometry: square(-20, -20, 50),
          }),
        ],
        scenes: [
          scene({
            layers: [
              {
                id: "context",
                kinds: ["appellation-area"],
                features: ["geo.appellation-area.umbrella"],
                role: "context",
              },
              {
                id: "appellations",
                kinds: ["appellation-area"],
                features: ["geo.appellation-area.alpha"],
                role: "selectable",
              },
            ],
          }),
        ],
        entities: [
          entity("region.fixture", { status: "active" }),
          entity("appellation.alpha", { geography_id: "geo.appellation-area.alpha" }),
          entity("appellation.umbrella", { geography_id: "geo.appellation-area.umbrella" }),
        ],
      }),
    );
    const view = output.scenes[0];
    expect(view.bbox).toEqual(fitted.bbox);
    expect(view.projection).toEqual(fitted.projection);
    expect(view.viewBox).toEqual(fitted.viewBox);
    // The context area is still drawn, extending past the viewBox where the SVG clips it.
    const umbrella = view.layers[0].features[0];
    expect(umbrella.owner).toBe("appellation.umbrella");
    const xs = pathNumbers(umbrella.path as string).map(([x]) => x);
    expect(Math.min(...xs)).toBeLessThan(0);
    expect(Math.max(...xs)).toBeGreaterThan(VIEWBOX_WIDTH);
  });

  it("refuses to fit a scene whose only published areas are context", () => {
    const input = baseInput({
      scenes: [
        scene({
          layers: [
            {
              id: "context",
              kinds: ["appellation-area"],
              features: ["geo.appellation-area.alpha"],
              role: "context",
            },
          ],
        }),
      ],
    });
    expect(() => buildAtlasDisplay(input)).toThrow(
      /has no published selectable appellation areas to fit/,
    );
  });

  it("treats a collinear ring that rounds to floating-point noise as a sliver", () => {
    // Identity projection: positions are already viewBox units on the 0.1 display grid.
    const identity = (([x, y]: [number, number]) => [x, y]) as unknown as GeoProjection;
    const sliver = [
      [10.1, 20.3],
      [10.3, 20.9],
      [10.7, 22.1],
      [10.1, 20.3],
    ];
    // Exactly collinear, but the shoelace sum is not exactly zero in floating point.
    expect(planarSignedArea(sliver)).not.toBe(0);
    expect(Math.abs(planarSignedArea(sliver))).toBeLessThan(1e-9);
    const smallest = [
      [0, 0],
      [0.1, 0],
      [0, 0.1],
      [0, 0],
    ];
    const kept = projectShape(identity, {
      type: "MultiPolygon",
      coordinates: [[sliver], [smallest]],
    });
    expect(kept.droppedParts).toBe(1);
    expect(kept.collapsed).toBeUndefined();
    expect(kept.path).toBe("M0 0L0.1 0L0 0.1Z");
    const onlySliver = projectShape(identity, { type: "Polygon", coordinates: [sliver] });
    expect(onlySliver.collapsed).toBe("no ring keeps an extent at display resolution");
    expect(onlySliver.droppedParts).toBe(1);
  });

  it("exposes the projection helper for plain positions", () => {
    const { projection, height } = fitProjection(
      (square(10, 50, 2) as { coordinates: number[][][] }).coordinates[0],
      0,
    );
    // Mercator stretches latitude more than longitude at 50° north.
    expect(height).toBeGreaterThan(1000);
    expect(projection([10, 52])?.map((value) => Math.round(value) || 0)).toEqual([0, 0]);
    expect(projection([12, 50])?.map((value) => Math.round(value) || 0)).toEqual([1000, height]);
  });
});

describe("Atlas scene composition", () => {
  it("draws larger areas first within a layer and ranks them", () => {
    const output = buildAtlasDisplay(
      baseInput({
        records: [
          record({
            id: "geo.appellation-area.small",
            owner: "appellation.small",
            geometry: square(0.2, 0.2, 0.2),
          }),
          record({
            id: "geo.appellation-area.alpha",
            owner: "appellation.alpha",
            geometry: square(0, 0, 1),
          }),
          record({
            id: "geo.populated-place.town",
            names: { nl: "Stad", en: "Town" },
            geometry: { type: "Point", coordinates: [0.5, 0.5] },
          }),
        ],
        scenes: [
          scene({
            layers: [
              {
                id: "appellations",
                kinds: ["appellation-area"],
                features: ["geo.appellation-area.small", "geo.appellation-area.alpha"],
                role: "selectable",
              },
              { id: "places", kinds: ["populated-place"], features: ["geo.populated-place.town"] },
            ],
            intended_entities: ["appellation.alpha", "appellation.small"],
          }),
        ],
        entities: [
          entity("region.fixture"),
          entity("appellation.alpha", { geography_id: "geo.appellation-area.alpha" }),
          entity("appellation.small", { geography_id: "geo.appellation-area.small" }),
        ],
      }),
    );
    const [areas, places] = output.scenes[0].layers;
    expect(areas.role).toBe("selectable");
    expect(areas.features.map((feature) => [feature.id, feature.areaRank])).toEqual([
      ["geo.appellation-area.alpha", 1],
      ["geo.appellation-area.small", 2],
    ]);
    expect(areas.features[0]).toMatchObject({
      owner: "appellation.alpha",
      names: { nl: "alpha (nl)", en: "alpha (en)" },
      geometryType: "area",
      kind: "appellation-area",
    });
    expect(areas.features[0].labelAnchor?.[0]).toBeCloseTo(500, 0);
    expect(places.role).toBe("places");
    expect(places.features[0]).toMatchObject({
      geometryType: "point",
      names: { nl: "Stad", en: "Town" },
    });
    expect(places.features[0].point?.[0]).toBeCloseTo(500, 0);
    expect(places.features[0].path).toBeUndefined();
    expect(places.features[0].areaRank).toBeUndefined();
  });

  it("places a label anchor inside a concave area whose centroid falls outside it", () => {
    // A U shape: a 3x3 square without the notch x in [1,2], y in [1,3].
    const u: GeographyGeometry = {
      type: "Polygon",
      coordinates: [
        [
          [0, 0],
          [3, 0],
          [3, 3],
          [2, 3],
          [2, 1],
          [1, 1],
          [1, 3],
          [0, 3],
          [0, 0],
        ],
      ],
    };
    const output = buildAtlasDisplay(
      baseInput({
        records: [
          record({ id: "geo.appellation-area.alpha", owner: "appellation.alpha", geometry: u }),
        ],
        scenes: [scene({ extent: { mode: "fit", padding: 0 } })],
      }),
    );
    const anchor = output.scenes[0].layers[0].features[0].labelAnchor as [number, number];
    // The left arm spans x in [0, 1000/3); the notch would have been around x = 500.
    expect(anchor[0]).toBeGreaterThan(0);
    expect(anchor[0]).toBeLessThan(1000 / 3);
    expect(
      labelAnchorForPolygons([
        [
          [
            [0, 0],
            [10, 0],
            [10, 10],
            [0, 10],
          ],
        ],
      ]),
    ).toEqual([5, 5]);
  });

  it("names orientation features from their records and owned features from entities", () => {
    const output = buildAtlasDisplay(
      baseInput({
        records: [
          record({
            id: "geo.appellation-area.alpha",
            owner: "appellation.alpha",
            geometry: square(0, 0, 1),
          }),
          record({
            id: "geo.river.flow",
            names: { nl: "Stroom", en: "Flow" },
            geometry: {
              type: "MultiLineString",
              coordinates: [
                [
                  [0, 0.5],
                  [1, 0.5],
                ],
                [
                  [0.5, 0],
                  [0.5, 1],
                ],
              ],
            },
          }),
        ],
        scenes: [
          scene({
            // A context-only scene cannot be fitted, so it states its extent explicitly.
            extent: { mode: "bbox", bbox: [-0.1, -0.1, 1.1, 1.1] },
            layers: [
              { id: "water", kinds: ["river", "water-body"], features: ["geo.river.flow"] },
              {
                id: "appellations",
                kinds: ["appellation-area"],
                features: ["geo.appellation-area.alpha"],
                role: "context",
              },
            ],
          }),
        ],
      }),
    );
    const [water, context] = output.scenes[0].layers;
    expect(water.role).toBe("water");
    expect(water.features[0]).toMatchObject({
      geometryType: "line",
      names: { nl: "Stroom", en: "Flow" },
    });
    expect(water.features[0].path).toMatch(/^M[\d. ]+L[\d. ]+M[\d. ]+L[\d. ]+$/);
    expect(water.features[0].owner).toBeUndefined();
    expect(context.role).toBe("context");
  });

  it("collects one credit per source with registry licence data and joined attributions", () => {
    const output = buildAtlasDisplay(
      baseInput({
        records: [
          record({
            id: "geo.appellation-area.alpha",
            owner: "appellation.alpha",
            geometry: square(0, 0, 1),
            release: "2026-10-12",
          }),
          record({
            id: "geo.river.flow",
            names: { nl: "Stroom", en: "Flow" },
            geometry: {
              type: "LineString",
              coordinates: [
                [0, 0.5],
                [1, 0.5],
              ],
            },
            release: "2026-09-01",
            attribution: "Fixture publisher, rivers, edition 2026-09-01",
          }),
          record({
            id: "geo.populated-place.town",
            names: { nl: "Stad", en: "Town" },
            geometry: { type: "Point", coordinates: [0.5, 0.5] },
            sourceId: "source.places",
            release: "2025-01-01",
          }),
        ],
        scenes: [
          scene({
            layers: [
              { id: "water", kinds: ["river"], features: ["geo.river.flow"] },
              {
                id: "appellations",
                kinds: ["appellation-area"],
                features: ["geo.appellation-area.alpha"],
                role: "selectable",
              },
              { id: "places", kinds: ["populated-place"], features: ["geo.populated-place.town"] },
            ],
          }),
        ],
        sources: [
          source("source.fixture-dataset"),
          source("source.places", { publisher: "Places office", title: "Places", url: undefined }),
        ],
      }),
    );
    const view = output.scenes[0];
    expect(view.credits).toEqual([
      {
        sourceId: "source.fixture-dataset",
        publisher: "Fixture publisher",
        licence: {
          id: "etalab-2.0",
          name: "Licence Ouverte / Open Licence 2.0",
          url: "https://www.data.gouv.fr/pages/legal/licences/etalab-2.0",
        },
        url: "https://example.org/fixture-dataset",
        attribution:
          "Fixture publisher, fixture dataset, edition 2026-10-12; Fixture publisher, rivers, edition 2026-09-01",
      },
      {
        sourceId: "source.places",
        publisher: "Places office",
        licence: {
          id: "etalab-2.0",
          name: "Licence Ouverte / Open Licence 2.0",
          url: "https://www.data.gouv.fr/pages/legal/licences/etalab-2.0",
        },
        attribution: "Fixture publisher, fixture dataset, edition 2026-10-12",
      },
    ]);
    expect(view.credits[0]).not.toHaveProperty("title");
    expect(view).not.toHaveProperty("generatedAt");
  });

  it("records the simplification method and keeps every vertex when the budget allows", () => {
    const view = buildAtlasDisplay(baseInput()).scenes[0];
    expect(view.simplification).toEqual({
      method: expect.stringContaining("topojson-simplify"),
      tolerance: 0,
      pixels: 0,
      vertexCountBefore: 5,
      vertexCountAfter: 5,
      droppedParts: [],
    });
  });
});

/** A jagged ring with many vertices that does not compress well. */
function jaggedRing(vertices: number): GeographyGeometry {
  const ring: number[][] = [];
  let seed = 7;
  for (let index = 0; index < vertices; index += 1) {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    const angle = (index / vertices) * 2 * Math.PI;
    const radius = 1 + (seed / 2147483648) * 0.05;
    ring.push([
      Number((10 + radius * Math.cos(angle)).toFixed(6)),
      Number((45 + radius * 0.7 * Math.sin(angle)).toFixed(6)),
    ]);
  }
  ring.push(ring[0]);
  return { type: "Polygon", coordinates: [ring] };
}

describe("Atlas budgets and simplification", () => {
  it("simplifies with a topology-preserving tolerance until the scene budget holds", () => {
    const input = baseInput({
      records: [
        record({
          id: "geo.appellation-area.alpha",
          owner: "appellation.alpha",
          geometry: jaggedRing(4000),
        }),
      ],
      budgets: { sceneGzipBytes: 12 * 1024 },
    });
    const unconstrained = buildAtlasDisplay({ ...input, budgets: undefined }).scenes[0];
    expect(unconstrained.simplification.tolerance).toBe(0);
    expect(unconstrained.simplification.vertexCountAfter).toBe(4001);
    expect(gzipSize(JSON.stringify(unconstrained))).toBeGreaterThan(12 * 1024);

    const constrained = buildAtlasDisplay(input).scenes[0];
    expect(constrained.simplification.tolerance).toBeGreaterThan(0);
    expect(constrained.simplification.vertexCountBefore).toBe(4001);
    expect(constrained.simplification.vertexCountAfter).toBeLessThan(4001);
    expect(constrained.simplification.vertexCountAfter).toBeGreaterThan(3);
    expect(constrained.layers[0].features).toHaveLength(1);
    expect(gzipSize(JSON.stringify(constrained))).toBeLessThanOrEqual(12 * 1024);
  });

  it("refuses a feature that display rounding flattens, instead of shipping a dot", () => {
    const input = baseInput({
      records: [
        record({
          id: "geo.appellation-area.alpha",
          owner: "appellation.alpha",
          geometry: square(0, 0, 2),
        }),
        record({
          id: "geo.appellation-area.tiny",
          owner: "appellation.tiny",
          geometry: square(0.5, 0.5, 0.00008),
        }),
      ],
      scenes: [
        scene({
          layers: [
            {
              id: "appellations",
              kinds: ["appellation-area"],
              features: ["geo.appellation-area.alpha", "geo.appellation-area.tiny"],
              role: "selectable",
            },
          ],
          intended_entities: ["appellation.alpha", "appellation.tiny"],
        }),
      ],
      entities: [
        entity("region.fixture"),
        entity("appellation.alpha", { geography_id: "geo.appellation-area.alpha" }),
        entity("appellation.tiny", { geography_id: "geo.appellation-area.tiny" }),
      ],
    });
    expect(() => buildAtlasDisplay(input)).toThrow(
      /scene\.fixture\.yaml: cannot be displayed: .*collapses 'geo\.appellation-area\.tiny' \(no ring keeps an extent at display resolution\)/,
    );
  });

  it("drops a river segment below display resolution but keeps the river and counts the part", () => {
    const output = buildAtlasDisplay(
      baseInput({
        records: [
          record({
            id: "geo.appellation-area.alpha",
            owner: "appellation.alpha",
            geometry: square(0, 0, 1),
          }),
          record({
            id: "geo.river.flow",
            names: { nl: "Stroom", en: "Flow" },
            geometry: {
              type: "MultiLineString",
              coordinates: [
                [
                  [0, 0.5],
                  [1, 0.5],
                ],
                [
                  [0.5, 0.25],
                  [0.500002, 0.25],
                ],
              ],
            },
          }),
        ],
        scenes: [
          scene({
            layers: [
              { id: "water", kinds: ["river"], features: ["geo.river.flow"] },
              {
                id: "appellations",
                kinds: ["appellation-area"],
                features: ["geo.appellation-area.alpha"],
                role: "selectable",
              },
            ],
          }),
        ],
      }),
    );
    const view = output.scenes[0];
    const river = view.layers[0].features[0];
    expect(river.id).toBe("geo.river.flow");
    expect(river.path).toMatch(/^M[\d. ]+L[\d. ]+$/);
    expect(view.simplification.droppedParts).toEqual([{ featureId: "geo.river.flow", parts: 1 }]);
    expect(view.simplification.vertexCountAfter).toBe(7);
    expect(output.report.join("\n")).toContain("1 part below display resolution dropped");
  });

  it("drops a hole below display resolution but keeps the exterior ring", () => {
    const holed = square(0, 0, 1) as { type: "Polygon"; coordinates: number[][][] };
    holed.coordinates.push(
      [...(square(0.5, 0.5, 0.00005) as { coordinates: number[][][] }).coordinates[0]].reverse(),
    );
    const view = buildAtlasDisplay(
      baseInput({
        records: [
          record({ id: "geo.appellation-area.alpha", owner: "appellation.alpha", geometry: holed }),
        ],
      }),
    ).scenes[0];
    const feature = view.layers[0].features[0];
    expect((feature.path as string).split("Z").filter(Boolean)).toHaveLength(1);
    expect(feature.labelAnchor).toBeDefined();
    expect(view.simplification.droppedParts).toEqual([
      { featureId: "geo.appellation-area.alpha", parts: 1 },
    ]);
    expect(view.coverage.shown).toEqual(["appellation.alpha"]);
  });

  it("still fails when every part of a feature collapses", () => {
    const input = baseInput({
      records: [
        record({
          id: "geo.appellation-area.alpha",
          owner: "appellation.alpha",
          geometry: square(0, 0, 1),
        }),
        record({
          id: "geo.river.dust",
          names: { nl: "Stof", en: "Dust" },
          geometry: {
            type: "MultiLineString",
            coordinates: [
              [
                [0.5, 0.25],
                [0.500002, 0.25],
              ],
              [
                [0.5, 0.75],
                [0.5, 0.750002],
              ],
            ],
          },
        }),
      ],
      scenes: [
        scene({
          layers: [
            { id: "water", kinds: ["river"], features: ["geo.river.dust"] },
            {
              id: "appellations",
              kinds: ["appellation-area"],
              features: ["geo.appellation-area.alpha"],
              role: "selectable",
            },
          ],
        }),
      ],
    });
    expect(() => buildAtlasDisplay(input)).toThrow(
      /collapses 'geo\.river\.dust' \(no line keeps an extent at display resolution\)/,
    );
  });

  it("stops simplifying before a small feature collapses and reports the blocked budget", () => {
    const input = baseInput({
      records: [
        record({
          id: "geo.appellation-area.alpha",
          owner: "appellation.alpha",
          geometry: jaggedRing(4000),
        }),
        record({
          id: "geo.appellation-area.small",
          owner: "appellation.small",
          geometry: square(10, 45, 0.01),
        }),
      ],
      scenes: [
        scene({
          layers: [
            {
              id: "appellations",
              kinds: ["appellation-area"],
              features: ["geo.appellation-area.alpha", "geo.appellation-area.small"],
              role: "selectable",
            },
          ],
          intended_entities: ["appellation.alpha", "appellation.small"],
        }),
      ],
      entities: [
        entity("region.fixture"),
        entity("appellation.alpha", { geography_id: "geo.appellation-area.alpha" }),
        entity("appellation.small", { geography_id: "geo.appellation-area.small" }),
      ],
      budgets: { sceneGzipBytes: 4 * 1024 },
    });
    expect(() => buildAtlasDisplay(input)).toThrow(
      /over the 4\.0 KiB budget; further simplification would collapse 'geo\.appellation-area\.small' \(no ring keeps an extent at display resolution\)/,
    );
  });

  it("keeps a shared border identical in both neighbours while simplifying it", () => {
    // Two squares meet along a jagged edge of 400 vertices; both records carry the same edge.
    const edge: number[][] = [];
    let seed = 11;
    for (let index = 0; index <= 400; index += 1) {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      edge.push([Number((1 + ((seed / 2147483648) * 2 - 1) * 0.002).toFixed(6)), index / 400]);
    }
    const left: GeographyGeometry = {
      type: "Polygon",
      coordinates: [[[0, 0], ...edge, [0, 1], [0, 0]]],
    };
    const right: GeographyGeometry = {
      type: "Polygon",
      coordinates: [[[2, 0], [2, 1], ...[...edge].reverse(), [2, 0]]],
    };
    const input = baseInput({
      records: [
        record({ id: "geo.appellation-area.left", owner: "appellation.left", geometry: left }),
        record({ id: "geo.appellation-area.right", owner: "appellation.right", geometry: right }),
      ],
      scenes: [
        scene({
          extent: { mode: "fit", padding: 0 },
          layers: [
            {
              id: "appellations",
              kinds: ["appellation-area"],
              features: ["geo.appellation-area.left", "geo.appellation-area.right"],
              role: "selectable",
            },
          ],
          intended_entities: ["appellation.left", "appellation.right"],
        }),
      ],
      entities: [
        entity("region.fixture"),
        entity("appellation.left", { geography_id: "geo.appellation-area.left" }),
        entity("appellation.right", { geography_id: "geo.appellation-area.right" }),
      ],
      budgets: { sceneGzipBytes: 2 * 1024 },
    });
    const view = buildAtlasDisplay(input).scenes[0];
    expect(view.simplification.pixels).toBeGreaterThan(0);
    expect(view.simplification.vertexCountAfter).toBeLessThan(
      view.simplification.vertexCountBefore,
    );
    const band = (path: string) =>
      new Set(
        pathNumbers(path)
          .filter(([x]) => x > 480 && x < 520)
          .map(([x, y]) => `${x},${y}`),
      );
    const [first, second] = view.layers[0].features.map((feature) => band(feature.path as string));
    expect(first.size).toBeGreaterThan(2);
    expect(first.size).toBeLessThan(401);
    expect(second).toEqual(first);
  });

  it("projects a MultiPolygon as one path per part and anchors the label in the largest", () => {
    const view = buildAtlasDisplay(
      baseInput({
        records: [
          record({
            id: "geo.appellation-area.alpha",
            owner: "appellation.alpha",
            geometry: {
              type: "MultiPolygon",
              coordinates: [
                (square(3, 0, 0.2) as { coordinates: number[][][] }).coordinates,
                (square(0, 0, 1) as { coordinates: number[][][] }).coordinates,
              ],
            },
          }),
        ],
        scenes: [scene({ extent: { mode: "fit", padding: 0 } })],
      }),
    ).scenes[0];
    const feature = view.layers[0].features[0];
    expect((feature.path as string).split("Z").filter(Boolean)).toHaveLength(2);
    const anchor = feature.labelAnchor as [number, number];
    expect(anchor[0]).toBeGreaterThan(0);
    expect(anchor[0]).toBeLessThan(1000 / 3.2);
  });

  it("does not depend on the order of records or scenes in its input", () => {
    const records = [
      record({
        id: "geo.appellation-area.alpha",
        owner: "appellation.alpha",
        geometry: square(0, 0, 1),
      }),
      record({
        id: "geo.appellation-area.beta",
        owner: "appellation.beta",
        geometry: square(0.2, 0.2, 0.3),
      }),
    ];
    const entities = [
      entity("region.fixture"),
      entity("region.other"),
      entity("appellation.alpha", { geography_id: "geo.appellation-area.alpha" }),
      entity("appellation.beta", { geography_id: "geo.appellation-area.beta" }),
    ];
    const scenes = [
      scene({
        layers: [
          {
            id: "appellations",
            kinds: ["appellation-area"],
            features: ["geo.appellation-area.beta", "geo.appellation-area.alpha"],
            role: "selectable",
          },
        ],
        intended_entities: ["appellation.beta", "appellation.alpha"],
      }),
      scene({ id: "scene.other", owner: "region.other" }),
    ];
    const forward = buildAtlasDisplay(baseInput({ records, scenes, entities }));
    const reversed = buildAtlasDisplay(
      baseInput({ records: [...records].reverse(), scenes: [...scenes].reverse(), entities }),
    );
    expect(reversed.files).toEqual(forward.files);
    expect(Object.keys(forward.files)).toEqual([
      "scenes/scene.fixture.json",
      "scenes/scene.other.json",
      "index.json",
    ]);
  });

  it("fails on a scene budget breach instead of dropping features", () => {
    const input = baseInput({ budgets: { sceneGzipBytes: 64 } });
    expect(() => buildAtlasDisplay(input)).toThrow(AtlasBuildError);
    expect(() => buildAtlasDisplay(input)).toThrow(
      /scene\.fixture\.yaml: display asset is .* over the 0\.1 KiB budget/,
    );
  });

  it("fails on an index budget breach", () => {
    expect(() => buildAtlasDisplay(baseInput({ budgets: { indexGzipBytes: 16 } }))).toThrow(
      /index\.json is .* over the 0\.0 KiB budget/,
    );
  });

  it("produces byte-identical output across runs and reports sizes", () => {
    const first = buildAtlasDisplay(baseInput());
    const second = buildAtlasDisplay(baseInput());
    expect(second.files).toEqual(first.files);
    expect(Object.keys(first.files).sort()).toEqual(["index.json", "scenes/scene.fixture.json"]);
    expect(first.sizes["scenes/scene.fixture.json"].gzipBytes).toBeGreaterThan(0);
    expect(first.index.scenes[0]).not.toHaveProperty("layers");
    expect(first.index.scenes[0].featureCount).toBe(1);
    expect(first.index.scenes[0].selectableEntities).toEqual(["appellation.alpha"]);
    expect(first.index.scenes[0].thumbnail).toEqual(second.index.scenes[0].thumbnail);
    expect(first.report.join("\n")).toMatch(/thumbnail \d+\/3072 B path text at 0 px/);
    expect(first.report.join("\n")).toMatch(
      /scene\.fixture: 1 features, .* KiB gzip at 0 px tolerance/,
    );
    expect(first.report.join("\n")).toMatch(/index: 1 scene, /);
  });

  it("excludes unpublished features from display and credits", () => {
    const output = buildAtlasDisplay(
      baseInput({
        records: [
          record({
            id: "geo.appellation-area.alpha",
            owner: "appellation.alpha",
            geometry: square(0, 0, 1),
          }),
          record({
            id: "geo.river.pending",
            names: { nl: "Nog niet", en: "Pending" },
            geometry: {
              type: "LineString",
              coordinates: [
                [0, 0.5],
                [1, 0.5],
              ],
            },
            status: "imported",
            sourceId: "source.other",
          }),
        ],
        scenes: [
          scene({
            layers: [
              { id: "water", kinds: ["river"], features: ["geo.river.pending"] },
              {
                id: "appellations",
                kinds: ["appellation-area"],
                features: ["geo.appellation-area.alpha"],
                role: "selectable",
              },
            ],
          }),
        ],
        sources: [source("source.fixture-dataset"), source("source.other")],
      }),
    );
    const view = output.scenes[0];
    expect(view.layers.map((layer) => layer.features.length)).toEqual([0, 1]);
    expect(view.credits.map((credit) => credit.sourceId)).toEqual(["source.fixture-dataset"]);
    expect(output.report.join("\n")).toContain("'geo.river.pending' is imported, not published");
  });

  it("rejects a scene whose records disagree on the licence of one source", () => {
    const input = baseInput({
      records: [
        record({
          id: "geo.appellation-area.alpha",
          owner: "appellation.alpha",
          geometry: square(0, 0, 1),
        }),
        {
          ...record({
            id: "geo.river.flow",
            names: { nl: "Stroom", en: "Flow" },
            geometry: {
              type: "LineString",
              coordinates: [
                [0, 0.5],
                [1, 0.5],
              ],
            },
          }),
        },
      ],
      scenes: [
        scene({
          layers: [
            { id: "water", kinds: ["river"], features: ["geo.river.flow"] },
            {
              id: "appellations",
              kinds: ["appellation-area"],
              features: ["geo.appellation-area.alpha"],
              role: "selectable",
            },
          ],
        }),
      ],
    });
    (input.records[1].record.licence as { id: string }).id = "other-licence";
    expect(() => buildAtlasDisplay(input)).toThrow(
      /declare different licences \(etalab-2\.0, other-licence\)/,
    );
  });
});

describe("Atlas output files", () => {
  it("writes scenes and the index atomically and removes stale outputs", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "oenocademy-atlas-output-"));
    temporaryRoots.push(directory);
    await mkdir(path.join(directory, "scenes"), { recursive: true });
    await writeFile(path.join(directory, "scenes", "scene.stale.json"), "{}");
    await writeFile(path.join(directory, "scenes", "scene.fixture.json.old.tmp"), "{}");
    await writeFile(path.join(directory, "old-index.json"), "{}");
    await writeFile(path.join(directory, "notes.txt"), "keep");

    const output = buildAtlasDisplay(baseInput());
    await writeAtlasDisplay(directory, output);

    expect((await readdir(directory)).sort()).toEqual(["index.json", "notes.txt", "scenes"]);
    expect(await readdir(path.join(directory, "scenes"))).toEqual(["scene.fixture.json"]);
    expect(await readFile(path.join(directory, "index.json"), "utf8")).toBe(
      output.files["index.json"],
    );
    expect(
      JSON.parse(await readFile(path.join(directory, "scenes", "scene.fixture.json"), "utf8")),
    ).toEqual(output.scenes[0]);

    await writeAtlasDisplay(directory, buildAtlasDisplay(baseInput({ scenes: [] })));
    expect(await readdir(path.join(directory, "scenes"))).toEqual([]);
    expect(await readFile(path.join(directory, "index.json"), "utf8")).toBe('{"scenes":[]}\n');
  });
});

describe("Atlas region-chooser thumbnails", () => {
  /** Absolute points of a compact thumbnail path: a move, then relative offsets per ring. */
  const decode = (path: string) =>
    path
      .split("z")
      .filter(Boolean)
      .map((ring) => {
        const numbers = (ring.match(/-?\d+/g) ?? []).map(Number);
        const points: Array<[number, number]> = [[numbers[0], numbers[1]]];
        for (let index = 2; index + 1 < numbers.length; index += 2) {
          const [x, y] = points[points.length - 1];
          points.push([x + numbers[index], y + numbers[index + 1]]);
        }
        return points;
      });

  const twoLayerInput = (selectable: GeographyGeometry, umbrella: GeographyGeometry) =>
    baseInput({
      records: [
        record({
          id: "geo.appellation-area.alpha",
          owner: "appellation.alpha",
          geometry: selectable,
        }),
        record({
          id: "geo.appellation-area.umbrella",
          owner: "appellation.umbrella",
          geometry: umbrella,
        }),
        record({
          id: "geo.populated-place.town",
          names: { nl: "Stad", en: "Town" },
          geometry: { type: "Point", coordinates: [0.5, 0.5] },
        }),
      ],
      scenes: [
        scene({
          layers: [
            {
              id: "context",
              kinds: ["appellation-area"],
              features: ["geo.appellation-area.umbrella"],
              role: "context",
            },
            {
              id: "appellations",
              kinds: ["appellation-area"],
              features: ["geo.appellation-area.alpha"],
              role: "selectable",
            },
            { id: "places", kinds: ["populated-place"], features: ["geo.populated-place.town"] },
          ],
        }),
      ],
      entities: [
        entity("region.fixture", { status: "active" }),
        entity("appellation.alpha", { geography_id: "geo.appellation-area.alpha" }),
        entity("appellation.umbrella", { geography_id: "geo.appellation-area.umbrella" }),
      ],
    });

  it("writes one strict thumbnail per scene: selectable areas only, 160 units wide", () => {
    const output = buildAtlasDisplay(twoLayerInput(square(0, 0, 1), square(-5, -5, 20)));
    const [summary] = output.index.scenes;
    const thumbnail = atlasThumbnailSchema.parse(summary.thumbnail);
    expect(thumbnail.viewBox).toEqual({
      width: 160,
      height: Math.round((output.scenes[0].viewBox.height * 160) / VIEWBOX_WIDTH),
    });
    // The overarching umbrella and the town never enter the thumbnail.
    expect(thumbnail.paths).toHaveLength(1);
    // The selectable square fills the fitted frame inside its padding.
    const selectable = decode(thumbnail.paths[0]).flat();
    expect(Math.min(...selectable.map(([x]) => x))).toBeGreaterThan(0);
    expect(Math.max(...selectable.map(([x]) => x))).toBeLessThan(160);
    expect(output.scenes[0]).not.toHaveProperty("thumbnail");
  });

  it("simplifies with the scene ladder until the path text fits its budget", () => {
    const output = buildAtlasDisplay(twoLayerInput(jaggedRing(4000), square(5, 40, 10)));
    const thumbnail = atlasThumbnailSchema.parse(output.index.scenes[0].thumbnail);
    const bytes = thumbnail.paths.reduce((sum, path) => sum + path.length, 0);
    expect(bytes).toBeLessThanOrEqual(ATLAS_THUMBNAIL_PATH_BUDGET_BYTES);
    expect(thumbnail.paths).toHaveLength(1);
    expect(output.report.join("\n")).toMatch(
      new RegExp(`thumbnail ${bytes}/3072 B path text at (0\\.25|0\\.5|[1-8]) px`),
    );
  });

  it("draws a shared shape once and gives both areas the same scene-wide rank", () => {
    const output = buildAtlasDisplay(
      baseInput({
        records: [
          record({
            id: "geo.appellation-area.alpha",
            owner: "appellation.alpha",
            geometry: square(0, 0, 1),
          }),
          record({
            id: "geo.appellation-area.twin",
            owner: "appellation.twin",
            geometry: square(0, 0, 1),
          }),
        ],
        scenes: [
          scene({
            layers: [
              {
                id: "appellations",
                kinds: ["appellation-area"],
                features: ["geo.appellation-area.alpha", "geo.appellation-area.twin"],
                role: "selectable",
              },
            ],
            intended_entities: ["appellation.alpha", "appellation.twin"],
          }),
        ],
        entities: [
          entity("region.fixture", { status: "active" }),
          entity("appellation.alpha", { geography_id: "geo.appellation-area.alpha" }),
          entity("appellation.twin", { geography_id: "geo.appellation-area.twin" }),
        ],
      }),
    );
    expect(output.scenes[0].layers[0].features).toHaveLength(2);
    expect(output.index.scenes[0].thumbnail?.paths).toHaveLength(1);
    expect(output.scenes[0].layers[0].features.map((feature) => feature.areaRank)).toEqual([1, 1]);
  });

  it("clips rings to a rectangle and drops what lies outside", () => {
    const bounds: [number, number, number, number] = [0, 0, 10, 10];
    expect(
      clipRing(
        [
          [2, 2],
          [8, 2],
          [8, 8],
          [2, 8],
        ],
        bounds,
      ),
    ).toEqual([
      [2, 2],
      [8, 2],
      [8, 8],
      [2, 8],
    ]);
    expect(
      clipRing(
        [
          [20, 20],
          [30, 20],
          [30, 30],
        ],
        bounds,
      ),
    ).toEqual([]);
    const clipped = clipRing(
      [
        [-10, 5],
        [5, 5],
        [5, 20],
        [-10, 20],
      ],
      bounds,
    );
    expect(clipped.every(([x, y]) => x >= 0 && x <= 10 && y >= 0 && y <= 10)).toBe(true);
    expect(clipped).toEqual(
      expect.arrayContaining([
        [0, 5],
        [5, 5],
        [5, 10],
        [0, 10],
      ]),
    );
  });

  it("encodes rings compactly with relative offsets and merges straight runs", () => {
    expect(
      encodeRings([
        [
          [10, 20],
          [13, 18],
          [13, 25],
        ],
      ]),
    ).toBe("M10 20l3-2 0 7z");
    expect(thumbnailPath("M0 0L5 0L10 0L10 10L0 10Z", { width: 160, height: 100 })).toBe(
      "M0 0l10 0 0 10-10 0z",
    );
    // A ring below one unit of area has no extent at thumbnail size.
    expect(thumbnailPath("M0 0L1 0L0 1Z", { width: 160, height: 100 })).toBeNull();
    expect(thumbnailPath("M500 500L600 500L600 600Z", { width: 160, height: 100 })).toBeNull();
  });

  it("clips an area that reaches beyond the frame to the viewBox plus a 2-unit margin", () => {
    const path = thumbnailPath("M-400 -400L600 -400L600 600L-400 600Z", {
      width: 160,
      height: 100,
    });
    expect(path).toBe("M-2 102l0-104 164 0 0 104z");
  });

  it("ranks areas scene-wide, largest first, with equal shapes sharing a rank", () => {
    const ranks = rankAreas([
      { id: "c", area: 50 },
      { id: "a", area: 400 },
      { id: "b", area: 50 * (1 + 1e-9) },
      { id: "d", area: 10 },
    ]);
    expect(Object.fromEntries(ranks)).toEqual({ a: 1, b: 2, c: 2, d: 3 });
  });

  it("ranks appellation areas only; a water polygon gets no rank", () => {
    const output = buildAtlasDisplay(
      baseInput({
        records: [
          record({
            id: "geo.appellation-area.alpha",
            owner: "appellation.alpha",
            geometry: square(0, 0, 1),
          }),
          record({
            id: "geo.water-body.lake",
            names: { nl: "Meer", en: "Lake" },
            geometry: square(-1, -1, 4),
          }),
        ],
        scenes: [
          scene({
            layers: [
              { id: "water", kinds: ["water-body"], features: ["geo.water-body.lake"] },
              {
                id: "appellations",
                kinds: ["appellation-area"],
                features: ["geo.appellation-area.alpha"],
                role: "selectable",
              },
            ],
          }),
        ],
      }),
    );
    const [water, areas] = output.scenes[0].layers;
    expect(water.features[0].areaRank).toBeUndefined();
    expect(areas.features[0].areaRank).toBe(1);
  });

  it("explains a thumbnail with nothing to draw instead of a byte count", () => {
    // A sliver: drawable at scene resolution, flatter than one unit at thumbnail resolution.
    const sliver: GeographyGeometry = {
      type: "Polygon",
      coordinates: [
        [
          [0, 0],
          [1, 0],
          [1, 0.0005],
          [0, 0.0005],
          [0, 0],
        ],
      ],
    };
    const input = baseInput({
      records: [
        record({ id: "geo.appellation-area.alpha", owner: "appellation.alpha", geometry: sliver }),
      ],
    });
    expect(() => buildAtlasDisplay(input)).toThrow(
      /no selectable area keeps an extent at thumbnail resolution/,
    );
  });

  it("rejects thumbnails that break the schema or the byte budget", () => {
    const valid = { viewBox: { width: 160, height: 90 }, paths: ["M10 20l3-2 0 7z"] };
    expect(atlasThumbnailSchema.safeParse(valid).success).toBe(true);
    expect(atlasThumbnailSchema.safeParse({ ...valid, outline: "M0 0z" }).success).toBe(false);
    expect(
      atlasThumbnailSchema.safeParse({ ...valid, viewBox: { width: 1000, height: 90 } }).success,
    ).toBe(false);
    expect(atlasThumbnailSchema.safeParse({ ...valid, paths: [] }).success).toBe(false);
    expect(atlasThumbnailSchema.safeParse({ ...valid, paths: ["M 0 0 C 1 1"] }).success).toBe(
      false,
    );
    const ring = `M0 0l${"1 1 ".repeat(800).trim()}z`;
    expect(ring.length).toBeGreaterThan(ATLAS_THUMBNAIL_PATH_BUDGET_BYTES);
    expect(atlasThumbnailSchema.safeParse({ ...valid, paths: [ring] }).success).toBe(false);
  });
});

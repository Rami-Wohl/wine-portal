import { describe, expect, it } from "vitest";
import { sampleScene } from "./fixtures/sample-scene";
import { labelVisibleAt, NO_SCRIPT_ZOOM, pathBounds, planLabels } from "./labels";
import type { AtlasFeatureView } from "@/content/model";

const selectable = sampleScene.layers.find((layer) => layer.role === "selectable")!.features;

describe("pathBounds", () => {
  it("reads the extent of absolute path data", () => {
    expect(pathBounds("M 10 20 L 30 40 L 5 60 Z")).toEqual({
      minX: 5,
      minY: 20,
      maxX: 30,
      maxY: 60,
    });
    expect(pathBounds("M1.5,2.5L-3,4e1Z")).toEqual({ minX: -3, minY: 2.5, maxX: 1.5, maxY: 40 });
    expect(pathBounds("")).toBeNull();
  });
});

describe("planLabels", () => {
  it("always labels the highlighted area and keeps larger areas first", () => {
    const plan = planLabels(selectable, {
      locale: "nl",
      highlightedEntityId: "appellation.barsac",
      viewWidth: sampleScene.viewBox.width,
      viewHeight: sampleScene.viewBox.height,
    });
    expect(plan[0]).toMatchObject({
      featureId: "geo.appellation-area.barsac",
      minZoom: 0,
      highlighted: true,
      kind: "area",
    });
    expect(plan.map((label) => label.featureId)).toContain("geo.appellation-area.graves");
  });

  it("defers a label that cannot fit at the base view to a deeper zoom step", () => {
    const tiny: AtlasFeatureView = {
      id: "geo.appellation-area.fixture-tiny",
      kind: "appellation-area",
      names: { nl: "Een heel lange naam voor een klein vlak", en: "A very long name" },
      geometryType: "area",
      path: "M 100 600 L 130 600 L 130 620 L 100 620 Z",
      labelAnchor: [115, 610],
    };
    const plan = planLabels([...selectable, tiny], {
      locale: "nl",
      viewWidth: sampleScene.viewBox.width,
      viewHeight: sampleScene.viewBox.height,
    });
    const deferred = plan.find((label) => label.featureId === tiny.id);
    expect(deferred?.minZoom ?? Infinity).toBeGreaterThan(1);
  });

  it("does not place two labels on top of each other at the same zoom", () => {
    const twin: AtlasFeatureView = {
      ...selectable[0],
      id: "geo.appellation-area.fixture-twin",
      names: { nl: "Tweeling", en: "Twin" },
    };
    const plan = planLabels([selectable[0], twin], {
      locale: "nl",
      viewWidth: sampleScene.viewBox.width,
      viewHeight: sampleScene.viewBox.height,
    });
    const first = plan.find((label) => label.featureId === selectable[0].id);
    const second = plan.find((label) => label.featureId === twin.id);
    expect(first?.minZoom ?? Infinity).toBeLessThanOrEqual(1);
    expect(second?.minZoom ?? Infinity).toBeGreaterThan(first?.minZoom ?? Infinity);
  });

  it("plans town labels beside their marker and keeps every label inside the view", () => {
    const places = sampleScene.layers.find((layer) => layer.role === "places")!.features;
    const edge: AtlasFeatureView = {
      id: "geo.appellation-area.fixture-edge",
      kind: "appellation-area",
      names: { nl: "Randgebied met een lange naam", en: "Edge area with a long name" },
      geometryType: "area",
      path: "M 900 300 L 1000 300 L 1000 400 L 900 400 Z",
      labelAnchor: [995, 350],
    };
    const plan = planLabels([...selectable, ...places, edge], {
      locale: "nl",
      viewWidth: sampleScene.viewBox.width,
      viewHeight: sampleScene.viewBox.height,
    });
    const town = plan.find((label) => label.featureId === places[0].id);
    expect(town).toMatchObject({ kind: "place", x: places[0].point![0], y: places[0].point![1] });
    expect(plan.find((label) => label.featureId === edge.id)).toBeUndefined();
  });

  const square = (id: string, name: string, x: number, y: number, size: number, rank?: number) =>
    ({
      id: `geo.appellation-area.${id}`,
      kind: "appellation-area",
      owner: `appellation.${id}`,
      names: { nl: name, en: name },
      geometryType: "area",
      path: `M ${x} ${y} L ${x + size} ${y} L ${x + size} ${y + size} L ${x} ${y + size} Z`,
      labelAnchor: [x + size / 2, y + size / 2],
      areaRank: rank,
    }) as AtlasFeatureView;
  const town = (id: string, name: string, x: number, y: number) =>
    ({
      id: `geo.populated-place.${id}`,
      kind: "populated-place",
      names: { nl: name, en: name },
      geometryType: "point",
      point: [x, y],
    }) as AtlasFeatureView;
  const plan = (features: AtlasFeatureView[]) =>
    planLabels(features, { locale: "nl", viewWidth: 1000, viewHeight: 1000 });

  it("labels the largest areas on a narrow screen even when the name is wider than the area", () => {
    const areas = [
      square("a", "Een naam", 100, 100, 120, 1),
      square("b", "Tweede", 600, 100, 110, 2),
      square("c", "Derde", 100, 600, 100, 3),
      square("d", "Vierde", 600, 600, 90, 4),
    ];
    const result = plan(areas);
    const narrow = result.filter((label) => labelVisibleAt(label, NO_SCRIPT_ZOOM.narrow));
    expect(narrow.map((label) => label.text).sort()).toEqual(
      ["Derde", "Een naam", "Tweede"].sort(),
    );
  });

  it("hands a town's name to its same-named area once the area label shows", () => {
    const result = plan([
      square("margaux", "Margaux", 400, 400, 60, 1),
      town("margaux", "Margaux", 430, 300),
    ]);
    const area = result.find((label) => label.kind === "area")!;
    const place = result.find((label) => label.kind === "place");
    for (const zoom of [0.3, 0.45, 1, 2, 8]) {
      const both = labelVisibleAt(area, zoom) && place !== undefined && labelVisibleAt(place, zoom);
      expect(both, String(zoom)).toBe(false);
    }
    expect(labelVisibleAt(area, 8)).toBe(true);
  });

  it("never places a label over another town's marker, and moves an area label off a marker", () => {
    const result = plan([
      square("big", "Groot", 300, 300, 400, 1),
      town("centre", "Midden", 500, 500),
      town("near", "Buur", 480, 495),
    ]);
    const area = result.find((label) => label.kind === "area")!;
    expect(area.shift).not.toBe(0);
    const near = result.find((label) => label.text === "Buur");
    // "Buur" sits just left of "Midden": its label would run over the Midden marker.
    expect(near === undefined || near.minZoom > 1).toBe(true);
  });

  it("shows a label inside its zoom range only", () => {
    expect(labelVisibleAt({ minZoom: 0.5, maxZoom: 2 }, 0.45)).toBe(false);
    expect(labelVisibleAt({ minZoom: 0.5, maxZoom: 2 }, 1)).toBe(true);
    expect(labelVisibleAt({ minZoom: 0.5, maxZoom: 2 }, 2)).toBe(false);
    expect(labelVisibleAt({ minZoom: 0 }, 0.1)).toBe(true);
  });
});

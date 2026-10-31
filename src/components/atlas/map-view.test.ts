import { describe, expect, it } from "vitest";
import { ASSUMED_RENDER_PX } from "./labels";
import {
  chooserPosition,
  clampView,
  effectiveZoom,
  exceedsDragThreshold,
  isModifiedClick,
  MAX_ZOOM,
  orderCandidates,
  parseViewBox,
  pinchView,
  shouldOpenChooser,
  translateView,
  unitsAt,
  viewMetrics,
  wheelZoomFactor,
  zoomFactor,
  zoomView,
} from "./map-view";

const base = { x: 0, y: 0, w: 1000, h: 700 };

describe("parseViewBox", () => {
  it("reads space or comma separated values and rejects malformed input", () => {
    expect(parseViewBox("0 0 1000 700")).toEqual(base);
    expect(parseViewBox(" 10,20 300,200 ")).toEqual({ x: 10, y: 20, w: 300, h: 200 });
    expect(parseViewBox("0 0 1000")).toBeNull();
    expect(parseViewBox("0 0 0 700")).toBeNull();
    expect(parseViewBox(null)).toBeNull();
  });
});

describe("zoomView", () => {
  it("keeps the point under the pointer fixed and clamps the factor", () => {
    const zoomed = zoomView(base, base, 2, [250, 175]);
    expect(zoomed.w).toBe(500);
    expect(zoomed.h).toBe(350);
    // (250,175) sat at 25% of the view before and must still sit at 25% of the new view.
    expect(zoomed.x + zoomed.w * 0.25).toBeCloseTo(250);
    expect(zoomed.y + zoomed.h * 0.25).toBeCloseTo(175);
    expect(zoomFactor(base, zoomView(base, base, 100))).toBe(MAX_ZOOM);
    expect(zoomView(base, base, 0.2)).toEqual(base);
  });

  it("zooms about the centre by default", () => {
    const zoomed = zoomView(base, base, 4);
    expect(zoomed).toEqual({ x: 375, y: 262.5, w: 250, h: 175 });
  });
});

describe("clampView and translateView", () => {
  it("never lets the view centre leave the base extent", () => {
    const small = { x: 0, y: 0, w: 250, h: 175 };
    expect(clampView({ ...small, x: -5000, y: -5000 }, base)).toEqual({
      ...small,
      x: -125,
      y: -87.5,
    });
    expect(translateView(small, base, 5000, 5000)).toEqual({ ...small, x: 875, y: 612.5 });
    expect(translateView(small, base, 10, -10)).toEqual({ ...small, x: 10, y: -10 });
  });
});

describe("viewMetrics and unitsAt", () => {
  it("letterboxes with a uniform scale and converts pixels back to units", () => {
    const metrics = viewMetrics(base, 500, 500);
    expect(metrics).toEqual({ scale: 0.5, offsetX: 0, offsetY: 75 });
    expect(unitsAt(base, metrics!, 250, 250)).toEqual([500, 350]);
    expect(viewMetrics(base, 0, 500)).toBeNull();
  });
});

describe("pinchView", () => {
  it("scales by the finger distance and keeps the midpoint on the same map point", () => {
    const box = { width: 1000, height: 700 };
    const start = { view: base, midUnits: [500, 350] as [number, number], distance: 100 };
    const pinched = pinchView(base, start, { x: 400, y: 350 }, { x: 600, y: 350 }, box);
    expect(zoomFactor(base, pinched)).toBe(2);
    const metrics = viewMetrics(pinched, box.width, box.height)!;
    expect(unitsAt(pinched, metrics, 500, 350)).toEqual([500, 350]);
    expect(pinchView(base, { ...start, distance: 0 }, { x: 0, y: 0 }, { x: 1, y: 1 }, box)).toBe(
      base,
    );
  });
});

describe("gesture helpers", () => {
  it("scales label thresholds by the rendered size", () => {
    expect(effectiveZoom(ASSUMED_RENDER_PX / 1000, 1000)).toBeCloseTo(1);
    expect(effectiveZoom(0.288, 1000)).toBeCloseTo(0.45);
  });

  it("zooms in on wheel up and normalises line and page deltas", () => {
    expect(wheelZoomFactor(-100, 0)).toBeGreaterThan(1);
    expect(wheelZoomFactor(100, 0)).toBeLessThan(1);
    expect(wheelZoomFactor(-3, 1)).toBeCloseTo(wheelZoomFactor(-48, 0));
    expect(wheelZoomFactor(1, 2)).toBeCloseTo(wheelZoomFactor(100, 0));
  });

  it("treats small pointer movement as a click", () => {
    expect(exceedsDragThreshold(2, 2)).toBe(false);
    expect(exceedsDragThreshold(4, 0)).toBe(true);
  });

  it("passes modified clicks to the browser", () => {
    const plain = { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false };
    expect(isModifiedClick(plain)).toBe(false);
    expect(isModifiedClick({ ...plain, metaKey: true })).toBe(true);
    expect(isModifiedClick({ ...plain, button: 1 })).toBe(true);
  });
});

describe("chooser rules", () => {
  const barsac = { id: "a", name: "Barsac", href: "/a", context: false };
  const sauternes = { id: "b", name: "Sauternes", href: "/b", context: false };
  const bordeaux = { id: "c", name: "Bordeaux", href: "/c", context: true };

  it("opens only when two or more selectable areas overlap", () => {
    expect(shouldOpenChooser([barsac, sauternes, bordeaux])).toBe(true);
    expect(shouldOpenChooser([barsac, bordeaux])).toBe(false);
    expect(shouldOpenChooser([bordeaux])).toBe(false);
    expect(shouldOpenChooser([])).toBe(false);
  });

  it("lists overarching areas last without dropping any candidate", () => {
    expect(orderCandidates([bordeaux, barsac, sauternes], "nl").map((item) => item.id)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("orders candidates alphabetically per language, whatever the draw order", () => {
    const entre = { id: "d", name: "Entre-deux-Mers", href: "/d", context: false };
    const cerons = { id: "e", name: "Cérons", href: "/e", context: false };
    expect(
      orderCandidates([sauternes, entre, bordeaux, cerons, barsac], "en").map((item) => item.name),
    ).toEqual(["Barsac", "Cérons", "Entre-deux-Mers", "Sauternes", "Bordeaux"]);
  });

  it("keeps the popover inside the frame and flips above near the bottom", () => {
    expect(chooserPosition({ x: 10, y: 10 }, { width: 800, height: 600 }, 2)).toEqual({
      left: 8,
      top: 22,
    });
    expect(chooserPosition({ x: 790, y: 590 }, { width: 800, height: 600 }, 2)).toEqual({
      left: 512,
      top: 386,
    });
    expect(chooserPosition({ x: 150, y: 100 }, { width: 300, height: 600 }, 1).left).toBe(10);
    expect(chooserPosition({ x: 60, y: 100 }, { width: 300, height: 600 }, 1).left).toBe(8);
  });
});

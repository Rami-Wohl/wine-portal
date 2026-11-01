import { describe, expect, it } from "vitest";
import { ASSUMED_RENDER_PX } from "./labels";
import {
  chooserPlacement,
  compareAreaRank,
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
  wheelZooms,
  zoomFactor,
  zoomModifierKey,
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

  it("zooms with the wheel only while Ctrl or ⌘ is held, as trackpad pinches arrive", () => {
    expect(wheelZooms({ ctrlKey: false, metaKey: false })).toBe(false);
    expect(wheelZooms({ ctrlKey: true, metaKey: false })).toBe(true);
    expect(wheelZooms({ ctrlKey: false, metaKey: true })).toBe(true);
  });

  it("names ⌘ on Apple platforms and Ctrl elsewhere", () => {
    expect(zoomModifierKey("MacIntel")).toBe("⌘");
    expect(zoomModifierKey("macOS")).toBe("⌘");
    expect(zoomModifierKey("iPhone")).toBe("⌘");
    expect(zoomModifierKey("Win32")).toBe("Ctrl");
    expect(zoomModifierKey("Linux x86_64")).toBe("Ctrl");
    expect(zoomModifierKey("")).toBe("Ctrl");
  });

  it("passes modified clicks to the browser", () => {
    const plain = { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false };
    expect(isModifiedClick(plain)).toBe(false);
    expect(isModifiedClick({ ...plain, metaKey: true })).toBe(true);
    expect(isModifiedClick({ ...plain, button: 1 })).toBe(true);
  });
});

describe("chooser rules", () => {
  // Ranks as the build assigns them per layer: largest area first, so higher is smaller.
  const barsac = { id: "a", name: "Barsac", href: "/a", context: false, areaRank: 6 };
  const sauternes = { id: "b", name: "Sauternes", href: "/b", context: false, areaRank: 4 };
  const bordeaux = { id: "c", name: "Bordeaux", href: "/c", context: true, areaRank: 1 };

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

  it("puts the most specific (smallest) area first, whatever the draw or name order", () => {
    // Pauillac over Haut-Médoc over Médoc: the area the reader aimed at leads.
    const medoc = { id: "m", name: "Médoc", href: "/m", context: false, areaRank: 1 };
    const hautMedoc = { id: "h", name: "Haut-Médoc", href: "/h", context: false, areaRank: 2 };
    const pauillac = { id: "p", name: "Pauillac", href: "/p", context: false, areaRank: 5 };
    const aop = { id: "b", name: "AOP Bordeaux", href: "/b", context: true, areaRank: 1 };
    expect(
      orderCandidates([medoc, aop, hautMedoc, pauillac], "nl").map((item) => item.name),
    ).toEqual(["Pauillac", "Haut-Médoc", "Médoc", "AOP Bordeaux"]);
  });

  it("falls back to the list's alphabetical order for equal or missing ranks", () => {
    const entre = { id: "d", name: "Entre-deux-Mers", href: "/d", context: false, areaRank: null };
    const cerons = { id: "e", name: "Cérons", href: "/e", context: false, areaRank: null };
    const superieur = {
      id: "f",
      name: "Bordeaux Supérieur",
      href: "/f",
      context: true,
      areaRank: 2,
    };
    expect(
      orderCandidates([entre, superieur, bordeaux, cerons], "en").map((item) => item.name),
    ).toEqual(["Cérons", "Entre-deux-Mers", "Bordeaux", "Bordeaux Supérieur"]);
    const twin = { ...barsac, id: "g", name: "Aardam (testdata)" };
    expect(orderCandidates([barsac, twin], "nl").map((item) => item.id)).toEqual(["g", "a"]);
  });

  it("compares ranks explicitly: smaller area first, unranked last, ties equal", () => {
    expect(compareAreaRank(5, 2)).toBeLessThan(0);
    expect(compareAreaRank(2, 5)).toBeGreaterThan(0);
    expect(compareAreaRank(3, 3)).toBe(0);
    expect(compareAreaRank(null, 3)).toBeGreaterThan(0);
    expect(compareAreaRank(3, null)).toBeLessThan(0);
    expect(compareAreaRank(null, null)).toBe(0);
  });

  it("puts Saint-Émilion before Saint-Émilion Grand Cru when they share a shape and rank", () => {
    const grandCru = {
      id: "g",
      name: "Saint-Émilion Grand Cru",
      href: "/g",
      context: false,
      areaRank: 2,
    };
    const saintEmilion = {
      id: "s",
      name: "Saint-Émilion",
      href: "/s",
      context: false,
      areaRank: 2,
    };
    const pomerol = { id: "p", name: "Pomerol", href: "/p", context: false, areaRank: 5 };
    expect(
      orderCandidates([grandCru, saintEmilion, pomerol], "nl").map((item) => item.name),
    ).toEqual(["Pomerol", "Saint-Émilion", "Saint-Émilion Grand Cru"]);
  });
});

describe("chooserPlacement", () => {
  const frame = { width: 800, height: 600 };
  const size = { width: 280, height: 200 };

  it("sits below the click, centred and clamped to the frame's sides", () => {
    expect(chooserPlacement({ x: 400, y: 100 }, size, frame)).toEqual({ left: 260, top: 112 });
    expect(chooserPlacement({ x: 10, y: 100 }, size, frame).left).toBe(8);
    expect(chooserPlacement({ x: 795, y: 100 }, size, frame).left).toBe(512);
  });

  it("flips above the click when it does not fit below", () => {
    expect(chooserPlacement({ x: 400, y: 500 }, size, frame)).toEqual({ left: 260, top: 288 });
  });

  it("stays inside when it fits neither below nor above the click", () => {
    const tall = { width: 280, height: 500 };
    const placed = chooserPlacement({ x: 400, y: 300 }, tall, frame);
    expect(placed.top).toBe(92);
    expect(placed.top + tall.height).toBeLessThanOrEqual(frame.height - 8);
    // Taller than the frame: pinned to the top margin; its max-height and scroll do the rest.
    expect(chooserPlacement({ x: 400, y: 300 }, { width: 280, height: 900 }, frame).top).toBe(8);
  });

  it("keeps a frame narrower than the chooser at the left margin", () => {
    expect(chooserPlacement({ x: 100, y: 10 }, size, { width: 200, height: 600 }).left).toBe(8);
  });
});

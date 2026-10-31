import type { AtlasFeatureView } from "@/content/model";

/**
 * Server-side label planning. Labels are plain text at the anchor the build
 * supplies; nothing here draws or implies a boundary. The plan decides which
 * labels fit at the base view and from which zoom level the others may appear,
 * so the client enhancement only toggles visibility.
 */

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface PlannedLabel {
  featureId: string;
  text: string;
  x: number;
  y: number;
  /**
   * Smallest effective zoom at which the label is shown. Effective zoom is the
   * view zoom times rendered-width / ASSUMED_RENDER_PX, so small screens show
   * fewer labels and zooming in reveals more. 0 marks the highlighted label,
   * always shown.
   */
  minZoom: number;
  /**
   * Effective zoom from which the label is hidden again; set only for a town
   * whose same-named appellation area takes over the name at that zoom.
   */
  maxZoom?: number;
  highlighted: boolean;
  kind: "area" | "place";
  /**
   * Vertical offset of an area label in label lines (LABEL_SHIFT_PX each, in screen
   * pixels): 0 at the anchor, -1 one line above, 1 one line below. Used when the
   * anchor sits on a town marker or another label.
   */
  shift: LabelShift;
}

export type LabelShift = -1 | 0 | 1;
/** Shift positions tried for an area label, in order of preference. */
const SHIFTS: LabelShift[] = [0, -1, 1];

/** Area label height in CSS pixels at the base view; keep in sync with atlas.css. */
export const LABEL_FONT_PX = 12;
/** Town label height in CSS pixels; keep in sync with atlas.css (.atlas-place text). */
export const PLACE_FONT_PX = 10.5;
/** One shift step in CSS pixels: one area label line; keep in sync with atlas.css. */
export const LABEL_SHIFT_PX = 15;
/** Rendered map width in CSS pixels assumed when the server plans labels. */
export const ASSUMED_RENDER_PX = 640;
/**
 * Effective zoom steps at which the plan is evaluated. The low steps exist for
 * narrow screens: a 320 px viewport renders the map near 286 px, effective 0.45.
 */
export const LABEL_ZOOM_STEPS = [
  0.3, 0.35, 0.4, 0.45, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8,
] as const;
/**
 * Effective zooms the server assumes for pages without JavaScript, per shared
 * breakpoint (see responsive.css): ≤620 px renders about 286 px of map at 320 px
 * wide, ≤760 px about 590 px. Wider pages use the plan at 1.
 */
export const NO_SCRIPT_ZOOM = { narrow: 0.44, medium: 0.9, wide: 1 } as const;
/** Largest selectable areas labelled whenever their label fits in the view, even if wider than the area. */
export const PRIORITY_AREA_COUNT = 3;

const AVERAGE_GLYPH_WIDTH = 0.58;
const LINE_HEIGHT = 1.25;
/** Horizontal gap between a town marker and its label, in CSS px; keep in sync with atlas.css. */
const PLACE_LABEL_OFFSET_PX = 6.5;
const NUMBER_PATTERN = /-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi;

/** Whether a planned label is visible at an effective zoom; shared by server and client. */
export function labelVisibleAt(
  label: { minZoom: number; maxZoom?: number },
  effective: number,
): boolean {
  const zoom = effective + 1e-6;
  return zoom >= label.minZoom && (label.maxZoom === undefined || zoom < label.maxZoom);
}

/**
 * Bounding box of absolute SVG path data as the build emits it (M/L/Z with
 * absolute coordinate pairs). Relative commands are not expected; if present the
 * result is only approximate, which affects label fit, never geometry.
 */
export function pathBounds(d: string): Bounds | null {
  const numbers = d.match(NUMBER_PATTERN);
  if (!numbers || numbers.length < 2) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let index = 0; index + 1 < numbers.length; index += 2) {
    const x = Number(numbers[index]);
    const y = Number(numbers[index + 1]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return minX === Infinity ? null : { minX, minY, maxX, maxY };
}

type Role = "selectable" | "context" | "water" | "places";

interface Candidate {
  feature: AtlasFeatureView;
  kind: "area" | "place";
  role: Role;
  text: string;
  anchor: [number, number];
  bounds: Bounds | null;
  highlighted: boolean;
  /** Labelled whenever it fits in the view, even if wider than its own area. */
  priority: boolean;
  /** For a town: the same-named selectable area; for that area: the town. */
  twin?: string;
  order: number;
  /** Fixed once the label is first placed, so it never jumps while zooming. */
  shift?: LabelShift;
}

/** Town marker radius plus its halo, in CSS px; keep in sync with atlas.css. */
const DOT_RADIUS_PX = 5;

function labelBox(
  candidate: Candidate,
  unitsPerPx: number,
  zoom: number,
  shift: LabelShift = 0,
): Bounds {
  const scale = unitsPerPx / zoom;
  const font = candidate.kind === "place" ? PLACE_FONT_PX : LABEL_FONT_PX;
  const width = candidate.text.length * font * AVERAGE_GLYPH_WIDTH * scale;
  const height = font * LINE_HEIGHT * scale;
  const x = candidate.anchor[0];
  const y = candidate.anchor[1] + shift * LABEL_SHIFT_PX * scale;
  if (candidate.kind === "place") {
    const start = x + PLACE_LABEL_OFFSET_PX * scale;
    return { minX: start, minY: y - height / 2, maxX: start + width, maxY: y + height / 2 };
  }
  return { minX: x - width / 2, minY: y - height / 2, maxX: x + width / 2, maxY: y + height / 2 };
}

function dotBox(point: [number, number], unitsPerPx: number, zoom: number): Bounds {
  const r = (DOT_RADIUS_PX * unitsPerPx) / zoom;
  return { minX: point[0] - r, minY: point[1] - r, maxX: point[0] + r, maxY: point[1] + r };
}

function withinView(label: Bounds, view: Bounds): boolean {
  return (
    label.minX >= view.minX &&
    label.maxX <= view.maxX &&
    label.minY >= view.minY &&
    label.maxY <= view.maxY
  );
}

function fitsInside(label: Bounds, area: Bounds | null): boolean {
  if (!area) return true;
  const labelWidth = label.maxX - label.minX;
  const labelHeight = label.maxY - label.minY;
  return (
    labelWidth <= (area.maxX - area.minX) * 0.85 && labelHeight <= (area.maxY - area.minY) * 0.7
  );
}

function intersects(a: Bounds, b: Bounds, padding: number): boolean {
  return !(
    a.maxX + padding < b.minX ||
    b.maxX + padding < a.minX ||
    a.maxY + padding < b.minY ||
    b.maxY + padding < a.minY
  );
}

function boundsArea(bounds: Bounds | null) {
  return bounds ? (bounds.maxX - bounds.minX) * (bounds.maxY - bounds.minY) : 0;
}

function normalizeName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Plans area and town labels with one rule at every zoom step: a label is shown
 * when it fits in the view without touching another label or a town marker.
 * Processing order is the priority: the highlighted area (always shown), the
 * largest selectable areas, towns, then other selectable areas (which must also
 * fit inside their own extent), overarching areas and water. Labels placed at
 * one step keep their place at deeper steps, so zooming in only adds labels,
 * except that a town hands its name to a same-named appellation area once that
 * area's label is shown (the town keeps its marker).
 */
export function planLabels(
  features: AtlasFeatureView[],
  options: {
    locale: "nl" | "en";
    highlightedEntityId?: string;
    viewWidth: number;
    viewHeight: number;
    /** Layer role per feature id; area features without one count as selectable. */
    roles?: Map<string, Role>;
  },
): PlannedLabel[] {
  const unitsPerPx = options.viewWidth / ASSUMED_RENDER_PX;
  const view: Bounds = { minX: 0, minY: 0, maxX: options.viewWidth, maxY: options.viewHeight };
  const base: Candidate[] = features
    .filter(
      (feature) =>
        (feature.geometryType === "area" && feature.labelAnchor) ||
        (feature.geometryType === "point" && feature.point),
    )
    .map((feature, order) => {
      const kind = feature.geometryType === "point" ? ("place" as const) : ("area" as const);
      return {
        feature,
        kind,
        role: options.roles?.get(feature.id) ?? (kind === "place" ? "places" : "selectable"),
        text: feature.names[options.locale],
        anchor: (kind === "place" ? feature.point : feature.labelAnchor) as [number, number],
        bounds: kind === "area" && feature.path ? pathBounds(feature.path) : null,
        highlighted: Boolean(
          options.highlightedEntityId && feature.owner === options.highlightedEntityId,
        ),
        priority: false,
        order,
      };
    });

  // The largest selectable areas: build rank first, extent as a fallback.
  const selectable = base.filter((candidate) => candidate.role === "selectable");
  const bySize = [...selectable].sort((a, b) => {
    const rankA = a.feature.areaRank ?? Infinity;
    const rankB = b.feature.areaRank ?? Infinity;
    if (rankA !== rankB) return rankA - rankB;
    return boundsArea(b.bounds) - boundsArea(a.bounds);
  });
  for (const candidate of bySize.slice(0, PRIORITY_AREA_COUNT)) candidate.priority = true;

  // A town and a same-named selectable area share one name on the map.
  const areaByName = new Map(selectable.map((area) => [normalizeName(area.text), area]));
  for (const town of base.filter((candidate) => candidate.kind === "place")) {
    const area = areaByName.get(normalizeName(town.text));
    if (area) {
      town.twin = area.feature.id;
      area.twin = town.feature.id;
    }
  }

  const tier = (candidate: Candidate) => {
    if (candidate.highlighted) return 0;
    if (candidate.priority) return 1;
    if (candidate.kind === "place") return 2;
    if (candidate.role === "selectable") return 3;
    if (candidate.role === "context") return 4;
    return 5;
  };
  const candidates = [...base].sort((a, b) => tier(a) - tier(b) || a.order - b.order);
  const dots = candidates
    .filter((candidate) => candidate.kind === "place")
    .map((candidate) => ({ id: candidate.feature.id, point: candidate.anchor }));

  const shown = new Map<string, boolean[]>();
  let sticky: Candidate[] = [];
  LABEL_ZOOM_STEPS.forEach((zoom, stepIndex) => {
    const padding = 2 * (unitsPerPx / zoom);
    const dotBoxes = dots.map((dot) => ({ id: dot.id, box: dotBox(dot.point, unitsPerPx, zoom) }));
    const placed: Array<{ candidate: Candidate; box: Bounds }> = [];
    const stickyIds = new Set(sticky.map((candidate) => candidate.feature.id));
    const order = [...sticky, ...candidates.filter((c) => !stickyIds.has(c.feature.id))];
    for (const candidate of order) {
      const id = candidate.feature.id;
      if (
        candidate.kind === "place" &&
        candidate.twin &&
        placed.some((entry) => entry.candidate.feature.id === candidate.twin)
      ) {
        continue;
      }
      // Placed at the previous step: keeps its place (and shift), so zooming in never
      // drops a label. Shifted boxes are not strictly monotone, so they are not re-tested.
      if (stickyIds.has(id)) {
        placed.push({ candidate, box: labelBox(candidate, unitsPerPx, zoom, candidate.shift) });
        continue;
      }
      const shifts: LabelShift[] =
        candidate.shift !== undefined
          ? [candidate.shift]
          : candidate.kind === "area" && !candidate.highlighted
            ? SHIFTS
            : [0];
      let chosen: { box: Bounds; shift: LabelShift; replacesTwin: boolean } | null = null;
      for (const shift of shifts) {
        const box = labelBox(candidate, unitsPerPx, zoom, shift);
        if (candidate.highlighted) {
          chosen = { box, shift, replacesTwin: false };
          break;
        }
        if (!withinView(box, view)) continue;
        if (
          candidate.kind === "area" &&
          !candidate.priority &&
          !fitsInside(box, candidate.bounds)
        ) {
          continue;
        }
        if (dotBoxes.some((dot) => dot.id !== id && intersects(box, dot.box, 0))) continue;
        const colliders = placed.filter((entry) => intersects(box, entry.box, padding));
        if (colliders.length === 0) {
          chosen = { box, shift, replacesTwin: false };
          break;
        }
        // An area label may take over its own name from the same-named town.
        if (
          candidate.kind === "area" &&
          colliders.every((entry) => entry.candidate.feature.id === candidate.twin)
        ) {
          chosen = { box, shift, replacesTwin: true };
          break;
        }
      }
      if (!chosen) continue;
      if (chosen.replacesTwin) {
        placed.splice(
          placed.findIndex((entry) => entry.candidate.feature.id === candidate.twin),
          1,
        );
      }
      candidate.shift = chosen.shift;
      const box = chosen.box;
      placed.push({ candidate, box });
    }
    // A town never repeats the name its same-named area already shows.
    const placedIds = new Set(placed.map((entry) => entry.candidate.feature.id));
    for (let index = placed.length - 1; index >= 0; index -= 1) {
      const { candidate } = placed[index];
      if (candidate.kind === "place" && candidate.twin && placedIds.has(candidate.twin)) {
        placed.splice(index, 1);
      }
    }
    for (const entry of placed) {
      const id = entry.candidate.feature.id;
      const steps = shown.get(id) ?? new Array<boolean>(LABEL_ZOOM_STEPS.length).fill(false);
      steps[stepIndex] = true;
      shown.set(id, steps);
    }
    sticky = placed.map((entry) => entry.candidate);
  });

  return candidates.flatMap((candidate) => {
    const steps = shown.get(candidate.feature.id);
    if (!steps) return [];
    const first = steps.indexOf(true);
    const end = steps.indexOf(false, first);
    return [
      {
        featureId: candidate.feature.id,
        text: candidate.text,
        x: candidate.anchor[0],
        y: candidate.anchor[1],
        minZoom: candidate.highlighted ? 0 : LABEL_ZOOM_STEPS[first],
        ...(end === -1 || candidate.highlighted ? {} : { maxZoom: LABEL_ZOOM_STEPS[end] }),
        highlighted: candidate.highlighted,
        kind: candidate.kind,
        shift: candidate.shift ?? 0,
      },
    ];
  });
}

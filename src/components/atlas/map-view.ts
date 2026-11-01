import { compareAreaNames } from "./area-names";
import { ASSUMED_RENDER_PX } from "./labels";

/**
 * Pure viewBox arithmetic for the map enhancement. No DOM, no geometry library:
 * everything works on the SVG viewBox and CSS-pixel measurements.
 */

export interface View {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** How a view maps onto its rendered box: px per unit plus the letterbox offsets. */
export interface ViewMetrics {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Candidate {
  id: string;
  name: string;
  href: string | null;
  /** Overarching (context) areas are listed last, on one line. */
  context: boolean;
  /**
   * The build's scene-wide area rank (scripts/geography/lib/display.ts `rankAreas`): every area
   * of every layer is numbered from 1, largest first, so a higher rank is a smaller area; areas
   * with the same projected size share a rank. Null when the markup carries no rank.
   */
  areaRank: number | null;
}

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 8;
export const ZOOM_STEP = 1.5;
export const DRAG_THRESHOLD_PX = 4;
export const WHEEL_ZOOM_RATE = 0.0018;
/** How long a gesture hint stays over the map. */
export const HINT_DURATION_MS = 1600;

export function parseViewBox(value: string | null | undefined): View | null {
  const parts = (value ?? "")
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) return null;
  if (parts[2] <= 0 || parts[3] <= 0) return null;
  return { x: parts[0], y: parts[1], w: parts[2], h: parts[3] };
}

export function formatViewBox(view: View): string {
  return `${view.x} ${view.y} ${view.w} ${view.h}`;
}

export function zoomFactor(base: View, view: View): number {
  return base.w / view.w;
}

export function clampZoom(zoom: number): number {
  return Math.min(Math.max(zoom, MIN_ZOOM), MAX_ZOOM);
}

/** Keep the view centre inside the base extent so the map can never be panned away. */
export function clampView(view: View, base: View): View {
  const halfW = view.w / 2;
  const halfH = view.h / 2;
  return {
    w: view.w,
    h: view.h,
    x: Math.min(Math.max(view.x, base.x - halfW), base.x + base.w - halfW),
    y: Math.min(Math.max(view.y, base.y - halfH), base.y + base.h - halfH),
  };
}

export function viewCentre(view: View): [number, number] {
  return [view.x + view.w / 2, view.y + view.h / 2];
}

/** Zoom to a factor, keeping `about` (in view units) fixed on screen; defaults to the centre. */
export function zoomView(
  base: View,
  view: View,
  targetZoom: number,
  about?: [number, number] | null,
): View {
  const nextZoom = clampZoom(targetZoom);
  const w = base.w / nextZoom;
  const h = base.h / nextZoom;
  const [ax, ay] = about ?? viewCentre(view);
  const ratio = w / view.w;
  return clampView({ x: ax - (ax - view.x) * ratio, y: ay - (ay - view.y) * ratio, w, h }, base);
}

export function translateView(view: View, base: View, dxUnits: number, dyUnits: number): View {
  return clampView({ ...view, x: view.x + dxUnits, y: view.y + dyUnits }, base);
}

/** `preserveAspectRatio="xMidYMid meet"`: uniform scale, centred letterbox. */
export function viewMetrics(view: View, width: number, height: number): ViewMetrics | null {
  if (!(width > 0) || !(height > 0)) return null;
  const scale = Math.min(width / view.w, height / view.h);
  return { scale, offsetX: (width - view.w * scale) / 2, offsetY: (height - view.h * scale) / 2 };
}

/** A point measured in px from the rendered box's top-left corner, in view units. */
export function unitsAt(
  view: View,
  metrics: ViewMetrics,
  localX: number,
  localY: number,
): [number, number] {
  return [
    view.x + (localX - metrics.offsetX) / metrics.scale,
    view.y + (localY - metrics.offsetY) / metrics.scale,
  ];
}

export interface PinchStart {
  view: View;
  /** The point under the pinch midpoint when it started, in view units. */
  midUnits: [number, number];
  distance: number;
}

/** The view for a two-finger gesture: scale by the distance ratio and keep the midpoint fixed. */
export function pinchView(
  base: View,
  start: PinchStart,
  a: Point,
  b: Point,
  box: { width: number; height: number },
): View {
  const distance = Math.hypot(a.x - b.x, a.y - b.y);
  if (!(start.distance > 0) || !(distance > 0)) return start.view;
  const nextZoom = clampZoom(zoomFactor(base, start.view) * (distance / start.distance));
  const w = base.w / nextZoom;
  const h = base.h / nextZoom;
  const metrics = viewMetrics({ x: 0, y: 0, w, h }, box.width, box.height);
  if (!metrics) return start.view;
  const midX = (a.x + b.x) / 2;
  const midY = (a.y + b.y) / 2;
  return clampView(
    {
      w,
      h,
      x: start.midUnits[0] - (midX - metrics.offsetX) / metrics.scale,
      y: start.midUnits[1] - (midY - metrics.offsetY) / metrics.scale,
    },
    base,
  );
}

/** Labels are planned for ASSUMED_RENDER_PX; this scales the zoom by the real rendered size. */
export function effectiveZoom(scale: number, baseWidth: number): number {
  return (scale * baseWidth) / ASSUMED_RENDER_PX;
}

export function wheelZoomFactor(deltaY: number, deltaMode: number): number {
  const delta = deltaMode === 1 ? deltaY * 16 : deltaMode === 2 ? deltaY * 100 : deltaY;
  return Math.exp(-delta * WHEEL_ZOOM_RATE);
}

export function exceedsDragThreshold(dx: number, dy: number): boolean {
  return Math.hypot(dx, dy) >= DRAG_THRESHOLD_PX;
}

/** Higher rank (smaller area) first; an unranked candidate after every ranked one. */
export function compareAreaRank(left: number | null, right: number | null): number {
  if (left === right) return 0;
  if (left === null) return 1;
  if (right === null) return -1;
  return right - left;
}

/**
 * The chooser's order: the most specific area first. Selectable candidates sort by area,
 * smallest first, so the area the reader most likely aimed at leads; equal or missing ranks
 * fall back to the list's alphabetical order ("Saint-Émilion" before "Saint-Émilion Grand
 * Cru"). Overarching areas follow, alphabetically, so they never hide a candidate.
 */
export function orderCandidates<
  T extends { context: boolean; name: string; areaRank: number | null },
>(items: T[], locale: "nl" | "en"): T[] {
  const compareNames = compareAreaNames(locale);
  const specific = items
    .filter((item) => !item.context)
    .sort(
      (left, right) =>
        compareAreaRank(left.areaRank, right.areaRank) || compareNames(left.name, right.name),
    );
  const overarching = items
    .filter((item) => item.context)
    .sort((left, right) => compareNames(left.name, right.name));
  return [...specific, ...overarching];
}

/**
 * Whether a wheel turn should zoom the map: only with Ctrl or ⌘ (which is also how trackpad
 * pinches arrive), so an ordinary wheel or two-finger swipe keeps scrolling the page.
 */
export function wheelZooms(event: { ctrlKey: boolean; metaKey: boolean }): boolean {
  return event.ctrlKey || event.metaKey;
}

/** The modifier readers press with the wheel: ⌘ on Apple platforms, Ctrl elsewhere. */
export function zoomModifierKey(platform: string): string {
  return /mac|iphone|ipad|ipod/i.test(platform) ? "⌘" : "Ctrl";
}

/** The chooser opens only for a real overlap: two or more selectable areas under the pointer. */
export function shouldOpenChooser(items: Array<{ context: boolean }>): boolean {
  return items.filter((item) => !item.context).length >= 2;
}

/** Let the browser handle modified clicks (new tab, context menu, middle button). */
export function isModifiedClick(event: {
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}): boolean {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

/** Gap between the chooser and the frame edge, and between the click and the chooser. */
export const CHOOSER_MARGIN_PX = 8;
export const CHOOSER_OFFSET_PX = 12;

/**
 * Place the measured chooser near the click and wholly inside the frame: centred on the click
 * horizontally and clamped to the frame; below the click when it fits, above it when it fits
 * there, otherwise as low as the frame allows (the chooser's own max-height and scroll keep a
 * taller list inside).
 */
export function chooserPlacement(
  click: Point,
  size: { width: number; height: number },
  frame: { width: number; height: number },
): { left: number; top: number } {
  const margin = CHOOSER_MARGIN_PX;
  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), Math.max(min, max));
  const left = clamp(click.x - size.width / 2, margin, frame.width - size.width - margin);
  const below = click.y + CHOOSER_OFFSET_PX;
  const above = click.y - CHOOSER_OFFSET_PX - size.height;
  const top =
    below + size.height <= frame.height - margin
      ? below
      : above >= margin
        ? above
        : clamp(frame.height - size.height - margin, margin, frame.height - size.height - margin);
  return { left, top };
}

import { compareAreaNames } from "./copy";
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
  /** Overarching (context) areas are listed last and marked. */
  context: boolean;
}

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 8;
export const ZOOM_STEP = 1.5;
export const DRAG_THRESHOLD_PX = 4;
export const CHOOSER_WIDTH_PX = 280;
export const WHEEL_ZOOM_RATE = 0.0018;

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

/** Alphabetical within each group; overarching areas come last so they never hide a candidate. */
export function orderCandidates<T extends { context: boolean; name: string }>(
  items: T[],
  locale: "nl" | "en",
): T[] {
  // Alphabetical per language, like the list, so both keyboard-facing orders agree.
  const compare = compareAreaNames(locale);
  const sorted = [...items].sort((left, right) => compare(left.name, right.name));
  return [...sorted.filter((item) => !item.context), ...sorted.filter((item) => item.context)];
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

/** Place the chooser near the click, inside the frame, flipping above when it would overflow. */
export function chooserPosition(
  local: Point,
  frame: { width: number; height: number },
  itemCount: number,
): { left: number; top: number } {
  const width = Math.min(CHOOSER_WIDTH_PX, frame.width - 16);
  const left = Math.min(Math.max(local.x - width / 2, 8), Math.max(8, frame.width - width - 8));
  const estimatedHeight = 96 + itemCount * 48;
  const below = local.y + 12;
  const top =
    below + estimatedHeight > frame.height ? Math.max(8, below - estimatedHeight - 24) : below;
  return { left, top };
}

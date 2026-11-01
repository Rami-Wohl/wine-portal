import { planarSignedArea } from "./geometry";

// Pure helpers for the region-chooser thumbnails (docs/atlas-plan.md §7). They work on the
// absolute "M x yL x y…Z" path text that projectShape writes on a whole-unit grid, so the
// thumbnail reuses the scene's projection, simplification and part-dropping unchanged.

export type ThumbnailPoint = [number, number];

/** Parse projectShape's closed-ring path text back into rings of points. */
export function parseRings(path: string): ThumbnailPoint[][] {
  return path
    .split("Z")
    .filter((ring) => ring.length > 0)
    .map((ring) =>
      ring
        .replace(/^M/, "")
        .split("L")
        .map((pair) => {
          const [x, y] = pair.split(" ").map(Number);
          return [x, y] as ThumbnailPoint;
        }),
    );
}

interface Edge {
  inside: (point: ThumbnailPoint) => boolean;
  cross: (from: ThumbnailPoint, to: ThumbnailPoint) => ThumbnailPoint;
}

function edges(minX: number, minY: number, maxX: number, maxY: number): Edge[] {
  const atX = (x: number) => (from: ThumbnailPoint, to: ThumbnailPoint) =>
    [x, from[1] + ((to[1] - from[1]) * (x - from[0])) / (to[0] - from[0])] as ThumbnailPoint;
  const atY = (y: number) => (from: ThumbnailPoint, to: ThumbnailPoint) =>
    [from[0] + ((to[0] - from[0]) * (y - from[1])) / (to[1] - from[1]), y] as ThumbnailPoint;
  return [
    { inside: ([x]) => x >= minX, cross: atX(minX) },
    { inside: ([x]) => x <= maxX, cross: atX(maxX) },
    { inside: ([, y]) => y >= minY, cross: atY(minY) },
    { inside: ([, y]) => y <= maxY, cross: atY(maxY) },
  ];
}

/**
 * Sutherland–Hodgman clipping of one ring to a rectangle. It does what the SVG viewport does
 * visually, but drops the vertices nobody can see. A concave ring may leave edges running
 * along the rectangle; the caller keeps the rectangle just outside the viewBox so they are
 * never visible. Returns an empty ring when nothing lies inside.
 */
export function clipRing(
  ring: ThumbnailPoint[],
  [minX, minY, maxX, maxY]: [number, number, number, number],
): ThumbnailPoint[] {
  let output = ring;
  for (const edge of edges(minX, minY, maxX, maxY)) {
    const input = output;
    output = [];
    for (let index = 0; index < input.length; index += 1) {
      const current = input[index];
      const previous = input[(index + input.length - 1) % input.length];
      if (edge.inside(current)) {
        if (!edge.inside(previous)) output.push(edge.cross(previous, current));
        output.push(current);
      } else if (edge.inside(previous)) {
        output.push(edge.cross(previous, current));
      }
    }
    if (output.length === 0) return [];
  }
  return output;
}

/** True when `middle` lies on the straight run from `before` to `after`, pointing forward. */
function onStraightRun(
  before: ThumbnailPoint,
  middle: ThumbnailPoint,
  after: ThumbnailPoint,
): boolean {
  const ax = middle[0] - before[0];
  const ay = middle[1] - before[1];
  const bx = after[0] - middle[0];
  const by = after[1] - middle[1];
  return ax * by - ay * bx === 0 && ax * bx + ay * by > 0;
}

/**
 * Round to the whole-unit grid, drop repeated points (including a closing repeat) and merge
 * steps that continue in the same direction: rounding turns gentle curves into runs of
 * collinear unit steps that draw the same with one vertex.
 */
function snap(ring: ThumbnailPoint[]): ThumbnailPoint[] {
  const points: ThumbnailPoint[] = [];
  for (const [x, y] of ring) {
    const point: ThumbnailPoint = [Math.round(x) || 0, Math.round(y) || 0];
    const last = points[points.length - 1];
    if (last && last[0] === point[0] && last[1] === point[1]) continue;
    if (points.length >= 2 && onStraightRun(points[points.length - 2], last, point)) points.pop();
    points.push(point);
  }
  const first = points[0];
  const last = points[points.length - 1];
  if (points.length > 1 && first[0] === last[0] && first[1] === last[1]) points.pop();
  return points;
}

/** Join numbers the shortest valid SVG way: a minus sign separates as well as a space. */
function joinNumbers(values: number[]): string {
  return values.reduce(
    (text, value, index) => `${text}${index > 0 && value >= 0 ? " " : ""}${value}`,
    "",
  );
}

/**
 * Compact path text for one set of rings: an absolute move per ring, then relative line
 * offsets with the command letter written once, closed with "z". On a whole-unit grid this is
 * about half the size of the absolute form, which is what lets 30-odd areas fit the budget.
 */
export function encodeRings(rings: ThumbnailPoint[][]): string {
  return rings
    .map((ring) => {
      const [start, ...rest] = ring;
      const deltas = rest.flatMap((point, index) => {
        const previous = ring[index];
        return [point[0] - previous[0], point[1] - previous[1]];
      });
      return `M${joinNumbers(start)}${deltas.length > 0 ? `l${joinNumbers(deltas)}` : ""}z`;
    })
    .join("");
}

/**
 * A ring smaller than one thumbnail unit, about one CSS pixel, has no visible extent: it is a
 * part below display resolution, dropped as the scene build drops its own.
 */
const MIN_RING_AREA = 1;

/**
 * Thumbnail path text for one area: clip every ring to the viewBox plus a margin, snap to the
 * grid and drop rings that keep no extent. Null when no ring is left to draw.
 */
export function thumbnailPath(
  absolutePath: string,
  viewBox: { width: number; height: number },
  margin = 2,
): string | null {
  const bounds: [number, number, number, number] = [
    -margin,
    -margin,
    viewBox.width + margin,
    viewBox.height + margin,
  ];
  const rings = parseRings(absolutePath)
    .map((ring) => snap(clipRing(ring, bounds)))
    .filter((ring) => ring.length >= 3 && Math.abs(planarSignedArea(ring)) >= MIN_RING_AREA);
  return rings.length > 0 ? encodeRings(rings) : null;
}

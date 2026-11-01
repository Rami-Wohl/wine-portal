import type { LineString, MultiLineString, MultiPolygon, Point, Polygon, Position } from "geojson";
import type { GeographyKind } from "../../../src/content/model";
import { planarSignedArea } from "./geometry";

// Structural validation of source geometry, RFC 7946 ring orientation and fixed-precision
// rounding. Planar checks run in the native CRS and again in lon-lat; both are planar
// approximations that are adequate for the regional extents handled here.

export type AreaGeometry = Polygon | MultiPolygon;
export type LineGeometry = LineString | MultiLineString;
export type ImportGeometry = AreaGeometry | LineGeometry | Point;

/** Decimal degrees kept after reprojection: about one millimetre, the resolution of the source. */
export const COORDINATE_DECIMALS = 8;

export function polygonsOf(geometry: AreaGeometry): Position[][][] {
  return geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
}

export function linesOf(geometry: LineGeometry): Position[][] {
  return geometry.type === "LineString" ? [geometry.coordinates] : geometry.coordinates;
}

function orientation(p: Position, q: Position, r: Position): number {
  const value = (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
  return value > 0 ? 1 : value < 0 ? -1 : 0;
}

function onSegment(p: Position, q: Position, r: Position): boolean {
  return (
    Math.min(p[0], r[0]) <= q[0] &&
    q[0] <= Math.max(p[0], r[0]) &&
    Math.min(p[1], r[1]) <= q[1] &&
    q[1] <= Math.max(p[1], r[1])
  );
}

/** True when the closed segments p1-p2 and p3-p4 share at least one point. */
export function segmentsIntersect(p1: Position, p2: Position, p3: Position, p4: Position): boolean {
  const o1 = orientation(p1, p2, p3);
  const o2 = orientation(p1, p2, p4);
  const o3 = orientation(p3, p4, p1);
  const o4 = orientation(p3, p4, p2);
  if (o1 !== o2 && o3 !== o4) return true;
  if (o1 === 0 && onSegment(p1, p3, p2)) return true;
  if (o2 === 0 && onSegment(p1, p4, p2)) return true;
  if (o3 === 0 && onSegment(p3, p1, p4)) return true;
  if (o4 === 0 && onSegment(p3, p2, p4)) return true;
  return false;
}

/** True only when the segments cross at an interior point of both; touching does not count. */
export function segmentsCrossProperly(
  p1: Position,
  p2: Position,
  p3: Position,
  p4: Position,
): boolean {
  const o1 = orientation(p1, p2, p3);
  const o2 = orientation(p1, p2, p4);
  const o3 = orientation(p3, p4, p1);
  const o4 = orientation(p3, p4, p2);
  return o1 !== 0 && o2 !== 0 && o3 !== 0 && o4 !== 0 && o1 !== o2 && o3 !== o4;
}

interface SweepSegment {
  ring: number;
  index: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

function sweepSegments(rings: Position[][]): SweepSegment[] {
  const segments: SweepSegment[] = [];
  rings.forEach((ring, ringIndex) => {
    for (let index = 0; index < ring.length - 1; index += 1) {
      const a = ring[index];
      const b = ring[index + 1];
      segments.push({
        ring: ringIndex,
        index,
        minX: Math.min(a[0], b[0]),
        maxX: Math.max(a[0], b[0]),
        minY: Math.min(a[1], b[1]),
        maxY: Math.max(a[1], b[1]),
      });
    }
  });
  return segments.sort((left, right) => left.minX - right.minX);
}

/**
 * Report the first pair of non-adjacent segments of a closed ring that touch or cross.
 * A simple ring has none; a bow-tie or a ring that touches itself at a vertex is refused.
 */
export function findRingSelfIntersection(ring: Position[]): [number, number] | null {
  const segmentCount = ring.length - 1;
  const segments = sweepSegments([ring]);
  for (let i = 0; i < segments.length; i += 1) {
    const a = segments[i];
    for (let j = i + 1; j < segments.length; j += 1) {
      const b = segments[j];
      if (b.minX > a.maxX) break;
      const adjacent =
        Math.abs(a.index - b.index) === 1 ||
        (Math.min(a.index, b.index) === 0 && Math.max(a.index, b.index) === segmentCount - 1);
      if (adjacent) continue;
      if (b.minY > a.maxY || b.maxY < a.minY) continue;
      if (segmentsIntersect(ring[a.index], ring[a.index + 1], ring[b.index], ring[b.index + 1])) {
        return a.index < b.index ? [a.index, b.index] : [b.index, a.index];
      }
    }
  }
  return null;
}

/**
 * Report the first proper crossing between segments of two different rings. Rings that only
 * touch at vertices or share an edge (holes against their exterior, sliver holes) are allowed.
 */
export function findRingCrossing(
  left: Position[],
  right: Position[],
): { left: number; right: number } | null {
  const segments = sweepSegments([left, right]);
  for (let i = 0; i < segments.length; i += 1) {
    const a = segments[i];
    for (let j = i + 1; j < segments.length; j += 1) {
      const b = segments[j];
      if (b.minX > a.maxX) break;
      if (a.ring === b.ring) continue;
      if (b.minY > a.maxY || b.maxY < a.minY) continue;
      const ringA = a.ring === 0 ? left : right;
      const ringB = b.ring === 0 ? left : right;
      if (
        segmentsCrossProperly(
          ringA[a.index],
          ringA[a.index + 1],
          ringB[b.index],
          ringB[b.index + 1],
        )
      ) {
        const leftIndex = a.ring === 0 ? a.index : b.index;
        const rightIndex = a.ring === 0 ? b.index : a.index;
        return { left: leftIndex, right: rightIndex };
      }
    }
  }
  return null;
}

function isFinitePosition(position: unknown): position is Position {
  return (
    Array.isArray(position) &&
    position.length >= 2 &&
    typeof position[0] === "number" &&
    typeof position[1] === "number" &&
    Number.isFinite(position[0]) &&
    Number.isFinite(position[1])
  );
}

function hasConsecutiveDuplicate(positions: Position[]): number | null {
  for (let index = 1; index < positions.length; index += 1) {
    if (
      positions[index][0] === positions[index - 1][0] &&
      positions[index][1] === positions[index - 1][1]
    ) {
      return index;
    }
  }
  return null;
}

/** Exact test: the point lies on one of the ring's segments. */
export function pointOnRing(point: Position, ring: Position[]): boolean {
  for (let index = 1; index < ring.length; index += 1) {
    const a = ring[index - 1];
    const b = ring[index];
    if (orientation(a, b, point) === 0 && onSegment(a, point, b)) return true;
  }
  return false;
}

/** Ray-casting test; a point exactly on the boundary may return either value. */
export function pointInRing(point: Position, ring: Position[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (
      yi > point[1] !== yj > point[1] &&
      point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi) + xi
    ) {
      inside = !inside;
    }
  }
  return inside;
}

function strictlyInside(point: Position, ring: Position[]): boolean {
  return !pointOnRing(point, ring) && pointInRing(point, ring);
}

/**
 * Structural validation of an area geometry: Polygon or MultiPolygon, finite x/y pairs, rings
 * of at least four positions that close, non-zero area, no consecutive duplicate positions,
 * simple rings, holes whose vertices lie inside or on their exterior ring, no hole edge
 * crossing the exterior or another hole, and no hole inside another hole. Returns the problems.
 */
export function validateAreaGeometry(geometry: unknown, label: string): string[] {
  const issues: string[] = [];
  if (typeof geometry !== "object" || geometry === null) return [`${label}: geometry is empty`];
  const { type, coordinates } = geometry as { type?: unknown; coordinates?: unknown };
  if (type !== "Polygon" && type !== "MultiPolygon") {
    return [`${label}: geometry type '${String(type)}' is not Polygon or MultiPolygon`];
  }
  const polygons = (type === "Polygon" ? [coordinates] : coordinates) as unknown[];
  if (!Array.isArray(polygons) || polygons.length === 0) {
    return [`${label}: geometry has no polygons`];
  }
  polygons.forEach((polygon, polygonIndex) => {
    const where = type === "Polygon" ? "Polygon" : `polygon ${polygonIndex}`;
    if (!Array.isArray(polygon) || polygon.length === 0) {
      issues.push(`${label}: ${where} has no rings`);
      return;
    }
    const validRings: Position[][] = [];
    (polygon as unknown[]).forEach((ring, ringIndex) => {
      const ringWhere = `${where} ring ${ringIndex}`;
      if (!Array.isArray(ring) || ring.length < 4) {
        issues.push(`${label}: ${ringWhere} has fewer than four positions`);
        return;
      }
      if (!ring.every(isFinitePosition)) {
        issues.push(`${label}: ${ringWhere} contains a non-finite or malformed position`);
        return;
      }
      const positions = ring as Position[];
      const first = positions[0];
      const last = positions[positions.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        issues.push(`${label}: ${ringWhere} is not closed`);
        return;
      }
      const duplicate = hasConsecutiveDuplicate(positions);
      if (duplicate !== null) {
        issues.push(`${label}: ${ringWhere} repeats position ${duplicate - 1} at ${duplicate}`);
        return;
      }
      if (planarSignedArea(positions) === 0) {
        issues.push(`${label}: ${ringWhere} has zero area`);
        return;
      }
      const crossing = findRingSelfIntersection(positions);
      if (crossing) {
        issues.push(
          `${label}: ${ringWhere} is not simple; segments ${crossing[0]} and ${crossing[1]} touch or cross`,
        );
        return;
      }
      validRings.push(positions);
    });
    if (validRings.length !== (polygon as unknown[]).length) return;
    const exterior = validRings[0];
    const holes = validRings.slice(1);
    holes.forEach((hole, holeIndex) => {
      // A hole may touch its exterior ring at vertices or along an edge, but no vertex may lie
      // strictly outside it and no hole edge may cross an exterior edge.
      const outside = hole.find(
        (vertex) => !pointOnRing(vertex, exterior) && !pointInRing(vertex, exterior),
      );
      if (outside) {
        issues.push(
          `${label}: ${where} ring ${holeIndex + 1} is a hole with a vertex [${outside.join(", ")}] outside its exterior ring`,
        );
        return;
      }
      const crossing = findRingCrossing(exterior, hole);
      if (crossing) {
        issues.push(
          `${label}: ${where} ring ${holeIndex + 1} is a hole whose segment ${crossing.right} crosses exterior segment ${crossing.left}`,
        );
      }
    });
    for (let a = 0; a < holes.length; a += 1) {
      for (let b = a + 1; b < holes.length; b += 1) {
        const crossing = findRingCrossing(holes[a], holes[b]);
        if (crossing) {
          issues.push(
            `${label}: ${where} rings ${a + 1} and ${b + 1} are holes that cross each other (segments ${crossing.left} and ${crossing.right})`,
          );
          continue;
        }
        if (
          holes[b].some((vertex) => strictlyInside(vertex, holes[a])) ||
          holes[a].some((vertex) => strictlyInside(vertex, holes[b]))
        ) {
          issues.push(
            `${label}: ${where} rings ${a + 1} and ${b + 1} are holes nested inside each other`,
          );
        }
      }
    }
  });
  return issues;
}

/** Structural validation of a line geometry: finite pairs, at least two positions, no repeats. */
export function validateLineGeometry(geometry: unknown, label: string): string[] {
  if (typeof geometry !== "object" || geometry === null) return [`${label}: geometry is empty`];
  const { type, coordinates } = geometry as { type?: unknown; coordinates?: unknown };
  if (type !== "LineString" && type !== "MultiLineString") {
    return [`${label}: geometry type '${String(type)}' is not LineString or MultiLineString`];
  }
  const lines = (type === "LineString" ? [coordinates] : coordinates) as unknown[];
  if (!Array.isArray(lines) || lines.length === 0) return [`${label}: geometry has no lines`];
  const issues: string[] = [];
  lines.forEach((line, lineIndex) => {
    const where = type === "LineString" ? "LineString" : `line ${lineIndex}`;
    if (!Array.isArray(line) || line.length < 2) {
      issues.push(`${label}: ${where} has fewer than two positions`);
      return;
    }
    if (!line.every(isFinitePosition)) {
      issues.push(`${label}: ${where} contains a non-finite or malformed position`);
      return;
    }
    const duplicate = hasConsecutiveDuplicate(line as Position[]);
    if (duplicate !== null) {
      issues.push(`${label}: ${where} repeats position ${duplicate - 1} at ${duplicate}`);
    }
  });
  return issues;
}

export function validatePointGeometry(geometry: unknown, label: string): string[] {
  if (typeof geometry !== "object" || geometry === null) return [`${label}: geometry is empty`];
  const { type, coordinates } = geometry as { type?: unknown; coordinates?: unknown };
  if (type !== "Point") return [`${label}: geometry type '${String(type)}' is not Point`];
  if (!isFinitePosition(coordinates)) {
    return [`${label}: Point is not a finite [x, y] pair`];
  }
  return [];
}

export function validateGeometryForKind(
  geometry: unknown,
  kind: GeographyKind,
  label: string,
): string[] {
  switch (kind) {
    case "appellation-area":
    case "water-body":
      return validateAreaGeometry(geometry, label);
    case "river":
    case "coastline":
      return validateLineGeometry(geometry, label);
    case "populated-place":
      return validatePointGeometry(geometry, label);
  }
}

/** Transform every position; rings and lines keep their vertex order. */
export function mapPositions<G extends ImportGeometry>(
  geometry: G,
  transform: (position: Position) => Position,
): G {
  const mapLine = (line: Position[]) => line.map((position) => transform(position));
  switch (geometry.type) {
    case "Point":
      return { type: "Point", coordinates: transform(geometry.coordinates) } as G;
    case "LineString":
      return { type: "LineString", coordinates: mapLine(geometry.coordinates) } as G;
    case "MultiLineString":
      return { type: "MultiLineString", coordinates: geometry.coordinates.map(mapLine) } as G;
    case "Polygon":
      return { type: "Polygon", coordinates: geometry.coordinates.map(mapLine) } as G;
    case "MultiPolygon":
      return {
        type: "MultiPolygon",
        coordinates: geometry.coordinates.map((polygon) => polygon.map(mapLine)),
      } as G;
  }
}

/**
 * RFC 7946 §3.1.6: exterior rings counterclockwise, holes clockwise. A ring is reversed in
 * place of its order only; no coordinate changes. Returns how many rings were reversed.
 */
export function enforceRfc7946Orientation(geometry: AreaGeometry): number {
  let reversed = 0;
  for (const polygon of polygonsOf(geometry)) {
    polygon.forEach((ring, index) => {
      const area = planarSignedArea(ring);
      const shouldBeCounterclockwise = index === 0;
      if ((shouldBeCounterclockwise && area < 0) || (!shouldBeCounterclockwise && area > 0)) {
        ring.reverse();
        reversed += 1;
      }
    });
  }
  return reversed;
}

function roundCoordinate(value: number, decimals: number): number {
  const rounded = Number(value.toFixed(decimals));
  // toFixed keeps the sign of a tiny negative value; a canonical file never carries -0.
  return Object.is(rounded, -0) ? 0 : rounded;
}

export function roundPosition(
  position: Position,
  decimals: number = COORDINATE_DECIMALS,
): Position {
  return [roundCoordinate(position[0], decimals), roundCoordinate(position[1], decimals)];
}

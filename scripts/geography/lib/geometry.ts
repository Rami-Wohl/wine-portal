import { createHash } from "node:crypto";
import type {
  Feature,
  LineString,
  MultiLineString,
  MultiPolygon,
  Point,
  Polygon,
  Position,
} from "geojson";
import type { GeographyGeometryType, LonLatBbox } from "../../../src/content/model";

/** One canonical RFC 7946 Feature in EPSG:4326, longitude first. */
export type GeographyGeometry = Polygon | MultiPolygon | LineString | MultiLineString | Point;

export type GeographyFeature = Feature<GeographyGeometry>;

const GEOMETRY_TYPES: readonly GeographyGeometryType[] = [
  "Polygon",
  "MultiPolygon",
  "LineString",
  "MultiLineString",
  "Point",
];

/** Coordinates in a committed record and its YAML metadata may differ by rounding only. */
export const COORDINATE_TOLERANCE = 1e-7;

export function sha256Hex(bytes: Uint8Array | string): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Parse a GeoJSON text into exactly one Feature with a supported geometry type.
 * Structural coordinate checks follow separately so every issue names the file.
 */
export function parseGeographyFeature(
  text: string,
  file: string,
): { feature: GeographyFeature | undefined; issues: string[] } {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (error) {
    return {
      feature: undefined,
      issues: [`${file}: invalid JSON (${error instanceof Error ? error.message : String(error)})`],
    };
  }
  if (!isRecord(raw) || raw.type !== "Feature") {
    return {
      feature: undefined,
      issues: [
        `${file}: must contain exactly one GeoJSON Feature, found ${
          isRecord(raw) && typeof raw.type === "string" ? `'${raw.type}'` : "no Feature object"
        }`,
      ],
    };
  }
  if (!isRecord(raw.geometry) || typeof raw.geometry.type !== "string") {
    return { feature: undefined, issues: [`${file}: Feature has no geometry`] };
  }
  if (!GEOMETRY_TYPES.includes(raw.geometry.type as GeographyGeometryType)) {
    return {
      feature: undefined,
      issues: [
        `${file}: geometry type '${raw.geometry.type}' is not supported; use ${GEOMETRY_TYPES.join(", ")}`,
      ],
    };
  }
  if (!Array.isArray(raw.geometry.coordinates)) {
    return { feature: undefined, issues: [`${file}: geometry has no coordinates array`] };
  }
  return { feature: raw as unknown as GeographyFeature, issues: [] };
}

function validatePosition(position: unknown, where: string, file: string, issues: string[]): void {
  if (!Array.isArray(position) || position.length !== 2) {
    issues.push(
      `${file}: ${where} must be a [longitude, latitude] pair; 3D positions are rejected, so the import step must drop altitude`,
    );
    return;
  }
  const [lon, lat] = position as unknown[];
  if (typeof lon !== "number" || typeof lat !== "number" || !isFinite(lon) || !isFinite(lat)) {
    issues.push(`${file}: ${where} must contain finite numbers`);
    return;
  }
  if (lon < -180 || lon > 180 || lat < -90 || lat > 90) {
    issues.push(
      `${file}: ${where} [${lon}, ${lat}] is outside longitude [-180, 180] and latitude [-90, 90]; check the CRS and axis order`,
    );
  }
}

function samePosition(left: Position, right: Position): boolean {
  return left[0] === right[0] && left[1] === right[1];
}

/**
 * Planar shoelace area with longitude (or x) as x; positive means counterclockwise. Works for
 * closed rings (the repeated closing point adds nothing) and for rings without one.
 */
export function planarSignedArea(points: ArrayLike<readonly number[]>): number {
  let area = 0;
  for (let index = 0; index < points.length; index += 1) {
    const [x0, y0] = points[index];
    const [x1, y1] = points[(index + 1) % points.length];
    area += x0 * y1 - x1 * y0;
  }
  return area / 2;
}

function validateLine(line: unknown, where: string, file: string, issues: string[]): void {
  if (!Array.isArray(line) || line.length < 2) {
    issues.push(`${file}: ${where} must contain at least two positions`);
    return;
  }
  line.forEach((position, index) =>
    validatePosition(position, `${where} position ${index}`, file, issues),
  );
}

function validateRing(
  ring: unknown,
  where: string,
  exterior: boolean,
  file: string,
  issues: string[],
): void {
  if (!Array.isArray(ring) || ring.length < 4) {
    issues.push(`${file}: ${where} must be a closed ring of at least four positions`);
    return;
  }
  const before = issues.length;
  ring.forEach((position, index) =>
    validatePosition(position, `${where} position ${index}`, file, issues),
  );
  if (issues.length > before) return;
  const positions = ring as Position[];
  if (!samePosition(positions[0], positions[positions.length - 1])) {
    issues.push(`${file}: ${where} is not closed; its first and last positions differ`);
    return;
  }
  const area = planarSignedArea(positions);
  if (area === 0) {
    issues.push(`${file}: ${where} has no area`);
    return;
  }
  if (exterior && area < 0) {
    issues.push(
      `${file}: ${where} must run counterclockwise (RFC 7946 exterior ring); reverse it in the import step`,
    );
  }
  if (!exterior && area > 0) {
    issues.push(
      `${file}: ${where} must run clockwise (RFC 7946 interior ring); reverse it in the import step`,
    );
  }
}

function validatePolygon(polygon: unknown, where: string, file: string, issues: string[]): void {
  if (!Array.isArray(polygon) || polygon.length < 1) {
    issues.push(`${file}: ${where} must contain at least one ring`);
    return;
  }
  polygon.forEach((ring, index) =>
    validateRing(ring, `${where} ring ${index}`, index === 0, file, issues),
  );
}

/** Structural checks: finite in-range pairs, closed rings, RFC 7946 orientation. */
export function validateGeometryStructure(geometry: GeographyGeometry, file: string): string[] {
  const issues: string[] = [];
  const coordinates: unknown = geometry.coordinates;
  switch (geometry.type) {
    case "Point":
      validatePosition(coordinates, "Point", file, issues);
      break;
    case "LineString":
      validateLine(coordinates, "LineString", file, issues);
      break;
    case "MultiLineString":
      if (!Array.isArray(coordinates) || coordinates.length < 1) {
        issues.push(`${file}: MultiLineString must contain at least one line`);
        break;
      }
      coordinates.forEach((line, index) => validateLine(line, `line ${index}`, file, issues));
      break;
    case "Polygon":
      validatePolygon(coordinates, "Polygon", file, issues);
      break;
    case "MultiPolygon":
      if (!Array.isArray(coordinates) || coordinates.length < 1) {
        issues.push(`${file}: MultiPolygon must contain at least one polygon`);
        break;
      }
      coordinates.forEach((polygon, index) =>
        validatePolygon(polygon, `polygon ${index}`, file, issues),
      );
      break;
  }
  return issues;
}

/** Every position in the coordinate arrays, including a ring's repeated closing position. */
export function geometryPositions(geometry: GeographyGeometry): Position[] {
  switch (geometry.type) {
    case "Point":
      return [geometry.coordinates];
    case "LineString":
      return geometry.coordinates;
    case "MultiLineString":
    case "Polygon":
      return geometry.coordinates.flat();
    case "MultiPolygon":
      return geometry.coordinates.flat(2);
  }
}

export function countVertices(geometry: GeographyGeometry): number {
  return geometryPositions(geometry).length;
}

export function geometryBbox(geometry: GeographyGeometry): LonLatBbox {
  const positions = geometryPositions(geometry);
  const bbox: LonLatBbox = [Infinity, Infinity, -Infinity, -Infinity];
  for (const [lon, lat] of positions) {
    bbox[0] = Math.min(bbox[0], lon);
    bbox[1] = Math.min(bbox[1], lat);
    bbox[2] = Math.max(bbox[2], lon);
    bbox[3] = Math.max(bbox[3], lat);
  }
  return bbox;
}

export function bboxesMatch(left: LonLatBbox, right: LonLatBbox): boolean {
  return left.every((value, index) => Math.abs(value - right[index]) <= COORDINATE_TOLERANCE);
}

export function geometryTypeToDisplay(type: GeographyGeometryType): "area" | "line" | "point" {
  switch (type) {
    case "Polygon":
    case "MultiPolygon":
      return "area";
    case "LineString":
    case "MultiLineString":
      return "line";
    case "Point":
      return "point";
  }
}

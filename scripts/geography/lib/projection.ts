import { geoArea, geoMercator, type GeoProjection } from "d3-geo";
import type { Position } from "geojson";
import type { LonLatBbox } from "../../../src/content/model";
import { SceneBuildError } from "./errors";
import { planarSignedArea, type GeographyGeometry } from "./geometry";

// Projection, fitting, path generation and label anchors for the display build. Everything
// here is planar maths on the fixed viewBox; the runtime never needs it.

export const VIEWBOX_WIDTH = 1000;
/** Display paths are rounded to this many decimals in viewBox units. */
export const DISPLAY_DECIMALS = 1;
export const PROJECTION_DECIMALS = 6;

export type Point2 = [number, number];

export function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  const rounded = Math.round(value * factor) / factor;
  return Object.is(rounded, -0) ? 0 : rounded;
}

function formatCoordinate(value: number, decimals: number): string {
  return round(value, decimals).toString();
}

export function bboxCorners(bbox: LonLatBbox): Position[] {
  const [minLon, minLat, maxLon, maxLat] = bbox;
  return [
    [minLon, minLat],
    [maxLon, minLat],
    [maxLon, maxLat],
    [minLon, maxLat],
  ];
}

/**
 * d3-geo winds spherical polygons clockwise, the opposite of RFC 7946, and would read a
 * counterclockwise exterior ring as the rest of the sphere. Rewind a copy for d3's area only.
 */
export function sphericalArea(geometry: GeographyGeometry): number {
  if (geometry.type !== "Polygon" && geometry.type !== "MultiPolygon") return 0;
  const rewind = (polygon: Position[][]) => polygon.map((ring) => [...ring].reverse());
  return geoArea(
    geometry.type === "Polygon"
      ? { type: "Polygon", coordinates: rewind(geometry.coordinates) }
      : { type: "MultiPolygon", coordinates: geometry.coordinates.map(rewind) },
  );
}

/**
 * Fit a Mercator projection so the projected vertices fill the viewBox width minus padding on
 * each side. Padding is a fraction of the fitted extent per axis; the height follows the aspect.
 * Vertex bounds, not spherical polygon bounds, are what the straight-line SVG paths occupy.
 */
export function fitProjection(
  positions: Position[],
  padding: number,
): { projection: GeoProjection; height: number } {
  const unit = geoMercator().scale(1).translate([0, 0]);
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const position of positions) {
    const projected = unit([position[0], position[1]]);
    if (!projected || !projected.every(isFinite)) {
      throw new SceneBuildError(`position [${position.join(", ")}] cannot be projected`);
    }
    x0 = Math.min(x0, projected[0]);
    y0 = Math.min(y0, projected[1]);
    x1 = Math.max(x1, projected[0]);
    y1 = Math.max(y1, projected[1]);
  }
  if (!(x1 - x0 > 0) || !(y1 - y0 > 0)) {
    throw new SceneBuildError("extent has no width or height to fit");
  }
  const innerWidth = VIEWBOX_WIDTH / (1 + 2 * padding);
  const scale = innerWidth / (x1 - x0);
  const innerHeight = (y1 - y0) * scale;
  const padX = innerWidth * padding;
  const padY = innerHeight * padding;
  const projection = geoMercator()
    .scale(scale)
    .translate([padX - x0 * scale, padY - y0 * scale]);
  return { projection, height: Math.max(1, Math.round(innerHeight + 2 * padY)) };
}

/** Spherical area of one viewBox pixel square at the extent centre, in steradians. */
export function pixelAreaSteradians(projection: GeoProjection, centerLatitude: number): number {
  const cosine = Math.cos((centerLatitude * Math.PI) / 180);
  return (cosine * cosine) / (projection.scale() * projection.scale());
}

export function projectPosition(
  projection: GeoProjection,
  position: Position,
  decimals: number = DISPLAY_DECIMALS,
): Point2 {
  const projected = projection([position[0], position[1]]);
  if (!projected)
    throw new SceneBuildError(`position [${position.join(", ")}] cannot be projected`);
  return [round(projected[0], decimals), round(projected[1], decimals)];
}

function projectLine(projection: GeoProjection, line: Position[], decimals: number): Point2[] {
  const points: Point2[] = [];
  for (const position of line) {
    const point = projectPosition(projection, position, decimals);
    const previous = points[points.length - 1];
    if (previous && previous[0] === point[0] && previous[1] === point[1]) continue;
    points.push(point);
  }
  return points;
}

/** Projected ring without its closing point; consecutive duplicates are dropped. */
function projectRing(projection: GeoProjection, ring: Position[], decimals: number): Point2[] {
  const points = projectLine(projection, ring, decimals);
  const first = points[0];
  const last = points[points.length - 1];
  if (points.length > 1 && first[0] === last[0] && first[1] === last[1]) points.pop();
  return points;
}

function linePath(points: Point2[], decimals: number): string {
  return points
    .map(
      ([x, y], index) =>
        `${index === 0 ? "M" : "L"}${formatCoordinate(x, decimals)} ${formatCoordinate(y, decimals)}`,
    )
    .join("");
}

function ringPath(points: Point2[], decimals: number): string {
  return `${linePath(points, decimals)}Z`;
}

function ringCentroid(points: Point2[]): Point2 {
  const area = planarSignedArea(points);
  if (area === 0) {
    const sum = points.reduce((acc, [x, y]) => [acc[0] + x, acc[1] + y], [0, 0]);
    return [sum[0] / points.length, sum[1] / points.length];
  }
  let cx = 0;
  let cy = 0;
  for (let index = 0; index < points.length; index += 1) {
    const [x0, y0] = points[index];
    const [x1, y1] = points[(index + 1) % points.length];
    const cross = x0 * y1 - x1 * y0;
    cx += (x0 + x1) * cross;
    cy += (y0 + y1) * cross;
  }
  return [cx / (6 * area), cy / (6 * area)];
}

function pointInRing([x, y]: Point2, ring: Point2[]): boolean {
  let inside = false;
  for (
    let index = 0, previous = ring.length - 1;
    index < ring.length;
    previous = index, index += 1
  ) {
    const [x0, y0] = ring[index];
    const [x1, y1] = ring[previous];
    if (y0 > y !== y1 > y && x < ((x1 - x0) * (y - y0)) / (y1 - y0) + x0) inside = !inside;
  }
  return inside;
}

function pointInPolygon(point: Point2, polygon: Point2[][]): boolean {
  return (
    pointInRing(point, polygon[0]) && polygon.slice(1).every((hole) => !pointInRing(point, hole))
  );
}

/**
 * A display-only label anchor: the planar centroid when it lies inside the largest polygon,
 * otherwise the midpoint of the longest interior run along the centroid's horizontal.
 */
export function labelAnchorForPolygons(
  polygons: Point2[][][],
  decimals: number = DISPLAY_DECIMALS,
): Point2 {
  const largest = polygons.reduce((best, polygon) =>
    Math.abs(planarSignedArea(polygon[0])) > Math.abs(planarSignedArea(best[0])) ? polygon : best,
  );
  const centroid = ringCentroid(largest[0]);
  if (pointInPolygon(centroid, largest)) {
    return [round(centroid[0], decimals), round(centroid[1], decimals)];
  }
  const y = centroid[1];
  const crossings: number[] = [];
  for (const ring of largest) {
    for (
      let index = 0, previous = ring.length - 1;
      index < ring.length;
      previous = index, index += 1
    ) {
      const [x0, y0] = ring[index];
      const [x1, y1] = ring[previous];
      if (y0 > y !== y1 > y) crossings.push(x0 + ((y - y0) * (x1 - x0)) / (y1 - y0));
    }
  }
  crossings.sort((left, right) => left - right);
  let best: Point2 | undefined;
  let bestLength = 0;
  for (let index = 0; index + 1 < crossings.length; index += 2) {
    const length = crossings[index + 1] - crossings[index];
    if (length > bestLength) {
      bestLength = length;
      best = [(crossings[index] + crossings[index + 1]) / 2, y];
    }
  }
  const anchor = best ?? largest[0][0];
  return [round(anchor[0], decimals), round(anchor[1], decimals)];
}

export interface ProjectedShape {
  path: string;
  labelAnchor?: Point2;
  /** Positions of the simplified geometry that remain drawn. */
  vertexCount: number;
  /** Planar area in square viewBox units (exteriors minus holes); 0 for lines. */
  area: number;
  /**
   * Sub-parts without extent at display resolution: a line segment, a hole, or a whole
   * exclave polygon (its holes included). Dropped from the drawing, counted per feature.
   */
  droppedParts: number;
  /** Set when no part survives; the feature cannot be drawn at this rung. */
  collapsed?: string;
}

function distinctPoints(points: Point2[]): number {
  return new Set(points.map(([x, y]) => `${x},${y}`)).size;
}

/**
 * On a grid of 10^-decimals units the smallest non-zero ring area is half a cell (0.005 square
 * units at one decimal); collinear rounded rings compute to floating-point noise around 0 instead
 * of exactly 0. Half that minimum separates the two without dropping any ring with real extent.
 */
function minRingArea(decimals: number): number {
  return 0.5 * 0.5 * 10 ** (-2 * decimals);
}

function ringCollapsed(ring: Point2[], decimals: number): boolean {
  return distinctPoints(ring) < 3 || Math.abs(planarSignedArea(ring)) < minRingArea(decimals);
}

/**
 * Project a simplified geometry into viewBox units and build its SVG path data. Source data
 * legitimately holds parts of a few metres (short river segments, small island holes); at
 * 0.1 viewBox units they have no extent and are left out rather than drawn as dots. The
 * region-chooser thumbnails pass a coarser grid through `decimals`.
 */
export function projectShape(
  projection: GeoProjection,
  geometry: GeographyGeometry,
  decimals: number = DISPLAY_DECIMALS,
): ProjectedShape {
  switch (geometry.type) {
    case "Polygon":
    case "MultiPolygon": {
      const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
      const kept: Point2[][][] = [];
      let vertexCount = 0;
      let droppedParts = 0;
      for (const [exterior, ...holes] of polygons) {
        const projectedExterior = projectRing(projection, exterior, decimals);
        if (ringCollapsed(projectedExterior, decimals)) {
          droppedParts += 1;
          continue;
        }
        vertexCount += exterior.length;
        const rings = [projectedExterior];
        for (const hole of holes) {
          const projectedHole = projectRing(projection, hole, decimals);
          if (ringCollapsed(projectedHole, decimals)) {
            droppedParts += 1;
            continue;
          }
          vertexCount += hole.length;
          rings.push(projectedHole);
        }
        kept.push(rings);
      }
      if (kept.length === 0) {
        return {
          path: "",
          vertexCount: 0,
          area: 0,
          droppedParts,
          collapsed: "no ring keeps an extent at display resolution",
        };
      }
      const area = kept.reduce(
        (sum, [exterior, ...holes]) =>
          sum +
          Math.abs(planarSignedArea(exterior)) -
          holes.reduce((holeSum, hole) => holeSum + Math.abs(planarSignedArea(hole)), 0),
        0,
      );
      return {
        area,
        path: kept
          .flat()
          .map((ring) => ringPath(ring, decimals))
          .join(""),
        labelAnchor: labelAnchorForPolygons(kept, decimals),
        vertexCount,
        droppedParts,
      };
    }
    case "LineString":
    case "MultiLineString": {
      const lines = geometry.type === "LineString" ? [geometry.coordinates] : geometry.coordinates;
      const kept: Point2[][] = [];
      let vertexCount = 0;
      let droppedParts = 0;
      for (const line of lines) {
        const projected = projectLine(projection, line, decimals);
        if (distinctPoints(projected) < 2) {
          droppedParts += 1;
          continue;
        }
        vertexCount += line.length;
        kept.push(projected);
      }
      if (kept.length === 0) {
        return {
          path: "",
          vertexCount: 0,
          area: 0,
          droppedParts,
          collapsed: "no line keeps an extent at display resolution",
        };
      }
      return {
        path: kept.map((line) => linePath(line, decimals)).join(""),
        vertexCount,
        area: 0,
        droppedParts,
      };
    }
    case "Point":
      throw new SceneBuildError("points are projected directly, not as shapes");
  }
}

import { readFile } from "node:fs/promises";
import type { Point, Position } from "geojson";
import { loadManifest, type ManifestResource } from "../fetch";
import { ImportError } from "./import-error";
import {
  ORIENTATION_KINDS,
  loadOrientationMapping,
  type OrientationEntry,
} from "./mapping-schemas";
import {
  buildRecord,
  createFormatters,
  createProjection,
  limitationsFor,
  readToolVersions,
  verifiedResourcePath,
  type BuiltRecord,
  type Logger,
  type PipelineContext,
  type Projection,
} from "./record";
import { COORDINATE_DECIMALS, type ImportGeometry } from "./validate";
import { findStaleFiles, writeRecords, type ImportOptions, type WrittenRecord } from "./write";

// IGN orientation features (rivers, water bodies, coastline, populated places) from committed
// WFS responses. The response is the pinned artefact; the mapping's selection rule is re-applied
// and the response must satisfy it completely.

export interface RawFeature {
  type: "Feature";
  id?: string;
  geometry: { type: string; coordinates: unknown } | null;
  properties: Record<string, unknown>;
}

export interface RawCollection {
  type: "FeatureCollection";
  features: RawFeature[];
  totalFeatures?: number;
  numberMatched?: number;
  numberReturned?: number;
  timeStamp?: string;
  crs?: { type: string; properties: { name: string } };
}

export function parseRawCollection(text: string, label: string): RawCollection {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new ImportError(
      `${label}: the committed response is not valid JSON (${error instanceof Error ? error.message : String(error)})`,
    );
  }
  const collection = parsed as Partial<RawCollection>;
  if (collection.type !== "FeatureCollection" || !Array.isArray(collection.features)) {
    throw new ImportError(`${label}: the committed response is not a GeoJSON FeatureCollection`);
  }
  return collection as RawCollection;
}

/** Features whose attributes satisfy the reviewed selection rule. */
export function selectRawFeatures(
  entry: OrientationEntry,
  collection: RawCollection,
): RawFeature[] {
  const { select } = entry;
  return collection.features.filter((feature) => {
    const properties = feature.properties ?? {};
    const value = properties[select.property];
    if (value === null || value === undefined) return false;
    if (!select.values.includes(String(value))) return false;
    if (select.type_de_limite === null && properties.type_de_limite !== null) return false;
    if (select.cleabs !== undefined && properties.cleabs !== select.cleabs) return false;
    return true;
  });
}

/**
 * The pinned requests sort by `cleabs`; the committed response must honour that, so the
 * merged geometry's part order is reproducible and documented.
 */
export function assertCleabsOrder(label: string, features: RawFeature[]): void {
  let previous: string | undefined;
  features.forEach((feature, index) => {
    const cleabs = feature.properties?.cleabs;
    if (typeof cleabs !== "string" || cleabs.length === 0) {
      throw new ImportError(`${label}: feature ${index} has no cleabs identifier`);
    }
    if (previous !== undefined && !(cleabs > previous)) {
      throw new ImportError(
        `${label}: features are not in strictly increasing cleabs order ('${previous}' is followed by '${cleabs}' at ${index}); the response does not match the pinned SORTBY`,
      );
    }
    previous = cleabs;
  });
}

/** Merge the selected features into the single geometry type the entry declares. */
export function mergeRawGeometries(
  entry: OrientationEntry,
  features: RawFeature[],
): ImportGeometry {
  const label = entry.id;
  if (entry.geometry === "Point") {
    if (features.length !== 1) {
      throw new ImportError(
        `${label}: a populated place needs exactly one feature, found ${features.length}`,
      );
    }
    const geometry = features[0].geometry;
    if (!geometry || geometry.type !== "Point") {
      throw new ImportError(`${label}: the selected feature is not a Point`);
    }
    return geometry as Point;
  }
  if (entry.geometry === "MultiLineString") {
    const lines: Position[][] = [];
    features.forEach((feature, index) => {
      const geometry = feature.geometry;
      if (!geometry) throw new ImportError(`${label}: feature ${index} has no geometry`);
      if (geometry.type === "LineString") lines.push(geometry.coordinates as Position[]);
      else if (geometry.type === "MultiLineString")
        lines.push(...(geometry.coordinates as Position[][]));
      else throw new ImportError(`${label}: feature ${index} is a ${geometry.type}, not a line`);
    });
    return { type: "MultiLineString", coordinates: lines };
  }
  const polygons: Position[][][] = [];
  features.forEach((feature, index) => {
    const geometry = feature.geometry;
    if (!geometry) throw new ImportError(`${label}: feature ${index} has no geometry`);
    if (geometry.type === "Polygon") polygons.push(geometry.coordinates as Position[][]);
    else if (geometry.type === "MultiPolygon")
      polygons.push(...(geometry.coordinates as Position[][][]));
    else throw new ImportError(`${label}: feature ${index} is a ${geometry.type}, not an area`);
  });
  return { type: "MultiPolygon", coordinates: polygons };
}

export interface ImportedOrientationFeature extends BuiltRecord {
  entry: OrientationEntry;
  featureCount: number;
}

export interface PreparedOrientation {
  features: ImportedOrientationFeature[];
}

export interface OrientationImportSummary extends PreparedOrientation {
  written: WrittenRecord[];
  stale: string[];
}

function verificationSentence(
  entry: OrientationEntry,
  resource: ManifestResource,
  selected: RawFeature[],
): string {
  const request = resource.request;
  const rule =
    entry.select.cleabs !== undefined
      ? `the single object with ${entry.select.property} '${entry.select.values[0]}' and cleabs ${entry.select.cleabs}`
      : entry.select.expect
        ? `the chef-lieu point with ${entry.select.property} '${entry.select.values[0]}' (${Object.entries(
            entry.select.expect,
          )
            .map(([key, value]) => `${key} '${value}'`)
            .join(", ")})`
        : `all ${selected.length} features with ${entry.select.property} in {${entry.select.values
            .map((value) => `'${value}'`)
            .join(", ")}}${entry.select.type_de_limite === null ? " and no type_de_limite" : ""}`;
  const envelope = request?.envelope ? ` intersecting the ${request.envelope} envelope` : "";
  const whole =
    entry.select.cleabs === undefined && !entry.select.expect
      ? ", kept as whole features in verified cleabs order without clipping"
      : "";
  return (
    `Selected from the committed WFS response ${resource.id} (layer ${request?.typename ?? resource.resource_id}; request, edition and checksum pinned in the manifest): ${rule}${envelope}${whole}. ` +
    `Reprojected from ${resource.crs?.recognised ?? "the response CRS"} with explicit longitude-latitude order and no datum shift; coordinates rounded to ${COORDINATE_DECIMALS} decimal degrees.`
  );
}

/** Read, select and build every orientation record without writing anything. */
export async function prepareOrientationFeatures(
  root: string,
  log: Logger = () => {},
): Promise<PreparedOrientation> {
  const manifest = await loadManifest(root);
  const mapping = await loadOrientationMapping(root);
  const resourcesById = new Map(manifest.resources.map((resource) => [resource.id, resource]));
  const tools = await readToolVersions();
  const formatters = await createFormatters(root);
  const collections = new Map<string, RawCollection>();
  const projections = new Map<string, Projection>();

  const failures: string[] = [];
  const features: ImportedOrientationFeature[] = [];
  for (const entry of mapping.entries) {
    try {
      const resource = resourcesById.get(entry.resource);
      if (!resource) {
        throw new ImportError(
          `${entry.id}: resource '${entry.resource}' is not pinned in the manifest`,
        );
      }
      if (resource.storage !== "raw" || resource.format !== "geojson" || !resource.crs?.urn) {
        throw new ImportError(
          `${entry.id}: resource '${resource.id}' is not a committed GeoJSON response with a crs urn`,
        );
      }
      let collection = collections.get(resource.id);
      if (!collection) {
        const file = await verifiedResourcePath(root, resource, log);
        collection = parseRawCollection(await readFile(file, "utf8"), resource.id);
        const crsName = collection.crs?.properties?.name;
        if (crsName !== resource.crs.urn) {
          throw new ImportError(
            `${resource.id}: the response declares crs '${String(crsName)}', the manifest pins '${resource.crs.urn}'`,
          );
        }
        if (
          resource.feature_count !== undefined &&
          collection.features.length !== resource.feature_count
        ) {
          throw new ImportError(
            `${resource.id}: the response has ${collection.features.length} features, the manifest pins ${resource.feature_count}`,
          );
        }
        if (
          collection.numberMatched !== undefined &&
          collection.numberReturned !== undefined &&
          collection.numberMatched !== collection.numberReturned
        ) {
          throw new ImportError(
            `${resource.id}: the response is paged (${collection.numberReturned} of ${collection.numberMatched} features); pin a complete response`,
          );
        }
        assertCleabsOrder(resource.id, collection.features);
        collections.set(resource.id, collection);
        if (!projections.has(resource.crs.proj_definition)) {
          projections.set(
            resource.crs.proj_definition,
            createProjection(resource.crs.proj_definition),
          );
        }
      }
      const selected = selectRawFeatures(entry, collection);
      if (selected.length === 0) {
        throw new ImportError(
          `${entry.id}: no feature of ${resource.id} satisfies the selection rule`,
        );
      }
      if (entry.kind !== "populated-place" && selected.length !== collection.features.length) {
        throw new ImportError(
          `${entry.id}: ${collection.features.length - selected.length} feature(s) of ${resource.id} fall outside the selection rule; the committed response does not match the pinned request`,
        );
      }
      if (entry.select.expect) {
        const properties = selected[0].properties ?? {};
        const mismatches = Object.entries(entry.select.expect)
          .filter(([key, value]) => properties[key] !== value)
          .map(
            ([key, value]) =>
              `${key}: source has '${String(properties[key])}', mapping expects '${value}'`,
          );
        if (mismatches.length > 0) {
          throw new ImportError(
            `${entry.id}: the selected feature contradicts the mapping`,
            mismatches,
          );
        }
      }
      const geometry = mergeRawGeometries(entry, selected);
      const featureKey: Record<string, string | number | boolean | null> = {
        layer: resource.request?.typename ?? resource.resource_id,
        property: entry.select.property,
        values: entry.select.values.join(" | "),
        feature_count: selected.length,
      };
      if (entry.select.cleabs !== undefined) featureKey.cleabs = entry.select.cleabs;
      if (entry.select.type_de_limite === null) featureKey.type_de_limite = null;
      if (entry.select.expect) {
        for (const [key, value] of Object.entries(entry.select.expect)) featureKey[key] = value;
        const cleabs = selected[0].properties?.cleabs;
        if (typeof cleabs === "string") featureKey.cleabs = cleabs;
      }
      const context: PipelineContext = {
        projection: projections.get(resource.crs.proj_definition) as Projection,
        tools,
        ...formatters,
      };
      const built = await buildRecord(context, {
        id: entry.id,
        kind: entry.kind,
        names: entry.names,
        geometry,
        resource,
        featureKey,
        meaning: entry.meaning,
        limitations: limitationsFor(entry.kind),
        review: {
          status: entry.review.status,
          reviewed_at: mapping.reviewed_at,
          notes: `${verificationSentence(entry, resource, selected)} ${entry.review.notes.trim()}`,
        },
        label: entry.id,
      });
      features.push({ ...built, entry, featureCount: selected.length });
      log(
        `prepared  ${entry.id}  ${selected.length} source feature(s)  ${built.record.geometry.type}  ${built.record.geometry.vertex_count} positions  ${entry.review.status}`,
      );
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
      log(`FAILED    ${entry.id}`);
    }
  }
  if (failures.length > 0) {
    throw new ImportError(
      `${failures.length} of ${mapping.entries.length} orientation entries failed; nothing was written`,
      failures,
    );
  }
  return { features };
}

/** Prepare and write the orientation table on its own. */
export async function importOrientationFeatures(
  root: string,
  options: ImportOptions = {},
): Promise<OrientationImportSummary> {
  const log = options.log ?? (() => {});
  const prepared = await prepareOrientationFeatures(root, log);
  const written = await writeRecords(root, prepared.features, options, log);
  const stale = await findStaleFiles(root, ORIENTATION_KINDS, prepared.features, log);
  return { ...prepared, written, stale };
}

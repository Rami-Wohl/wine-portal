import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import type { Feature, Position } from "geojson";
import proj4 from "proj4";
import { format as prettierFormat, resolveConfig as resolvePrettierConfig } from "prettier";
import { Document as YamlDocument, isSeq } from "yaml";
import {
  geographyRecordSchema,
  type GeographyKind,
  type GeographyRecord,
} from "../../../src/content/model";
import { resourcePathFor, verifyCachedResource, type ManifestResource } from "../fetch";
import {
  countVertices,
  geometryBbox,
  planarSignedArea,
  sha256Hex,
  validateGeometryStructure,
} from "./geometry";
import { ImportError } from "./import-error";
import { APPELLATION_AREA_KIND } from "./mapping-schemas";
import {
  COORDINATE_DECIMALS,
  enforceRfc7946Orientation,
  mapPositions,
  polygonsOf,
  roundPosition,
  validateGeometryForKind,
  type AreaGeometry,
  type ImportGeometry,
} from "./validate";

// The shared record pipeline: reproject with explicit lon-lat axis order, orient rings, round to
// the fixed precision, validate again, run the content pipeline's structure check and the record
// schema, then serialise the GeoJSON and YAML pair (docs/atlas-plan.md §4).

export const FEATURES_RELATIVE_PATH = path.join("data", "geography", "features");

/** Maximum disagreement allowed between the source CRS definition and the manifest PROJ string. */
export const PROJECTION_AGREEMENT_DEGREES = 1e-9;

export const WGS84_LONLAT = "+proj=longlat +datum=WGS84 +no_defs";

export type Logger = (line: string) => void;

export interface Projection {
  forward: (position: Position) => Position;
  inverse: (position: Position) => Position;
}

/** Converter from the source definition to EPSG:4326 with explicit longitude-latitude order. */
export function createProjection(sourceDefinition: string): Projection {
  const converter = proj4(sourceDefinition, WGS84_LONLAT);
  return {
    forward: ([x, y]) => {
      const [lon, lat] = converter.forward([x, y]);
      return [lon, lat];
    },
    inverse: ([lon, lat]) => {
      const [x, y] = converter.inverse([lon, lat]);
      return [x, y];
    },
  };
}

/** Maximum disagreement in degrees between two projections on a grid over a native bbox. */
export function projectionDisagreement(
  left: Projection,
  right: Projection,
  nativeBbox: [number, number, number, number],
  steps = 10,
): number {
  let worst = 0;
  for (let i = 0; i <= steps; i += 1) {
    for (let j = 0; j <= steps; j += 1) {
      const x = nativeBbox[0] + ((nativeBbox[2] - nativeBbox[0]) * i) / steps;
      const y = nativeBbox[1] + ((nativeBbox[3] - nativeBbox[1]) * j) / steps;
      const a = left.forward([x, y]);
      const b = right.forward([x, y]);
      worst = Math.max(worst, Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
    }
  }
  return worst;
}

export interface ToolVersions {
  proj4: string;
  shapefile: string;
  fflate: string;
}

/** Versions of the packages that touched the geometry, read from the installed packages. */
export async function readToolVersions(): Promise<ToolVersions> {
  const require = createRequire(import.meta.url);
  const read = async (name: string): Promise<string> => {
    const file = require.resolve(`${name}/package.json`);
    const parsed = JSON.parse(await readFile(file, "utf8")) as { version?: unknown };
    if (typeof parsed.version !== "string") {
      throw new ImportError(`Cannot read the version of ${name}`);
    }
    return parsed.version;
  };
  return {
    proj4: await read("proj4"),
    shapefile: await read("shapefile"),
    fflate: await read("fflate"),
  };
}

export interface PipelineContext {
  projection: Projection;
  tools: ToolVersions;
  formatJson: (text: string) => Promise<string>;
  formatYaml: (text: string) => Promise<string>;
}

export interface RecordInput {
  id: string;
  kind: GeographyKind;
  owner?: string;
  names?: { nl: string; en: string };
  /** Geometry in the resource's native CRS. */
  geometry: unknown;
  resource: ManifestResource;
  featureKey: Record<string, string | number | boolean | null>;
  meaning: string;
  limitations: string;
  review: { status: "reviewed" | "published" | "held"; reviewed_at: string; notes: string };
  label: string;
}

export interface BuiltRecord {
  id: string;
  kind: GeographyKind;
  feature: Feature<ImportGeometry>;
  geojsonText: string;
  record: GeographyRecord;
  yamlText: string;
  nativeVertexCount: number;
  nativeBbox: [number, number, number, number];
  reversedRings: number;
}

const LIMITATIONS: Record<GeographyKind, string> = {
  "appellation-area":
    "Not a parcel delimitation, planted area or survey boundary. INAO publishes the shape for information; the commune list in the cahier des charges is the legal delimitation.",
  river:
    "Cartographic centreline segments at BD CARTO® scale (1:50 000 to 1:250 000) for regional orientation; not a hydrographic survey, a navigation line or a flood extent.",
  "water-body":
    "Cartographic water surface at BD CARTO® scale (1:50 000 to 1:250 000) for regional orientation; not a tidal, flood, navigation or property limit.",
  coastline:
    "High-water shoreline at BD CARTO® scale (1:50 000 to 1:250 000) for regional orientation; not a legal maritime or cadastral limit.",
  "populated-place":
    "Position of the commune's chef-lieu in ADMIN EXPRESS for orientation; not a settlement extent, an address or a winery location.",
};

export function limitationsFor(kind: GeographyKind): string {
  return LIMITATIONS[kind];
}

/** Reproject, orient, round, validate and serialise one record. */
export async function buildRecord(
  context: PipelineContext,
  input: RecordInput,
): Promise<BuiltRecord> {
  const { resource, kind, label } = input;
  const nativeIssues = validateGeometryForKind(input.geometry, kind, label);
  if (nativeIssues.length > 0) {
    throw new ImportError(`${input.id}: invalid source geometry`, nativeIssues);
  }
  const native = input.geometry as ImportGeometry;
  const nativeVertexCount = countVertices(native);
  const nativeBbox = geometryBbox(native);
  const extent = resource.expected_extent_wgs84;
  const projected = mapPositions(native, (position) => {
    const lonLat = context.projection.forward(position);
    if (!Number.isFinite(lonLat[0]) || !Number.isFinite(lonLat[1])) {
      throw new ImportError(`${input.id}: reprojection of [${position.join(", ")}] is not finite`);
    }
    if (
      extent &&
      (lonLat[0] < extent[0] ||
        lonLat[0] > extent[2] ||
        lonLat[1] < extent[1] ||
        lonLat[1] > extent[3])
    ) {
      throw new ImportError(
        `${input.id}: reprojected position [${lonLat.join(", ")}] lies outside the expected extent [${extent.join(", ")}]; check CRS and axis order`,
      );
    }
    return lonLat;
  });
  const isArea = projected.type === "Polygon" || projected.type === "MultiPolygon";
  const reversedRings = isArea ? enforceRfc7946Orientation(projected as AreaGeometry) : 0;
  const rounded = mapPositions(projected, (position) => roundPosition(position));
  const roundedIssues = validateGeometryForKind(
    rounded,
    kind,
    `${input.id} (after reprojection and rounding)`,
  );
  if (roundedIssues.length > 0) {
    throw new ImportError(
      `${input.id}: geometry is invalid after reprojection and rounding`,
      roundedIssues,
    );
  }
  if (isArea) {
    for (const polygon of polygonsOf(rounded as AreaGeometry)) {
      polygon.forEach((ring, index) => {
        const area = planarSignedArea(ring);
        if ((index === 0 && area <= 0) || (index > 0 && area >= 0)) {
          throw new ImportError(`${input.id}: ring orientation is not RFC 7946 after rounding`);
        }
      });
    }
  }
  const pipelineIssues = validateGeometryStructure(rounded, input.id);
  if (pipelineIssues.length > 0) {
    throw new ImportError(
      `${input.id}: geometry fails the content pipeline structure checks`,
      pipelineIssues,
    );
  }

  const bbox = geometryBbox(rounded);
  const properties: Record<string, string> = { id: input.id, kind };
  if (input.owner) properties.owner = input.owner;
  if (input.names) {
    properties.name_nl = input.names.nl;
    properties.name_en = input.names.en;
  }
  const feature: Feature<ImportGeometry> = {
    type: "Feature",
    id: input.id,
    properties,
    bbox,
    geometry: rounded,
  };
  const geojsonText = await context.formatJson(JSON.stringify(feature));
  const sha256 = sha256Hex(geojsonText);

  const transformation: GeographyRecord["transformation"] = [
    {
      step: "reproject",
      from: resource.crs?.equivalent_epsg ?? "",
      to: "EPSG:4326",
      axis_order: "lon-lat",
      tool: `proj4@${context.tools.proj4}`,
    },
  ];
  if (isArea) transformation.push({ step: "ring-orientation", convention: "rfc7946" });
  transformation.push({
    step: "coordinate-precision",
    decimals: COORDINATE_DECIMALS,
    unit: "degree",
  });

  const record: GeographyRecord = {
    id: input.id,
    kind,
    ...(input.owner ? { owner: input.owner } : {}),
    ...(input.names ? { names: input.names } : {}),
    geometry: {
      file: `${input.id}.geojson`,
      type: rounded.type,
      sha256,
      vertex_count: countVertices(rounded),
      bbox,
    },
    source: {
      source_id: resource.source_id,
      dataset_id: resource.dataset_id,
      resource_id: resource.resource_id,
      release: resource.release,
      retrieved_at: resource.retrieved_at,
      resource_sha256: resource.sha256,
      crs: resource.crs?.recognised ?? "",
      encoding: resource.encoding,
      feature_key: input.featureKey,
    },
    licence: {
      id: "etalab-2.0",
      attribution: resource.licence.attribution,
      notes:
        kind === APPELLATION_AREA_KIND
          ? "informative geometry; official dossiers carry the legal delimitation"
          : "cartographic reference geometry reused under Licence Ouverte 2.0; the credit names the publisher, dataset and edition without implying endorsement",
    },
    transformation,
    meaning: input.meaning,
    precision: "regional-orientation",
    limitations: input.limitations,
    review: input.review,
    supersedes: null,
  };
  const parsed = geographyRecordSchema.safeParse(record);
  if (!parsed.success) {
    throw new ImportError(
      `${input.id}: the generated record does not satisfy the geography record schema`,
      parsed.error.issues.map((issue) => `${issue.path.join(".")} ${issue.message}`),
    );
  }
  const yamlText = await context.formatYaml(stringifyRecord(record));
  return {
    id: input.id,
    kind,
    feature,
    geojsonText,
    record,
    yamlText,
    nativeVertexCount,
    nativeBbox,
    reversedRings,
  };
}

/** YAML in contract order with a flow-style bbox; prettier makes the final layout. */
export function stringifyRecord(record: GeographyRecord): string {
  const document = new YamlDocument(record);
  const bbox = document.getIn(["geometry", "bbox"]);
  if (isSeq(bbox)) bbox.flow = true;
  return document.toString({ lineWidth: 0 });
}

/**
 * Formatters that reproduce `prettier --check .` for the written files, so a later
 * `npm run format` cannot change bytes that the YAML checksums cover. The checksums therefore
 * depend on the installed Prettier version; upgrading Prettier requires a re-import.
 */
export async function createFormatters(
  root: string,
): Promise<Pick<PipelineContext, "formatJson" | "formatYaml">> {
  const sample = path.join(root, FEATURES_RELATIVE_PATH, APPELLATION_AREA_KIND, "record.yaml");
  const options = (await resolvePrettierConfig(sample)) ?? {};
  return {
    formatJson: (text) => prettierFormat(text, { ...options, parser: "json" }),
    formatYaml: (text) => prettierFormat(text, { ...options, parser: "yaml" }),
  };
}

/** The local path of a pinned resource once its bytes and digest match the manifest. */
export async function verifiedResourcePath(
  root: string,
  resource: ManifestResource,
  log: Logger,
): Promise<string> {
  const file = resourcePathFor(root, resource);
  const verification = await verifyCachedResource(file, resource);
  if (verification.status !== "verified") {
    throw new ImportError(
      `${path.relative(root, file)} is ${verification.status === "missing" ? "missing" : "not the pinned file"}; run 'npm run geography:fetch' first` +
        (verification.status === "mismatch"
          ? ` (observed ${verification.bytes} bytes, sha256 ${verification.sha256})`
          : ""),
    );
  }
  log(`verified  ${resource.id}  ${path.relative(root, file)}`);
  return file;
}

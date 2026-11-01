// Geography fixture helpers for pipeline and build tests. Shapes are synthetic squares,
// lines and points, never published geography.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { stringify as stringifyYaml } from "yaml";
import type { Entity, GeographyRecord, Scene } from "../../../src/content/model";
import {
  countVertices,
  geometryBbox,
  sha256Hex,
  type GeographyGeometry,
} from "../../geography/lib/geometry";

export async function addSource(root: string, id: string): Promise<void> {
  await mkdir(path.join(root, "data", "sources"), { recursive: true });
  await writeFile(
    path.join(root, "data", "sources", `${id.slice("source.".length)}.yaml`),
    stringifyYaml({
      id,
      source_type: "dataset",
      publisher: "Fixture publisher",
      title: "Fixture dataset",
      url: "https://example.org/fixture-dataset",
      published_at: "2026-10-12",
      language: "fr",
      status: "active",
    }),
  );
}

/** A counterclockwise square, the simplest RFC 7946 exterior ring. */
export function square(lon: number, lat: number, size: number): GeographyGeometry {
  return {
    type: "Polygon",
    coordinates: [
      [
        [lon, lat],
        [lon + size, lat],
        [lon + size, lat + size],
        [lon, lat + size],
        [lon, lat],
      ],
    ],
  };
}

export function line(positions: Array<[number, number]>): GeographyGeometry {
  return { type: "LineString", coordinates: positions };
}

export function point(lon: number, lat: number): GeographyGeometry {
  return { type: "Point", coordinates: [lon, lat] };
}

interface RecordOptions {
  id: string;
  geometry: GeographyGeometry;
  owner?: string;
  names?: { nl: string; en: string };
  status?: GeographyRecord["review"]["status"];
  sourceId?: string;
  release?: string;
  licenceId?: string;
  attribution?: string;
  /** Applied on top of the generated YAML before writing; use it to break a record. */
  patch?: (record: Record<string, unknown>) => void;
  geojsonText?: string;
  directoryKind?: string;
  filename?: string;
}

export async function addGeographyRecord(root: string, options: RecordOptions): Promise<string> {
  const kind = options.id.split(".")[1];
  const directory = path.join(root, "data", "geography", "features", options.directoryKind ?? kind);
  await mkdir(directory, { recursive: true });
  const geojsonText =
    options.geojsonText ??
    `${JSON.stringify({ type: "Feature", properties: {}, geometry: options.geometry })}\n`;
  await writeFile(path.join(directory, `${options.id}.geojson`), geojsonText);
  const status = options.status ?? "published";
  const record: Record<string, unknown> = {
    id: options.id,
    kind,
    ...(options.owner ? { owner: options.owner } : {}),
    ...(options.names ? { names: options.names } : {}),
    geometry: {
      file: `${options.id}.geojson`,
      type: options.geometry.type,
      sha256: sha256Hex(geojsonText),
      vertex_count: countVertices(options.geometry),
      bbox: geometryBbox(options.geometry),
    },
    source: {
      source_id: options.sourceId ?? "source.fixture-dataset",
      dataset_id: "fixture-dataset",
      resource_id: "fixture-resource",
      release: options.release ?? "2026-10-12",
      retrieved_at: "2026-10-30",
      resource_sha256: "a".repeat(64),
      crs: "EPSG:2154",
      encoding: "UTF-8",
      feature_key: { id_app: 1, app: "Fixture" },
    },
    licence: {
      id: options.licenceId ?? "etalab-2.0",
      attribution: options.attribution ?? "Fixture publisher, fixture dataset, edition 2026-10-12",
    },
    transformation: [
      {
        step: "reproject",
        from: "EPSG:2154",
        to: "EPSG:4326",
        axis_order: "lon-lat",
        tool: "proj4@2",
      },
      { step: "ring-orientation", convention: "rfc7946" },
      { step: "coordinate-precision", decimals: 6, unit: "degree" },
    ],
    meaning: "fixture-shape",
    precision: "regional-orientation",
    limitations: "Synthetic test fixture, not geography.",
    review: {
      status,
      ...(status === "imported" ? {} : { reviewed_at: "2026-10-30" }),
      ...(status === "held" ? { notes: "identity not confirmed in the fixture" } : {}),
    },
    supersedes: null,
  };
  options.patch?.(record);
  const file = path.join(directory, options.filename ?? `${options.id}.yaml`);
  await writeFile(file, stringifyYaml(record));
  return path.relative(root, file);
}

interface SceneOptions {
  id?: string;
  owner?: string;
  extent?: Scene["extent"];
  layers?: Scene["layers"];
  intended?: string[];
  patch?: (scene: Record<string, unknown>) => void;
  filename?: string;
}

export async function addScene(root: string, options: SceneOptions = {}): Promise<string> {
  const directory = path.join(root, "data", "geography", "scenes");
  await mkdir(directory, { recursive: true });
  const scene: Record<string, unknown> = {
    id: options.id ?? "scene.fixture",
    owner: options.owner ?? "region.fixture",
    extent: options.extent ?? { mode: "fit", padding: 0.1 },
    projection: "mercator",
    layers: options.layers ?? [
      {
        id: "appellations",
        kinds: ["appellation-area"],
        features: ["geo.appellation-area.alpha"],
        role: "selectable",
      },
    ],
    intended_entities: options.intended ?? ["appellation.alpha"],
  };
  options.patch?.(scene);
  const file = path.join(directory, options.filename ?? `${scene.id}.yaml`);
  await writeFile(file, stringifyYaml(scene));
  return path.relative(root, file);
}

/** A minimal schema-valid entity object for in-memory build and repository fixtures. */
export function fixtureEntity(id: string, options: Partial<Entity> = {}): Entity {
  const [type, slug] = id.split(".") as [Entity["type"], string];
  return {
    id,
    type,
    status: "draft",
    canonical_name: slug,
    names: { nl: `${slug} (nl)`, en: `${slug} (en)` },
    slugs: { nl: slug, en: slug },
    locales: { nl: "overview.nl.md", en: "overview.en.md" },
    relations: [],
    assertions: [],
    source_refs: [],
    ...options,
  };
}

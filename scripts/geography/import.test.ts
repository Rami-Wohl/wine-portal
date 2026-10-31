import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { zipSync } from "fflate";
import type { Position } from "geojson";
import { afterEach, describe, expect, it } from "vitest";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { geographyRecordSchema } from "../../src/content/model";
import { MANIFEST_RELATIVE_PATH, resourcePathFor, type ManifestResource } from "./fetch";
import { importAppellationAreas, importOrientationFeatures } from "./import";
import { buildImportedFeature, type BuildContext } from "./lib/appellations";
import { planarSignedArea } from "./lib/geometry";
import {
  APPELLATION_MAPPING_RELATIVE_PATH,
  ORIENTATION_MAPPING_RELATIVE_PATH,
  loadMapping,
  loadOrientationMapping,
  type MappingEntry,
  type OrientationEntry,
} from "./lib/mapping-schemas";
import { assertCleabsOrder, type RawFeature } from "./lib/orientation";
import {
  createProjection,
  projectionDisagreement,
  readToolVersions,
  stringifyRecord,
} from "./lib/record";
import { indexRegister, parseCsv, verifyAgainstRegister } from "./lib/register";
import {
  indexSourceRows,
  matchSourceRow,
  openShapefileBundle,
  sourceRowKey,
  type SourceIndex,
} from "./lib/shapefile";
import {
  COORDINATE_DECIMALS,
  enforceRfc7946Orientation,
  findRingCrossing,
  findRingSelfIntersection,
  roundPosition,
  validateAreaGeometry,
  validateLineGeometry,
  validatePointGeometry,
  type AreaGeometry,
} from "./lib/validate";

const temporaryRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});

async function temporaryRoot(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "geography-import-"));
  temporaryRoots.push(root);
  return root;
}

const sha256 = (bytes: Uint8Array | string): string =>
  createHash("sha256").update(bytes).digest("hex");

const LAMBERT_93_WKT =
  'PROJCS["RGF93_Lambert_93",GEOGCS["GCS_RGF_1993",DATUM["D_RGF_1993",SPHEROID["GRS_1980",6378137.0,298.257222101]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Lambert_Conformal_Conic"],PARAMETER["False_Easting",700000.0],PARAMETER["False_Northing",6600000.0],PARAMETER["Central_Meridian",3.0],PARAMETER["Standard_Parallel_1",44.0],PARAMETER["Standard_Parallel_2",49.0],PARAMETER["Latitude_Of_Origin",46.5],UNIT["Meter",1.0]]';
const LAMBERT_93_PROJ =
  "+proj=lcc +lat_0=46.5 +lon_0=3 +lat_1=49 +lat_2=44 +x_0=700000 +y_0=6600000 +ellps=GRS80 +units=m +no_defs";
const LAMBERT_93_URN = "urn:ogc:def:crs:EPSG::2154";

// Shapefile convention: exterior rings clockwise, holes counterclockwise. Native metres.
const CLOCKWISE_SQUARE: Position[] = [
  [400000, 6440000],
  [400000, 6450000],
  [410000, 6450000],
  [410000, 6440000],
  [400000, 6440000],
];
const COUNTERCLOCKWISE_HOLE: Position[] = [
  [403000, 6443000],
  [406000, 6443000],
  [406000, 6446000],
  [403000, 6446000],
  [403000, 6443000],
];

const LICENCE = {
  id: "etalab-2.0",
  name: "Licence Ouverte / Open Licence 2.0",
  url: "https://www.data.gouv.fr/pages/legal/licences/etalab-2.0",
  attribution: "Fixture publisher, fixture, 2026",
};

// ---------------------------------------------------------------------------------------------
// Minimal shapefile and DBF writers for fixtures (polygon type 5, character fields only).
// ---------------------------------------------------------------------------------------------

function writeShp(polygons: Position[][][]): Uint8Array {
  const records: Uint8Array[] = [];
  const total = [Infinity, Infinity, -Infinity, -Infinity];
  polygons.forEach((rings, index) => {
    const points = rings.flat();
    const box = [Infinity, Infinity, -Infinity, -Infinity];
    for (const [x, y] of points) {
      box[0] = Math.min(box[0], x);
      box[1] = Math.min(box[1], y);
      box[2] = Math.max(box[2], x);
      box[3] = Math.max(box[3], y);
    }
    box.forEach((value, boxIndex) => {
      total[boxIndex] =
        boxIndex < 2 ? Math.min(total[boxIndex], value) : Math.max(total[boxIndex], value);
    });
    const contentBytes = 4 + 32 + 4 + 4 + 4 * rings.length + 16 * points.length;
    const buffer = new ArrayBuffer(8 + contentBytes);
    const view = new DataView(buffer);
    view.setInt32(0, index + 1, false);
    view.setInt32(4, contentBytes / 2, false);
    view.setInt32(8, 5, true);
    box.forEach((value, boxIndex) => view.setFloat64(12 + boxIndex * 8, value, true));
    view.setInt32(44, rings.length, true);
    view.setInt32(48, points.length, true);
    let offset = 52;
    let start = 0;
    for (const ring of rings) {
      view.setInt32(offset, start, true);
      offset += 4;
      start += ring.length;
    }
    for (const [x, y] of points) {
      view.setFloat64(offset, x, true);
      view.setFloat64(offset + 8, y, true);
      offset += 16;
    }
    records.push(new Uint8Array(buffer));
  });
  const length = 100 + records.reduce((sum, record) => sum + record.length, 0);
  const file = new Uint8Array(length);
  const header = new DataView(file.buffer, 0, 100);
  header.setInt32(0, 9994, false);
  header.setInt32(24, length / 2, false);
  header.setInt32(28, 1000, true);
  header.setInt32(32, 5, true);
  total.forEach((value, boxIndex) => header.setFloat64(36 + boxIndex * 8, value, true));
  let offset = 100;
  for (const record of records) {
    file.set(record, offset);
    offset += record.length;
  }
  return file;
}

function writeDbf(
  fields: Array<{ name: string; length: number }>,
  rows: Array<Record<string, string>>,
): Uint8Array {
  const encoder = new TextEncoder();
  const headerLength = 32 + 32 * fields.length + 1;
  const recordLength = 1 + fields.reduce((sum, field) => sum + field.length, 0);
  const file = new Uint8Array(headerLength + recordLength * rows.length + 1);
  const view = new DataView(file.buffer);
  file[0] = 0x03;
  view.setUint32(4, rows.length, true);
  view.setUint16(8, headerLength, true);
  view.setUint16(10, recordLength, true);
  fields.forEach((field, index) => {
    const offset = 32 + index * 32;
    file.set(encoder.encode(field.name).slice(0, 11), offset);
    file[offset + 11] = "C".charCodeAt(0);
    file[offset + 16] = field.length;
  });
  file[32 + 32 * fields.length] = 0x0d;
  let offset = headerLength;
  for (const row of rows) {
    file[offset] = 0x20;
    let fieldOffset = offset + 1;
    for (const field of fields) {
      file.fill(0x20, fieldOffset, fieldOffset + field.length);
      const bytes = encoder.encode(row[field.name] ?? "");
      if (bytes.length > field.length) throw new Error(`fixture value too long for ${field.name}`);
      file.set(bytes, fieldOffset);
      fieldOffset += field.length;
    }
    offset += recordLength;
  }
  file[file.length - 1] = 0x1a;
  return file;
}

const DBF_FIELDS = [
  { name: "type_denom", length: 60 },
  { name: "id_app", length: 11 },
  { name: "app", length: 60 },
  { name: "id_denom", length: 11 },
  { name: "denom", length: 60 },
  { name: "signe", length: 10 },
];

interface FixtureRow {
  type_denom: string;
  denom: string;
  id_app?: string;
  app?: string;
  id_denom?: string;
  signe?: string;
  rings: Position[][];
}

function buildArchive(rows: FixtureRow[], prj = LAMBERT_93_WKT, cpg = "UTF-8"): Uint8Array {
  const encoder = new TextEncoder();
  return zipSync({
    "fixture.shp": writeShp(rows.map((row) => row.rings)),
    "fixture.dbf": writeDbf(
      DBF_FIELDS,
      rows.map((row) => ({
        type_denom: row.type_denom,
        denom: row.denom,
        id_app: row.id_app ?? "",
        app: row.app ?? "",
        id_denom: row.id_denom ?? "",
        signe: row.signe ?? "",
      })),
    ),
    "fixture.prj": encoder.encode(prj),
    "fixture.cpg": encoder.encode(cpg),
    "fixture.shx": new Uint8Array(100),
  });
}

const REGISTER_CSV = [
  "﻿signe_fr,signe_ue,id_categorie_produit,categorie,id_type_produit,classe_ue,secteur,id_appellation,appellation,id_denomination_geo,denomination,produit,idproduit,pro_etat,lib_etat,cvi_douane,reference_produit,comite_national,comite_regional,site_inao,delegation_territoriale_inao,date_extraction",
  'AOC  ,AOP  ,1,Vin tranquille,1,"Vins, et autres",VITICOLE,59,Pauillac,118,Pauillac,Pauillac rouge,1,2,Publié,,,CNAOV,,Bordeaux,5 Aquitaine,2025-12-31',
  'AOC  ,AOP  ,1,Vin tranquille,1,"Vins, et autres",VITICOLE,685,Côtes de Bordeaux,2079,Côtes de Bordeaux Blaye,Côtes de Bordeaux Blaye rouge,2,2,Publié,,,CNAOV,,Bordeaux,5 Aquitaine,2025-12-31',
  'AOC  ,AOP  ,1,Vin tranquille,1,"Vins, et autres",VITICOLE,685,Côtes de Bordeaux,2079,Côtes de Bordeaux Blaye,Côtes de Bordeaux Blaye blanc,3,2,Publié,,,CNAOV,,Bordeaux,5 Aquitaine,2025-12-31',
  "AOC  ,AOP  ,9,Fromage,2,Fromages,LAITIER,900,Valençay,901,Valençay,Valençay,4,2,Publié,,,CNAOP,,Tours,7 Val de Loire,2025-12-31",
  'AOC  ,AOP  ,1,Vin tranquille,1,"Vins, et autres",VITICOLE,901,Valençay,902,Valençay,Valençay rouge,5,2,Publié,,,CNAOV,,Tours,7 Val de Loire,2025-12-31',
  'AOC  ,AOP  ,1,Vin tranquille,1,"Vins, et autres",VITICOLE,905,Valençay,906,Valençay,Valençay blanc,6,2,Publié,,,CNAOV,,Tours,7 Val de Loire,2025-12-31',
  "",
].join("\r\n");

function entry(overrides: Partial<MappingEntry> = {}): MappingEntry {
  return {
    entity: "appellation.pauillac",
    id: "geo.appellation-area.pauillac",
    feature_key: {
      id_app: 59,
      id_denom: 118,
      signe: "AOC",
      type_denom: "appellation",
      app: "Pauillac",
      denom: "Pauillac",
    },
    review: { status: "published", notes: "Fixture review note." },
    ...overrides,
  };
}

function shapefileResource(
  zipBytes: Uint8Array,
  members: Array<{ name: string; bytes: number }>,
): ManifestResource {
  return {
    id: "fixture-shapes",
    storage: "cache",
    source_id: "source.inao-geographical-areas-2026",
    publisher: "INAO",
    title: "Fixture shapes",
    dataset_id: "dataset-fixture",
    dataset_url: "https://example.test/datasets/fixture",
    resource_id: "resource-fixture",
    url: "https://example.test/fixture.zip",
    filename: "fixture.zip",
    format: "shapefile-zip",
    bytes: zipBytes.length,
    sha256: sha256(zipBytes),
    release: "2026-10-26",
    retrieved_at: "2026-10-30",
    licence: { ...LICENCE, attribution: "INAO, fixture, édition du 26 octobre 2026" },
    encoding: "UTF-8",
    crs: {
      recognised: "IGNF:LAMB93",
      equivalent_epsg: "EPSG:2154",
      units: "metre",
      wkt: LAMBERT_93_WKT,
      proj_definition: LAMBERT_93_PROJ,
    },
    expected_extent_wgs84: [-6, 41, 10.5, 51.5],
    members,
  };
}

function registerResource(csv: string): ManifestResource {
  const bytes = new TextEncoder().encode(csv);
  return {
    id: "fixture-register",
    storage: "cache",
    source_id: "source.inao-siqo-product-register-2025",
    publisher: "INAO",
    title: "Fixture register",
    dataset_id: "dataset-register",
    dataset_url: "https://example.test/datasets/register",
    resource_id: "resource-register",
    url: "https://example.test/register.csv",
    filename: "register.csv",
    format: "csv",
    bytes: bytes.length,
    sha256: sha256(bytes),
    release: "2025-12-31",
    retrieved_at: "2026-10-30",
    licence: { ...LICENCE, attribution: "INAO, fixture register" },
    encoding: "UTF-8",
    delimiter: ",",
  };
}

async function writeFixtureRoot(options: {
  rows: FixtureRow[];
  entries: MappingEntry[];
  manifestWkt?: string;
  recordCount?: number;
}): Promise<string> {
  const root = await temporaryRoot();
  const zipBytes = buildArchive(options.rows);
  const bundle = openShapefileBundle(zipBytes);
  const shapes = shapefileResource(zipBytes, bundle.members);
  if (options.manifestWkt && shapes.crs) shapes.crs.wkt = options.manifestWkt;
  if (options.recordCount !== undefined) shapes.record_count = options.recordCount;
  const register = registerResource(REGISTER_CSV);
  const manifestFile = path.join(root, MANIFEST_RELATIVE_PATH);
  await mkdir(path.dirname(manifestFile), { recursive: true });
  await writeFile(
    manifestFile,
    stringifyYaml({ version: 1, resources: [shapes, register] }),
    "utf8",
  );
  const mappingFile = path.join(root, APPELLATION_MAPPING_RELATIVE_PATH);
  await mkdir(path.dirname(mappingFile), { recursive: true });
  await writeFile(
    mappingFile,
    stringifyYaml({
      resource: shapes.id,
      register: register.id,
      reviewed_at: "2026-10-30",
      entries: options.entries,
    }),
    "utf8",
  );
  for (const [resource, bytes] of [
    [shapes, zipBytes],
    [register, new TextEncoder().encode(REGISTER_CSV)],
  ] as const) {
    const file = resourcePathFor(root, resource);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, bytes);
  }
  return root;
}

// ---------------------------------------------------------------------------------------------
// Raw WFS response fixtures for orientation features
// ---------------------------------------------------------------------------------------------

function rawCollection(
  features: Array<{ id: string; geometry: unknown; properties: Record<string, unknown> }>,
  crsName = LAMBERT_93_URN,
): string {
  return JSON.stringify({
    type: "FeatureCollection",
    features: features.map((feature) => ({
      type: "Feature",
      id: feature.id,
      geometry: feature.geometry,
      geometry_name: "geometrie",
      properties: feature.properties,
    })),
    totalFeatures: features.length,
    numberMatched: features.length,
    numberReturned: features.length,
    timeStamp: "2026-10-30T12:00:00.000Z",
    crs: { type: "name", properties: { name: crsName } },
  });
}

const RIVER_RESPONSE = rawCollection([
  {
    id: "troncon_hydrographique.1",
    geometry: {
      type: "LineString",
      coordinates: [
        [400000, 6440000],
        [401000, 6441000],
        [402000, 6441500],
      ],
    },
    properties: { cleabs: "TRONHYDR0000000000000001", cpx_toponyme_de_cours_d_eau: "la Garonne" },
  },
  {
    id: "troncon_hydrographique.2",
    geometry: {
      type: "LineString",
      coordinates: [
        [402000, 6441500],
        [403000, 6442000],
      ],
    },
    properties: {
      cleabs: "TRONHYDR0000000000000002",
      cpx_toponyme_de_cours_d_eau: "Fleuve la Garonne",
    },
  },
]);

const LAKE_RESPONSE = rawCollection([
  {
    id: "plan_d_eau.1",
    geometry: { type: "MultiPolygon", coordinates: [[CLOCKWISE_SQUARE]] },
    properties: { cleabs: "PLANDEAU0000000000000001", toponyme: "Lac de Fixture", nature: "Lac" },
  },
]);

const PLACES_RESPONSE = rawCollection([
  {
    id: "chef_lieu_de_commune.1",
    geometry: { type: "Point", coordinates: [417227.90021551, 6421824.70475101] },
    properties: {
      cleabs: "CHFL_COM0000000000033063",
      nom_officiel: "Bordeaux",
      nom_du_chef_lieu: "Bordeaux",
      code_insee_de_la_commune: "33063",
    },
  },
  {
    id: "chef_lieu_de_commune.2",
    geometry: { type: "Point", coordinates: [404000, 6465000] },
    properties: {
      cleabs: "CHFL_COM0000000000033314",
      nom_officiel: "Pauillac",
      nom_du_chef_lieu: "Pauillac",
      code_insee_de_la_commune: "33314",
    },
  },
]);

function rawResource(
  id: string,
  text: string,
  overrides: Partial<ManifestResource> = {},
): ManifestResource {
  const bytes = new TextEncoder().encode(text);
  const parsed = JSON.parse(text) as { features: unknown[] };
  return {
    id,
    storage: "raw",
    source_id: "source.ign-bd-carto-v5-2026",
    publisher: "IGN",
    title: `Fixture ${id}`,
    dataset_id: "IGNF_FIXTURE",
    raw_directory: "fixture-ign",
    dataset_url: "https://example.test/datasets/ign",
    resource_id: "FIXTURE:layer",
    url: `https://example.test/wfs?TYPENAMES=FIXTURE%3Alayer&ID=${id}`,
    request: {
      service: "https://example.test/wfs",
      protocol: "WFS 2.0.0 GetFeature",
      typename: "FIXTURE:layer",
      output_format: "application/json",
      srs: "EPSG:2154",
      sort_by: "cleabs",
      cql_filter: "fixture",
      envelope: "bordeaux",
    },
    filename: `${id}.geojson`,
    format: "geojson",
    bytes: bytes.length,
    sha256: sha256(bytes),
    release: "2026-03-15",
    edition: "Fixture edition 2026-03-15",
    retrieved_at: "2026-10-30",
    licence: { ...LICENCE, attribution: "IGN, fixture, édition du 15 mars 2026" },
    encoding: "UTF-8",
    crs: {
      recognised: "EPSG:2154",
      equivalent_epsg: "EPSG:2154",
      units: "metre",
      urn: LAMBERT_93_URN,
      proj_definition: LAMBERT_93_PROJ,
    },
    expected_extent_wgs84: [-6, 41, 10.5, 51.5],
    feature_count: parsed.features.length,
    ...overrides,
  };
}

function orientationEntry(overrides: Partial<OrientationEntry> = {}): OrientationEntry {
  return {
    id: "geo.river.garonne",
    kind: "river",
    names: { nl: "Garonne", en: "Garonne" },
    resource: "fixture-river",
    select: {
      property: "cpx_toponyme_de_cours_d_eau",
      values: ["la Garonne", "Fleuve la Garonne"],
    },
    geometry: "MultiLineString",
    meaning: "watercourse-centreline-segments",
    review: { status: "published", notes: "Fixture river note." },
    ...overrides,
  };
}

async function writeOrientationRoot(options: {
  resources: Array<{ resource: ManifestResource; text: string }>;
  entries: OrientationEntry[];
}): Promise<string> {
  const root = await temporaryRoot();
  const manifestFile = path.join(root, MANIFEST_RELATIVE_PATH);
  await mkdir(path.dirname(manifestFile), { recursive: true });
  await writeFile(
    manifestFile,
    stringifyYaml({
      version: 1,
      envelopes: {
        bordeaux: {
          wgs84: [-1.5, 44.1, 0.55, 45.8],
          lambert93: [339900, 6336487, 509729, 6532221],
        },
      },
      resources: options.resources.map((item) => item.resource),
    }),
    "utf8",
  );
  const mappingFile = path.join(root, ORIENTATION_MAPPING_RELATIVE_PATH);
  await mkdir(path.dirname(mappingFile), { recursive: true });
  await writeFile(
    mappingFile,
    stringifyYaml({ reviewed_at: "2026-10-30", entries: options.entries }),
    "utf8",
  );
  for (const item of options.resources) {
    const file = resourcePathFor(root, item.resource);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, item.text, "utf8");
  }
  return root;
}

// ---------------------------------------------------------------------------------------------

describe("ring validation", () => {
  it("accepts a simple closed ring with a hole inside", () => {
    const geometry: AreaGeometry = {
      type: "Polygon",
      coordinates: [CLOCKWISE_SQUARE, COUNTERCLOCKWISE_HOLE],
    };
    expect(validateAreaGeometry(geometry, "fixture")).toEqual([]);
  });

  it("refuses unclosed, short, non-finite, duplicated and zero-area rings", () => {
    const open: AreaGeometry = { type: "Polygon", coordinates: [CLOCKWISE_SQUARE.slice(0, 4)] };
    expect(validateAreaGeometry(open, "fixture")).toEqual([
      "fixture: Polygon ring 0 is not closed",
    ]);
    const short: AreaGeometry = { type: "Polygon", coordinates: [CLOCKWISE_SQUARE.slice(0, 3)] };
    expect(validateAreaGeometry(short, "fixture")[0]).toMatch(/fewer than four positions/);
    const nan: AreaGeometry = {
      type: "Polygon",
      coordinates: [
        [
          [0, 0],
          [1, Number.NaN],
          [1, 1],
          [0, 0],
        ],
      ],
    };
    expect(validateAreaGeometry(nan, "fixture")[0]).toMatch(/non-finite/);
    const duplicated: AreaGeometry = {
      type: "Polygon",
      coordinates: [
        [
          [0, 0],
          [1, 0],
          [1, 0],
          [1, 1],
          [0, 0],
        ],
      ],
    };
    expect(validateAreaGeometry(duplicated, "fixture")[0]).toMatch(/repeats position 1 at 2/);
    const flat: AreaGeometry = {
      type: "Polygon",
      coordinates: [
        [
          [0, 0],
          [1, 1],
          [2, 2],
          [0, 0],
        ],
      ],
    };
    expect(validateAreaGeometry(flat, "fixture")[0]).toMatch(/zero area/);
  });

  it("refuses a bow-tie and a ring that touches itself", () => {
    // Asymmetric so the two lobes do not cancel to a zero signed area.
    const bowTie: Position[] = [
      [0, 0],
      [10, 10],
      [10, 0],
      [0, 6],
      [0, 0],
    ];
    expect(planarSignedArea(bowTie)).not.toBe(0);
    expect(findRingSelfIntersection(bowTie)).toEqual([0, 2]);
    expect(validateAreaGeometry({ type: "Polygon", coordinates: [bowTie] }, "fixture")[0]).toMatch(
      /not simple/,
    );
    const pinched: Position[] = [
      [0, 0],
      [4, 0],
      [4, 4],
      [2, 2],
      [0, 4],
      [2, 2],
      [0, 0],
    ];
    expect(findRingSelfIntersection(pinched)).not.toBeNull();
    expect(findRingSelfIntersection(CLOCKWISE_SQUARE)).toBeNull();
  });

  it("refuses a hole outside its exterior ring and unsupported types", () => {
    const outside: Position[] = [
      [500000, 6500000],
      [500100, 6500000],
      [500100, 6500100],
      [500000, 6500100],
      [500000, 6500000],
    ];
    const geometry: AreaGeometry = { type: "Polygon", coordinates: [CLOCKWISE_SQUARE, outside] };
    expect(validateAreaGeometry(geometry, "fixture")).toEqual([
      "fixture: Polygon ring 1 is a hole with a vertex [500000, 6500000] outside its exterior ring",
    ]);
    // A hole that touches the exterior ring at a vertex and along an edge is still inside it.
    const touching: Position[] = [
      [400000, 6440000],
      [402000, 6440000],
      [402000, 6442000],
      [400000, 6442000],
      [400000, 6440000],
    ];
    expect(
      validateAreaGeometry(
        { type: "Polygon", coordinates: [CLOCKWISE_SQUARE, touching] },
        "fixture",
      ),
    ).toEqual([]);
    const crossing: Position[] = [
      [399000, 6440000],
      [402000, 6440000],
      [402000, 6442000],
      [399000, 6442000],
      [399000, 6440000],
    ];
    expect(
      validateAreaGeometry(
        { type: "Polygon", coordinates: [CLOCKWISE_SQUARE, crossing] },
        "fixture",
      )[0],
    ).toMatch(/hole with a vertex \[399000, 6440000\] outside/);
    expect(validateAreaGeometry({ type: "Point", coordinates: [1, 2] }, "fixture")[0]).toMatch(
      /not Polygon or MultiPolygon/,
    );
    expect(validateAreaGeometry(null, "fixture")).toEqual(["fixture: geometry is empty"]);
  });

  it("refuses a hole whose edges cross a concave exterior although every vertex lies inside", () => {
    // A U-shaped exterior; the hole has its vertices in both arms and spans the notch.
    const exterior: Position[] = [
      [0, 0],
      [10, 0],
      [10, 10],
      [7, 10],
      [7, 3],
      [3, 3],
      [3, 10],
      [0, 10],
      [0, 0],
    ];
    const spanning: Position[] = [
      [1, 5],
      [1, 6],
      [9, 6],
      [9, 5],
      [1, 5],
    ];
    expect(findRingCrossing(exterior, spanning)).not.toBeNull();
    const issues = validateAreaGeometry(
      { type: "Polygon", coordinates: [exterior, spanning] },
      "fixture",
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatch(/ring 1 is a hole whose segment \d+ crosses exterior segment \d+/);
  });

  it("refuses two holes that overlap without either containing a vertex of the other", () => {
    const exterior: Position[] = [
      [0, 0],
      [20, 0],
      [20, 20],
      [0, 20],
      [0, 0],
    ];
    const wide: Position[] = [
      [5, 8],
      [5, 12],
      [15, 12],
      [15, 8],
      [5, 8],
    ];
    const tall: Position[] = [
      [8, 5],
      [8, 15],
      [12, 15],
      [12, 5],
      [8, 5],
    ];
    const issues = validateAreaGeometry(
      { type: "Polygon", coordinates: [exterior, wide, tall] },
      "fixture",
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatch(/rings 1 and 2 are holes that cross each other/);
  });

  it("allows holes that only touch the exterior or each other at a vertex or along an edge", () => {
    const exterior: Position[] = [
      [0, 0],
      [20, 0],
      [20, 20],
      [0, 20],
      [0, 0],
    ];
    // Touches the exterior along part of its bottom edge, like the Moulis-en-Médoc slivers.
    const onEdge: Position[] = [
      [2, 0],
      [2, 3],
      [6, 3],
      [6, 0],
      [2, 0],
    ];
    const first: Position[] = [
      [8, 8],
      [8, 12],
      [12, 12],
      [12, 8],
      [8, 8],
    ];
    // Shares only the vertex [12, 12] with the first hole.
    const second: Position[] = [
      [12, 12],
      [12, 16],
      [16, 16],
      [16, 12],
      [12, 12],
    ];
    expect(findRingCrossing(exterior, onEdge)).toBeNull();
    expect(findRingCrossing(first, second)).toBeNull();
    expect(
      validateAreaGeometry(
        { type: "Polygon", coordinates: [exterior, onEdge, first, second] },
        "fixture",
      ),
    ).toEqual([]);
  });
});

describe("line and point validation", () => {
  it("accepts lines with at least two finite distinct positions", () => {
    expect(
      validateLineGeometry(
        {
          type: "MultiLineString",
          coordinates: [
            [
              [0, 0],
              [1, 1],
            ],
            [
              [2, 2],
              [3, 3],
              [4, 4],
            ],
          ],
        },
        "fixture",
      ),
    ).toEqual([]);
  });

  it("refuses short, non-finite and repeated line positions and wrong types", () => {
    expect(
      validateLineGeometry({ type: "LineString", coordinates: [[0, 0]] }, "fixture")[0],
    ).toMatch(/fewer than two positions/);
    expect(
      validateLineGeometry(
        {
          type: "LineString",
          coordinates: [
            [0, 0],
            [1, Number.POSITIVE_INFINITY],
          ],
        },
        "fixture",
      )[0],
    ).toMatch(/non-finite/);
    expect(
      validateLineGeometry(
        {
          type: "MultiLineString",
          coordinates: [
            [
              [0, 0],
              [0, 0],
              [1, 1],
            ],
          ],
        },
        "fixture",
      )[0],
    ).toMatch(/line 0 repeats position 0 at 1/);
    expect(validateLineGeometry({ type: "Polygon", coordinates: [] }, "fixture")[0]).toMatch(
      /not LineString or MultiLineString/,
    );
    expect(
      validatePointGeometry({ type: "Point", coordinates: [1, Number.NaN] }, "fixture")[0],
    ).toMatch(/not a finite/);
    expect(validatePointGeometry({ type: "Point", coordinates: [1, 2] }, "fixture")).toEqual([]);
  });
});

describe("ring orientation", () => {
  it("reverses clockwise exteriors and counterclockwise holes without changing coordinates", () => {
    const geometry: AreaGeometry = {
      type: "MultiPolygon",
      coordinates: [
        [
          CLOCKWISE_SQUARE.map((p) => [...p] as Position),
          COUNTERCLOCKWISE_HOLE.map((p) => [...p] as Position),
        ],
      ],
    };
    expect(planarSignedArea(geometry.coordinates[0][0])).toBeLessThan(0);
    expect(enforceRfc7946Orientation(geometry)).toBe(2);
    expect(planarSignedArea(geometry.coordinates[0][0])).toBeGreaterThan(0);
    expect(planarSignedArea(geometry.coordinates[0][1])).toBeLessThan(0);
    expect(geometry.coordinates[0][0]).toEqual([...CLOCKWISE_SQUARE].reverse());
    expect(geometry.coordinates[0][1]).toEqual([...COUNTERCLOCKWISE_HOLE].reverse());
    expect(enforceRfc7946Orientation(geometry)).toBe(0);
  });
});

describe("projection", () => {
  it("returns longitude before latitude from the Lambert-93 WKT", () => {
    const projection = createProjection(LAMBERT_93_WKT);
    const [lon, lat] = projection.forward([700000, 6600000]);
    expect(lon).toBeCloseTo(3, 9);
    expect(lat).toBeCloseTo(46.5, 9);
    // Independent Lambert conformal conic (EPSG method 9802) evaluation of the same point.
    const [lon2, lat2] = projection.forward([404079.9500000007, 6435502.018998022]);
    expect(lon2).toBeCloseTo(-0.753787657, 8);
    expect(lat2).toBeCloseTo(44.9554124173, 8);
    const [x, y] = projection.inverse([lon2, lat2]);
    expect(x).toBeCloseTo(404079.9500000007, 3);
    expect(y).toBeCloseTo(6435502.018998022, 3);
  });

  it("agrees with the PROJ definition of EPSG:2154 and detects a different projection", () => {
    const wkt = createProjection(LAMBERT_93_WKT);
    const bbox: [number, number, number, number] = [370000, 6360000, 490000, 6510000];
    expect(projectionDisagreement(wkt, createProjection(LAMBERT_93_PROJ), bbox)).toBeLessThan(1e-9);
    const other = createProjection(LAMBERT_93_PROJ.replace("+lat_1=49", "+lat_1=48"));
    expect(projectionDisagreement(wkt, other, bbox)).toBeGreaterThan(1e-4);
  });

  it("rounds to the fixed precision", () => {
    expect(roundPosition([-0.123456789123, 44.987654321987])).toEqual([-0.12345679, 44.98765432]);
    expect(COORDINATE_DECIMALS).toBe(8);
    const [lon, lat] = roundPosition([-0.000000001, -0.0000000049]);
    expect(Object.is(lon, 0)).toBe(true);
    expect(Object.is(lat, 0)).toBe(true);
  });
});

describe("source matching", () => {
  function index(
    rows: Array<{ type_denom: string; denom: string; id_app?: number | null; app?: string | null }>,
  ): SourceIndex {
    const counts = new Map<string, number>();
    const retained = new Map<string, ReturnType<SourceIndex["rows"]["get"]>>();
    rows.forEach((row, position) => {
      const key = sourceRowKey(row.type_denom, row.denom);
      counts.set(key, (counts.get(key) ?? 0) + 1);
      retained.set(key, [
        ...(retained.get(key) ?? []),
        {
          index: position,
          properties: {
            type_denom: row.type_denom,
            denom: row.denom,
            id_app: row.id_app ?? null,
            app: row.app ?? null,
            id_denom: null,
            signe: null,
          },
          geometry: { type: "Polygon", coordinates: [CLOCKWISE_SQUARE] },
        },
      ]);
    });
    return {
      recordCount: rows.length,
      counts,
      rows: retained as SourceIndex["rows"],
      nativeBbox: [0, 0, 1, 1],
    };
  }

  it("fails on a missing record", () => {
    expect(() =>
      matchSourceRow(entry(), index([{ type_denom: "appellation", denom: "Margaux" }])),
    ).toThrow(/no source record has type_denom 'appellation' and denom 'Pauillac'/);
  });

  it("fails on duplicate records", () => {
    const duplicated = index([
      { type_denom: "appellation", denom: "Pauillac" },
      { type_denom: "appellation", denom: "Pauillac" },
    ]);
    expect(() => matchSourceRow(entry(), duplicated)).toThrow(/2 source records share/);
  });

  it("fails when a present key field contradicts the mapping", () => {
    const wrong = index([
      { type_denom: "appellation", denom: "Pauillac", id_app: 60, app: "Pauillac" },
    ]);
    expect(() => matchSourceRow(entry(), wrong)).toThrow(
      /id_app: source has '60', mapping expects '59'/,
    );
  });

  it("records which key fields were verified and which are blank in the edition", () => {
    const partial = index([
      { type_denom: "appellation", denom: "Pauillac", id_app: 59, app: null },
    ]);
    const match = matchSourceRow(entry(), partial);
    expect(match.verifiedFields).toEqual(["type_denom", "denom", "id_app"]);
    expect(match.absentFields).toEqual(["id_denom", "app", "signe"]);
  });
});

describe("product register", () => {
  it("parses quoted fields, CRLF rows and a byte-order mark", () => {
    const rows = parseCsv('﻿a,b\r\n1,"x, ""y"""\r\n2,z\r\n');
    expect(rows).toEqual([
      ["a", "b"],
      ["1", 'x, "y"'],
      ["2", "z"],
    ]);
  });

  it("confirms an id pair with its labels and sign", () => {
    const register = indexRegister(REGISTER_CSV);
    expect(verifyAgainstRegister(entry(), register)).toEqual([]);
    const blaye = entry({
      entity: "appellation.blaye-cotes-de-bordeaux",
      id: "geo.appellation-area.blaye-cotes-de-bordeaux",
      feature_key: {
        id_app: 685,
        id_denom: 2079,
        signe: "AOC",
        type_denom: "dénomination géographique complémentaire",
        app: "Côtes de Bordeaux",
        denom: "Côtes de Bordeaux Blaye",
      },
    });
    expect(verifyAgainstRegister(blaye, register)).toEqual([]);
  });

  it("reports unknown pairs, label differences and ambiguous labels", () => {
    const register = indexRegister(REGISTER_CSV);
    expect(
      verifyAgainstRegister(
        entry({ feature_key: { ...entry().feature_key, id_denom: 119 } }),
        register,
      )[0],
    ).toMatch(/no row for id_appellation 59 \/ id_denomination_geo 119/);
    expect(
      verifyAgainstRegister(
        entry({ feature_key: { ...entry().feature_key, app: "Pauilac" } }),
        register,
      )[0],
    ).toMatch(/register appellation 'Pauillac' differs from expected 'Pauilac'/);
    const valencay = entry({
      entity: "appellation.valencay",
      id: "geo.appellation-area.valencay",
      feature_key: {
        id_app: 901,
        id_denom: 902,
        signe: "AOC",
        type_denom: "appellation",
        app: "Valençay",
        denom: "Valençay",
      },
    });
    expect(verifyAgainstRegister(valencay, register).join("\n")).toMatch(
      /label alone is ambiguous/,
    );
  });
});

describe("shapefile reading", () => {
  it("reads a UTF-8 DBF from the archive and counts every key", async () => {
    const zipBytes = buildArchive([
      { type_denom: "appellation", denom: "Pauillac", rings: [CLOCKWISE_SQUARE] },
      {
        type_denom: "dénomination géographique complémentaire",
        denom: "Côtes de Bordeaux Blaye",
        rings: [CLOCKWISE_SQUARE, COUNTERCLOCKWISE_HOLE],
      },
      { type_denom: "appellation", denom: "Margaux", rings: [CLOCKWISE_SQUARE] },
      { type_denom: "appellation", denom: "Margaux", rings: [CLOCKWISE_SQUARE] },
    ]);
    const bundle = openShapefileBundle(zipBytes);
    expect(bundle.prj).toBe(LAMBERT_93_WKT);
    expect(bundle.cpg).toBe("UTF-8");
    expect(bundle.members.map((member) => member.name)).toEqual([
      "fixture.cpg",
      "fixture.dbf",
      "fixture.prj",
      "fixture.shp",
      "fixture.shx",
    ]);
    const wanted = new Set([
      sourceRowKey("dénomination géographique complémentaire", "Côtes de Bordeaux Blaye"),
    ]);
    const index = await indexSourceRows(bundle, "UTF-8", wanted);
    expect(index.recordCount).toBe(4);
    expect(index.counts.get(sourceRowKey("appellation", "Margaux"))).toBe(2);
    const [row] = index.rows.get(Array.from(wanted)[0]) ?? [];
    expect(row?.index).toBe(1);
    expect(row?.properties.id_app).toBeNull();
    expect(row?.geometry?.type).toBe("Polygon");
    expect((row?.geometry as AreaGeometry).coordinates).toHaveLength(2);
  });

  it("refuses an archive without exactly one shapefile member set", () => {
    const zipBytes = zipSync({
      "a.shp": new Uint8Array(100),
      "b.shp": new Uint8Array(100),
      "a.dbf": new Uint8Array(40),
      "a.prj": new Uint8Array(1),
      "a.cpg": new Uint8Array(1),
    });
    expect(() => openShapefileBundle(zipBytes)).toThrow(/exactly one .shp member; found 2/);
  });
});

describe("record building", () => {
  async function context(overrides: Partial<BuildContext> = {}): Promise<BuildContext> {
    const zipBytes = buildArchive([]);
    const resource = shapefileResource(zipBytes, []);
    const register = registerResource(REGISTER_CSV);
    const mapping = {
      resource: resource.id,
      register: register.id,
      reviewed_at: "2026-10-30",
      entries: [entry()],
    };
    return {
      manifest: { version: 1, resources: [resource, register] },
      resource,
      registerResource: register,
      mapping,
      projection: createProjection(LAMBERT_93_WKT),
      tools: await readToolVersions(),
      formatJson: async (text) => `${text}\n`,
      formatYaml: async (text) => text,
      ...overrides,
    };
  }

  it("builds a record whose checksum, vertex count, bbox, orientation and steps match the GeoJSON", async () => {
    const built = await buildImportedFeature(await context(), entry(), {
      row: {
        index: 7,
        properties: {
          type_denom: "appellation",
          denom: "Pauillac",
          id_app: null,
          id_denom: null,
          app: null,
          signe: null,
        },
        geometry: { type: "Polygon", coordinates: [CLOCKWISE_SQUARE, COUNTERCLOCKWISE_HOLE] },
      },
      verifiedFields: ["type_denom", "denom"],
      absentFields: ["id_app", "id_denom", "app", "signe"],
    });
    expect(built.record.geometry.sha256).toBe(sha256(built.geojsonText));
    expect(built.record.geometry.vertex_count).toBe(10);
    expect(built.reversedRings).toBe(2);
    const feature = JSON.parse(built.geojsonText) as { geometry: AreaGeometry; bbox: number[] };
    expect(planarSignedArea(feature.geometry.coordinates[0] as Position[])).toBeGreaterThan(0);
    expect(planarSignedArea(feature.geometry.coordinates[1] as Position[])).toBeLessThan(0);
    expect(feature.bbox).toEqual(built.record.geometry.bbox);
    expect(built.record.geometry.bbox[1]).toBeGreaterThan(44);
    expect(built.record.transformation).toEqual([
      {
        step: "reproject",
        from: "EPSG:2154",
        to: "EPSG:4326",
        axis_order: "lon-lat",
        tool: expect.stringMatching(/^proj4@\d/),
      },
      { step: "ring-orientation", convention: "rfc7946" },
      { step: "coordinate-precision", decimals: 8, unit: "degree" },
    ]);
    expect(built.record.review.notes).toMatch(/blank in every record of this edition/);
    expect(built.record.review.notes).toMatch(/Fixture review note\.$/);
    expect(geographyRecordSchema.safeParse(built.record).success).toBe(true);
    expect(parseYaml(stringifyRecord(built.record))).toEqual(built.record);
    for (const ring of feature.geometry.coordinates as Position[][]) {
      for (const [lon, lat] of ring) {
        expect(lon).toBe(Number(lon.toFixed(COORDINATE_DECIMALS)));
        expect(lat).toBe(Number(lat.toFixed(COORDINATE_DECIMALS)));
      }
    }
  });

  it("refuses corrupted source geometry", async () => {
    const ctx = await context();
    const match = (geometry: unknown) => ({
      row: {
        index: 0,
        properties: { type_denom: "appellation", denom: "Pauillac" },
        geometry: geometry as AreaGeometry,
      },
      verifiedFields: ["type_denom", "denom"],
      absentFields: [],
    });
    await expect(
      buildImportedFeature(
        ctx,
        entry(),
        match({ type: "Polygon", coordinates: [CLOCKWISE_SQUARE.slice(0, 4)] }),
      ),
    ).rejects.toThrow(/not closed/);
    await expect(
      buildImportedFeature(
        ctx,
        entry(),
        match({
          type: "Polygon",
          coordinates: [
            [
              [0, 0],
              [10, 10],
              [10, 0],
              [0, 6],
              [0, 0],
            ],
          ],
        }),
      ),
    ).rejects.toThrow(/not simple/);
    await expect(buildImportedFeature(ctx, entry(), match(null))).rejects.toThrow(
      /geometry is empty/,
    );
  });

  it("refuses positions outside the expected extent, which signals a CRS or axis mistake", async () => {
    const ctx = await context({
      projection: { forward: ([x, y]) => [y / 1e5, x / 1e5], inverse: (p) => p },
    });
    await expect(
      buildImportedFeature(ctx, entry(), {
        row: {
          index: 0,
          properties: {},
          geometry: { type: "Polygon", coordinates: [CLOCKWISE_SQUARE] },
        },
        verifiedFields: [],
        absentFields: [],
      }),
    ).rejects.toThrow(/outside the expected extent/);
  });
});

describe("importAppellationAreas", () => {
  const rows: FixtureRow[] = [
    {
      type_denom: "appellation",
      denom: "Pauillac",
      rings: [CLOCKWISE_SQUARE, COUNTERCLOCKWISE_HOLE],
    },
    {
      type_denom: "dénomination géographique complémentaire",
      denom: "Côtes de Bordeaux Blaye",
      rings: [CLOCKWISE_SQUARE],
    },
  ];

  it("writes canonical records atomically and reports them unchanged on the next run", async () => {
    const root = await writeFixtureRoot({ rows, entries: [entry()], recordCount: 2 });
    const lines: string[] = [];
    const summary = await importAppellationAreas(root, { log: (line) => lines.push(line) });
    expect(summary.written).toEqual([{ id: "geo.appellation-area.pauillac", outcome: "created" }]);
    const directory = path.join(root, "data", "geography", "features", "appellation-area");
    expect(await readdir(directory)).toEqual([
      "geo.appellation-area.pauillac.geojson",
      "geo.appellation-area.pauillac.yaml",
    ]);
    const yamlText = await readFile(
      path.join(directory, "geo.appellation-area.pauillac.yaml"),
      "utf8",
    );
    const record = geographyRecordSchema.parse(parseYaml(yamlText));
    const geojson = await readFile(path.join(directory, "geo.appellation-area.pauillac.geojson"));
    expect(record.geometry.sha256).toBe(sha256(geojson));
    expect(record.source.feature_key).toEqual({
      id_app: 59,
      id_denom: 118,
      signe: "AOC",
      type_denom: "appellation",
      app: "Pauillac",
      denom: "Pauillac",
    });
    expect(record.source.resource_sha256).toBe(summary.resource.sha256);
    expect(lines.some((line) => line.startsWith("checked   PRJ equals"))).toBe(true);
    const again = await importAppellationAreas(root, { dryRun: true });
    expect(again.written).toEqual([{ id: "geo.appellation-area.pauillac", outcome: "unchanged" }]);
  });

  it("writes nothing when one entry fails", async () => {
    const root = await writeFixtureRoot({
      rows,
      entries: [
        entry(),
        entry({
          entity: "appellation.margaux",
          id: "geo.appellation-area.margaux",
          feature_key: {
            id_app: 52,
            id_denom: 111,
            signe: "AOC",
            type_denom: "appellation",
            app: "Margaux",
            denom: "Margaux",
          },
        }),
      ],
    });
    await expect(importAppellationAreas(root)).rejects.toThrow(
      /1 of 2 entries failed; nothing was written/,
    );
    await expect(
      readdir(path.join(root, "data", "geography", "features", "appellation-area")),
    ).rejects.toThrow();
  });

  it("refuses a PRJ that differs from the pinned WKT", async () => {
    const root = await writeFixtureRoot({
      rows,
      entries: [entry()],
      manifestWkt: LAMBERT_93_WKT.replace("44.0", "44.5"),
    });
    await expect(importAppellationAreas(root)).rejects.toThrow(
      /PRJ member differs from the WKT pinned/,
    );
  });

  it("refuses a cache file that is not the pinned one", async () => {
    const root = await writeFixtureRoot({ rows, entries: [entry()] });
    const manifestFile = path.join(root, MANIFEST_RELATIVE_PATH);
    const manifest = parseYaml(await readFile(manifestFile, "utf8")) as {
      resources: ManifestResource[];
    };
    manifest.resources[0].sha256 = "0".repeat(64);
    await writeFile(manifestFile, stringifyYaml(manifest), "utf8");
    await expect(importAppellationAreas(root)).rejects.toThrow(
      /not the pinned file; run 'npm run geography:fetch' first/,
    );
  });

  it("refuses a record count that differs from the manifest", async () => {
    const root = await writeFixtureRoot({ rows, entries: [entry()], recordCount: 3 });
    await expect(importAppellationAreas(root)).rejects.toThrow(
      /has 2 records, the manifest pins 3/,
    );
  });
});

describe("cleabs order of a committed response", () => {
  const feature = (cleabs: unknown): RawFeature => ({
    type: "Feature",
    geometry: { type: "Point", coordinates: [0, 0] },
    properties: cleabs === undefined ? {} : { cleabs },
  });

  it("accepts strictly increasing cleabs identifiers", () => {
    expect(() =>
      assertCleabsOrder("fixture", [
        feature("TRON0000000000000001"),
        feature("TRON0000000000000002"),
        feature("TRON0000000000000010"),
      ]),
    ).not.toThrow();
  });

  it("refuses a response out of cleabs order, with a repeated or a missing identifier", () => {
    expect(() =>
      assertCleabsOrder("fixture", [
        feature("TRON0000000000000002"),
        feature("TRON0000000000000001"),
      ]),
    ).toThrow(/not in strictly increasing cleabs order/);
    expect(() =>
      assertCleabsOrder("fixture", [
        feature("TRON0000000000000001"),
        feature("TRON0000000000000001"),
      ]),
    ).toThrow(/not in strictly increasing cleabs order/);
    expect(() => assertCleabsOrder("fixture", [feature(undefined)])).toThrow(
      /feature 0 has no cleabs identifier/,
    );
  });
});

describe("importOrientationFeatures", () => {
  const resources = () => [
    { resource: rawResource("fixture-river", RIVER_RESPONSE), text: RIVER_RESPONSE },
    { resource: rawResource("fixture-lake", LAKE_RESPONSE), text: LAKE_RESPONSE },
    { resource: rawResource("fixture-places", PLACES_RESPONSE), text: PLACES_RESPONSE },
  ];
  const lake = (): OrientationEntry =>
    orientationEntry({
      id: "geo.water-body.lac-de-fixture",
      kind: "water-body",
      names: { nl: "Lac de Fixture", en: "Lac de Fixture" },
      resource: "fixture-lake",
      select: {
        property: "toponyme",
        values: ["Lac de Fixture"],
        cleabs: "PLANDEAU0000000000000001",
      },
      geometry: "MultiPolygon",
      meaning: "lake-water-surface",
      review: { status: "published", notes: "Fixture lake note." },
    });
  const place = (): OrientationEntry =>
    orientationEntry({
      id: "geo.populated-place.pauillac",
      kind: "populated-place",
      names: { nl: "Pauillac", en: "Pauillac" },
      resource: "fixture-places",
      select: {
        property: "code_insee_de_la_commune",
        values: ["33314"],
        expect: { nom_officiel: "Pauillac", nom_du_chef_lieu: "Pauillac" },
      },
      geometry: "Point",
      meaning: "commune-chef-lieu",
      review: { status: "published", notes: "Fixture place note." },
    });

  it("writes river, water-body and populated-place records from committed responses", async () => {
    const root = await writeOrientationRoot({
      resources: resources(),
      entries: [orientationEntry(), lake(), place()],
    });
    const summary = await importOrientationFeatures(root);
    expect(summary.written.map((item) => item.outcome)).toEqual(["created", "created", "created"]);
    const features = path.join(root, "data", "geography", "features");
    expect((await readdir(features)).sort()).toEqual(["populated-place", "river", "water-body"]);

    const river = geographyRecordSchema.parse(
      parseYaml(await readFile(path.join(features, "river", "geo.river.garonne.yaml"), "utf8")),
    );
    expect(river.names).toEqual({ nl: "Garonne", en: "Garonne" });
    expect(river.owner).toBeUndefined();
    expect(river.geometry.type).toBe("MultiLineString");
    expect(river.geometry.vertex_count).toBe(5);
    expect(river.transformation.map((step) => step.step)).toEqual([
      "reproject",
      "coordinate-precision",
    ]);
    expect(river.source.feature_key).toMatchObject({
      layer: "FIXTURE:layer",
      property: "cpx_toponyme_de_cours_d_eau",
      values: "la Garonne | Fleuve la Garonne",
      feature_count: 2,
    });
    expect(river.review.notes).toMatch(/all 2 features with cpx_toponyme_de_cours_d_eau/);
    expect(river.review.notes).toMatch(/Fixture river note\.$/);
    const riverGeojson = await readFile(path.join(features, "river", "geo.river.garonne.geojson"));
    expect(river.geometry.sha256).toBe(sha256(riverGeojson));
    const riverFeature = JSON.parse(riverGeojson.toString("utf8")) as {
      properties: Record<string, string>;
      geometry: { coordinates: Position[][] };
    };
    expect(riverFeature.properties).toEqual({
      id: "geo.river.garonne",
      kind: "river",
      name_nl: "Garonne",
      name_en: "Garonne",
    });
    expect(riverFeature.geometry.coordinates).toHaveLength(2);

    const water = geographyRecordSchema.parse(
      parseYaml(
        await readFile(
          path.join(features, "water-body", "geo.water-body.lac-de-fixture.yaml"),
          "utf8",
        ),
      ),
    );
    expect(water.geometry.type).toBe("MultiPolygon");
    expect(water.transformation.map((step) => step.step)).toEqual([
      "reproject",
      "ring-orientation",
      "coordinate-precision",
    ]);
    expect(water.source.feature_key).toMatchObject({ cleabs: "PLANDEAU0000000000000001" });

    const point = geographyRecordSchema.parse(
      parseYaml(
        await readFile(
          path.join(features, "populated-place", "geo.populated-place.pauillac.yaml"),
          "utf8",
        ),
      ),
    );
    expect(point.geometry.type).toBe("Point");
    expect(point.geometry.vertex_count).toBe(1);
    expect(point.source.feature_key).toMatchObject({
      property: "code_insee_de_la_commune",
      values: "33314",
      nom_officiel: "Pauillac",
      nom_du_chef_lieu: "Pauillac",
      cleabs: "CHFL_COM0000000000033314",
    });
    const pointGeojson = JSON.parse(
      await readFile(
        path.join(features, "populated-place", "geo.populated-place.pauillac.geojson"),
        "utf8",
      ),
    ) as { geometry: { coordinates: Position } };
    expect(pointGeojson.geometry.coordinates[0]).toBeLessThan(pointGeojson.geometry.coordinates[1]);
    expect(pointGeojson.geometry.coordinates[1]).toBeGreaterThan(45);

    const again = await importOrientationFeatures(root, { dryRun: true });
    expect(again.written.map((item) => item.outcome)).toEqual([
      "unchanged",
      "unchanged",
      "unchanged",
    ]);
  });

  it("refuses a response whose crs differs from the pinned urn", async () => {
    const text = rawCollection([], "urn:ogc:def:crs:EPSG::4326");
    const root = await writeOrientationRoot({
      resources: [{ resource: rawResource("fixture-river", text), text }],
      entries: [orientationEntry()],
    });
    await expect(importOrientationFeatures(root)).rejects.toThrow(
      /declares crs 'urn:ogc:def:crs:EPSG::4326'/,
    );
  });

  it("refuses a response with features outside the selection rule, a wrong expected name and a tampered file", async () => {
    const mixed = rawCollection([
      {
        id: "t.1",
        geometry: {
          type: "LineString",
          coordinates: [
            [400000, 6440000],
            [401000, 6441000],
          ],
        },
        properties: { cleabs: "A", cpx_toponyme_de_cours_d_eau: "la Garonne" },
      },
      {
        id: "t.2",
        geometry: {
          type: "LineString",
          coordinates: [
            [402000, 6440000],
            [403000, 6441000],
          ],
        },
        properties: { cleabs: "B", cpx_toponyme_de_cours_d_eau: "la Dordogne" },
      },
    ]);
    const outside = await writeOrientationRoot({
      resources: [{ resource: rawResource("fixture-river", mixed), text: mixed }],
      entries: [orientationEntry()],
    });
    await expect(importOrientationFeatures(outside)).rejects.toThrow(
      /fall outside the selection rule/,
    );

    const wrongName = await writeOrientationRoot({
      resources: resources(),
      entries: [
        place().id === "geo.populated-place.pauillac"
          ? {
              ...place(),
              select: {
                property: "code_insee_de_la_commune",
                values: ["33314"],
                expect: { nom_officiel: "Pauilac" },
              },
            }
          : place(),
      ],
    });
    await expect(importOrientationFeatures(wrongName)).rejects.toThrow(
      /nom_officiel: source has 'Pauillac'/,
    );

    const tampered = await writeOrientationRoot({
      resources: resources(),
      entries: [orientationEntry()],
    });
    await writeFile(
      resourcePathFor(tampered, rawResource("fixture-river", RIVER_RESPONSE)),
      RIVER_RESPONSE.replace("6441500", "6441501"),
      "utf8",
    );
    await expect(importOrientationFeatures(tampered)).rejects.toThrow(/not the pinned file/);
  });
});

describe("committed mapping tables", () => {
  it("names 39 appellation entities with unique keys and the hard cases as decided", async () => {
    const mapping = await loadMapping(path.resolve(__dirname, "..", ".."));
    expect(mapping.entries).toHaveLength(39);
    const byEntity = new Map(mapping.entries.map((item) => [item.entity, item]));
    expect(byEntity.get("appellation.cotes-de-bordeaux")?.review.status).toBe("held");
    expect(byEntity.get("appellation.blaye-cotes-de-bordeaux")?.feature_key).toMatchObject({
      type_denom: "dénomination géographique complémentaire",
      denom: "Côtes de Bordeaux Blaye",
      id_app: 685,
    });
    expect(byEntity.get("appellation.saint-emilion-grand-cru")?.feature_key.id_denom).not.toBe(
      byEntity.get("appellation.saint-emilion")?.feature_key.id_denom,
    );
    expect(byEntity.get("appellation.cadillac")?.feature_key.denom).toBe("Cadillac");
    expect(byEntity.get("appellation.cadillac-cotes-de-bordeaux")?.feature_key.denom).toBe(
      "Côtes de Bordeaux Cadillac",
    );
    expect(byEntity.has("appellation.port")).toBe(false);
    expect(byEntity.has("appellation.sherry")).toBe(false);
  });

  it("names the orientation features with NL and EN names and one resource each", async () => {
    const mapping = await loadOrientationMapping(path.resolve(__dirname, "..", ".."));
    const kinds = new Map<string, number>();
    for (const item of mapping.entries) kinds.set(item.kind, (kinds.get(item.kind) ?? 0) + 1);
    expect(kinds.get("river")).toBe(8);
    expect(kinds.get("water-body")).toBe(9);
    expect(kinds.get("coastline")).toBe(1);
    expect(kinds.get("populated-place")).toBe(29);
    expect(
      mapping.entries.find((item) => item.id === "geo.populated-place.margaux")?.select.expect,
    ).toEqual({
      nom_officiel: "Margaux-Cantenac",
      nom_du_chef_lieu: "Margaux",
    });
  });
});

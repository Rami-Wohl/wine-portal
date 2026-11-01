import { unzipSync } from "fflate";
import { open as openShapefile } from "shapefile";
import { ImportError } from "./import-error";
import type { MappingEntry } from "./mapping-schemas";
import type { AreaGeometry } from "./validate";

// Reading the pinned INAO shapefile archive and selecting the reviewed rows (contract §6).

export interface ShapefileBundle {
  shp: Uint8Array;
  dbf: Uint8Array;
  prj: string;
  cpg: string;
  members: Array<{ name: string; bytes: number }>;
}

/** Unzip the pinned archive and pick the single shapefile member set it must contain. */
export function openShapefileBundle(zipBytes: Uint8Array): ShapefileBundle {
  const entries = unzipSync(zipBytes);
  const members = Object.entries(entries)
    .map(([name, bytes]) => ({ name, bytes: bytes.length }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const pick = (extension: string): string => {
    const matches = members.filter((member) => member.name.toLowerCase().endsWith(extension));
    if (matches.length !== 1) {
      throw new ImportError(
        `The archive must contain exactly one ${extension} member; found ${matches.length}: ${matches
          .map((member) => member.name)
          .join(", ")}`,
      );
    }
    return matches[0].name;
  };
  const decoder = new TextDecoder("utf-8", { fatal: true });
  return {
    shp: entries[pick(".shp")],
    dbf: entries[pick(".dbf")],
    prj: decoder.decode(entries[pick(".prj")]).trim(),
    cpg: decoder.decode(entries[pick(".cpg")]).trim(),
    members,
  };
}

export type SourceProperties = Record<string, string | number | boolean | null>;

export interface SourceRow {
  index: number;
  properties: SourceProperties;
  geometry: AreaGeometry | null;
}

export function sourceRowKey(typeDenom: string, denom: string): string {
  return `${typeDenom}\u0000${denom}`;
}

export interface SourceIndex {
  recordCount: number;
  /** Every key with its record count, so duplicates are visible even for unwanted keys. */
  counts: Map<string, number>;
  /** Full rows for the wanted keys only; the national file is too large to keep in memory. */
  rows: Map<string, SourceRow[]>;
  nativeBbox: [number, number, number, number];
}

function trimmedString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function indexSourceRows(
  bundle: Pick<ShapefileBundle, "shp" | "dbf">,
  encoding: string,
  wantedKeys: ReadonlySet<string>,
): Promise<SourceIndex> {
  const source = await openShapefile(bundle.shp, bundle.dbf, { encoding });
  const counts = new Map<string, number>();
  const rows = new Map<string, SourceRow[]>();
  let index = -1;
  for (let result = await source.read(); !result.done; result = await source.read()) {
    index += 1;
    const feature = result.value;
    const properties = (feature.properties ?? {}) as Record<string, unknown>;
    const typeDenom = trimmedString(properties.type_denom) ?? "";
    const denom = trimmedString(properties.denom) ?? "";
    const key = sourceRowKey(typeDenom, denom);
    counts.set(key, (counts.get(key) ?? 0) + 1);
    if (!wantedKeys.has(key)) continue;
    const normalised: SourceProperties = {};
    for (const [name, value] of Object.entries(properties)) {
      normalised[name] =
        typeof value === "number" || typeof value === "boolean" ? value : trimmedString(value);
    }
    const geometry = feature.geometry as unknown;
    const list = rows.get(key) ?? [];
    list.push({
      index,
      properties: normalised,
      geometry:
        typeof geometry === "object" &&
        geometry !== null &&
        ((geometry as { type?: unknown }).type === "Polygon" ||
          (geometry as { type?: unknown }).type === "MultiPolygon")
          ? (geometry as AreaGeometry)
          : null,
    });
    rows.set(key, list);
  }
  const bbox = source.bbox as number[];
  return {
    recordCount: index + 1,
    counts,
    rows,
    nativeBbox: [bbox[0], bbox[1], bbox[2], bbox[3]],
  };
}

export const VERIFIABLE_KEY_FIELDS = ["id_app", "id_denom", "app", "signe"] as const;

export interface MatchResult {
  row: SourceRow;
  /** Key fields that were present in the DBF and equal to the mapping. */
  verifiedFields: string[];
  /** Key fields that are blank in this edition and could not be verified in the DBF. */
  absentFields: string[];
}

/** Select exactly one source row for an entry; fail on missing, duplicate or conflicting rows. */
export function matchSourceRow(entry: MappingEntry, index: SourceIndex): MatchResult {
  const key = entry.feature_key;
  const rowKey = sourceRowKey(key.type_denom, key.denom);
  const count = index.counts.get(rowKey) ?? 0;
  if (count === 0) {
    throw new ImportError(
      `${entry.entity}: no source record has type_denom '${key.type_denom}' and denom '${key.denom}'`,
    );
  }
  if (count > 1) {
    throw new ImportError(
      `${entry.entity}: ${count} source records share type_denom '${key.type_denom}' and denom '${key.denom}'; the identity is ambiguous in this edition`,
    );
  }
  const rows = index.rows.get(rowKey);
  if (!rows || rows.length !== 1) {
    throw new ImportError(`${entry.entity}: the matching source record was not retained`);
  }
  const row = rows[0];
  const verifiedFields: string[] = ["type_denom", "denom"];
  const absentFields: string[] = [];
  const conflicts: string[] = [];
  for (const field of VERIFIABLE_KEY_FIELDS) {
    const observed = row.properties[field];
    const expected = key[field];
    if (observed === null || observed === undefined) {
      absentFields.push(field);
    } else if (observed === expected || String(observed) === String(expected)) {
      verifiedFields.push(field);
    } else {
      conflicts.push(
        `${field}: source has '${String(observed)}', mapping expects '${String(expected)}'`,
      );
    }
  }
  if (conflicts.length > 0) {
    throw new ImportError(`${entry.entity}: the source record contradicts the mapping`, conflicts);
  }
  return { row, verifiedFields, absentFields };
}

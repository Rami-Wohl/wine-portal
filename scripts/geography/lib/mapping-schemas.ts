import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { z } from "zod";
import { GEOGRAPHY_KINDS, type GeographyKind } from "../../../src/content/model";
import { ImportError } from "./import-error";

// The two reviewed mapping tables that drive the import (docs/atlas-plan.md §6). Every identity
// decision lives here; the import only re-applies them.

export const APPELLATION_MAPPING_RELATIVE_PATH = path.join(
  "data",
  "geography",
  "mappings",
  "inao-appellations.yaml",
);
export const ORIENTATION_MAPPING_RELATIVE_PATH = path.join(
  "data",
  "geography",
  "mappings",
  "ign-orientation.yaml",
);

export const APPELLATION_AREA_KIND = "appellation-area";

export const TYPE_DENOM_VALUES = [
  "appellation",
  "dénomination géographique complémentaire",
] as const;

const idSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const reviewStatusSchema = z.enum(["reviewed", "published", "held"]);

export const featureKeySchema = z
  .object({
    id_app: z.number().int().positive(),
    id_denom: z.number().int().positive(),
    signe: z.literal("AOC"),
    type_denom: z.enum(TYPE_DENOM_VALUES),
    app: z.string().min(1),
    denom: z.string().min(1),
  })
  .strict();

export type FeatureKey = z.infer<typeof featureKeySchema>;

export const mappingEntrySchema = z
  .object({
    entity: z.string().regex(/^appellation\.[a-z0-9]+(?:-[a-z0-9]+)*$/),
    id: z.string().regex(/^geo\.appellation-area\.[a-z0-9]+(?:-[a-z0-9]+)*$/),
    feature_key: featureKeySchema,
    register_labels: z
      .object({
        appellation: z.string().min(1).optional(),
        denomination: z.string().min(1).optional(),
      })
      .strict()
      .optional(),
    prior_edition_check: z.iso.date().optional(),
    shares_geometry_with: z
      .array(z.string().regex(/^appellation\./))
      .min(1)
      .optional(),
    review: z.object({ status: reviewStatusSchema, notes: z.string().min(1) }).strict(),
  })
  .strict();

export type MappingEntry = z.infer<typeof mappingEntrySchema>;

export const mappingSchema = z
  .object({
    resource: idSchema,
    register: idSchema,
    reviewed_at: z.iso.date(),
    entries: z.array(mappingEntrySchema).min(1),
  })
  .strict()
  .superRefine((mapping, context) => {
    const seen = new Map<string, Set<string>>();
    const check = (field: string, value: string, index: number, pathName: string) => {
      const values = seen.get(field) ?? new Set<string>();
      if (values.has(value)) {
        context.addIssue({
          code: "custom",
          path: ["entries", index, pathName],
          message: `duplicates ${field} '${value}'`,
        });
      }
      values.add(value);
      seen.set(field, values);
    };
    mapping.entries.forEach((entry, index) => {
      check("entity", entry.entity, index, "entity");
      check("id", entry.id, index, "id");
      check(
        "source row",
        `${entry.feature_key.type_denom}|${entry.feature_key.denom}`,
        index,
        "feature_key",
      );
      check(
        "id pair",
        `${entry.feature_key.id_app}/${entry.feature_key.id_denom}`,
        index,
        "feature_key",
      );
      const slug = entry.entity.slice("appellation.".length);
      if (entry.id !== `geo.appellation-area.${slug}`) {
        context.addIssue({
          code: "custom",
          path: ["entries", index, "id"],
          message: `must be 'geo.appellation-area.${slug}' for entity '${entry.entity}'`,
        });
      }
    });
  });

export type AppellationMapping = z.infer<typeof mappingSchema>;

export const ORIENTATION_KINDS = GEOGRAPHY_KINDS.filter(
  (kind) => kind !== APPELLATION_AREA_KIND,
) as [GeographyKind, ...GeographyKind[]];

export const orientationEntrySchema = z
  .object({
    id: z.string().regex(/^geo\.[a-z-]+\.[a-z0-9]+(?:-[a-z0-9]+)*$/),
    kind: z.enum(ORIENTATION_KINDS),
    names: z.object({ nl: z.string().min(1), en: z.string().min(1) }).strict(),
    resource: idSchema,
    select: z
      .object({
        property: z.string().min(1),
        values: z.array(z.string().min(1)).min(1),
        cleabs: z.string().min(1).optional(),
        type_de_limite: z.null().optional(),
        expect: z.record(z.string().min(1), z.string().min(1)).optional(),
      })
      .strict(),
    geometry: z.enum(["MultiLineString", "MultiPolygon", "Point"]),
    meaning: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    review: z.object({ status: reviewStatusSchema, notes: z.string().min(1) }).strict(),
  })
  .strict()
  .superRefine((entry, context) => {
    const expectedType =
      entry.kind === "populated-place"
        ? "Point"
        : entry.kind === "water-body"
          ? "MultiPolygon"
          : "MultiLineString";
    if (entry.geometry !== expectedType) {
      context.addIssue({
        code: "custom",
        path: ["geometry"],
        message: `must be ${expectedType} for kind '${entry.kind}'`,
      });
    }
    if (entry.id.split(".")[1] !== entry.kind) {
      context.addIssue({
        code: "custom",
        path: ["id"],
        message: `must use the kind '${entry.kind}' as its second segment`,
      });
    }
  });

export type OrientationEntry = z.infer<typeof orientationEntrySchema>;

export const orientationMappingSchema = z
  .object({
    reviewed_at: z.iso.date(),
    entries: z.array(orientationEntrySchema).min(1),
  })
  .strict()
  .superRefine((mapping, context) => {
    const ids = new Set<string>();
    mapping.entries.forEach((entry, index) => {
      if (ids.has(entry.id)) {
        context.addIssue({
          code: "custom",
          path: ["entries", index, "id"],
          message: `duplicates id '${entry.id}'`,
        });
      }
      ids.add(entry.id);
    });
  });

export type OrientationMapping = z.infer<typeof orientationMappingSchema>;

async function loadYamlTable<T>(
  root: string,
  relativePath: string,
  schema: z.ZodType<T>,
  label: string,
): Promise<T> {
  const raw: unknown = parseYaml(await readFile(path.join(root, relativePath), "utf8"));
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new ImportError(
      `Invalid ${label} ${relativePath}`,
      result.error.issues.map((issue) => `${issue.path.join(".") || "table"} ${issue.message}`),
    );
  }
  return result.data;
}

export function loadMapping(root: string): Promise<AppellationMapping> {
  return loadYamlTable(root, APPELLATION_MAPPING_RELATIVE_PATH, mappingSchema, "mapping table");
}

export function loadOrientationMapping(root: string): Promise<OrientationMapping> {
  return loadYamlTable(
    root,
    ORIENTATION_MAPPING_RELATIVE_PATH,
    orientationMappingSchema,
    "orientation mapping table",
  );
}

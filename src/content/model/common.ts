import { z } from "zod";

export const ENTITY_TYPES = [
  "region",
  "appellation",
  "site",
  "producer",
  "grape",
  "classification",
  "vintage",
  "concept",
] as const;

export const ENTITY_TYPE_DIRECTORIES = {
  region: "regions",
  appellation: "appellations",
  site: "sites",
  producer: "producers",
  grape: "grapes",
  classification: "classifications",
  vintage: "vintages",
  concept: "concepts",
} as const satisfies Record<EntityType, string>;

export const RELATION_TYPES = [
  "part_of",
  "contains",
  "located_in",
  "produces_in",
  "associated_with",
  "important_grape",
  "parent_appellation",
  "classified_under",
  "related_to",
  "contrasts_with",
  "scope",
] as const;

export const SYMMETRIC_RELATION_TYPES = [
  "associated_with",
  "related_to",
  "contrasts_with",
] as const satisfies readonly (typeof RELATION_TYPES)[number][];

export const LOCALES = ["nl", "en"] as const;

export const DEPTHS = ["foundation", "intermediate", "advanced", "specialist"] as const;

export type EntityType = (typeof ENTITY_TYPES)[number];

export type Locale = (typeof LOCALES)[number];

export type Depth = (typeof DEPTHS)[number];

export const entityTypePattern = ENTITY_TYPES.join("|");

export const entityIdPattern = new RegExp(`^(?:${entityTypePattern})\\.[a-z0-9]+(?:-[a-z0-9]+)*$`);

export const entityIdSchema = z
  .string()
  .regex(entityIdPattern, "must be '<entity-type>.<canonical-slug>'");

export const sourceIdSchema = z
  .string()
  .regex(/^source\.[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be 'source.<canonical-slug>'");

export const mediaIdSchema = z
  .string()
  .regex(
    /^media\.[a-z0-9]+(?:[.-][a-z0-9]+)*$/,
    "must start with 'media.' and contain canonical slugs",
  );

export const narrativeIdSchema = z
  .string()
  .regex(
    /^narrative\.[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*)?$/,
    "must start with 'narrative.' and contain canonical slugs",
  );

export const learningPathIdSchema = z
  .string()
  .regex(/^learning-path\.[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be 'learning-path.<canonical-slug>'");

export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be a lowercase kebab-case slug");

export const localizedTextSchema = z
  .object({ nl: z.string().min(1), en: z.string().min(1) })
  .strict();

export const localizedStringListSchema = z
  .object({ nl: z.array(z.string().min(1)), en: z.array(z.string().min(1)) })
  .strict();

export const localizedFileSchema = z
  .object({
    nl: z.string().regex(/\.nl\.md$/),
    en: z.string().regex(/\.en\.md$/),
  })
  .strict();

export const dateSchema = z.iso.date();

export const scalarSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

export const contentAnchorSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const httpUrlSchema = z.url().refine((value) => {
  const protocol = new URL(value).protocol;
  return protocol === "http:" || protocol === "https:";
}, "must use an http or https URL");

export const frameworkAlignmentSchema = z
  .object({
    framework: z.string().min(1),
    level: z.union([z.string(), z.number()]),
    relation: z.enum(["prerequisite", "core-overlap", "extension", "beyond"]),
  })
  .strict();

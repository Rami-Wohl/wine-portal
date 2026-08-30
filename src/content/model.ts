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

export const LOCALES = ["nl", "en"] as const;
export const DEPTHS = ["foundation", "intermediate", "advanced", "specialist"] as const;

export type EntityType = (typeof ENTITY_TYPES)[number];
export type Locale = (typeof LOCALES)[number];
export type Depth = (typeof DEPTHS)[number];

export const entityIdPattern = /^(region|appellation|site|producer|grape|classification|vintage|concept)\.[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const entityIdSchema = z.string().regex(entityIdPattern, "must be '<entity-type>.<canonical-slug>'");
export const sourceIdSchema = z.string().regex(/^source\.[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be 'source.<canonical-slug>'");
export const narrativeIdSchema = z.string().regex(/^narrative\.[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*)?$/, "must start with 'narrative.' and contain canonical slugs");
const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be a lowercase kebab-case slug");
const localizedTextSchema = z.object({ nl: z.string().min(1), en: z.string().min(1) }).strict();
const localizedFileSchema = z.object({
  nl: z.string().regex(/\.nl\.md$/),
  en: z.string().regex(/\.en\.md$/),
}).strict();
const dateSchema = z.iso.date();
const scalarSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

export const relationSchema = z.object({
  type: z.enum(RELATION_TYPES),
  target: entityIdSchema,
  properties: z.record(z.string(), scalarSchema).optional(),
  valid_from: z.union([z.string(), z.number()]).optional(),
  valid_to: z.union([z.string(), z.number(), z.null()]).optional(),
}).strict();

export const assertionSchema = z.object({
  id: z.string().regex(/^assertion\.[a-z0-9]+(?:[.-][a-z0-9]+)*$/),
  predicate: z.string().regex(/^[a-z][a-z0-9_]*$/),
  value: z.union([z.string(), z.number(), z.boolean()]),
  status: z.enum(["verified", "provisional", "contested", "historical", "deprecated"]),
  sources: z.array(sourceIdSchema).min(1),
  last_verified: dateSchema.optional(),
  valid_from: z.union([z.string(), z.number()]).optional(),
  valid_to: z.union([z.string(), z.number(), z.null()]).optional(),
}).strict();

const frameworkAlignmentSchema = z.object({
  framework: z.string().min(1),
  level: z.union([z.string(), z.number()]),
  relation: z.enum(["prerequisite", "core-overlap", "extension", "beyond"]),
}).strict();

export const entitySchema = z.object({
  id: entityIdSchema,
  type: z.enum(ENTITY_TYPES),
  status: z.enum(["draft", "active", "deprecated"]),
  canonical_name: z.string().min(1),
  names: localizedTextSchema,
  slugs: z.object({ nl: slugSchema, en: slugSchema }).strict(),
  locales: localizedFileSchema,
  relations: z.array(relationSchema).default([]),
  assertions: z.array(assertionSchema).default([]),
  source_refs: z.array(sourceIdSchema).default([]),
  geography_id: z.string().regex(/^(?:geo|geometry)\.[a-z0-9]+(?:[.-][a-z0-9]+)*$/).optional(),
  depth: z.enum(DEPTHS).optional(),
  framework_alignment: z.array(frameworkAlignmentSchema).optional(),
  last_reviewed: dateSchema.optional(),
}).strict();

export const narrativeSchema = z.object({
  id: narrativeIdSchema,
  type: z.enum(["lesson", "regional-deep-dive", "producer-profile", "comparison", "tasting-guide", "historical-essay", "explainer"]),
  status: z.enum(["draft", "active", "deprecated"]),
  title: localizedTextSchema,
  slugs: z.object({ nl: slugSchema, en: slugSchema }).strict(),
  locales: z.object({
    nl: z.string().regex(/\.nl\.md$/),
    en: z.string().regex(/\.en\.md$/),
  }).strict(),
  primary_entity: entityIdSchema.optional(),
  related_entities: z.array(entityIdSchema).default([]),
  source_refs: z.array(sourceIdSchema).default([]),
  depth: z.enum(DEPTHS).optional(),
  framework_alignment: z.array(frameworkAlignmentSchema).optional(),
}).strict();

export const sourceSchema = z.object({
  id: sourceIdSchema,
  source_type: z.enum(["regulator", "academic", "book", "trade-body", "producer", "critic", "journalism", "historical-document", "dataset"]),
  publisher: z.string().min(1),
  title: z.string().min(1),
  url: z.url().optional(),
  published_at: dateSchema.optional(),
  accessed_at: dateSchema.optional(),
  language: z.string().regex(/^[a-z]{2,3}$/),
  status: z.enum(["active", "unavailable", "deprecated"]),
}).strict();

export type Entity = z.infer<typeof entitySchema>;
export type Relation = z.infer<typeof relationSchema>;
export type Narrative = z.infer<typeof narrativeSchema>;
export type Source = z.infer<typeof sourceSchema>;

export interface ResolvedRelation extends Relation {
  source: string;
}

export interface NarrativeMention {
  entity_id: string;
  label: string | null;
  locale: Locale;
}

export type GeneratedNarrative = Narrative & {
  mentions: NarrativeMention[];
};

export interface GeneratedKnowledgeBase {
  entities: Entity[];
  narratives: GeneratedNarrative[];
  sources: Source[];
  relations: {
    forward: ResolvedRelation[];
    inverse: Record<string, ResolvedRelation[]>;
  };
  backlinks: Record<string, string[]>;
  indexes: {
    entity_ids: string[];
    entities_by_type: Record<EntityType, string[]>;
    localized_slugs: Record<Locale, Record<string, string>>;
    geography: Record<string, string>;
    search: Array<{
      id: string;
      type: EntityType;
      canonical_name: string;
      names: Record<Locale, string>;
      slugs: Record<Locale, string>;
    }>;
  };
}

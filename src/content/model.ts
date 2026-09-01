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
export const CONTENT_BLOCK_TYPES = [
  "summary",
  "objectives",
  "section",
  "key-idea",
  "caveat",
  "in-the-glass",
  "comparison",
] as const;
export const CAVEAT_VARIANTS = ["simplification", "uncertainty", "exception"] as const;

export type EntityType = (typeof ENTITY_TYPES)[number];
export type Locale = (typeof LOCALES)[number];
export type Depth = (typeof DEPTHS)[number];
export type ContentBlockType = (typeof CONTENT_BLOCK_TYPES)[number];
export type CaveatVariant = (typeof CAVEAT_VARIANTS)[number];

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

export interface ContentTextNode {
  type: "text";
  value: string;
}

export interface ContentInlineCodeNode {
  type: "inline-code";
  value: string;
}

export interface ContentEntityLinkNode {
  type: "entity-link";
  entity_id: string;
  label: string | null;
}

export interface ContentCitationNode {
  type: "citation";
  source_id: string;
  locator: string | null;
}

export interface ContentInlineContainerNode {
  type: "emphasis" | "strong";
  children: ContentInlineNode[];
}

export interface ContentLinkNode {
  type: "link";
  url: string;
  title: string | null;
  children: ContentInlineNode[];
}

export interface ContentBreakNode {
  type: "break";
}

export type ContentInlineNode =
  | ContentTextNode
  | ContentInlineCodeNode
  | ContentEntityLinkNode
  | ContentCitationNode
  | ContentInlineContainerNode
  | ContentLinkNode
  | ContentBreakNode;

export interface ContentParagraphNode {
  type: "paragraph";
  children: ContentInlineNode[];
}

export interface ContentHeadingNode {
  type: "heading";
  depth: 2 | 3;
  children: ContentInlineNode[];
}

export interface ContentListItemNode {
  type: "list-item";
  children: ContentBlockNode[];
}

export interface ContentListNode {
  type: "list";
  ordered: boolean;
  start: number | null;
  children: ContentListItemNode[];
}

export interface ContentBlockquoteNode {
  type: "blockquote";
  children: ContentBlockNode[];
}

export interface ContentTableNode {
  type: "table";
  align: Array<"left" | "right" | "center" | null>;
  rows: ContentInlineNode[][][];
}

export type ContentBlockNode =
  | ContentParagraphNode
  | ContentHeadingNode
  | ContentListNode
  | ContentBlockquoteNode
  | ContentTableNode;

export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  depth: Depth | null;
  source_refs: string[];
  variant: CaveatVariant | null;
  nodes: ContentBlockNode[];
}

export interface ContentDocument {
  blocks: ContentBlock[];
}

export type GeneratedEntity = Entity & {
  content: Record<Locale, ContentDocument>;
};

export type GeneratedNarrative = Narrative & {
  mentions: NarrativeMention[];
  content: Record<Locale, ContentDocument>;
};

export interface GeneratedKnowledgeBase {
  entities: GeneratedEntity[];
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

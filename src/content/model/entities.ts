import { z } from "zod";
import {
  ENTITY_TYPES,
  RELATION_TYPES,
  DEPTHS,
  entityIdSchema,
  sourceIdSchema,
  slugSchema,
  localizedTextSchema,
  localizedStringListSchema,
  localizedFileSchema,
  dateSchema,
  scalarSchema,
  contentAnchorSchema,
  frameworkAlignmentSchema,
} from "./common";

export const relationSchema = z
  .object({
    type: z.enum(RELATION_TYPES),
    target: entityIdSchema,
    properties: z.record(z.string(), scalarSchema).optional(),
    valid_from: z.union([z.string(), z.number()]).optional(),
    valid_to: z.union([z.string(), z.number(), z.null()]).optional(),
  })
  .strict();

export const assertionSchema = z
  .object({
    id: z.string().regex(/^assertion\.[a-z0-9]+(?:[.-][a-z0-9]+)*$/),
    predicate: z.string().regex(/^[a-z][a-z0-9_]*$/),
    value: z.union([z.string(), z.number(), z.boolean()]),
    status: z.enum(["verified", "provisional", "contested", "historical", "deprecated"]),
    sources: z.array(sourceIdSchema).min(1),
    last_verified: dateSchema.optional(),
    valid_from: z.union([z.string(), z.number()]).optional(),
    valid_to: z.union([z.string(), z.number(), z.null()]).optional(),
  })
  .strict();

export const entityPresentationSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("monograph") }).strict(),
  z
    .object({
      mode: z.enum(["collection-profile", "register-entry"]),
      owner: entityIdSchema,
      anchor: contentAnchorSchema,
    })
    .strict(),
]);

export const entitySchema = z
  .object({
    id: entityIdSchema,
    type: z.enum(ENTITY_TYPES),
    status: z.enum(["draft", "active", "deprecated"]),
    canonical_name: z.string().min(1),
    names: localizedTextSchema,
    aliases: localizedStringListSchema.optional(),
    slugs: z.object({ nl: slugSchema, en: slugSchema }).strict(),
    locales: localizedFileSchema,
    relations: z.array(relationSchema).default([]),
    assertions: z.array(assertionSchema).default([]),
    source_refs: z.array(sourceIdSchema).default([]),
    presentation: entityPresentationSchema.optional(),
    geography_id: z
      .string()
      .regex(/^(?:geo|geometry)\.[a-z0-9]+(?:[.-][a-z0-9]+)*$/)
      .optional(),
    depth: z.enum(DEPTHS).optional(),
    framework_alignment: z.array(frameworkAlignmentSchema).optional(),
    last_reviewed: dateSchema.optional(),
  })
  .strict()
  .superRefine((entity, context) => {
    if (entity.type === "producer" && !entity.presentation) {
      context.addIssue({
        code: "custom",
        path: ["presentation"],
        message: "is required for every producer entity",
      });
    }
    if (entity.type !== "producer" && entity.presentation) {
      context.addIssue({
        code: "custom",
        path: ["presentation"],
        message: "is only supported for producer entities",
      });
    }
  });

export type Entity = z.infer<typeof entitySchema>;

export type EntityPresentation = z.infer<typeof entityPresentationSchema>;

export type Relation = z.infer<typeof relationSchema>;

export function entityPresentationMode(
  entity: Pick<Entity, "type" | "presentation">,
): "monograph" | "collection-profile" | "register-entry" {
  if (entity.type !== "producer") return "monograph";
  if (!entity.presentation) {
    throw new Error("Producer entity has no explicit presentation mode");
  }
  return entity.presentation.mode;
}

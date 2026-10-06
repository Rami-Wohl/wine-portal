import { z } from "zod";
import {
  DEPTHS,
  entityIdSchema,
  sourceIdSchema,
  narrativeIdSchema,
  slugSchema,
  localizedTextSchema,
  frameworkAlignmentSchema,
} from "./common";

export const narrativeSchema = z
  .object({
    id: narrativeIdSchema,
    type: z.enum([
      "lesson",
      "regional-deep-dive",
      "producer-profile",
      "comparison",
      "tasting-guide",
      "historical-essay",
      "explainer",
    ]),
    status: z.enum(["draft", "active", "deprecated"]),
    title: localizedTextSchema,
    slugs: z.object({ nl: slugSchema, en: slugSchema }).strict(),
    locales: z
      .object({
        nl: z.string().regex(/\.nl\.md$/),
        en: z.string().regex(/\.en\.md$/),
      })
      .strict(),
    primary_entity: entityIdSchema.optional(),
    related_entities: z.array(entityIdSchema).default([]),
    source_refs: z.array(sourceIdSchema).default([]),
    depth: z.enum(DEPTHS).optional(),
    framework_alignment: z.array(frameworkAlignmentSchema).optional(),
  })
  .strict();

export type Narrative = z.infer<typeof narrativeSchema>;

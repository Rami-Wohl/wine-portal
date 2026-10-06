import { z } from "zod";
import {
  entityIdSchema,
  narrativeIdSchema,
  learningPathIdSchema,
  slugSchema,
  localizedTextSchema,
  localizedStringListSchema,
  contentAnchorSchema,
} from "./common";

export const CURRICULUM_LEVELS = ["understand", "explain", "analyze"] as const;

export type CurriculumLevel = (typeof CURRICULUM_LEVELS)[number];

export const learningPathTargetSchema = z.union([
  entityIdSchema,
  narrativeIdSchema,
  learningPathIdSchema,
]);

export const localizedRequiredStringListSchema = z
  .object({
    nl: z.array(z.string().min(1)).min(1),
    en: z.array(z.string().min(1)).min(1),
  })
  .strict();

export const learningPathSchema = z
  .object({
    schema_version: z.literal(1),
    id: learningPathIdSchema,
    status: z.enum(["draft", "active", "deprecated"]),
    curriculum_level: z.enum(CURRICULUM_LEVELS),
    title: localizedTextSchema,
    slugs: z.object({ nl: slugSchema, en: slugSchema }).strict(),
    summary: localizedTextSchema,
    audience: localizedTextSchema,
    prerequisites: localizedStringListSchema,
    objectives: localizedRequiredStringListSchema,
    steps: z
      .array(
        z
          .object({
            id: contentAnchorSchema,
            target: narrativeIdSchema,
            context: localizedTextSchema,
          })
          .strict(),
      )
      .min(1),
    completion: z
      .object({
        recap: localizedRequiredStringListSchema,
        encouragement: localizedTextSchema,
        suggestions: z
          .array(
            z
              .object({
                id: contentAnchorSchema,
                target: learningPathTargetSchema,
                context: localizedTextSchema,
              })
              .strict(),
          )
          .min(1),
      })
      .strict(),
  })
  .strict();

export type LearningPath = z.infer<typeof learningPathSchema>;

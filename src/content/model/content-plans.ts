import { z } from "zod";
import {
  entityIdSchema,
  sourceIdSchema,
  narrativeIdSchema,
  slugSchema,
  localizedTextSchema,
} from "./common";
import { entityPresentationSchema } from "./entities";

export const REGION_OVERVIEW_DIMENSIONS = [
  "identity-and-orientation",
  "historical-development",
  "landscape-climate-and-soils",
  "wine-families",
  "grape-varieties",
  "viticulture-and-winemaking",
  "appellation-structure",
  "classification-systems",
  "trade-and-institutions",
  "labels-and-terminology",
  "style-and-glass-context",
  "modern-developments",
  "visuals",
  "child-knowledge",
] as const;

export const APPELLATION_OVERVIEW_DIMENSIONS = [
  "identity-and-orientation",
  "historical-development",
  "landscape-climate-and-soils",
  "grape-varieties",
  "viticulture-and-winemaking",
  "appellation-rules",
  "classification-and-producers",
  "style-and-glass-context",
  "labels-and-buying",
  "modern-developments",
  "visuals",
  "child-knowledge",
] as const;

export const GRAPE_OVERVIEW_DIMENSIONS = [
  "identity-and-origins",
  "vine-and-growing-cycle",
  "site-climate-and-soils",
  "regions-and-appellations",
  "wine-styles-and-sensory-profile",
  "viticulture-and-risks",
  "winemaking-and-ageing",
  "synonyms-clones-and-relatives",
  "labels-and-recognition",
  "modern-developments",
  "visuals",
  "child-knowledge",
] as const;

export const CONCEPT_SYSTEM_OVERVIEW_DIMENSIONS = [
  "identity-and-scope",
  "system-components-and-relationships",
  "mechanisms-and-interactions",
  "conditions-and-variation",
  "decisions-and-trade-offs",
  "global-context-and-examples",
  "evidence-and-limits",
  "practical-interpretation",
] as const;

export const CONCEPT_FOCUSED_OVERVIEW_DIMENSIONS = [
  "identity-and-scope",
  "mechanism-and-function",
  "conditions-and-variation",
  "application-and-decisions",
  "evidence-and-limits",
  "practical-interpretation",
] as const;

export const CONTENT_PLAN_DIMENSIONS = [
  ...REGION_OVERVIEW_DIMENSIONS,
  ...APPELLATION_OVERVIEW_DIMENSIONS,
  ...GRAPE_OVERVIEW_DIMENSIONS,
  ...CONCEPT_SYSTEM_OVERVIEW_DIMENSIONS,
  ...CONCEPT_FOCUSED_OVERVIEW_DIMENSIONS,
] as const;

export const CONTENT_PLAN_SECTION_HEADINGS = {
  "region-overview": {
    "identity-and-orientation": { nl: "Overzicht", en: "Overview" },
    "historical-development": { nl: "Geschiedenis", en: "History" },
    "landscape-climate-and-soils": {
      nl: "Landschap, klimaat en bodem",
      en: "Landscape, climate and soils",
    },
    "wine-families": { nl: "Wijnstijlen", en: "Wine styles" },
    "grape-varieties": { nl: "Druivenrassen", en: "Grape varieties" },
    "viticulture-and-winemaking": {
      nl: "Wijnbouw en wijnmaken",
      en: "Viticulture and winemaking",
    },
    "appellation-structure": { nl: "Appellations", en: "Appellations" },
    "classification-systems": { nl: "Classificaties", en: "Classifications" },
    "trade-and-institutions": {
      nl: "Handel en instituties",
      en: "Trade and institutions",
    },
    "labels-and-terminology": {
      nl: "Etiketten en begrippen",
      en: "Labels and terminology",
    },
    "style-and-glass-context": { nl: "In het glas", en: "In the glass" },
    "modern-developments": {
      nl: "Hedendaagse ontwikkelingen",
      en: "Contemporary developments",
    },
    visuals: { nl: "Beeld", en: "Visuals" },
    "child-knowledge": { nl: "Verder ontdekken", en: "Explore further" },
  },
  "appellation-overview": {
    "identity-and-orientation": {
      nl: "Ligging en afbakening",
      en: "Location and boundaries",
    },
    "historical-development": { nl: "Geschiedenis", en: "History" },
    "landscape-climate-and-soils": {
      nl: "Landschap, klimaat en bodem",
      en: "Landscape, climate and soils",
    },
    "grape-varieties": { nl: "Druivenrassen", en: "Grape varieties" },
    "viticulture-and-winemaking": {
      nl: "Wijnbouw en wijnmaken",
      en: "Viticulture and winemaking",
    },
    "appellation-rules": { nl: "Appellationregels", en: "Appellation rules" },
    "classification-and-producers": {
      nl: "Classificatie en producenten",
      en: "Classification and producers",
    },
    "style-and-glass-context": {
      nl: "Wijnstijl en flesontwikkeling",
      en: "Wine style and bottle development",
    },
    "labels-and-buying": { nl: "Etiket en aankoop", en: "Labels and buying" },
    "modern-developments": {
      nl: "Hedendaagse ontwikkelingen",
      en: "Contemporary developments",
    },
    visuals: { nl: "Beeld", en: "Visuals" },
    "child-knowledge": { nl: "Verder ontdekken", en: "Explore further" },
  },
  "grape-overview": {
    "identity-and-origins": {
      nl: "Identiteit en oorsprong",
      en: "Identity and origins",
    },
    "vine-and-growing-cycle": {
      nl: "Wijnstok en groeicyclus",
      en: "Vine and growing cycle",
    },
    "site-climate-and-soils": {
      nl: "Klimaat, ligging en bodem",
      en: "Climate, site and soils",
    },
    "regions-and-appellations": {
      nl: "Regio's en appellations",
      en: "Regions and appellations",
    },
    "wine-styles-and-sensory-profile": {
      nl: "Wijnstijlen en smaakprofiel",
      en: "Wine styles and sensory profile",
    },
    "viticulture-and-risks": {
      nl: "Wijnbouw en gevoeligheden",
      en: "Viticulture and vulnerabilities",
    },
    "winemaking-and-ageing": {
      nl: "Wijnmaken en rijping",
      en: "Winemaking and ageing",
    },
    "synonyms-clones-and-relatives": {
      nl: "Synoniemen, klonen en verwantschap",
      en: "Synonyms, clones and relationships",
    },
    "labels-and-recognition": {
      nl: "Etiket en herkenning",
      en: "Labels and recognition",
    },
    "modern-developments": {
      nl: "Hedendaagse ontwikkelingen",
      en: "Contemporary developments",
    },
    visuals: { nl: "Beeld", en: "Visuals" },
    "child-knowledge": { nl: "Verder ontdekken", en: "Explore further" },
  },
  "concept-system-overview": {
    "identity-and-scope": { nl: "Overzicht", en: "Overview" },
    "system-components-and-relationships": {
      nl: "Opbouw en samenhang",
      en: "Structure and relationships",
    },
    "mechanisms-and-interactions": { nl: "Werking", en: "How it works" },
    "conditions-and-variation": {
      nl: "Omstandigheden en variatie",
      en: "Conditions and variation",
    },
    "decisions-and-trade-offs": {
      nl: "Keuzes en afwegingen",
      en: "Decisions and trade-offs",
    },
    "global-context-and-examples": {
      nl: "Wereldwijde context",
      en: "Global context",
    },
    "evidence-and-limits": { nl: "Bewijs en grenzen", en: "Evidence and limits" },
    "practical-interpretation": {
      nl: "Betekenis voor wijn",
      en: "Significance for wine",
    },
  },
  "concept-focused-overview": {
    "identity-and-scope": { nl: "Overzicht", en: "Overview" },
    "mechanism-and-function": { nl: "Werking", en: "How it works" },
    "conditions-and-variation": {
      nl: "Omstandigheden en variatie",
      en: "Conditions and variation",
    },
    "application-and-decisions": {
      nl: "Toepassing en keuzes",
      en: "Application and decisions",
    },
    "evidence-and-limits": { nl: "Bewijs en grenzen", en: "Evidence and limits" },
    "practical-interpretation": {
      nl: "Betekenis voor wijn",
      en: "Significance for wine",
    },
  },
} as const;

export const contentPlanBlockIdSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const contentPlanReviewSchema = z.enum(["open", "complete"]);

export const contentPlanTargetIdSchema = z.union([entityIdSchema, narrativeIdSchema]);

export const contentPlanSchema = z
  .object({
    schema_version: z.literal(2),
    package_id: entityIdSchema,
    archetype: z.enum([
      "region-overview",
      "appellation-overview",
      "grape-overview",
      "concept-system-overview",
      "concept-focused-overview",
    ]),
    coverage: z
      .array(
        z
          .object({
            key: z.enum(CONTENT_PLAN_DIMENSIONS),
            disposition: z.enum([
              "on-page",
              "child-entity",
              "dated-narrative",
              "omitted-with-reason",
              "research-gap",
            ]),
            reason: z.string().min(1).optional(),
            block_ids: z.array(contentPlanBlockIdSchema).default([]),
            target_ids: z.array(contentPlanTargetIdSchema).default([]),
            completeness_questions: z.array(z.string().min(1)).min(1),
            layers: z
              .object({
                foundation: z.array(z.string().min(1)).default([]),
                intermediate: z.array(z.string().min(1)).default([]),
                advanced: z.array(z.string().min(1)).default([]),
                specialist: z.array(z.string().min(1)).default([]),
              })
              .strict(),
            evidence: z
              .object({
                general_synthesis: z
                  .object({
                    topics: z.array(z.string().min(1)).default([]),
                    source_refs: z.array(sourceIdSchema).default([]),
                  })
                  .strict(),
                specific_claims: z
                  .array(
                    z
                      .object({
                        claim: z.string().min(1),
                        status: z.enum(["open", "supported", "omit"]),
                        source_refs: z.array(sourceIdSchema).default([]),
                      })
                      .strict(),
                  )
                  .default([]),
              })
              .strict(),
            review: z
              .object({
                outline: contentPlanReviewSchema,
                nl: contentPlanReviewSchema,
                en: contentPlanReviewSchema,
              })
              .strict(),
          })
          .strict(),
      )
      .min(1),
    entity_dependencies: z
      .array(
        z
          .object({
            id: entityIdSchema,
            names: localizedTextSchema,
            slugs: z.object({ nl: slugSchema, en: slugSchema }).strict(),
            disposition: z.enum(["link", "relation", "link-and-relation"]),
            presentation: entityPresentationSchema.optional(),
          })
          .strict(),
      )
      .default([]),
    review: z
      .object({
        outline: contentPlanReviewSchema,
        dependencies: contentPlanReviewSchema,
        nl: contentPlanReviewSchema,
        en: contentPlanReviewSchema,
      })
      .strict(),
  })
  .strict()
  .superRefine((plan, context) => {
    const dependencyIds = new Set(plan.entity_dependencies.map((dependency) => dependency.id));
    for (const [index, dependency] of plan.entity_dependencies.entries()) {
      if (dependency.id.startsWith("producer.") && !dependency.presentation) {
        context.addIssue({
          code: "custom",
          path: ["entity_dependencies", index, "presentation"],
          message: "schema v2 requires a publication decision for every producer dependency",
        });
      }
      if (!dependency.id.startsWith("producer.") && dependency.presentation) {
        context.addIssue({
          code: "custom",
          path: ["entity_dependencies", index, "presentation"],
          message: "publication decisions are only supported for producer dependencies",
        });
      }
    }
    for (const [coverageIndex, coverage] of plan.coverage.entries()) {
      for (const [targetIndex, targetId] of coverage.target_ids.entries()) {
        if (targetId.startsWith("producer.") && !dependencyIds.has(targetId)) {
          context.addIssue({
            code: "custom",
            path: ["coverage", coverageIndex, "target_ids", targetIndex],
            message: "producer targets must also be declared in entity_dependencies",
          });
        }
      }
    }
  });

export type ContentPlan = z.infer<typeof contentPlanSchema>;

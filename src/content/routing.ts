import type { CurriculumLevel, Depth, Entity, EntityType, LearningPath, Narrative } from "./model";

export const ENTITY_ROUTE_SEGMENTS = {
  region: "regions",
  appellation: "appellations",
  site: "sites",
  producer: "producers",
  grape: "grapes",
  vintage: "vintages",
  classification: "classifications",
  concept: "concepts",
} as const satisfies Record<EntityType, string>;

export const NARRATIVE_ROUTE_SEGMENTS = {
  lesson: "lessons",
  "regional-deep-dive": "regional-deep-dives",
  "producer-profile": "producer-profiles",
  comparison: "comparisons",
  "tasting-guide": "tasting-guides",
  "historical-essay": "historical-essays",
  explainer: "explainers",
} as const satisfies Record<Narrative["type"], string>;

export const ENTITY_TYPE_LABELS_NL = {
  region: "Regio",
  appellation: "Appellatie",
  site: "Wijngaardsite",
  producer: "Producent",
  grape: "Druif",
  vintage: "Jaargang",
  classification: "Classificatie",
  concept: "Concept",
} as const satisfies Record<EntityType, string>;

export const ENTITY_TYPE_PLURAL_LABELS_NL = {
  region: "Regio's",
  appellation: "Appellaties",
  site: "Wijngaardsites",
  producer: "Producenten",
  grape: "Druiven",
  vintage: "Jaargangen",
  classification: "Classificaties",
  concept: "Concepten",
} as const satisfies Record<EntityType, string>;

export const DEPTH_LABELS_NL = {
  foundation: "Basis",
  intermediate: "Verdieping",
  advanced: "Gevorderd",
  specialist: "Specialistisch",
} as const satisfies Record<Depth, string>;

export const CURRICULUM_LEVEL_LABELS_NL = {
  understand: "Wijn begrijpen",
  explain: "Wijn verklaren",
  analyze: "Wijn doorgronden",
} as const satisfies Record<CurriculumLevel, string>;

export const NARRATIVE_TYPE_LABELS_NL = {
  lesson: "Les",
  "regional-deep-dive": "Regionale verdieping",
  "producer-profile": "Producentenprofiel",
  comparison: "Vergelijking",
  "tasting-guide": "Proefgids",
  "historical-essay": "Historisch essay",
  explainer: "Uitleg",
} as const satisfies Record<Narrative["type"], string>;

export function entityHref(entity: Entity): string {
  return `/${ENTITY_ROUTE_SEGMENTS[entity.type]}/${entity.slugs.en}`;
}

export function narrativeHref(narrative: Narrative): string {
  return `/verdiepingen/${NARRATIVE_ROUTE_SEGMENTS[narrative.type]}/${narrative.slugs.en}`;
}

export function learningPathHref(learningPath: LearningPath): string {
  return `/learn/${learningPath.slugs.en}`;
}

export function learningPathCompletionHref(learningPath: LearningPath): string {
  return `${learningPathHref(learningPath)}/complete`;
}

export function learningPathLessonHref(learningPath: LearningPath, lesson: Narrative): string {
  const query = new URLSearchParams({ path: learningPath.slugs.en });
  return `${narrativeHref(lesson)}?${query.toString()}`;
}

export function entityTypeFromRouteSegment(segment: string): EntityType | undefined {
  return (Object.entries(ENTITY_ROUTE_SEGMENTS) as Array<[EntityType, string]>).find(
    ([, routeSegment]) => routeSegment === segment,
  )?.[0];
}

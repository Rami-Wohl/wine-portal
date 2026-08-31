import type { Locale, Relation } from "./model";

export type RelationDirection = "forward" | "inverse";

type LocalizedLabel = Record<Locale, string>;

export interface RelationPresentation {
  forward: LocalizedLabel;
  inverse: LocalizedLabel;
}

export const RELATION_PRESENTATIONS = {
  part_of: {
    forward: { nl: "Onderdeel van", en: "Part of" },
    inverse: { nl: "Bevat", en: "Contains" },
  },
  contains: {
    forward: { nl: "Bevat", en: "Contains" },
    inverse: { nl: "Onderdeel van", en: "Part of" },
  },
  located_in: {
    forward: { nl: "Gelegen in", en: "Located in" },
    inverse: { nl: "Hier gevestigd", en: "Based here" },
  },
  produces_in: {
    forward: { nl: "Produceert in", en: "Produces in" },
    inverse: { nl: "Producenten in dit gebied", en: "Producers in this area" },
  },
  associated_with: {
    forward: { nl: "Verbonden met", en: "Associated with" },
    inverse: { nl: "Verbonden met", en: "Associated with" },
  },
  important_grape: {
    forward: { nl: "Belangrijke druif", en: "Important grape" },
    inverse: { nl: "Belangrijk in", en: "Important in" },
  },
  parent_appellation: {
    forward: { nl: "Bovenliggende appellatie", en: "Parent appellation" },
    inverse: { nl: "Onderliggende appellatie", en: "Sub-appellation" },
  },
  classified_under: {
    forward: { nl: "Geclassificeerd onder", en: "Classified under" },
    inverse: { nl: "Binnen deze classificatie", en: "Within this classification" },
  },
  related_to: {
    forward: { nl: "Gerelateerd aan", en: "Related to" },
    inverse: { nl: "Gerelateerd aan", en: "Related to" },
  },
  contrasts_with: {
    forward: { nl: "Vergelijk met", en: "Compare with" },
    inverse: { nl: "Vergelijk met", en: "Compare with" },
  },
  scope: {
    forward: { nl: "Geografisch bereik", en: "Geographic scope" },
    inverse: { nl: "Binnen dit gebied", en: "Within this area" },
  },
} as const satisfies Record<Relation["type"], RelationPresentation>;

export function relationLabel(
  type: Relation["type"],
  direction: RelationDirection,
  locale: Locale,
): string {
  return RELATION_PRESENTATIONS[type][direction][locale];
}

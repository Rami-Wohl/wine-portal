import type { Locale, Relation } from "./model";

export type RelationDirection = "forward" | "inverse";

type LocalizedLabel = Record<Locale, string>;

export interface RelationPresentation {
  forward: LocalizedLabel;
  inverse: LocalizedLabel;
}

export interface GroupableRelation {
  relation: Relation;
  direction: RelationDirection;
}

export interface RelationGroup<T extends GroupableRelation> {
  label: string;
  items: T[];
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

const RELATION_GROUP_LABEL_ORDER: Record<Locale, string[]> = {
  nl: [
    "Onderdeel van",
    "Gelegen in",
    "Bovenliggende appellatie",
    "Bevat",
    "Onderliggende appellatie",
    "Belangrijke druif",
    "Belangrijk in",
    "Produceert in",
    "Producenten in dit gebied",
    "Hier gevestigd",
    "Geclassificeerd onder",
    "Binnen deze classificatie",
    "Geografisch bereik",
    "Binnen dit gebied",
    "Verbonden met",
    "Vergelijk met",
    "Gerelateerd aan",
  ],
  en: [
    "Part of",
    "Located in",
    "Parent appellation",
    "Contains",
    "Sub-appellation",
    "Important grape",
    "Important in",
    "Produces in",
    "Producers in this area",
    "Based here",
    "Classified under",
    "Within this classification",
    "Geographic scope",
    "Within this area",
    "Associated with",
    "Compare with",
    "Related to",
  ],
};

export function groupRelationsByLabel<T extends GroupableRelation>(
  relations: T[],
  locale: Locale,
): RelationGroup<T>[] {
  const groups = new Map<string, T[]>();
  for (const item of relations) {
    const label = relationLabel(item.relation.type, item.direction, locale);
    const group = groups.get(label) ?? [];
    group.push(item);
    groups.set(label, group);
  }

  const preferredOrder = RELATION_GROUP_LABEL_ORDER[locale];
  return Array.from(groups, ([label, items]) => ({ label, items })).sort((left, right) => {
    const leftIndex = preferredOrder.indexOf(left.label);
    const rightIndex = preferredOrder.indexOf(right.label);
    if (leftIndex < 0 && rightIndex < 0) return left.label.localeCompare(right.label, locale);
    if (leftIndex < 0) return 1;
    if (rightIndex < 0) return -1;
    return leftIndex - rightIndex;
  });
}

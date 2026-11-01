/**
 * Name matching for the Atlas portal finder, shared by the server render (data-match) and the
 * client filter so both sides normalise the same way: case, diacritics, hyphens and apostrophes
 * are ignored, so "méd", "MED" and "entre deux" find Médoc and Entre-deux-Mers.
 */
export function normalizePortalName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .toLocaleLowerCase("en")
    .replace(/[-‐‑–—'’`.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** The data-match value of a node: its normalised names, one per line. */
export function portalMatchValue(names: string[]): string {
  return Array.from(new Set(names.map(normalizePortalName))).join("\n");
}

/** True when a normalised query occurs in any of the node's normalised names. */
export function portalNameMatches(matchValue: string, query: string): boolean {
  return query.length > 0 && matchValue.split("\n").some((name) => name.includes(query));
}

export interface PortalFilterNode {
  /** Normalised own names, one per line (portalMatchValue). */
  match: string;
  /** Normalised names of the appellations on the node's own map, in display order. */
  areas?: string[];
  /** Index of the nearest enclosing node, or -1 at the top level. */
  parent: number;
}

export interface PortalVisibility {
  visible: boolean[];
  /** Indexes of the nodes that match, by their own name or by an appellation on their map. */
  matches: number[];
  /** Per node: the index in `areas` of the first matching appellation, when only that matched. */
  areaMatch: Array<number | null>;
  /** Nodes left visible: the matches, their ancestors as context, descendants of name matches. */
  shown: number;
}

/**
 * Which nodes the finder shows for a query, in O(n·d) for n nodes at depth d. A match on a
 * node's own name shows it with its ancestors and everything under it. A match on an
 * appellation of its map shows the node and its ancestors only: the overview map of a whole
 * cluster draws every appellation, and its sub-regions must not all appear for one of them.
 * An empty query shows everything.
 */
export function portalVisibility(nodes: PortalFilterNode[], query: string): PortalVisibility {
  const normalized = normalizePortalName(query);
  if (!normalized) {
    return {
      visible: nodes.map(() => true),
      matches: [],
      areaMatch: nodes.map(() => null),
      shown: nodes.length,
    };
  }
  const named = nodes.map((node) => portalNameMatches(node.match, normalized));
  const areaMatch = nodes.map((node, index) => {
    if (named[index]) return null;
    const hit = (node.areas ?? []).findIndex((area) => area.includes(normalized));
    return hit === -1 ? null : hit;
  });
  const matched = nodes.map((_, index) => named[index] || areaMatch[index] !== null);
  const visible = nodes.map(() => false);
  nodes.forEach((node, index) => {
    if (matched[index]) visible[index] = true;
    // Under a name match: shown as part of the matching region.
    for (let at = node.parent; at !== -1 && !visible[index]; at = nodes[at].parent) {
      if (named[at]) visible[index] = true;
    }
  });
  nodes.forEach((node, index) => {
    if (!matched[index]) return;
    // Ancestors of any match stay as context.
    for (let at = node.parent; at !== -1 && !visible[at]; at = nodes[at].parent) {
      visible[at] = true;
    }
  });
  const matches = matched.flatMap((value, index) => (value ? [index] : []));
  return { visible, matches, areaMatch, shown: visible.filter(Boolean).length };
}

/** Fills a finder template: {count}, {shown} and {query}. */
export function fillTemplate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in values ? String(values[key]) : whole,
  );
}

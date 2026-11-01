"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import type { AtlasFinderCopy } from "./copy";
import { fillTemplate, normalizePortalName, portalVisibility } from "./portal-match";

interface FilterResult {
  /** The matching nodes' own entry links (data-portal-entry). */
  entries: HTMLAnchorElement[];
  found: number;
  shown: number;
}

const EMPTY: FilterResult = { entries: [], found: 0, shown: 0 };

/** Elements that belong to a node itself (not to a node inside it), keyed by that node. */
function ownedBy(root: HTMLElement, selector: string): Map<Element, HTMLElement> {
  const owned = new Map<Element, HTMLElement>();
  for (const element of root.querySelectorAll<HTMLElement>(selector)) {
    const node = element.closest("[data-portal-node]");
    if (node && !owned.has(node)) owned.set(node, element);
  }
  return owned;
}

/**
 * Applies the finder's visibility to the server-rendered portal: every [data-portal-node]
 * element gets the hidden attribute when it is not shown, and a node found through an
 * appellation on its map names it in its [data-area-hit] line. Parents and owned elements come
 * from closest(), so the pass is O(n·d).
 */
export function filterPortal(root: HTMLElement, query: string, areaHit: string): FilterResult {
  const elements = Array.from(root.querySelectorAll<HTMLElement>("[data-portal-node]"));
  const indexOf = new Map(elements.map((element, index) => [element, index]));
  const areaNames = elements.map((element) => element.dataset.areas?.split("\n") ?? []);
  const nodes = elements.map((element, index) => {
    const parent = element.parentElement?.closest<HTMLElement>("[data-portal-node]");
    return {
      match: element.dataset.match ?? "",
      areas: areaNames[index].map(normalizePortalName),
      parent: parent ? (indexOf.get(parent) ?? -1) : -1,
    };
  });
  const { visible, matches, areaMatch, shown } = portalVisibility(nodes, query);
  const hits = ownedBy(root, "[data-area-hit]");
  const entries = ownedBy(root, "a[data-portal-entry]");
  elements.forEach((element, index) => {
    element.hidden = !visible[index];
    const hit = hits.get(element);
    const area = areaMatch[index];
    if (hit)
      hit.textContent =
        area === null ? "" : fillTemplate(areaHit, { area: areaNames[index][area] });
  });
  return {
    entries: matches.flatMap((index) => {
      const entry = entries.get(elements[index]);
      return entry ? [entry as HTMLAnchorElement] : [];
    }),
    found: matches.length,
    shown,
  };
}

/**
 * The portal's name filter. Without JavaScript it is a plain search form for regions on the
 * search page; with JavaScript it filters the server-rendered list in place, so finding a region
 * needs no request. Rendered on the server in full, so nothing moves when the script loads. Its
 * strings arrive as props: the bilingual Atlas copy stays out of this client chunk.
 */
export function AtlasPortalFinder({
  copy,
  portalId,
  searchAction,
}: {
  copy: AtlasFinderCopy;
  portalId: string;
  /** The localized search route; the form submits q and type=region to it. */
  searchAction: string;
}) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<FilterResult>(EMPTY);

  // Filtering happens in the event that changes the query: the list is server-rendered DOM
  // outside React, updated in place.
  function update(next: string) {
    setQuery(next);
    const root = document.getElementById(portalId);
    setResult(root ? filterPortal(root, next, copy.areaHit) : EMPTY);
  }

  const trimmed = query.trim();
  const { found } = result;
  // The status says what the reader sees: the matches, and how many entries are shown in all
  // when matching regions keep their containing and contained regions as context.
  const status = !trimmed
    ? ""
    : found === 0
      ? fillTemplate(copy.none, { query: trimmed })
      : fillTemplate(found === 1 ? copy.foundOne : copy.foundOther, { count: found }) +
        (result.shown > found ? fillTemplate(copy.shown, { shown: result.shown }) : "");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    // Exactly one match opens it; otherwise Enter searches regions on the search page, as it
    // does without JavaScript. An empty query goes nowhere.
    if (!trimmed) {
      event.preventDefault();
      return;
    }
    if (found === 1) {
      event.preventDefault();
      // The match's own entry link, whatever else its card links to.
      result.entries[0]?.click();
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape" && query) {
      event.preventDefault();
      update("");
    }
  }

  return (
    <form action={searchAction} className="atlas-portal-finder" onSubmit={onSubmit} role="search">
      <label htmlFor={`${portalId}-query`}>{copy.label}</label>
      <div className="search-field">
        <input
          autoComplete="off"
          id={`${portalId}-query`}
          name="q"
          onChange={(event) => update(event.target.value)}
          onKeyDown={onKeyDown}
          spellCheck={false}
          type="search"
          value={query}
        />
        <button type="submit">{copy.submit}</button>
      </div>
      <input name="type" type="hidden" value="region" />
      <p aria-live="polite" className="atlas-portal-status" role="status">
        {status}
        {trimmed && found === 0 ? (
          <>
            {" "}
            <a href={`${searchAction}?q=${encodeURIComponent(trimmed)}`}>
              {fillTemplate(copy.searchAll, { query: trimmed })}
            </a>
          </>
        ) : null}
      </p>
    </form>
  );
}

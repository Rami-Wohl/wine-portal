import { renderToStaticMarkup } from "react-dom/server";
import { gzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import type { AtlasPortal, AtlasPortalNode, AtlasPortalState } from "@/content/model";
import { AtlasPortalEmpty, AtlasPortalView, PORTAL_JUMP_MIN_SECTIONS } from "./atlas-portal";
import { syntheticPortal } from "./fixtures/portal-scale";
import {
  fillTemplate,
  normalizePortalName,
  portalMatchValue,
  portalNameMatches,
  portalVisibility,
  type PortalFilterNode,
} from "./portal-match";

const thumbnail = {
  viewBox: { width: 160 as const, height: 90 },
  paths: ["M0 0l160 0 0 90-160 0z", "M10 20l30 0 0 30z"],
};

const node = (
  id: string,
  name: string,
  state: AtlasPortalState,
  children: AtlasPortalNode[] = [],
  extra: Partial<AtlasPortalNode> = {},
): AtlasPortalNode => ({
  id: `region.${id}`,
  name,
  matchNames: [name],
  areaNames: [],
  href: state.kind === "map" ? `/atlas/${id}` : `/regions/${id}`,
  state,
  children,
  ...extra,
});

const map = (shown: number, intended: number, withThumbnail = true): AtlasPortalState => ({
  kind: "map",
  shown,
  intended,
  ...(withThumbnail ? { thumbnail } : {}),
});

function render(portal: AtlasPortal, locale: "nl" | "en" = "nl") {
  return renderToStaticMarkup(
    <AtlasPortalView
      locale={locale}
      portal={portal}
      searchAction={locale === "nl" ? "/search" : "/en/search"}
    />,
  );
}

const count = (html: string, pattern: RegExp) => html.match(pattern)?.length ?? 0;

/** The Bordeaux shape of today plus the other states: one section, five cards, one inner link. */
const bordeauxLike: AtlasPortal = {
  regionCount: 7,
  mapCount: 5,
  sections: [
    node(
      "bordeaux",
      "Bordeaux",
      map(37, 38),
      [
        node("entre-deux-mers", "Entre-deux-Mers", map(6, 6)),
        node("libournais", "Libournais", map(12, 12), [
          node("fronsadais", "Fronsadais", map(2, 2)),
        ]),
        node("medoc", "Médoc", map(8, 8), [], { areaNames: ["Pauillac", "Saint-Julien"] }),
        node("testgebied", "Testgebied", { kind: "preparing" }),
        node("deelgebied", "Deelgebied", {
          kind: "parent-map",
          parentName: "Bordeaux",
          sceneId: "scene.bordeaux",
        }),
      ],
      { pageHref: "/regions/bordeaux" },
    ),
  ],
};

describe("AtlasPortalView", () => {
  it("renders a section per top-level region with its lead card, its cards and inner links", () => {
    const html = render(bordeauxLike);
    expect(count(html, /<section [^>]*class="atlas-portal-section"/g)).toBe(1);
    expect(html).toContain(
      '<h2 class="atlas-portal-section-title" id="atlas-portal-region-bordeaux-title">Bordeaux</h2>',
    );
    // Lead card: the section's own map, and a secondary link to the region's page.
    expect(html).toMatch(
      /class="atlas-portal-card atlas-portal-card-lead"[\s\S]*?Kaart van Bordeaux/,
    );
    expect(html).toContain(
      '<p class="atlas-portal-about"><a href="/regions/bordeaux">Lees over Bordeaux</a></p>',
    );
    expect(count(html, /class="atlas-portal-card[ "]/g)).toBe(6);
    // Fronsadais is a link inside the Libournais card, not a card of its own.
    expect(html).toMatch(
      /<ul class="atlas-portal-sub"><li [^>]*><a [^>]*href="\/atlas\/fronsadais"/,
    );
    // One card-wide link per card; the lead adds its page link, Fronsadais has its own.
    expect(count(html, /class="atlas-portal-link"/g)).toBe(6);
    expect(count(html, /<a /g)).toBe(8);
    // Child cards keep exactly one link.
    for (const card of html.match(
      /<li data-portal-node[^>]*><div class="atlas-portal-card[^"]*">[\s\S]*?<\/div><\/li>/g,
    ) ?? []) {
      const own = card.replace(/<ul class="atlas-portal-sub">[\s\S]*<\/ul>/, "");
      expect(count(own, /<a /g)).toBe(1);
    }
    expect(html).not.toContain("atlas-portal-jump");
    expect(html).not.toContain("data-href");
  });

  it("states coverage from data: the count when complete, 'x van y' only when something is missing", () => {
    const html = render(bordeauxLike);
    expect(html).toContain("37 van 38 appellaties op de kaart");
    expect(html).toContain(">8 appellaties op de kaart<");
    expect(html).not.toContain("8 van 8");
    expect(html).toContain(">Kaart in voorbereiding<");
    expect(html).toContain(">Op de kaart van Bordeaux<");
    const en = render(bordeauxLike, "en");
    expect(en).toContain("37 of 38 appellations on the map");
    expect(en).toContain(">8 appellations on the map<");
    expect(en).toContain(">Map in preparation<");
    expect(en).toContain(">On the map of Bordeaux<");
    expect(en).toContain(">Map of Bordeaux<");
    expect(en).toContain(">Read about Bordeaux<");
  });

  it("names a card by its region and describes it by its state, as separate phrases", () => {
    const html = render(bordeauxLike);
    const link = html.match(/<a [^>]*href="\/atlas\/medoc"[^>]*>([\s\S]*?)<\/a>/);
    expect(link?.[0]).toContain('aria-describedby="atlas-portal-region-medoc-state"');
    expect(link?.[1].replace(/<[^>]+>/g, "")).toBe("Médoc");
    expect(html).toContain(
      '<p class="atlas-portal-state" id="atlas-portal-region-medoc-state">8 appellaties op de kaart<span class="atlas-portal-area-hit" data-area-hit=""></span></p>',
    );
    // Hyphenated names stay whole; the accessible text is unchanged.
    expect(html).toContain('<span class="atlas-portal-nobreak">Entre-deux-Mers</span>');
  });

  it("draws a thumbnail only for a map, and a card without one has no thumbnail row", () => {
    const html = render(bordeauxLike);
    // Lead, Entre-deux-Mers, Libournais and Médoc; Fronsadais is a link, two cards have no map.
    expect(count(html, /<svg [^>]*class="atlas-portal-thumb"/g)).toBe(4);
    const outer = html.match(/<svg [^>]*class="atlas-portal-thumb"[^>]*>/)?.[0] ?? "";
    expect(outer).toContain('aria-hidden="true"');
    expect(outer).toContain('viewBox="0 0 160 90"');
    expect(count(html, /class="atlas-portal-card atlas-portal-card-text"/g)).toBe(2);
    expect(html).toMatch(
      /<div class="atlas-portal-card atlas-portal-card-text"><h3 class="atlas-portal-card-title">/,
    );
  });

  it("finds without JavaScript through a search form for regions, rendered on the server", () => {
    const html = render(bordeauxLike);
    expect(html).toContain('<form class="atlas-portal-finder" role="search" action="/search">');
    expect(html).toContain('name="q"');
    expect(html).toContain('<input type="hidden" name="type" value="region"/>');
    expect(html).toContain('<label for="atlas-portal-query">Zoek een regio of appellatie</label>');
    expect(html).toContain('aria-live="polite"');
    expect(html.indexOf("atlas-portal-finder")).toBeLessThan(html.indexOf("<a "));
    expect(render(bordeauxLike, "en")).toContain('action="/en/search"');
    // Every node carries its normalised names (and its map's appellations) for the filter.
    expect(html).toContain('data-match="entre deux mers"');
    expect(html).toContain('data-match="medoc" data-areas="Pauillac\nSaint-Julien"');
    // Each node has one empty line for the appellation that found it, inside its state.
    expect(count(html, /<span class="atlas-portal-area-hit" data-area-hit=""><\/span>/g)).toBe(7);
    expect(count(html, /data-portal-entry=""/g)).toBe(7);
  });

  it("renders a childless top-level region as a compact section without an empty grid", () => {
    const html = render({
      regionCount: 2,
      mapCount: 1,
      sections: [
        node("eenling", "Eenling", map(3, 3), [], { pageHref: "/regions/eenling" }),
        node("tekstregio", "Tekstregio", { kind: "text" }),
      ],
    });
    expect(count(html, /class="atlas-portal-section atlas-portal-section-compact"/g)).toBe(2);
    expect(html).not.toContain("atlas-portal-grid");
    expect(html).toContain(">Kaart van Eenling<");
    // Without a map the lead card is about the region, not a repeat of the heading.
    expect(html).toMatch(/href="\/regions\/tekstregio">Over Tekstregio<\/a>/);
    expect(html).not.toMatch(/<h3[^>]*><a[^>]*>Tekstregio</);
    expect(html).toContain(">Nog geen kaart<");
    expect(count(html, /class="atlas-portal-about"/g)).toBe(1);
  });

  it("holds the end-goal scale: 15 sections, 150 cards and 450 inner links within budget", () => {
    // Clearly synthetic data (fixtures/portal-scale.ts): it never reaches a public route.
    const portal = syntheticPortal();
    const { sections } = portal;
    const html = render(portal);

    expect(count(html, /<section [^>]*class="atlas-portal-section"/g)).toBe(15);
    expect(count(html, /<li data-portal-node=""[^>]*><div class="atlas-portal-card/g)).toBe(150);
    expect(count(html, /<ul class="atlas-portal-sub">/g)).toBe(150);
    expect(count(html, /<li data-portal-node=""[^>]*><a /g)).toBe(450);
    // 15 lead + 150 card links, 450 inner links, 15 jump links, and a page link on each lead
    // card with a map (the odd sections).
    expect(count(html, /class="atlas-portal-link"/g)).toBe(165);
    const about = count(html, /class="atlas-portal-about"/g);
    expect(about).toBe(7);
    expect(count(html, /<a /g)).toBe(165 + 450 + 15 + about);
    expect(sections.length).toBeGreaterThanOrEqual(PORTAL_JUMP_MIN_SECTIONS);
    expect(html).toContain('<details class="atlas-portal-jump">');
    expect(html).toContain('href="#atlas-portal-region-testland-15"');
    expect(count(html, /<h2 /g)).toBe(15);
    expect(count(html, /<h3 /g)).toBe(165);

    // Budget: markup apart from thumbnails stays small per node; thumbnails dominate. Measured
    // 2026-11-01 with the appellation names of each map in the filter data (10 per map node):
    // 523 KB raw, 79 KB gzip, about 450 bytes per node besides thumbnails (with the empty
    // appellation-hit line and the entry marker per node).
    const thumbnails = count(html, /<svg [^>]*class="atlas-portal-thumb"/g);
    const thumbnailBytes = thumbnails * 3000;
    const perNode = (html.length - thumbnailBytes) / (15 + 150 + 450);
    expect(perNode).toBeLessThan(500);
    // The page carries this markup twice (HTML and the RSC payload); past ~40 maps thumbnails
    // move to a cached route (follow-up ticket).
    expect(html.length).toBeLessThan(540 * 1024);
    expect(gzipSync(html).length).toBeLessThan(90 * 1024);
  });

  it("states the empty Atlas once, with one heading and a way to Explore when nothing is listed", () => {
    const html = renderToStaticMarkup(
      <AtlasPortalEmpty exploreHref="/explore/regions" locale="nl" />,
    );
    expect(count(html, /<h[1-6]/g)).toBe(1);
    expect(html).toContain('<h2 id="atlas-empty-title">Er zijn nog geen kaarten</h2>');
    expect(html).toContain('href="/explore/regions"');
    expect(html).not.toMatch(/> </);
    const listed = renderToStaticMarkup(<AtlasPortalEmpty locale="en" />);
    expect(listed).toContain("There are no maps yet");
    expect(listed).not.toContain("<a ");
  });
});

describe("portal name matching", () => {
  it("ignores case, diacritics, hyphens and apostrophes", () => {
    expect(normalizePortalName("Médoc")).toBe("medoc");
    expect(normalizePortalName("Entre-deux-Mers")).toBe("entre deux mers");
    expect(normalizePortalName("Luján de Cuyo")).toBe("lujan de cuyo");
    const value = portalMatchValue(["Moezel", "Mosel"]);
    expect(portalNameMatches(value, normalizePortalName("MOS"))).toBe(true);
    expect(portalNameMatches(value, normalizePortalName("moez"))).toBe(true);
    expect(portalNameMatches(portalMatchValue(["Médoc"]), normalizePortalName("méd"))).toBe(true);
    expect(portalNameMatches(value, "")).toBe(false);
  });

  it("fills finder templates", () => {
    expect(fillTemplate("{count} regio's gevonden", { count: 3 })).toBe("3 regio's gevonden");
    expect(fillTemplate("Geen regio gevonden voor ‘{query}’.", { query: "x" })).toBe(
      "Geen regio gevonden voor ‘x’.",
    );
  });
});

describe("portal visibility at scale", () => {
  /** The synthetic portal flattened in document order, as the finder reads the DOM. */
  function flatten(): Array<PortalFilterNode & { name: string }> {
    const out: Array<PortalFilterNode & { name: string }> = [];
    const walk = (nodes: AtlasPortalNode[], parent: number) => {
      for (const item of nodes) {
        const index = out.length;
        out.push({
          name: item.name,
          match: portalMatchValue(item.matchNames),
          areas: item.areaNames.map(normalizePortalName),
          parent,
        });
        walk(item.children, index);
      }
    };
    walk(syntheticPortal().sections, -1);
    return out;
  }

  it("filters 615 nodes: matches, their context and the status counts", () => {
    const nodes = flatten();
    expect(nodes).toHaveLength(615);
    const all = portalVisibility(nodes, "");
    expect(all.shown).toBe(615);
    expect(all.matches).toHaveLength(0);

    // A card matches by name: it shows with its section above and its three sub-regions below.
    const card = portalVisibility(nodes, "testregio 42");
    expect(card.matches.map((index) => nodes[index].name)).toEqual([
      "Testregio 42",
      "Testregio 42.1",
      "Testregio 42.2",
      "Testregio 42.3",
    ]);
    expect(card.shown).toBe(5);
    expect(card.visible.filter((visible) => !visible)).toHaveLength(610);

    // A section matches: everything inside it shows (1 + 10 + 30), one match.
    const section = portalVisibility(nodes, "TESTLAND 7");
    expect(section.matches).toHaveLength(1);
    expect(section.shown).toBe(41);

    // An appellation finds the region whose map draws it, with its section as context but
    // without its sub-regions; the matched appellation is reported.
    const area = portalVisibility(nodes, "testappellatie testregio-3 2");
    expect(area.matches.map((index) => nodes[index].name)).toEqual(["Testregio 3"]);
    expect(area.shown).toBe(2);
    const regio3 = nodes.findIndex((item) => item.name === "Testregio 3");
    expect(area.areaMatch[regio3]).toBe(1);
    expect(nodes[nodes.findIndex((item) => item.name === "Testregio 3.1")]).toBeDefined();
    expect(area.visible[regio3 + 1]).toBe(false);

    expect(portalVisibility(nodes, "xyzzy").shown).toBe(0);
  });
});

describe("appellation matches", () => {
  // A cluster overview whose map draws everything, two sub-regions, one drawing Pauillac.
  const nodes: PortalFilterNode[] = [
    { match: "bordeaux", areas: ["pauillac", "pomerol"], parent: -1 },
    { match: "medoc", areas: ["pauillac"], parent: 0 },
    { match: "libournais", areas: ["pomerol"], parent: 0 },
    { match: "fronsadais", areas: [], parent: 2 },
  ];

  it("shows a region found by an appellation, its ancestors, and not its descendants", () => {
    const result = portalVisibility(nodes, "Pauillac");
    expect(result.visible).toEqual([true, true, false, false]);
    expect(result.matches).toEqual([0, 1]);
    expect(result.areaMatch).toEqual([0, 0, null, null]);
    expect(result.shown).toBe(2);
  });

  it("keeps showing everything under a region found by its own name", () => {
    const result = portalVisibility(nodes, "bordeaux");
    expect(result.visible).toEqual([true, true, true, true]);
    expect(result.matches).toEqual([0]);
    expect(result.areaMatch).toEqual([null, null, null, null]);
    const libournais = portalVisibility(nodes, "libour");
    expect(libournais.visible).toEqual([true, false, true, true]);
    expect(libournais.shown).toBe(3);
  });
});

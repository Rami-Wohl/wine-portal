import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AtlasFeatureList, foldSummary } from "./atlas-feature-list";

describe("AtlasFeatureList", () => {
  const area = (id: string, name: string, highlighted = false) => ({
    id: `geo.appellation-area.${id}`,
    name,
    href: `/appellations/${id}`,
    state: "linked" as const,
    highlighted,
    typeLabel: null,
    inCoverage: true,
  });

  it("lists every area with its link and state, then orientation layers and gaps", () => {
    const html = renderToStaticMarkup(
      <AtlasFeatureList
        areas={[
          {
            id: "geo.appellation-area.graves",
            name: "Graves",
            href: "/appellations/graves",
            state: "linked",
            highlighted: false,
            typeLabel: null,
            inCoverage: true,
          },
          {
            id: "geo.appellation-area.barsac",
            name: "Barsac",
            href: "/appellations/barsac",
            state: "linked",
            highlighted: true,
            typeLabel: null,
            inCoverage: true,
          },
          {
            id: "geo.appellation-area.draft",
            name: "Concept",
            href: null,
            state: "preview",
            highlighted: false,
            typeLabel: null,
            inCoverage: true,
          },
        ]}
        contextAreas={[
          {
            id: "geo.appellation-area.bordeaux",
            name: "AOP Bordeaux",
            href: "/appellations/bordeaux-aop",
            state: "linked",
            highlighted: false,
            typeLabel: null,
            inCoverage: true,
          },
        ]}
        mode="flat"
        headingLevel={3}
        idBase="atlas-test"
        locale="nl"
        missing={[{ name: "Cérons", reason: "held" }]}
        places={["Oefenstad (testdata)"]}
        water={["Oefenrivier (testdata)"]}
      />,
    );
    expect(html).toContain('<h3 class="atlas-list-title" id="atlas-test-list-title">');
    expect(html).toContain('href="/appellations/graves"');
    expect(html).toMatch(
      /<li class="atlas-area-item is-highlighted"[^>]*data-feature-id="geo\.appellation-area\.barsac"/,
    );
    expect(html).toMatch(
      /<a aria-current="page" class="atlas-area-link" href="\/appellations\/barsac">Barsac<\/a>/,
    );
    expect(html).toContain("Uitgelicht op de kaart");
    expect(html).toContain('<span class="atlas-area-link atlas-area-link-static">Concept</span>');
    expect(html).toContain("Pagina in voorbereiding");
    expect(html).toContain("Overkoepelend gebied");
    expect(html).not.toContain("atlas-list-disclosure");
    expect(html).toContain('href="/appellations/bordeaux-aop"');
    expect(html).toContain("Nog niet op de kaart");
    expect(html).toContain("Cérons");
    expect(html).toContain("de kaartvorm wordt nog gecontroleerd");
    expect(html).toContain("<dt>Water</dt><dd>Oefenrivier (testdata)</dd>");
    expect(html).toContain("<dt>Plaatsen</dt><dd>Oefenstad (testdata)</dd>");
    expect(html).toContain('<h4 class="atlas-list-group-title">');
    // Alphabetical per language, not draw order.
    expect(html.indexOf(">Barsac<")).toBeLessThan(html.indexOf(">Concept<"));
    expect(html.indexOf(">Concept<")).toBeLessThan(html.indexOf(">Graves<"));
  });

  it("keeps an honest empty state in English", () => {
    const html = renderToStaticMarkup(
      <AtlasFeatureList
        areas={[]}
        contextAreas={[]}
        mode="flat"
        headingLevel={4}
        idBase="atlas-test"
        locale="en"
        missing={[]}
        places={[]}
        water={[]}
      />,
    );
    expect(html).toContain("Appellation areas on this map");
    expect(html).toContain("This map has no appellation areas yet.");
    expect(html).not.toContain("For orientation");
  });

  it("keeps the highlighted area visible and folds the rest", () => {
    const html = renderToStaticMarkup(
      <AtlasFeatureList
        areas={[
          {
            id: "geo.appellation-area.graves",
            name: "Graves",
            href: "/appellations/graves",
            state: "linked",
            highlighted: false,
            typeLabel: null,
            inCoverage: true,
          },
          {
            id: "geo.appellation-area.barsac",
            name: "Barsac",
            href: "/appellations/barsac",
            state: "linked",
            highlighted: true,
            typeLabel: null,
            inCoverage: true,
          },
        ]}
        mode="folded"
        contextAreas={[
          {
            id: "geo.appellation-area.bordeaux",
            name: "AOP Bordeaux",
            href: "/appellations/bordeaux-aop",
            state: "linked",
            highlighted: false,
            typeLabel: null,
            inCoverage: true,
          },
        ]}
        headingLevel={3}
        idBase="atlas-test"
        locale="en"
        missing={[]}
        places={[]}
        water={[]}
      />,
    );
    const details = html.indexOf("<details");
    expect(html.indexOf('href="/appellations/barsac"')).toBeLessThan(details);
    expect(html).toContain('class="atlas-area-list atlas-area-list-current"');
    expect(html).toContain('<details class="atlas-list-disclosure"><summary>');
    expect(html).not.toContain("open=");
    // Every folded area counts, the overarching one (under its own heading) included.
    expect(html).toContain("<summary>Show the other 2 areas</summary>");
    expect(html.indexOf('href="/appellations/graves"')).toBeGreaterThan(details);
    expect(html.indexOf(">Overarching area<")).toBeGreaterThan(details);
    expect(html.indexOf('href="/appellations/bordeaux-aop"')).toBeGreaterThan(details);
    expect(html.match(/href="\/appellations\/barsac"/g)).toHaveLength(1);
    expect(html).not.toContain("data-atlas-wide-open");
  });

  it("marks the Atlas-page fold for the wide-screen enhancer, still closed in the markup", () => {
    const html = renderToStaticMarkup(
      <AtlasFeatureList
        areas={[area("graves", "Graves"), area("barsac", "Barsac")]}
        contextAreas={[area("bordeaux", "AOP Bordeaux")]}
        headingLevel={3}
        idBase="atlas-test"
        locale="nl"
        missing={[]}
        mode="folded"
        openWhenWide
        places={[]}
        water={[]}
      />,
    );
    expect(html).toContain(
      '<details class="atlas-list-disclosure" data-atlas-wide-open="true"><summary>Toon alle 3 gebieden</summary>',
    );
    expect(html).not.toMatch(/<details[^>]* open/);
  });

  it("keeps a highlighted overarching area out of the fold", () => {
    const html = renderToStaticMarkup(
      <AtlasFeatureList
        areas={[area("graves", "Graves"), area("barsac", "Barsac")]}
        mode="folded"
        contextAreas={[area("bordeaux", "Bordeaux", true)]}
        headingLevel={3}
        idBase="atlas-test"
        locale="nl"
        missing={[]}
        places={["Bordeaux"]}
        water={["Garonne"]}
      />,
    );
    const details = html.indexOf("<details");
    expect(html.indexOf('href="/appellations/bordeaux"')).toBeLessThan(details);
    expect(html.match(/href="\/appellations\/bordeaux"/g)).toHaveLength(1);
    expect(html).toContain("<summary>Toon de andere 2 gebieden</summary>");
    expect(html).not.toContain(">Overkoepelend gebied<");
  });

  it("names only water and towns when no area is folded, and drops the fold when empty", () => {
    const orientationOnly = renderToStaticMarkup(
      <AtlasFeatureList
        areas={[area("champagne", "Champagne", true)]}
        mode="folded"
        contextAreas={[]}
        headingLevel={3}
        idBase="atlas-test"
        locale="en"
        missing={[]}
        places={["Reims"]}
        water={["Marne"]}
      />,
    );
    expect(orientationOnly).toContain("<summary>Show water and towns</summary>");
    const nothing = renderToStaticMarkup(
      <AtlasFeatureList
        areas={[area("champagne", "Champagne", true)]}
        mode="folded"
        contextAreas={[]}
        headingLevel={3}
        idBase="atlas-test"
        locale="nl"
        missing={[]}
        places={[]}
        water={[]}
      />,
    );
    expect(nothing).not.toContain("<details");
    expect(nothing).toContain('href="/appellations/champagne"');
  });
});

describe("foldSummary", () => {
  it("counts the folded areas in the map's coverage, so it agrees with the coverage count", () => {
    const none = { areas: 0, inCoverage: 0, water: false, places: false };
    // Médoc: 8 selectable areas in coverage, AOP Bordeaux listed but outside it.
    expect(foldSummary("nl", { ...none, areas: 9, inCoverage: 8 }, false)).toBe(
      "Toon alle 8 gebieden",
    );
    // Libournais: 12 selectable areas in coverage, AOP Bordeaux outside it.
    expect(foldSummary("nl", { ...none, areas: 13, inCoverage: 12 }, false)).toBe(
      "Toon alle 12 gebieden",
    );
    // Bordeaux: 34 selectable and 3 overarching areas, all in coverage ("37 van 38").
    expect(foldSummary("nl", { ...none, areas: 37, inCoverage: 37 }, false)).toBe(
      "Toon alle 37 gebieden",
    );
    // Pauillac in the Médoc scene: the 7 other covered areas fold.
    expect(foldSummary("en", { ...none, areas: 8, inCoverage: 7 }, true)).toBe(
      "Show the other 7 areas",
    );
    // No covered area folded: fall back to every listed area.
    expect(foldSummary("en", { ...none, areas: 1 }, true)).toBe("Show the other area");
    expect(foldSummary("en", { ...none, water: true, places: true }, true)).toBe(
      "Show water and towns",
    );
    expect(foldSummary("nl", none, true)).toBeNull();
  });
});

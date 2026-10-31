import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AtlasFeatureList } from "./atlas-feature-list";

describe("AtlasFeatureList", () => {
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
          },
          {
            id: "geo.appellation-area.barsac",
            name: "Barsac",
            href: "/appellations/barsac",
            state: "linked",
            highlighted: true,
            typeLabel: null,
          },
          {
            id: "geo.appellation-area.draft",
            name: "Concept",
            href: null,
            state: "preview",
            highlighted: false,
            typeLabel: null,
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
          },
        ]}
        collapsible={false}
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
        collapsible={false}
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

  it("keeps the highlighted area visible and folds the rest when collapsible", () => {
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
          },
          {
            id: "geo.appellation-area.barsac",
            name: "Barsac",
            href: "/appellations/barsac",
            state: "linked",
            highlighted: true,
            typeLabel: null,
          },
        ]}
        collapsible={true}
        contextAreas={[
          {
            id: "geo.appellation-area.bordeaux",
            name: "AOP Bordeaux",
            href: "/appellations/bordeaux-aop",
            state: "linked",
            highlighted: false,
            typeLabel: null,
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
    expect(html).toContain("<summary>Show the other 2 areas</summary>");
    expect(html.indexOf('href="/appellations/graves"')).toBeGreaterThan(details);
    expect(html.match(/href="\/appellations\/barsac"/g)).toHaveLength(1);
  });

  const area = (id: string, name: string, highlighted = false) => ({
    id: `geo.appellation-area.${id}`,
    name,
    href: `/appellations/${id}`,
    state: "linked" as const,
    highlighted,
    typeLabel: null,
  });

  it("keeps a highlighted overarching area out of the fold", () => {
    const html = renderToStaticMarkup(
      <AtlasFeatureList
        areas={[area("graves", "Graves"), area("barsac", "Barsac")]}
        collapsible={true}
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
        collapsible={true}
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
        collapsible={true}
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

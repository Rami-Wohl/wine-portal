import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AtlasScene } from "./atlas-scene";
import { sampleScene } from "./fixtures/sample-scene";
import type { AtlasSceneView } from "@/content/model";

const areaAndLineFeatures = sampleScene.layers.flatMap((layer) =>
  layer.features.filter((feature) => feature.geometryType !== "point"),
);
const allFeatures = sampleScene.layers.flatMap((layer) => layer.features);

function visibleText(html: string) {
  return html
    .replace(/<title>[^<]*<\/title>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/&#x27;/g, "'");
}

function featurePaths(html: string) {
  return Array.from(html.matchAll(/<path [^>]*data-feature-id="([^"]+)"[^>]*>/g)).map((match) => ({
    id: match[1],
    tag: match[0],
  }));
}

function svgLinkHrefs(html: string) {
  return Array.from(html.matchAll(/<a [^>]*class="atlas-link"[^>]*href="([^"]+)"/g)).map(
    (match) => match[1],
  );
}

function listLinkHrefs(html: string) {
  return Array.from(html.matchAll(/<a [^>]*class="atlas-area-link"[^>]*href="([^"]+)"/g)).map(
    (match) => match[1],
  );
}

describe("AtlasScene", () => {
  const html = renderToStaticMarkup(
    <AtlasScene
      highlightedEntityId="appellation.barsac"
      locale="nl"
      scene={sampleScene}
      variant="overview"
    />,
  );

  it("renders one path per area or line feature with stable data attributes", () => {
    const paths = featurePaths(html);
    expect(paths.map((path) => path.id).sort()).toEqual(
      areaAndLineFeatures.map((feature) => feature.id).sort(),
    );
    for (const path of paths) {
      expect(path.tag).toMatch(/data-kind="(appellation-area|river|water-body|coastline)"/);
      expect(path.tag).toMatch(/data-role="(water|context|selectable|places)"/);
    }
    expect(html).toMatch(
      /<path [^>]*data-feature-id="geo\.river\.fixture-river"[^>]*data-role="water"/,
    );
    expect(html).toMatch(
      /<path [^>]*data-feature-id="geo\.appellation-area\.bordeaux"[^>]*data-role="context"/,
    );
    expect(html).toMatch(
      /<path [^>]*data-feature-id="geo\.appellation-area\.bordeaux"[^>]*fill="url\(#atlas-overview-graves-and-sauternais-hatch\)"/,
    );
  });

  it("gives every feature an accessible name and selectable areas an SVG link", () => {
    expect(html.match(/<title>/g)?.length).toBe(allFeatures.length);
    for (const feature of allFeatures) {
      expect(html).toContain(`<title>${feature.names.nl}</title>`);
    }
    expect(html).toMatch(
      /<a [^>]*class="atlas-link"[^>]*href="\/appellations\/graves" tabindex="-1"><title>Graves<\/title><path /,
    );
    expect(html).toMatch(
      /<a [^>]*class="atlas-link"[^>]*href="\/appellations\/bordeaux-aop" tabindex="-1">/,
    );
    expect(svgLinkHrefs(html)).toHaveLength(5);
    // The list is the keyboard path: every SVG link stays out of the tab order.
    const svgLinks = html.match(/<a [^>]*class="atlas-link"[^>]*>/g) ?? [];
    expect(svgLinks).toHaveLength(5);
    for (const link of svgLinks) expect(link).toContain('tabindex="-1"');
    expect(html).toMatch(
      /<g class="atlas-place"[^>]*data-feature-id="geo\.populated-place\.fixture-town-a"[^>]*><title>Oefenstad \(testdata\)<\/title><circle /,
    );
    expect(html).toMatch(
      /<text aria-hidden="true" data-min-zoom="[0-9.]+" data-visible="(true|false)"[^>]*>Oefenstad \(testdata\)<\/text>/,
    );
  });

  it("marks the highlighted area with outline state, a label and list parity", () => {
    expect(html).toMatch(
      /<a aria-current="page" class="atlas-link" data-highlighted="true" href="\/appellations\/barsac" tabindex="-1">/,
    );
    expect(html).toMatch(
      /<path [^>]*data-feature-id="geo\.appellation-area\.barsac"[^>]*data-highlighted="true"/,
    );
    expect(html).toMatch(
      /<text class="atlas-label atlas-label-selectable atlas-label-highlight"[^>]*data-label-for="geo\.appellation-area\.barsac"[^>]*data-min-zoom="0"[^>]*data-visible="true"[^>]*>Barsac<\/text>/,
    );
    expect(html).toMatch(
      /<li class="atlas-area-item is-highlighted"[^>]*><a aria-current="page" class="atlas-area-link" href="\/appellations\/barsac">Barsac<\/a>/,
    );
  });

  it("keeps the list alternative in parity with the map links, list first in DOM order", () => {
    expect(new Set(listLinkHrefs(html))).toEqual(new Set(svgLinkHrefs(html)));
    expect(html.indexOf('class="atlas-feature-list"')).toBeLessThan(html.indexOf("<svg"));
    expect(html.indexOf("<svg")).toBeLessThan(html.indexOf('class="atlas-legend"'));
  });

  it("labels the region honestly and never shows raw identifiers or pipeline terms", () => {
    const text = visibleText(html);
    expect(text).toContain("Kaart van Graves en Sauternais");
    // Atlas pages state the orientation sentence in the page intro, not again in the figure.
    expect(text).not.toContain("Productiegebieden van appellaties in Graves en Sauternais");
    expect(text.match(/Bedoeld voor regionale oriëntatie/g)).toHaveLength(1);
    expect(text).toContain("4 van de 5 appellaties van deze kaart zijn getekend.");
    expect(text).toContain("Cérons (de kaartvorm wordt nog gecontroleerd)");
    expect(text).toContain("Licence Ouverte / Open Licence 2.0");
    for (const forbidden of [
      "geo.",
      "appellation.",
      "region.",
      "scene.",
      "source.",
      "mercator",
      "EPSG",
      "etalab-2.0",
      "held",
      "fixture",
    ]) {
      expect(text, forbidden).not.toContain(forbidden);
    }
    expect(html).toContain(
      '<figure aria-labelledby="atlas-overview-graves-and-sauternais-title" class="atlas-scene atlas-scene-overview"',
    );
    expect(html).toMatch(
      /<svg aria-labelledby="atlas-overview-graves-and-sauternais-title"[^>]*preserveAspectRatio="xMidYMid meet"[^>]*role="group"[^>]*viewBox="0 0 1000 700"/,
    );
    expect(html).not.toMatch(/<svg [^>]*aria-describedby/);
    expect(html).toContain('<h2 class="atlas-scene-title"');
  });

  it("localizes routes and copy in English", () => {
    const english = renderToStaticMarkup(
      <AtlasScene locale="en" scene={sampleScene} variant="overview" />,
    );
    const text = visibleText(english);
    expect(english).toContain('href="/en/appellations/barsac"');
    expect(text).toContain("Map of Graves and Sauternais");
    expect(text).toContain("4 of this map's 5 appellations are drawn.");
    expect(text).toContain("édition du 12 octobre 2026");
  });

  /** The opening tag of the first element matching a pattern, for attribute-level checks. */
  const openingTag = (markup: string, pattern: RegExp) => markup.match(pattern)?.[0] ?? "";

  it("folds the Atlas-page list closed in the markup, ahead of the map and legend", () => {
    const details = openingTag(html, /<details [^>]*class="atlas-list-disclosure"[^>]*>/);
    expect(details).toContain('data-atlas-wide-open="true"');
    expect(details).not.toContain(" open");
    // Barsac stays above the fold; the three other covered areas are counted. AOP Bordeaux
    // folds too, under its own heading, but lies outside this scene's coverage.
    expect(html).toContain("<summary>Toon de andere 3 gebieden</summary>");
    expect(html.indexOf("atlas-list-disclosure")).toBeLessThan(html.indexOf("<svg"));
    expect(html.indexOf('class="atlas-scene-legend"')).toBeGreaterThan(html.indexOf("</svg>"));
  });

  it("renders the map controls on the server, disabled until the enhancer is ready", () => {
    const controls = html.match(/<button [^>]*class="atlas-map-control"[^>]*>/g) ?? [];
    expect(controls).toHaveLength(3);
    const labels = ["Inzoomen", "Uitzoomen", "Herstel weergave"];
    controls.forEach((button, index) => {
      expect(button).toContain('disabled=""');
      expect(button).toContain(`aria-label="${labels[index]}"`);
      expect(button).toContain(`title="${labels[index]}"`);
    });
    // The controls follow the frame in the server markup (an overlay on wide screens, a bar
    // below it on narrow ones), so nothing above the map appears on hydration.
    expect(html.indexOf('class="atlas-map-frame"')).toBeLessThan(
      html.indexOf('class="atlas-map-controls"'),
    );
    expect(html.indexOf('class="atlas-map-controls"')).toBeLessThan(
      html.indexOf('class="atlas-scene-legend"'),
    );
    expect(html).not.toContain("atlas-toolbar");
    expect(html).not.toContain("data-engaged");
    const hint = openingTag(html, /<p [^>]*class="atlas-map-hint"[^>]*>/);
    expect(hint).toContain('aria-hidden="true"');
    expect(hint).toContain('data-visible="false"');
    // One keyboard-help element: the frame's description and its focus caption.
    const frame = openingTag(html, /<div [^>]*class="atlas-map-frame"[^>]*>/);
    expect(frame).toContain('aria-describedby="atlas-overview-graves-and-sauternais-map-keys"');
    expect(frame).toContain('aria-label="Interactieve kaart"');
    expect(html.match(/Pijltjestoetsen verschuiven de kaart/g)).toHaveLength(1);
    const keys = openingTag(
      html,
      /<p [^>]*id="atlas-overview-graves-and-sauternais-map-keys"[^>]*>/,
    );
    expect(keys).toContain('class="atlas-map-keys-caption"');
    expect(keys).not.toContain("aria-hidden");
  });

  it("exposes the build's area rank on every area path for the chooser order", () => {
    for (const feature of sampleScene.layers.flatMap((layer) => layer.features)) {
      if (feature.geometryType !== "area" || feature.areaRank === undefined) continue;
      expect(html).toMatch(
        new RegExp(
          `data-feature-id="${feature.id.replace(/\./g, "\\.")}" data-area-rank="${feature.areaRank}"`,
        ),
      );
    }
  });

  it("hides the figure heading on scene routes but keeps it as the figure's name", () => {
    const hidden = renderToStaticMarkup(
      <AtlasScene locale="nl" scene={sampleScene} titleHidden variant="overview" />,
    );
    expect(hidden).toContain(
      '<h2 class="atlas-scene-title atlas-visually-hidden" id="atlas-overview-graves-and-sauternais-title">Kaart van Graves en Sauternais</h2>',
    );
    expect(hidden).not.toContain("atlas-scene-heading");
    expect(hidden).toContain('aria-labelledby="atlas-overview-graves-and-sauternais-title"');
  });

  it("keeps the embedded map compact: caption, map, gaps, then one disclosure", () => {
    const embedded = renderToStaticMarkup(
      <AtlasScene headingLevel={3} locale="nl" scene={sampleScene} variant="embedded" />,
    );
    const text = visibleText(embedded);
    expect(embedded).toContain('<h3 class="atlas-scene-title"');
    expect(embedded).toContain(
      '<p class="atlas-scene-intro" id="atlas-embedded-graves-and-sauternais-caption">Productiegebieden van appellaties in Graves en Sauternais, met water en plaatsen ter oriëntatie.</p>',
    );
    expect(embedded.match(/<details/g)).toHaveLength(1);
    expect(embedded).toContain(
      '<details class="atlas-about"><summary>Over deze kaart: gebieden, legenda en bron</summary>',
    );
    // Gaps sit between the map and the disclosure; the list inside does not repeat them.
    const about = embedded.indexOf('<details class="atlas-about">');
    expect(embedded.indexOf("atlas-legend-coverage")).toBeGreaterThan(embedded.indexOf("</svg>"));
    expect(embedded.indexOf("atlas-legend-coverage")).toBeLessThan(about);
    expect(text.match(/Cérons/g)).toHaveLength(1);
    // Areas, overarching areas, orientation, legend, scale statement and credits fold inside.
    for (const marker of [
      'class="atlas-feature-list"',
      ">Overkoepelend gebied<",
      ">Ter oriëntatie<",
      'class="atlas-legend-keys"',
      "Bedoeld voor regionale oriëntatie",
      'class="atlas-legend-credits"',
    ]) {
      expect(embedded.indexOf(marker), marker).toBeGreaterThan(about);
    }
    expect(text.match(/Bedoeld voor regionale oriëntatie/g)).toHaveLength(1);
    expect(text.match(/ter oriëntatie\./g)).toHaveLength(1);
    expect(embedded).not.toContain("atlas-scene-link");
    expect(embedded).toContain('<h4 class="atlas-list-title"');
    expect(embedded).toContain('class="atlas-scene atlas-scene-embedded"');
  });

  it("drops the coverage line for a complete map", () => {
    const complete: AtlasSceneView = {
      ...sampleScene,
      coverage: { ...sampleScene.coverage, intended: sampleScene.coverage.shown, missing: [] },
    };
    for (const variant of ["overview", "embedded"] as const) {
      const rendered = renderToStaticMarkup(
        <AtlasScene locale="nl" scene={complete} variant={variant} />,
      );
      expect(rendered).not.toContain("atlas-legend-coverage");
      expect(visibleText(rendered)).not.toContain("getekend");
    }
  });

  it("links an embedded map to its Atlas scene when a route is given", () => {
    const embedded = renderToStaticMarkup(
      <AtlasScene
        locale="en"
        scene={sampleScene}
        sceneHref="/en/atlas/graves-and-sauternais"
        variant="embedded"
      />,
    );
    expect(embedded).toContain(
      '<p class="atlas-scene-link"><a href="/en/atlas/graves-and-sauternais">View in the Atlas</a></p>',
    );
  });

  it("explains an unavailable highlighted area instead of drawing a stand-in", () => {
    const unavailable = renderToStaticMarkup(
      <AtlasScene
        highlightedEntityId="appellation.cerons"
        locale="nl"
        scene={sampleScene}
        variant="embedded"
      />,
    );
    expect(visibleText(unavailable)).toContain(
      "Cérons staat nog niet op de kaart: de kaartvorm wordt nog gecontroleerd. De kaart toont de andere appellatiegebieden van de regio.",
    );
    expect(unavailable).not.toContain("data-highlighted");
    expect(featurePaths(unavailable)).toHaveLength(areaAndLineFeatures.length);
  });

  it("mentions dropped sub-parts only when the build dropped some, without ids or counts", () => {
    expect(visibleText(html)).not.toContain("Heel kleine delen");
    const scene: AtlasSceneView = {
      ...sampleScene,
      simplification: {
        ...sampleScene.simplification,
        pixels: 1,
        droppedParts: [
          { featureId: "geo.river.fixture-river", parts: 213 },
          { featureId: "geo.water-body.fixture-estuary", parts: 7 },
        ],
      },
    };
    const text = visibleText(
      renderToStaticMarkup(<AtlasScene locale="nl" scene={scene} variant="overview" />),
    );
    expect(text).toContain(
      "Heel kleine delen, zoals losse snippers van een appellatiegebied, korte rivierstukken of eilandjes, zijn op deze schaal niet getekend.",
    );
    expect(text).not.toContain("213");
    expect(text).not.toContain("geo.");
  });

  it("never calls the owning region unavailable when it is the highlighted entity", () => {
    const html = renderToStaticMarkup(
      <AtlasScene
        highlightedEntityId={sampleScene.owner}
        locale="nl"
        scene={sampleScene}
        variant="embedded"
      />,
    );
    expect(html).not.toContain("atlas-scene-notice");
    expect(html).not.toContain("data-highlighted");
  });

  it("keeps a feature whose owner cannot be resolved visible but unlinked", () => {
    const scene: AtlasSceneView = {
      ...sampleScene,
      layers: sampleScene.layers.map((layer) =>
        layer.role === "selectable"
          ? {
              ...layer,
              features: [
                ...layer.features,
                {
                  id: "geo.appellation-area.fixture-orphan",
                  kind: "appellation-area",
                  owner: "appellation.fixture-orphan",
                  names: { nl: "Weesgebied (testdata)", en: "Orphan area (test data)" },
                  geometryType: "area",
                  path: "M 100 500 L 200 500 L 200 600 L 100 600 Z",
                  labelAnchor: [150, 550],
                  areaRank: 5,
                },
              ],
            }
          : layer,
      ),
    };
    const orphaned = renderToStaticMarkup(
      <AtlasScene locale="nl" scene={scene} variant="overview" />,
    );
    expect(orphaned).toMatch(
      /<path [^>]*data-feature-id="geo\.appellation-area\.fixture-orphan"[^>]*><title>Weesgebied \(testdata\)<\/title><\/path>/,
    );
    expect(orphaned).not.toMatch(/<a [^>]*href="[^"]*fixture-orphan/);
    expect(orphaned).toContain(
      '<span class="atlas-area-link atlas-area-link-static">Weesgebied (testdata)</span>',
    );
    expect(orphaned).toContain("Nog geen pagina");
  });

  it("keeps a draft owner's area on the map without sending readers to the draft page", () => {
    const scene: AtlasSceneView = {
      ...sampleScene,
      layers: sampleScene.layers.map((layer) =>
        layer.role === "selectable"
          ? {
              ...layer,
              features: [
                ...layer.features,
                {
                  id: "geo.appellation-area.fixture-draft",
                  kind: "appellation-area",
                  owner: "appellation.cahors",
                  names: { nl: "Conceptgebied (testdata)", en: "Draft area (test data)" },
                  geometryType: "area",
                  path: "M 100 500 L 200 500 L 200 600 L 100 600 Z",
                  areaRank: 5,
                },
              ],
            }
          : layer,
      ),
    };
    const html = renderToStaticMarkup(<AtlasScene locale="nl" scene={scene} variant="overview" />);
    expect(html).toMatch(
      /<path [^>]*data-feature-id="geo\.appellation-area\.fixture-draft"[^>]*data-role="selectable"[^>]*><title>Conceptgebied \(testdata\)<\/title><\/path>/,
    );
    expect(html).not.toContain("/appellations/cahors");
    expect(html).toContain("Pagina in voorbereiding");
  });

  it("repeats the highlighted outline above water, inert and hidden", () => {
    expect(html).toMatch(
      /<g aria-hidden="true" class="atlas-highlight-overlay"><path class="atlas-highlight-outline" d="[^"]+" data-outline-for="geo\.appellation-area\.barsac"><\/path><\/g><g aria-hidden="true" class="atlas-labels">/,
    );
    const plain = renderToStaticMarkup(
      <AtlasScene locale="nl" scene={sampleScene} variant="overview" />,
    );
    expect(plain).not.toContain("atlas-highlight-overlay");
  });

  it("plans every label for the no-JavaScript breakpoints too", () => {
    const labels = html.match(/<text class="atlas-label[^>]*>/g) ?? [];
    expect(labels.length).toBeGreaterThan(0);
    for (const label of labels) {
      expect(label).toMatch(/data-visible-medium="(true|false)"/);
      expect(label).toMatch(/data-visible-narrow="(true|false)"/);
    }
    expect(html).toMatch(/<text aria-hidden="true"[^>]*data-visible-narrow="(true|false)"/);
  });

  it("never calls a non-owner region unavailable, and names only the layers drawn", () => {
    const region = renderToStaticMarkup(
      <AtlasScene
        highlightedEntityId="region.bordeaux"
        locale="nl"
        scene={sampleScene}
        variant="embedded"
      />,
    );
    expect(region).not.toContain("atlas-scene-notice");
    const noPlaces: AtlasSceneView = {
      ...sampleScene,
      layers: sampleScene.layers.filter((layer) => layer.role !== "places"),
    };
    const text = visibleText(
      renderToStaticMarkup(<AtlasScene locale="en" scene={noPlaces} variant="embedded" />),
    );
    expect(text).toContain("with water for orientation.");
    expect(text).not.toContain("towns for orientation");
  });
});

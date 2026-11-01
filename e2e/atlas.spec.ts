// Atlas browser tests per docs/atlas-plan.md §9 and §10, written against the server-rendered
// markup of src/components/atlas. Scenes come from the generated display assets of the
// last content build; the tests fail loudly when a contract scene is missing.
import { expect, test, type Locator, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";

interface SceneFeature {
  id: string;
  owner?: string;
  labelAnchor?: [number, number];
  point?: [number, number];
  areaRank?: number;
}

interface SceneCredit {
  sourceId: string;
  attribution?: string;
  url?: string;
  licence: { name: string; url: string };
}

interface SceneFile {
  viewBox: { width: number; height: number };
  layers: Array<{ id: string; role: string; features: SceneFeature[] }>;
  coverage: {
    intended: string[];
    shown: string[];
    missing: Array<{ entity: string; reason: string }>;
  };
  credits: SceneCredit[];
}

function readScene(id: string): SceneFile {
  return JSON.parse(
    readFileSync(path.join(process.cwd(), "src/generated/geography/scenes", `${id}.json`), "utf8"),
  ) as SceneFile;
}

/** The source record's own title, which carries pipeline terms and must never be shown. */
function sourceRecordTitle(sourceId: string): string {
  const file = path.join(
    process.cwd(),
    "data/sources",
    `${sourceId.replace(/^source\./, "")}.yaml`,
  );
  return (parseYaml(readFileSync(file, "utf8")) as { title: string }).title;
}

function sceneFeature(scene: SceneFile, featureId: string): SceneFeature {
  const feature = scene.layers
    .flatMap((layer) => layer.features)
    .find((candidate) => candidate.id === featureId);
  if (!feature) throw new Error(`Scene has no feature '${featureId}'`);
  return feature;
}

/**
 * Map a point in viewBox units to client pixels for the rendered map. The SVG keeps its
 * aspect ratio (xMidYMid meet), so the drawing is centred within the element's box.
 */
async function clientPoint(
  map: Locator,
  [x, y]: [number, number],
): Promise<{ x: number; y: number }> {
  await map.scrollIntoViewIfNeeded();
  const box = await map.boundingBox();
  if (!box) throw new Error("The map has no bounding box");
  const viewBox = await map.evaluate((svg) =>
    (svg.getAttribute("viewBox") ?? "0 0 1 1").split(/[\s,]+/).map(Number),
  );
  const [vx, vy, vw, vh] = viewBox;
  const scale = Math.min(box.width / vw, box.height / vh);
  const offsetX = (box.width - vw * scale) / 2;
  const offsetY = (box.height - vh * scale) / 2;
  return { x: box.x + offsetX + (x - vx) * scale, y: box.y + offsetY + (y - vy) * scale };
}

async function noHorizontalOverflow(page: Page, width: number) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    width,
  );
}

/** Wait until the client enhancement has adopted the map (zoom state and a focusable frame). */
async function enhanced(scene: Locator) {
  await expect(scene.locator("svg.atlas-map")).toHaveAttribute("data-zoom", /^\d/);
  await expect(scene.locator(".atlas-map-frame")).toHaveAttribute("tabindex", "0");
}

/** Move the pointer over a visible part of the map and turn the wheel. */
async function wheelOverMap(page: Page, map: Locator, deltaY: number) {
  await map.scrollIntoViewIfNeeded();
  const box = await map.boundingBox();
  const viewport = page.viewportSize();
  if (!box || !viewport) throw new Error("The map has no bounding box");
  const y = Math.max(box.y + 20, Math.min(box.y + box.height / 2, viewport.height - 40));
  await page.mouse.move(box.x + box.width / 2, y);
  await page.mouse.wheel(0, deltaY);
}

const scrollY = (page: Page) => page.evaluate(() => window.scrollY);

/** Start keyboard traversal just before the feature list, without a tab stop of our own. */
async function focusBeforeList(scene: Locator) {
  await scene.locator(".atlas-feature-list .atlas-list-title").evaluate((title) => {
    title.setAttribute("tabindex", "-1");
    (title as HTMLElement).focus();
  });
}

type FocusKind = "list" | "svg" | "controls" | "frame" | "chooser" | "other" | "none";

async function focusedTarget(page: Page): Promise<{ kind: FocusKind; href: string | null }> {
  return page.evaluate(() => {
    const active = document.activeElement;
    if (!active || active === document.body) return { kind: "none" as const, href: null };
    const href = active.getAttribute("href");
    if (active.closest(".atlas-chooser")) return { kind: "chooser" as const, href };
    if (active.matches(".atlas-map-frame")) return { kind: "frame" as const, href };
    if (active.closest("svg")) return { kind: "svg" as const, href };
    if (active.matches("a.atlas-area-link")) return { kind: "list" as const, href };
    if (active.closest(".atlas-map-controls")) return { kind: "controls" as const, href };
    return { kind: "other" as const, href };
  });
}

async function hrefs(links: Locator): Promise<string[]> {
  return links.evaluateAll((elements) =>
    elements.map((element) => element.getAttribute("href") ?? ""),
  );
}

interface EntityRecord {
  names: { nl: string; en: string };
  slugs: { nl: string; en: string };
}

/** Read an entity's canonical record, e.g. "appellation.cotes-de-bordeaux". */
function readEntity(id: string): EntityRecord {
  const [type, slug] = id.split(".");
  return parseYaml(
    readFileSync(
      path.join(process.cwd(), "content/entities", `${type}s`, slug, "entity.yaml"),
      "utf8",
    ),
  ) as EntityRecord;
}

interface Hits {
  /** Feature under the pointer that receives hover: the topmost hit with a feature id. */
  top: string | null;
  selectable: string[];
  context: string[];
}

/** What the browser hit-tests at a client point, as the enhancer's chooser sees it. */
async function hitsAt(page: Page, { x, y }: { x: number; y: number }): Promise<Hits> {
  return page.evaluate(
    ([px, py]) => {
      const elements = document.elementsFromPoint(px, py);
      const ids = (role: string) =>
        elements
          .filter(
            (element) =>
              element instanceof SVGPathElement &&
              element.closest("svg.atlas-map") &&
              element.getAttribute("data-role") === role,
          )
          .map((element) => element.getAttribute("data-feature-id") ?? "");
      return {
        top: elements[0]?.closest("[data-feature-id]")?.getAttribute("data-feature-id") ?? null,
        selectable: ids("selectable"),
        context: ids("context"),
      };
    },
    [x, y] as const,
  );
}

/** Client point of a feature's label anchor in a scene. */
async function anchorPoint(scene: Locator, sceneId: string, featureId: string) {
  const anchor = sceneFeature(readScene(sceneId), featureId).labelAnchor;
  if (!anchor) throw new Error(`${featureId} has no label anchor`);
  return clientPoint(scene.locator("svg.atlas-map"), anchor);
}

/** Document offset of an element's top edge, in CSS px. */
async function documentTop(locator: Locator): Promise<number> {
  return locator.evaluate((element) => element.getBoundingClientRect().top + window.scrollY);
}

/** The SVG's current viewBox as numbers. */
async function viewBoxOf(map: Locator): Promise<number[]> {
  return map.evaluate((svg) => (svg.getAttribute("viewBox") ?? "").split(/[\s,]+/).map(Number));
}

/** Click the Barsac label anchor, where Barsac and Sauternes overlap, and return the chooser. */
async function openChooserAtBarsac(page: Page, scene: Locator): Promise<Locator> {
  await enhanced(scene);
  const point = await anchorPoint(scene, scenes.gravesSauternais.id, "geo.appellation-area.barsac");
  const hits = await hitsAt(page, point);
  expect(
    hits.selectable,
    "Test data: Barsac's label anchor should hit both Barsac and Sauternes",
  ).toEqual(
    expect.arrayContaining(["geo.appellation-area.barsac", "geo.appellation-area.sauternes"]),
  );
  await page.mouse.click(point.x, point.y);
  const chooser = scene.locator(".atlas-chooser[role='dialog']");
  await expect(chooser).toBeVisible();
  return chooser;
}

const scenes = {
  bordeaux: { id: "scene.bordeaux", slug: "bordeaux" },
  medoc: { id: "scene.medoc", slug: "medoc" },
  libournais: { id: "scene.libournais", slug: "libournais" },
  fronsadais: { id: "scene.fronsadais", slug: "fronsadais" },
  gravesSauternais: { id: "scene.graves-sauternais", slug: "graves-and-sauternais" },
  entreDeuxMers: { id: "scene.entre-deux-mers", slug: "entre-deux-mers" },
  blayaisBourgeais: { id: "scene.blayais-bourgeais", slug: "blayais-and-bourgeais" },
  champagne: { id: "scene.champagne", slug: "champagne" },
} as const;

/** Scenes whose owner region is active; Champagne's owner is still a draft. */
const activeOwnerScenes = [
  scenes.bordeaux,
  scenes.medoc,
  scenes.libournais,
  scenes.fronsadais,
  scenes.gravesSauternais,
  scenes.entreDeuxMers,
  scenes.blayaisBourgeais,
];

/** Pipeline and source-record vocabulary that must never reach readers. */
const forbiddenTerms = ["shapefile", "WFS", "remplace", "geo.", "EPSG", "scene."];

for (const locale of ["nl", "en"] as const) {
  const prefix = locale === "en" ? "/en" : "";
  const copy =
    locale === "nl"
      ? {
          overviewHeading: "Kaart van Bordeaux",
          medocHeading: "Kaart van Médoc",
          zoomIn: "Inzoomen",
          zoomOut: "Uitzoomen",
          reset: "Herstel weergave",
          coverage: (shown: number, intended: number) =>
            `${shown} van de ${intended} appellaties van deze kaart zijn getekend.`,
          contextHeading: /^Overkoepelend/,
          missingIntro: "Nog niet op de kaart:",
          chooserHeading: "Meerdere gebieden op deze plek",
          alsoWithin: "Ligt ook in:",
          reusedUnder: ", hergebruikt onder ",
          attributionLabel: "Bronvermelding",
          independence: /onafhankelijk/g,
          about: "Over deze kaart: gebieden, legenda en bron",
          unavailable: (name: string) => `${name} staat nog niet op de kaart: `,
          viewInAtlas: "Bekijk in de Atlas",
          readAbout: "Lees over Médoc",
          draftIntro:
            "De pagina over deze regio is nog in voorbereiding; de kaart is al te bekijken.",
          scaleStatement: "Bedoeld voor regionale oriëntatie.",
          sceneOrientation: "als oriëntatie",
          wheelHint: /^Gebruik (Ctrl|⌘) \+ scrollen om te zoomen$/,
          touchHint: "Gebruik twee vingers om de kaart te bewegen",
          portalTitle: "Wijnregio's op de kaart",
          previewNote: "De atlas is al vroeg te zien",
          scope: (regions: number, maps: number) =>
            `Nu in de atlas: ${regions} regio's, ${maps === regions ? "alle" : maps} met een kaart.`,
          cardCoverage: (shown: number, intended: number) =>
            shown === intended
              ? `${shown} appellaties op de kaart`
              : `${shown} van ${intended} appellaties op de kaart`,
          mapOf: "Kaart van",
          finderLabel: "Zoek een regio of appellatie",
          finderSubmit: "Zoeken",
          found: (count: number) =>
            count === 1 ? "1 regio gevonden" : `${count} regio's gevonden`,
          shown: (count: number) => `, ${count} getoond`,
          areaHit: (area: string) => `Met ${area}`,
          readAboutBordeaux: "Lees over Bordeaux",
          none: (query: string) => `Geen regio gevonden voor ‘${query}’.`,
        }
      : {
          overviewHeading: "Map of Bordeaux",
          medocHeading: "Map of Médoc",
          zoomIn: "Zoom in",
          zoomOut: "Zoom out",
          reset: "Reset view",
          coverage: (shown: number, intended: number) =>
            `${shown} of this map's ${intended} appellations are drawn.`,
          contextHeading: /^Overarching/,
          missingIntro: "Not yet on the map:",
          chooserHeading: "Several areas at this spot",
          alsoWithin: "Also within:",
          reusedUnder: ", reused under ",
          attributionLabel: "Attribution:",
          independence: /independently/g,
          about: "About this map: areas, legend and source",
          unavailable: (name: string) => `${name} is not on the map yet: `,
          viewInAtlas: "View in the Atlas",
          readAbout: "Read about Médoc",
          draftIntro:
            "The page about this region is still in preparation; the map can already be viewed.",
          scaleStatement: "Meant for regional orientation.",
          sceneOrientation: "for orientation",
          wheelHint: /^Use (Ctrl|⌘) \+ scroll to zoom$/,
          touchHint: "Use two fingers to move the map",
          portalTitle: "Wine regions on the map",
          previewNote: "The atlas is published early",
          scope: (regions: number, maps: number) =>
            `In the atlas so far: ${regions} regions, ${maps === regions ? "all" : maps} with a map.`,
          cardCoverage: (shown: number, intended: number) =>
            shown === intended
              ? `${shown} appellations on the map`
              : `${shown} of ${intended} appellations on the map`,
          mapOf: "Map of",
          finderLabel: "Find a region or appellation",
          finderSubmit: "Search",
          found: (count: number) => (count === 1 ? "1 region found" : `${count} regions found`),
          shown: (count: number) => `, ${count} shown`,
          areaHit: (area: string) => `With ${area}`,
          readAboutBordeaux: "Read about Bordeaux",
          none: (query: string) => `No region matches ‘${query}’.`,
        };

  test(`${locale} the Bordeaux overview scene renders with legend and one credit line per source`, async ({
    page,
  }) => {
    await page.goto(`${prefix}/atlas/${scenes.bordeaux.slug}`);
    const scene = page.locator(`[data-atlas-scene="${scenes.bordeaux.id}"]`);
    await expect(scene).toBeVisible();
    await expect(
      scene.getByRole("heading", { level: 2, name: copy.overviewHeading }),
    ).toBeAttached();
    await expect(scene.locator("svg.atlas-map")).toHaveAttribute("data-zoom", /^\d/);

    // Licence Ouverte 2.0: the verbatim attribution, linked to the dataset, plus the licence.
    const credits = scene.locator(".atlas-legend-credits");
    const sources = readScene(scenes.bordeaux.id).credits;
    await expect(credits.locator("li")).toHaveCount(sources.length);
    for (const source of sources) {
      if (!source.attribution) throw new Error(`${source.sourceId} has no attribution`);
      const line = credits.locator("li").filter({ hasText: source.attribution });
      await expect(line).toHaveCount(1);
      await expect(line).toHaveText(
        `${source.attribution}${copy.reusedUnder}${source.licence.name}.`,
      );
      if (source.url) {
        await expect(line.locator(`a[href="${source.url}"]`)).toHaveText(source.attribution);
      }
      await expect(line.getByRole("link", { name: source.licence.name })).toHaveAttribute(
        "href",
        /etalab-2\.0/,
      );
      await expect(credits).not.toContainText(sourceRecordTitle(source.sourceId));
    }
    await expect(credits).not.toContainText(copy.attributionLabel);
    const sceneText = await scene.innerText();
    expect(sceneText.match(copy.independence) ?? []).toHaveLength(1);
    // The scale statement lives in the map's legend, once, never in the intro.
    await expect(page.locator(".page-intro")).not.toContainText(copy.scaleStatement);
    const text = (await page.locator("main").textContent()) ?? "";
    expect(text.split(copy.scaleStatement)).toHaveLength(2);
  });

  test(`${locale} the Atlas portal lists every active-owner scene once and nothing of drafts`, async ({
    page,
  }) => {
    await page.goto(`${prefix}/atlas`);
    const portal = page.locator(".atlas-portal");
    for (const { slug } of activeOwnerScenes) {
      await expect(portal.locator(`a[href="${prefix}/atlas/${slug}"]`)).toHaveCount(1);
    }
    await expect(
      page.locator(`main a[href="${prefix}/atlas/${scenes.champagne.slug}"]`),
    ).toHaveCount(0);
    await expect(page.locator("main")).not.toContainText(
      readEntity("region.champagne").names[locale],
    );
    // The portal draws no map of its own and loads no scene.
    await expect(page.locator("[data-atlas-scene]")).toHaveCount(0);
    // Scope from data: every listed region is a portal node.
    await expect(page.locator(".page-intro")).toContainText(
      copy.scope(await page.locator("[data-portal-node]").count(), activeOwnerScenes.length),
    );
  });

  test(`${locale} the Atlas portal: Bordeaux section, its own map card, cards, and Fronsadais inside Libournais`, async ({
    page,
  }) => {
    await page.goto(`${prefix}/atlas`);
    await expect(page.getByRole("heading", { level: 1, name: copy.portalTitle })).toBeVisible();
    await expect(page.locator(".page-intro")).toContainText(copy.previewNote);
    const section = page.locator(".atlas-portal-section").filter({
      has: page.getByRole("heading", { level: 2, name: "Bordeaux", exact: true }),
    });
    await expect(section).toHaveCount(1);
    const lead = section.locator(".atlas-portal-card-lead");
    await expect(lead.getByRole("link", { name: copy.overviewHeading })).toHaveAttribute(
      "href",
      `${prefix}/atlas/${scenes.bordeaux.slug}`,
    );
    // The intro promises reading about the region: the lead card links to its page too.
    await expect(lead.getByRole("link", { name: copy.readAboutBordeaux })).toHaveAttribute(
      "href",
      `${prefix}/regions/bordeaux`,
    );
    const cards = section.locator(".atlas-portal-grid > li > .atlas-portal-card");
    await expect(cards).toHaveCount(5);
    for (const card of await cards.all()) {
      // One link per card; a map card shows its thumbnail.
      await expect(card.locator("a.atlas-portal-link")).toHaveCount(1);
      expect(await card.locator("svg.atlas-portal-thumb path").count()).toBeGreaterThan(0);
    }
    const libournais = section.locator("li[data-portal-node]").filter({
      has: page.locator(`a.atlas-portal-link[href="${prefix}/atlas/${scenes.libournais.slug}"]`),
    });
    const fronsadais = libournais.locator(".atlas-portal-sub a");
    await expect(fronsadais).toHaveAttribute("href", `${prefix}/atlas/${scenes.fronsadais.slug}`);
    await expect(fronsadais).toHaveText("Fronsadais");
  });

  test(`${locale} portal cards state coverage from computed data and read naturally`, async ({
    page,
  }) => {
    await page.goto(`${prefix}/atlas`);
    for (const scene of activeOwnerScenes) {
      const { coverage } = readScene(scene.id);
      const link = page.locator(`.atlas-portal a[href="${prefix}/atlas/${scene.slug}"]`);
      const state = page.locator(`#${await link.getAttribute("aria-describedby")}`);
      await expect(state).toHaveText(
        copy.cardCoverage(coverage.shown.length, coverage.intended.length),
      );
      // The name alone is the link text; the state is a separate description.
      const owner = readEntity(scene.id.replace(/^scene\./, "region.")).names[locale];
      const name = (await link.innerText()).trim();
      expect([owner, `${copy.mapOf} ${owner}`]).toContain(name);
    }
  });

  test(`${locale} the Bordeaux scene states coverage from computed data`, async ({ page }) => {
    // Expectations follow the scene data, so publishing a held record does not break the suite.
    const { coverage } = readScene(scenes.bordeaux.id);
    const missingNames = coverage.missing.map((entry) => readEntity(entry.entity).names[locale]);
    await page.goto(`${prefix}/atlas/${scenes.bordeaux.slug}`);
    const statement = page.locator(
      `[data-atlas-scene="${scenes.bordeaux.id}"] .atlas-legend-coverage`,
    );
    if (missingNames.length === 0) {
      // Complete coverage needs no statement.
      await expect(statement).toHaveCount(0);
      return;
    }
    await expect(statement.locator("p").first()).toHaveText(
      copy.coverage(coverage.shown.length, coverage.intended.length),
    );
    await expect(statement).toContainText(`${copy.missingIntro} ${missingNames[0]}`);
    for (const name of missingNames) await expect(statement).toContainText(name);
  });

  test(`${locale} a complete map says nothing about coverage`, async ({ page }) => {
    expect(readScene(scenes.medoc.id).coverage.missing, "Test data: Médoc is complete").toEqual([]);
    await page.goto(`${prefix}/atlas/${scenes.medoc.slug}`);
    await expect(page.locator(".atlas-legend-coverage")).toHaveCount(0);
    await page.goto(`${prefix}/appellations/pauillac`);
    await expect(page.locator("[data-entity-atlas] .atlas-legend-coverage")).toHaveCount(0);
  });

  test(`${locale} the portal and every scene route load without pipeline vocabulary`, async ({
    page,
  }) => {
    for (const route of [
      `${prefix}/atlas`,
      ...Object.values(scenes).map(({ slug }) => `${prefix}/atlas/${slug}`),
    ]) {
      const response = await page.goto(route);
      expect(response?.status(), route).toBe(200);
      await expect(page.locator("[data-atlas-scene], .atlas-portal").first()).toBeVisible();
      const text = await page.locator("main").innerText();
      for (const term of forbiddenTerms) {
        expect(text.includes(term), `${route} shows "${term}"`).toBe(false);
      }
    }
  });

  test(`${locale} the finder filters regions in place, ignoring case and accents`, async ({
    page,
  }) => {
    await page.goto(`${prefix}/atlas`);
    const input = page.getByRole("searchbox", { name: copy.finderLabel });
    const status = page.locator(".atlas-portal-status");
    const visibleCards = page.locator(".atlas-portal-grid > li:visible");
    const visibleNodes = page.locator("[data-portal-node]:visible");
    await expect(visibleCards).toHaveCount(5);

    // Case and accents are ignored: the same matches and the same status.
    await input.fill("médoc");
    await expect(status).not.toHaveText("");
    const statusText = (await status.textContent()) ?? "";
    for (const query of ["MEDOC", "Medoc"]) {
      await input.fill(query);
      await expect(status).toHaveText(statusText);
    }
    await expect(
      page.locator(`a.atlas-portal-link[href="${prefix}/atlas/${scenes.medoc.slug}"]`),
    ).toBeVisible();

    // A match deeper down keeps its card and section as context, and the status says what is
    // shown: one found, three entries on screen.
    await input.fill("fronsadais");
    await expect(visibleCards).toHaveCount(1);
    await expect(page.locator(".atlas-portal-sub a:visible")).toHaveText("Fronsadais");
    await expect(visibleNodes).toHaveCount(3);
    await expect(status).toHaveText(`${copy.found(1)}${copy.shown(3)}`);

    // An appellation finds the regions whose maps draw it: Médoc and the Bordeaux overview,
    // each saying so, and nothing else (Bordeaux is the section, so no extra context).
    await input.fill("pauillac");
    await expect(visibleNodes).toHaveCount(2);
    await expect(visibleCards).toHaveCount(1);
    const medocCard = page.locator(".atlas-portal-grid > li:visible");
    await expect(medocCard.locator("a.atlas-portal-link")).toHaveAttribute(
      "href",
      `${prefix}/atlas/${scenes.medoc.slug}`,
    );
    await expect(medocCard.locator("[data-area-hit]")).toHaveText(copy.areaHit("Pauillac"));
    await expect(page.locator(".atlas-portal-card-lead [data-area-hit]")).toHaveText(
      copy.areaHit("Pauillac"),
    );
    await expect(status).toHaveText(copy.found(2));
    await expect(page.locator("[data-area-hit]:not(:empty)")).toHaveCount(2);

    // A partial name still finds Fronsadais inside Libournais; the regions whose maps draw
    // Fronsac show too, and the status counts exactly the entries on screen.
    await input.fill("fronsa");
    await expect(visibleCards).toHaveCount(1);
    await expect(page.locator(".atlas-portal-sub a:visible")).toHaveText("Fronsadais");
    const onScreen = await visibleNodes.count();
    await expect(status).toHaveText(copy.found(onScreen));

    // Escape clears the filter and the appellation lines.
    await input.press("Escape");
    await expect(input).toHaveValue("");
    await expect(status).toHaveText("");
    await expect(visibleCards).toHaveCount(5);
    await expect(page.locator("[data-area-hit]:not(:empty)")).toHaveCount(0);

    // No match: say so and offer the whole knowledge base.
    await input.fill("xyzzy");
    await expect(status).toContainText(copy.none("xyzzy"));
    await expect(status.getByRole("link")).toHaveAttribute("href", `${prefix}/search?q=xyzzy`);
    await expect(page.locator(".atlas-portal-section:visible")).toHaveCount(0);

    // One match: Enter opens it.
    await input.fill("fronsadais");
    await input.press("Enter");
    await expect(page).toHaveURL(`${prefix}/atlas/${scenes.fronsadais.slug}`);
  });

  test(`${locale} Enter with several matches searches regions on the search page`, async ({
    page,
  }) => {
    await page.goto(`${prefix}/atlas`);
    const input = page.getByRole("searchbox", { name: copy.finderLabel });
    await input.fill("pauillac");
    await expect(page.locator(".atlas-portal-status")).not.toHaveText("");
    await expect(page.locator(".atlas-portal-status")).not.toHaveText(copy.found(1));
    await input.press("Enter");
    await expect(page).toHaveURL(new RegExp(`${prefix}/search\\?q=pauillac&type=region$`));
  });

  test(`${locale} without JavaScript the finder searches regions on the search page`, async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    try {
      await page.goto(`${prefix}/atlas`);
      await expect(page.locator(".atlas-portal-grid > li")).toHaveCount(5);
      await page.getByRole("searchbox", { name: copy.finderLabel }).fill("Médoc");
      await page.getByRole("button", { name: copy.finderSubmit }).click();
      await expect(page).toHaveURL(new RegExp(`${prefix}/search\\?q=M%C3%A9doc&type=region$`));
      await expect(page.locator(`main a[href="${prefix}/regions/medoc"]`).first()).toBeVisible();
    } finally {
      await context.close();
    }
  });

  test(`${locale} the finder is the first stop after the header, then one stop per region`, async ({
    page,
  }) => {
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${prefix}/atlas`);
      const input = page.getByRole("searchbox", { name: copy.finderLabel });
      // Nothing in main is focusable before the finder.
      const firstInMain = await page.evaluate(() => {
        const focusable = document.querySelectorAll(
          "main a[href], main button, main input:not([type=hidden]), main summary, main [tabindex]:not([tabindex='-1'])",
        );
        return focusable[0]?.id ?? focusable[0]?.tagName ?? null;
      });
      expect(firstInMain).toBe(await input.getAttribute("id"));
      await input.focus();
      await page.keyboard.press("Tab");
      await expect(page.getByRole("button", { name: copy.finderSubmit })).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(page.locator(".atlas-portal-card-lead a.atlas-portal-link")).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(page.locator(".atlas-portal-card-lead .atlas-portal-about a")).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(page.locator(".atlas-portal-grid a.atlas-portal-link").first()).toBeFocused();
    }
  });

  test(`${locale} Médoc scene offers the same areas on the map and in the list`, async ({
    page,
  }) => {
    await page.goto(`${prefix}/atlas/${scenes.medoc.slug}`);
    const scene = page.locator(`[data-atlas-scene="${scenes.medoc.id}"]`);
    // The page title names the region; the map heading stays for assistive technology only.
    const heading = scene.getByRole("heading", { level: 2, name: copy.medocHeading });
    await expect(heading).toHaveCount(1);
    await expect(heading).toHaveClass(/\batlas-visually-hidden\b/);
    const pauillac = `${prefix}/appellations/pauillac`;
    await expect(scene.locator(`a.atlas-link[href="${pauillac}"]`)).toHaveCount(1);
    await expect(scene.locator(`a.atlas-area-link[href="${pauillac}"]`)).toHaveCount(1);
    // The list is sorted per locale and the SVG keeps draw order: compare sets, not order.
    expect((await hrefs(scene.locator("a.atlas-link"))).sort()).toEqual(
      (await hrefs(scene.locator("a.atlas-area-link"))).sort(),
    );
    await enhanced(scene);
    const controls = scene.locator(".atlas-map-controls");
    for (const name of [copy.zoomIn, copy.zoomOut, copy.reset]) {
      // Ready: no longer disabled (zoom out still reports aria-disabled at the base view).
      await expect(controls.getByRole("button", { name, exact: true })).not.toHaveAttribute(
        "disabled",
      );
      await expect(controls.getByRole("button", { name, exact: true })).toHaveAttribute(
        "title",
        name,
      );
    }
    await expect(scene.locator("[data-engaged]")).toHaveCount(0);
    await controls.getByRole("button", { name: copy.zoomIn, exact: true }).click();
    await expect(scene.locator("svg.atlas-map")).toHaveAttribute("data-zoom", "1.50");
    await controls.getByRole("button", { name: copy.reset, exact: true }).click();
    await expect(scene.locator("svg.atlas-map")).toHaveAttribute("data-zoom", "1.00");
  });

  test(`${locale} scene intro says one thing once and its link reads as a link`, async ({
    page,
  }) => {
    await page.goto(`${prefix}/atlas/${scenes.medoc.slug}`);
    const intro = page.locator(".page-intro-copy");
    await expect(intro.locator("p")).toHaveCount(2);
    const link = intro.getByRole("link", { name: copy.readAbout, exact: true });
    await expect(link).toBeVisible();
    const colours = await link.evaluate((element) => {
      const paragraph = element.closest(".page-intro-copy") as HTMLElement;
      const own = getComputedStyle(element);
      return {
        link: own.color,
        text: getComputedStyle(paragraph).color,
        underline: own.textDecorationLine,
      };
    });
    expect(colours.link).not.toBe(colours.text);
    expect(colours.underline).toContain("underline");
    const text = (await page.locator("main").textContent()) ?? "";
    expect(text.split(copy.sceneOrientation)).toHaveLength(2);
    expect(text.split(copy.scaleStatement)).toHaveLength(2);
    await expect(intro).not.toContainText(copy.scaleStatement);
  });

  test(`${locale} selection works without JavaScript through the SVG link`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    try {
      await page.goto(`${prefix}/atlas/${scenes.medoc.slug}`);
      const scene = page.locator(`[data-atlas-scene="${scenes.medoc.id}"]`);
      await expect(scene).toBeVisible();
      await expect(scene.locator("svg.atlas-map")).not.toHaveAttribute("data-zoom", /./);
      await expect(scene.locator(".atlas-map-controls")).toBeHidden();
      const anchor = sceneFeature(
        readScene(scenes.medoc.id),
        "geo.appellation-area.pauillac",
      ).labelAnchor;
      if (!anchor) throw new Error("Pauillac has no label anchor");
      const point = await clientPoint(scene.locator("svg.atlas-map"), anchor);
      await page.mouse.click(point.x, point.y);
      await expect(page).toHaveURL(new RegExp(`${prefix}/appellations/pauillac$`));
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Pauillac");
    } finally {
      await context.close();
    }
  });

  test(`${locale} keyboard users open an area from the list with Enter; SVG links are not tab stops`, async ({
    page,
  }) => {
    await page.goto(`${prefix}/atlas/${scenes.medoc.slug}`);
    const scene = page.locator(`[data-atlas-scene="${scenes.medoc.id}"]`);
    await enhanced(scene);
    const svgLinks = scene.locator("a.atlas-link");
    expect(await svgLinks.count()).toBeGreaterThan(0);
    for (const link of await svgLinks.all()) await expect(link).toHaveAttribute("tabindex", "-1");
    await focusBeforeList(scene);
    await page.keyboard.press("Tab");
    const focused = await focusedTarget(page);
    expect(focused.kind).toBe("list");
    expect(focused.href).toMatch(new RegExp(`^${prefix}/appellations/`));
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp(`${focused.href}$`));
  });

  test(`${locale} Tab walks the Médoc list, then the map frame, then its controls, never an SVG link`, async ({
    page,
  }) => {
    await page.goto(`${prefix}/atlas/${scenes.medoc.slug}`);
    const scene = page.locator(`[data-atlas-scene="${scenes.medoc.id}"]`);
    await enhanced(scene);
    const listHrefs = await hrefs(scene.locator(".atlas-feature-list a.atlas-area-link"));
    expect(listHrefs.length).toBeGreaterThan(0);
    await expect(scene.locator("a.atlas-link")).toHaveCount(listHrefs.length);

    await focusBeforeList(scene);
    const steps: Array<{ kind: FocusKind; href: string | null }> = [];
    for (let step = 0; step < listHrefs.length + 6; step += 1) {
      await page.keyboard.press("Tab");
      steps.push(await focusedTarget(page));
    }
    expect(steps.map((step) => step.kind)).not.toContain("svg");
    expect(steps.slice(0, listHrefs.length)).toEqual(
      listHrefs.map((href) => ({ kind: "list", href })),
    );
    const after = steps.slice(listHrefs.length).map((step) => step.kind);
    expect(after.slice(0, 4)).toEqual(["frame", "controls", "controls", "controls"]);
  });

  test(`${locale} the focused frame pans with the arrows and zooms with + and 0, no engaging`, async ({
    page,
  }) => {
    await page.goto(`${prefix}/atlas/${scenes.medoc.slug}`);
    const scene = page.locator(`[data-atlas-scene="${scenes.medoc.id}"]`);
    const map = scene.locator("svg.atlas-map");
    await enhanced(scene);
    const frame = scene.locator(".atlas-map-frame");
    await expect(frame).toHaveAttribute("aria-describedby", /-map-keys$/);
    const describedBy = await frame.getAttribute("aria-describedby");
    await expect(page.locator(`[id="${describedBy}"]`)).toHaveText(/\+/);
    await frame.focus();
    await page.keyboard.press("+");
    await expect(map).toHaveAttribute("data-zoom", "1.50");
    const before = await viewBoxOf(map);
    await page.keyboard.press("ArrowRight");
    await expect.poll(async () => (await viewBoxOf(map))[0]).toBeGreaterThan(before[0]);
    await page.keyboard.press("0");
    await expect(map).toHaveAttribute("data-zoom", "1.00");
  });

  test(`${locale} hover and focus highlight the same area in the list and on the map`, async ({
    page,
  }) => {
    await page.goto(`${prefix}/atlas/${scenes.medoc.slug}`);
    const scene = page.locator(`[data-atlas-scene="${scenes.medoc.id}"]`);
    await enhanced(scene);
    // Listrac-Médoc has no town marker at its label anchor, so the pointer meets the area itself.
    const id = "geo.appellation-area.listrac-medoc";
    const listLink = scene.locator(
      `.atlas-feature-list [data-feature-id="${id}"] a.atlas-area-link`,
    );
    const shape = scene.locator(`svg.atlas-map path[data-feature-id="${id}"]`);
    const listItem = scene.locator(`.atlas-feature-list [data-feature-id="${id}"]`);

    await listLink.focus();
    await expect(shape).toHaveClass(/\bis-active\b/);
    await listLink.blur();
    await expect(shape).not.toHaveClass(/\bis-active\b/);

    const point = await anchorPoint(scene, scenes.medoc.id, id);
    expect(
      (await hitsAt(page, point)).top,
      "Test data: Listrac-Médoc's label anchor should hit the area itself, not a town marker",
    ).toBe(id);
    await page.mouse.move(point.x, point.y);
    await expect(listItem).toHaveClass(/\bis-active\b/);
    await expect(shape).toHaveClass(/\bis-active\b/);
  });

  test(`${locale} overlap chooser lists the most specific area first and overarching areas on one line`, async ({
    page,
  }) => {
    await page.goto(`${prefix}/atlas/${scenes.gravesSauternais.slug}`);
    const scene = page.locator(`[data-atlas-scene="${scenes.gravesSauternais.id}"]`);
    const chooser = await openChooserAtBarsac(page, scene);
    await expect(chooser).toContainText(copy.chooserHeading);
    // Expected order from the build's area rank: a higher rank is a smaller area.
    const data = readScene(scenes.gravesSauternais.id);
    const rank = (id: string) => sceneFeature(data, id).areaRank ?? 0;
    const expected = ["geo.appellation-area.barsac", "geo.appellation-area.sauternes"].sort(
      (left, right) => rank(right) - rank(left),
    );
    const names = expected.map((id) =>
      id === "geo.appellation-area.barsac" ? "Barsac" : "Sauternes",
    );
    const items = chooser.locator("li");
    await expect(items).toHaveText(names);
    await expect(items.first()).toHaveClass(/atlas-chooser-primary/);
    const context = chooser.locator(".atlas-chooser-context");
    await expect(context).toHaveCount(1);
    await expect(context).toHaveText(new RegExp(`^${copy.alsoWithin} .*Bordeaux`));
    await expect(page).toHaveURL(new RegExp(`${prefix}/atlas/${scenes.gravesSauternais.slug}$`));
    await chooser.getByRole("link", { name: "Sauternes", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${prefix}/appellations/sauternes$`));
  });

  test(`${locale} the Médoc chooser at Pauillac leads with Pauillac`, async ({ page }) => {
    await page.goto(`${prefix}/atlas/${scenes.medoc.slug}`);
    const scene = page.locator(`[data-atlas-scene="${scenes.medoc.id}"]`);
    await enhanced(scene);
    const point = await anchorPoint(scene, scenes.medoc.id, "geo.appellation-area.pauillac");
    const hits = await hitsAt(page, point);
    expect(hits.selectable.length, "Test data: Pauillac overlaps Médoc areas").toBeGreaterThan(1);
    await page.mouse.click(point.x, point.y);
    const chooser = scene.locator(".atlas-chooser[role='dialog']");
    await expect(chooser.locator("li").first()).toHaveText("Pauillac");
    await expect(chooser.locator(".atlas-chooser-context")).toHaveCount(
      hits.context.length > 0 ? 1 : 0,
    );
  });

  test(`${locale} a single area over the overarching one opens directly, without the chooser`, async ({
    page,
  }) => {
    // Lalande-de-Pomerol lies only over the overarching Bordeaux area and has no town marker.
    await page.goto(`${prefix}/atlas/${scenes.libournais.slug}`);
    const scene = page.locator(`[data-atlas-scene="${scenes.libournais.id}"]`);
    await enhanced(scene);
    const point = await anchorPoint(
      scene,
      scenes.libournais.id,
      "geo.appellation-area.lalande-de-pomerol",
    );
    const hits = await hitsAt(page, point);
    expect(
      hits.selectable,
      "Test data: Lalande-de-Pomerol's label anchor should hit one selectable area only",
    ).toEqual(["geo.appellation-area.lalande-de-pomerol"]);
    expect(
      hits.context.length,
      "Test data: an overarching area should lie beneath",
    ).toBeGreaterThan(0);
    await page.mouse.click(point.x, point.y);
    await expect(page).toHaveURL(new RegExp(`${prefix}/appellations/lalande-de-pomerol$`));
  });

  test(`${locale} chooser takes focus, Escape returns it to the frame and the page still scrolls`, async ({
    page,
  }) => {
    await page.goto(`${prefix}/atlas/${scenes.gravesSauternais.slug}`);
    const scene = page.locator(`[data-atlas-scene="${scenes.gravesSauternais.id}"]`);
    const chooser = await openChooserAtBarsac(page, scene);
    await expect.poll(async () => (await focusedTarget(page)).kind).toBe("chooser");
    await page.keyboard.press("Escape");
    await expect(chooser).toHaveCount(0);
    const frame = scene.locator(".atlas-map-frame");
    await expect(frame).toBeFocused();
    const before = await scrollY(page);
    await wheelOverMap(page, scene.locator("svg.atlas-map"), 400);
    await expect.poll(() => scrollY(page)).toBeGreaterThan(before);
    await expect(scene.locator("svg.atlas-map")).toHaveAttribute("data-zoom", "1.00");
  });

  test(`${locale} the wheel scrolls the page with a hint; Ctrl + wheel zooms the map`, async ({
    page,
  }) => {
    await page.goto(`${prefix}/atlas/${scenes.medoc.slug}`);
    const scene = page.locator(`[data-atlas-scene="${scenes.medoc.id}"]`);
    const map = scene.locator("svg.atlas-map");
    const hint = scene.locator(".atlas-map-hint");
    await enhanced(scene);
    await expect(hint).toBeHidden();
    await map.scrollIntoViewIfNeeded();
    const before = await scrollY(page);
    await wheelOverMap(page, map, 300);
    await expect.poll(() => scrollY(page)).toBeGreaterThan(before);
    await expect(map).toHaveAttribute("data-zoom", "1.00");
    await expect(hint).toBeVisible();
    await expect(hint).toHaveText(copy.wheelHint);
    await expect(hint).toHaveAttribute("aria-hidden", "true");
    await expect(hint).toBeHidden({ timeout: 4000 });

    await wheelOverMap(page, map, 0);
    const settled = await scrollY(page);
    await page.keyboard.down("Control");
    await page.mouse.wheel(0, -400);
    await page.keyboard.up("Control");
    await expect(map).not.toHaveAttribute("data-zoom", "1.00");
    expect(await scrollY(page)).toBe(settled);
  });

  test(`${locale} dragging the map pans it directly and never follows a link`, async ({ page }) => {
    await page.goto(`${prefix}/atlas/${scenes.medoc.slug}`);
    const scene = page.locator(`[data-atlas-scene="${scenes.medoc.id}"]`);
    const map = scene.locator("svg.atlas-map");
    await enhanced(scene);
    // Start on Listrac-Médoc, a linked area: a drag must pan, not open the page.
    const start = await anchorPoint(scene, scenes.medoc.id, "geo.appellation-area.listrac-medoc");
    const before = await viewBoxOf(map);
    const url = page.url();
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(start.x + 40, start.y + 30, { steps: 5 });
    await page.mouse.move(start.x + 80, start.y + 60, { steps: 5 });
    await page.mouse.up();
    const after = await viewBoxOf(map);
    expect(after[0]).toBeLessThan(before[0]);
    expect(after[1]).toBeLessThan(before[1]);
    expect(page.url()).toBe(url);
    await expect(scene.locator(".atlas-chooser")).toHaveCount(0);
  });

  test(`${locale} forced colours draw selectable areas as outlines`, async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await page.goto(`${prefix}/atlas/${scenes.medoc.slug}`);
    const scene = page.locator(`[data-atlas-scene="${scenes.medoc.id}"]`);
    await enhanced(scene);
    const styles = await scene
      .locator('svg.atlas-map path[data-role="selectable"]')
      .evaluateAll((paths) =>
        paths
          .filter((shape) => !shape.closest(".is-active, [data-highlighted]"))
          .map((shape) => {
            const style = getComputedStyle(shape);
            return {
              id: shape.getAttribute("data-feature-id"),
              fill: style.fill,
              fillOpacity: Number.parseFloat(style.fillOpacity),
              stroke: style.stroke,
              strokeWidth: Number.parseFloat(style.strokeWidth),
            };
          }),
      );
    expect(styles.length).toBeGreaterThan(0);
    for (const style of styles) {
      // The fill must be invisible but may stay painted (a Canvas fill at zero opacity) so the
      // whole area remains hit-testable; a fill of none would leave only the stroke clickable.
      const invisibleFill =
        ["none", "transparent", "rgba(0, 0, 0, 0)"].includes(style.fill) || style.fillOpacity === 0;
      expect(invisibleFill, `${style.id} fill ${style.fill} at opacity ${style.fillOpacity}`).toBe(
        true,
      );
      expect(["none", "transparent", "rgba(0, 0, 0, 0)"], `${style.id} stroke`).not.toContain(
        style.stroke,
      );
      expect(style.strokeWidth, `${style.id} stroke width`).toBeGreaterThan(0);
    }
    // Hit-testing still works without fills: Pauillac overlaps Haut-Médoc and Médoc.
    const point = await anchorPoint(scene, scenes.medoc.id, "geo.appellation-area.pauillac");
    await page.mouse.click(point.x, point.y);
    const chooser = scene.locator(".atlas-chooser[role='dialog']");
    await expect(chooser).toBeVisible();
    await expect(chooser.getByRole("link", { name: "Pauillac", exact: true })).toBeVisible();
    await expect(scene.locator(".atlas-map-control").first()).toBeVisible();
  });

  test(`${locale} region and appellation pages embed their scene; grapes do not`, async ({
    page,
  }) => {
    await page.goto(`${prefix}/regions/medoc`);
    const region = page.locator(`[data-entity-atlas="${scenes.medoc.id}"]`);
    await expect(region).toBeVisible();
    await expect(region.locator("a[aria-current]")).toHaveCount(0);

    await page.goto(`${prefix}/appellations/barsac`);
    const embedded = page.locator(`[data-entity-atlas="${scenes.gravesSauternais.id}"]`);
    await expect(embedded).toBeVisible();
    await expect(embedded.locator("a.atlas-link[aria-current='page']")).toHaveAttribute(
      "href",
      `${prefix}/appellations/barsac`,
    );
    await expect(embedded.locator("a.atlas-area-link[aria-current='page']")).toHaveAttribute(
      "href",
      `${prefix}/appellations/barsac`,
    );
    await expect(
      embedded.getByRole("link", { name: copy.viewInAtlas, exact: true }),
    ).toHaveAttribute("href", `${prefix}/atlas/${scenes.gravesSauternais.slug}`);
    // One disclosure after the map holds the areas, legend, scale statement and credits.
    const about = embedded.locator("details.atlas-about");
    await expect(embedded.locator("details")).toHaveCount(1);
    await expect(about).not.toHaveAttribute("open", "");
    await expect(about.locator("summary")).toHaveText(copy.about);
    expect(await documentTop(about)).toBeGreaterThan(
      await documentTop(embedded.locator(".atlas-map-frame")),
    );
    await about.locator("summary").click();
    await expect(about.locator(".atlas-feature-list")).toBeVisible();
    await expect(about).toContainText(copy.scaleStatement);
    await expect(about.locator(".atlas-legend-credits")).toBeVisible();

    await page.goto(`${prefix}/grapes/merlot`);
    await expect(page.locator("[data-entity-atlas]")).toHaveCount(0);
  });

  test(`${locale} an appellation under a draft region embeds the map without an Atlas link`, async ({
    page,
  }) => {
    await page.goto(`${prefix}/appellations/champagne`);
    const embedded = page.locator(`[data-entity-atlas="${scenes.champagne.id}"]`);
    await expect(embedded).toBeVisible();
    await expect(embedded.getByRole("link", { name: copy.viewInAtlas })).toHaveCount(0);
    await expect(page.locator(`a[href="${prefix}/atlas/${scenes.champagne.slug}"]`)).toHaveCount(0);
  });

  test(`${locale} an appellation whose shape is held shows the unavailable state`, async ({
    page,
  }) => {
    const gap = readScene(scenes.bordeaux.id).coverage.missing.find((entry) =>
      entry.entity.startsWith("appellation."),
    );
    test.skip(!gap, "Every intended Bordeaux appellation is drawn; no unavailable state to show");
    if (!gap) return;
    const entity = readEntity(gap.entity);
    await page.goto(`${prefix}/appellations/${entity.slugs.en}`);
    const embedded = page.locator(`[data-entity-atlas="${scenes.bordeaux.id}"]`);
    await expect(embedded).toBeVisible();
    await expect(embedded.locator(".atlas-scene-notice")).toContainText(
      copy.unavailable(entity.names[locale]),
    );
    await expect(embedded.locator("[aria-current]")).toHaveCount(0);
    await expect(embedded.locator("svg.atlas-map [data-highlighted]")).toHaveCount(0);
  });

  for (const width of [320, 768, 1440]) {
    test(`${locale} overview and region embed fit ${width}px with the list before the map`, async ({
      page,
    }) => {
      const before = (scene: Locator, first: string, second: string) =>
        scene.evaluate(
          (root, [a, b]) => {
            const one = root.querySelector(a);
            const two = root.querySelector(b);
            return Boolean(
              one && two && one.compareDocumentPosition(two) & Node.DOCUMENT_POSITION_FOLLOWING,
            );
          },
          [first, second] as const,
        );
      await page.setViewportSize({ width, height: 1000 });

      await page.goto(`${prefix}/atlas`);
      await noHorizontalOverflow(page, width);
      await page.goto(`${prefix}/atlas/${scenes.bordeaux.slug}`);
      const overview = page.locator(`[data-atlas-scene="${scenes.bordeaux.id}"]`);
      await enhanced(overview);
      await noHorizontalOverflow(page, width);
      await expect(overview.locator(".atlas-feature-list")).toBeVisible();
      expect(await before(overview, ".atlas-feature-list", ".atlas-map-panel")).toBe(true);
      expect(await before(overview, ".atlas-map-panel", ".atlas-scene-legend")).toBe(true);

      await page.goto(`${prefix}/regions/medoc`);
      const embedded = page.locator(`[data-entity-atlas="${scenes.medoc.id}"]`);
      await enhanced(embedded);
      await noHorizontalOverflow(page, width);
      expect(await before(embedded, ".atlas-map-panel", "details.atlas-about")).toBe(true);
      await expect(embedded.locator("details.atlas-about > summary")).toBeVisible();
    });
  }

  test(`${locale} the area list folds on a phone and opens beside the map on a desktop`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${prefix}/atlas/${scenes.medoc.slug}`);
    const scene = page.locator(`[data-atlas-scene="${scenes.medoc.id}"]`);
    await enhanced(scene);
    const fold = scene.locator("details.atlas-list-disclosure");
    await expect(fold).not.toHaveAttribute("open", "");
    await expect(fold.locator("summary")).toBeVisible();
    // Map first: the frame starts within the first screen (every scene route: see below).
    expect(await documentTop(scene.locator(".atlas-map-frame"))).toBeLessThan(844);

    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(fold).toHaveAttribute("open", "");
    const frame = await scene.locator(".atlas-map-frame").boundingBox();
    const list = await scene.locator(".atlas-feature-list").boundingBox();
    const legend = await scene.locator(".atlas-scene-legend").boundingBox();
    if (!frame || !list || !legend) throw new Error("Atlas layout boxes are missing");
    // The list sits left of the map and no taller than it; the legend sits directly under it.
    expect(list.x + list.width).toBeLessThanOrEqual(frame.x);
    expect(list.height).toBeLessThanOrEqual(frame.height + 1);
    expect(Math.abs(legend.x - frame.x)).toBeLessThanOrEqual(1);
    expect(legend.y - (frame.y + frame.height)).toBeGreaterThanOrEqual(0);
    expect(legend.y - (frame.y + frame.height)).toBeLessThanOrEqual(48);
  });

  test(`${locale} Atlas pages show the map early: cards on a phone, most of the frame on a desktop`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${prefix}/atlas`);
    // The portal's first region (the Bordeaux map card) starts within the first phone screen.
    expect(await documentTop(page.locator(".atlas-portal-card").first())).toBeLessThan(844);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${prefix}/atlas/${scenes.medoc.slug}`);
    const frame = page.locator(`[data-atlas-scene="${scenes.medoc.id}"] .atlas-map-frame`);
    await enhanced(page.locator(`[data-atlas-scene="${scenes.medoc.id}"]`));
    const top = await documentTop(frame);
    const box = await frame.boundingBox();
    if (!box) throw new Error("The map frame has no box");
    expect(top).toBeLessThanOrEqual(420);
    expect(Math.min(900 - top, box.height) / box.height).toBeGreaterThanOrEqual(0.6);
  });

  test(`${locale} on a phone the map controls cover no area or town label`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${prefix}/atlas/${scenes.medoc.slug}`);
    const scene = page.locator(`[data-atlas-scene="${scenes.medoc.id}"]`);
    await enhanced(scene);
    await expect(scene.locator("svg.atlas-map")).toHaveAttribute("data-zoom", "1.00");
    const overlaps = await scene.evaluate((root) => {
      const boxes = (selector: string) =>
        Array.from(root.querySelectorAll(selector))
          .map((element) => element.getBoundingClientRect())
          .filter((box) => box.width > 0 && box.height > 0);
      const labels = boxes(".atlas-labels text, .atlas-place text");
      const hits: string[] = [];
      for (const control of boxes(".atlas-map-control")) {
        for (const label of labels) {
          const separate =
            control.right <= label.left ||
            label.right <= control.left ||
            control.bottom <= label.top ||
            label.bottom <= control.top;
          if (!separate) hits.push(`${Math.round(label.left)},${Math.round(label.top)}`);
        }
      }
      return hits;
    });
    expect(overlaps).toEqual([]);
  });

  test(`${locale} the chooser stays inside the frame on a desktop and is a sheet on a phone`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${prefix}/atlas/${scenes.bordeaux.slug}`);
    const scene = page.locator(`[data-atlas-scene="${scenes.bordeaux.id}"]`);
    await enhanced(scene);
    const point = await anchorPoint(
      scene,
      scenes.bordeaux.id,
      "geo.appellation-area.saint-emilion",
    );
    const hits = await hitsAt(page, point);
    expect(hits.selectable.length, "Test data: Saint-Émilion overlaps").toBeGreaterThan(1);
    await page.mouse.click(point.x, point.y);
    const chooser = scene.locator(".atlas-chooser[role='dialog']");
    await expect(chooser).toBeVisible();
    // Saint-Émilion and its Grand Cru share one shape and rank: alphabetical between them.
    await expect(chooser.locator("li").first()).toHaveText("Saint-Émilion");
    const frame = await scene.locator(".atlas-map-frame").boundingBox();
    const close = await chooser.locator(".atlas-chooser-close").boundingBox();
    const box = await chooser.boundingBox();
    if (!frame || !close || !box) throw new Error("Chooser boxes are missing");
    for (const inner of [box, close]) {
      expect(inner.x).toBeGreaterThanOrEqual(frame.x);
      expect(inner.y).toBeGreaterThanOrEqual(frame.y);
      expect(inner.x + inner.width).toBeLessThanOrEqual(frame.x + frame.width);
      expect(inner.y + inner.height).toBeLessThanOrEqual(frame.y + frame.height);
    }
    await chooser.locator(".atlas-chooser-close").click();
    await expect(chooser).toHaveCount(0);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${prefix}/appellations/pauillac`);
    const embedded = page.locator(`[data-entity-atlas="${scenes.medoc.id}"]`);
    await enhanced(embedded);
    const pauillac = await anchorPoint(embedded, scenes.medoc.id, "geo.appellation-area.pauillac");
    await page.mouse.click(pauillac.x, pauillac.y);
    const sheet = embedded.locator(".atlas-chooser[role='dialog']");
    await expect(sheet).toHaveAttribute("data-sheet", "true");
    const frameBox = await embedded.locator(".atlas-map-frame").boundingBox();
    const sheetBox = await sheet.boundingBox();
    if (!frameBox || !sheetBox) throw new Error("Sheet boxes are missing");
    expect(Math.abs(sheetBox.x - frameBox.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(sheetBox.width - frameBox.width)).toBeLessThanOrEqual(3);
    expect(
      Math.abs(sheetBox.y + sheetBox.height - (frameBox.y + frameBox.height)),
    ).toBeLessThanOrEqual(2);
    // At most 85 % of the frame (atlas.css): a short embedded frame still shows a candidate.
    expect(sheetBox.height).toBeLessThanOrEqual(frameBox.height * 0.85 + 1);
    // The close button is visible without scrolling the sheet: inside the sheet and the screen.
    const sheetClose = sheet.locator(".atlas-chooser-close");
    await expect(sheetClose).toBeInViewport({ ratio: 1 });
    const closeBox = await sheetClose.boundingBox();
    if (!closeBox) throw new Error("The close button has no box");
    expect(closeBox.y).toBeGreaterThanOrEqual(sheetBox.y);
    expect(closeBox.y + closeBox.height).toBeLessThanOrEqual(sheetBox.y + sheetBox.height);
    expect(await sheet.locator(".atlas-chooser-body").evaluate((body) => body.scrollTop)).toBe(0);
    await page.keyboard.press("Escape");
    await expect(sheet).toHaveCount(0);

    // A resize invalidates the placement: the chooser closes instead of lingering.
    await page.mouse.click(pauillac.x, pauillac.y);
    await expect(sheet).toBeVisible();
    await page.setViewportSize({ width: 420, height: 844 });
    await expect(sheet).toHaveCount(0);
  });

  test(`${locale} the fold summary agrees with the coverage count`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const { id, slug } of [scenes.medoc, scenes.libournais, scenes.bordeaux]) {
      const shown = readScene(id).coverage.shown.length;
      await page.goto(`${prefix}/atlas/${slug}`);
      await expect(
        page.locator(`[data-atlas-scene="${id}"] details.atlas-list-disclosure > summary`),
        slug,
      ).toHaveText(locale === "nl" ? `Toon alle ${shown} gebieden` : `Show all ${shown} areas`);
    }
  });

  test(`${locale} every scene route starts its map within the first phone screen`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const { id, slug } of activeOwnerScenes) {
      await page.goto(`${prefix}/atlas/${slug}`);
      const frame = page.locator(`[data-atlas-scene="${id}"] .atlas-map-frame`);
      expect(await documentTop(frame), slug).toBeLessThan(900);
    }
  });

  test(`${locale} the portal does not move when the script loads`, async ({ browser }) => {
    const offsets = async (javaScriptEnabled: boolean, width: number) => {
      const context = await browser.newContext({
        javaScriptEnabled,
        viewport: { width, height: 900 },
      });
      const page = await context.newPage();
      try {
        await page.goto(`${prefix}/atlas`);
        if (javaScriptEnabled) await page.waitForLoadState("networkidle");
        return await page
          .locator(".atlas-portal a, .atlas-portal input, .atlas-portal-status")
          .evaluateAll((elements) =>
            elements.map((element) => {
              const box = element.getBoundingClientRect();
              return [Math.round(box.left), Math.round(box.top + window.scrollY)];
            }),
          );
      } finally {
        await context.close();
      }
    };
    for (const width of [390, 1440]) {
      expect(await offsets(true, width), `${width}px`).toEqual(await offsets(false, width));
    }
  });

  for (const width of [320, 390, 768, 1440]) {
    test(`${locale} the portal fits ${width}px: whole names, aligned state lines`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${prefix}/atlas`);
      await noHorizontalOverflow(page, width);
      // Nothing spills out of a card, not even a long unbreakable name.
      for (const card of await page.locator(".atlas-portal-card").all()) {
        expect(await card.evaluate((element) => element.scrollWidth - element.clientWidth)).toBe(0);
      }
      // Proper names with hyphens never break inside (Entre-deux-Mers).
      for (const name of await page.locator(".atlas-portal-nobreak").all()) {
        expect(await name.evaluate((element) => element.getClientRects().length)).toBe(1);
      }
      // The section's map card never overlaps its cards: above them when stacked, beside them
      // on a wide screen.
      const lead = await page.locator(".atlas-portal-card-lead").first().boundingBox();
      const first = await page.locator(".atlas-portal-grid > li").first().boundingBox();
      if (!lead || !first) throw new Error("Portal boxes are missing");
      if (width <= 980) expect(lead.y + lead.height).toBeLessThanOrEqual(first.y);
      else expect(lead.x + lead.width).toBeLessThanOrEqual(first.x);
      // Cards in one row share their state line.
      const rows = new Map<number, number[]>();
      for (const card of await page.locator(".atlas-portal-grid > li > .atlas-portal-card").all()) {
        const top = Math.round(await documentTop(card));
        const state = Math.round(await documentTop(card.locator(":scope > .atlas-portal-state")));
        rows.set(top, [...(rows.get(top) ?? []), state]);
      }
      for (const states of rows.values()) {
        expect(Math.max(...states) - Math.min(...states)).toBeLessThanOrEqual(1);
      }
      // On a wide screen today's five Bordeaux cards share one row: no orphan card.
      if (width === 1440) expect(rows.size).toBe(1);
      await page.screenshot({
        path: test.info().outputPath(`atlas-portal-${locale}-${width}.png`),
        fullPage: true,
      });
    });
  }

  test(`${locale} the portal layout holds at the end-goal scale (synthetic data, not a route)`, async ({
    page,
  }) => {
    // Clearly synthetic data rendered with the real component and the production CSS, loaded
    // as a detached document: it never exists on a public route.
    const { syntheticPortal } = await import("../src/components/atlas/fixtures/portal-scale");
    const { AtlasPortalView } = await import("../src/components/atlas/atlas-portal");
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { createElement } = await import("react");
    const markup = renderToStaticMarkup(
      createElement(AtlasPortalView, {
        locale,
        portal: syntheticPortal(),
        searchAction: `${prefix}/search`,
      }),
    );
    await page.goto(`${prefix}/atlas`);
    const stylesheets = await page
      .locator("link[rel='stylesheet']")
      .evaluateAll((links) => links.map((link) => (link as HTMLLinkElement).href));
    expect(stylesheets.length).toBeGreaterThan(0);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.setContent(
        `<!doctype html><html lang="${locale}"><head><meta name="viewport" content="width=device-width, initial-scale=1">${stylesheets
          .map((href) => `<link rel="stylesheet" href="${href}">`)
          .join(
            "",
          )}</head><body><main class="page-shell atlas-page">${markup}</main></body></html>`,
        { waitUntil: "load" },
      );
      await noHorizontalOverflow(page, width);
      await expect(page.locator(".atlas-portal-section")).toHaveCount(15);
      await expect(page.locator(".atlas-portal-grid > li")).toHaveCount(150);
      await expect(page.locator(".atlas-portal-sub > li")).toHaveCount(450);
      await expect(page.locator("details.atlas-portal-jump")).toHaveCount(1);
      const boxes = await page
        .locator(".atlas-portal-card")
        .evaluateAll((cards) => cards.map((card) => card.getBoundingClientRect().width));
      expect(Math.min(...boxes)).toBeGreaterThanOrEqual(140);
      await page.screenshot({
        path: test.info().outputPath(`atlas-portal-scale-${locale}-${width}.png`),
        fullPage: width === 1440,
      });
    }
  });

  test(`${locale} the map does not move when the script loads`, async ({ browser }) => {
    const offsets = async (javaScriptEnabled: boolean, width: number) => {
      const context = await browser.newContext({
        javaScriptEnabled,
        viewport: { width, height: 900 },
      });
      const page = await context.newPage();
      const result: number[] = [];
      try {
        for (const route of [
          `${prefix}/atlas/${scenes.bordeaux.slug}`,
          `${prefix}/atlas/${scenes.medoc.slug}`,
        ]) {
          await page.goto(route);
          const scene = page.locator("[data-atlas-scene]").first();
          if (javaScriptEnabled) await enhanced(scene);
          result.push(await documentTop(scene.locator(".atlas-map-frame")));
        }
        // Entity pages: other blocks above the map may change; within the block nothing moves.
        await page.goto(`${prefix}/appellations/pauillac`);
        const embedded = page.locator("[data-entity-atlas]");
        if (javaScriptEnabled) await enhanced(embedded);
        result.push(
          (await documentTop(embedded.locator(".atlas-map-frame"))) -
            (await documentTop(embedded.locator(".atlas-scene-title"))),
        );
      } finally {
        await context.close();
      }
      return result;
    };
    for (const width of [390, 1440]) {
      expect(await offsets(true, width), `${width}px`).toEqual(await offsets(false, width));
    }
  });

  test(`${locale} the embedded Médoc map stays compact on a phone`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${prefix}/appellations/pauillac`);
    const embedded = page.locator(`[data-entity-atlas="${scenes.medoc.id}"]`);
    await enhanced(embedded);
    const top = await documentTop(embedded.locator(".atlas-scene-title"));
    // On a phone the controls are a bar attached below the frame: measure to its bottom.
    const bar = embedded.locator(".atlas-map-controls");
    const frameBox = await embedded.locator(".atlas-map-frame").boundingBox();
    const barBox = await bar.boundingBox();
    if (!frameBox || !barBox) throw new Error("Map boxes are missing");
    expect(Math.abs(barBox.y - (frameBox.y + frameBox.height))).toBeLessThanOrEqual(1);
    expect(Math.abs(barBox.width - frameBox.width)).toBeLessThanOrEqual(1);
    for (const button of await bar.locator(".atlas-map-control").all()) {
      const box = await button.boundingBox();
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    }
    const bottom = await bar.evaluate(
      (element) => element.getBoundingClientRect().bottom + window.scrollY,
    );
    expect(bottom - top).toBeLessThanOrEqual(600);
    const text = (await embedded.textContent()) ?? "";
    expect(text.split(copy.scaleStatement)).toHaveLength(2);
    await expect(embedded.locator(".atlas-scene-intro")).not.toContainText(copy.scaleStatement);
  });

  test(`${locale} touch: one finger hints, two fingers pan the map`, async ({ browser }) => {
    const context = await browser.newContext({
      hasTouch: true,
      isMobile: true,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    try {
      await page.goto(`${prefix}/atlas/${scenes.medoc.slug}`);
      const scene = page.locator(`[data-atlas-scene="${scenes.medoc.id}"]`);
      const map = scene.locator("svg.atlas-map");
      await enhanced(scene);
      await expect(scene.locator(".atlas-map-frame")).toHaveCSS("touch-action", "pan-y");
      await map.scrollIntoViewIfNeeded();
      const box = await map.boundingBox();
      if (!box) throw new Error("The map has no bounding box");
      const viewport = page.viewportSize();
      const cx = box.x + box.width / 2;
      const cy = Math.min(box.y + box.height / 2, (viewport?.height ?? 844) - 120);
      const cdp = await context.newCDPSession(page);
      const touch = (
        type: "touchStart" | "touchMove" | "touchEnd",
        points: Array<[number, number]>,
      ) =>
        cdp.send("Input.dispatchTouchEvent", {
          type,
          touchPoints: points.map(([x, y], id) => ({ x, y, id })),
        });

      // One finger sideways: the map stays put and says how to move it.
      const before = await viewBoxOf(map);
      await touch("touchStart", [[cx, cy]]);
      for (let step = 1; step <= 6; step += 1) await touch("touchMove", [[cx - step * 12, cy]]);
      await touch("touchEnd", []);
      await expect(scene.locator(".atlas-map-hint")).toHaveText(copy.touchHint);
      await expect(scene.locator(".atlas-map-hint")).toBeVisible();
      expect(await viewBoxOf(map)).toEqual(before);

      // Two fingers moving together pan the map.
      await touch("touchStart", [
        [cx - 40, cy],
        [cx + 40, cy],
      ]);
      for (let step = 1; step <= 6; step += 1) {
        await touch("touchMove", [
          [cx - 40 + step * 10, cy + step * 8],
          [cx + 40 + step * 10, cy + step * 8],
        ]);
      }
      await touch("touchEnd", []);
      await expect.poll(async () => (await viewBoxOf(map))[0]).toBeLessThan(before[0]);
    } finally {
      await context.close();
    }
  });

  test(`${locale} draft owner scene is reachable but not indexed`, async ({ page }) => {
    const response = await page.goto(`${prefix}/atlas/${scenes.champagne.slug}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator(`[data-atlas-scene="${scenes.champagne.id}"]`)).toBeVisible();
    await expect(page.locator(".page-intro")).toContainText(copy.draftIntro);
    // The owner's page is still in preparation: the intro links nowhere.
    await expect(page.locator(".page-intro-copy a")).toHaveCount(0);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.locator('link[rel="alternate"]')).toHaveCount(0);
  });

  test(`${locale} unknown and Dutch-slug scene routes resolve like entity routes`, async ({
    request,
  }) => {
    expect((await request.get(`${prefix}/atlas/does-not-exist`)).status()).toBe(404);
    // Dutch region slugs are permanent aliases of the English route, as for entity pages.
    for (const [alias, target] of [
      ["graves-sauternais", scenes.gravesSauternais.slug],
      ["blayais-bourgeais", scenes.blayaisBourgeais.slug],
    ] as const) {
      const response = await request.get(`${prefix}/atlas/${alias}`, { maxRedirects: 0 });
      expect(response.status(), alias).toBe(308);
      expect(new URL(response.headers().location, response.url()).pathname).toBe(
        `${prefix}/atlas/${target}`,
      );
    }
    const withQuery = await request.get(`${prefix}/atlas/graves-sauternais?x=1&y=2`, {
      maxRedirects: 0,
    });
    expect(withQuery.status()).toBe(308);
    const location = new URL(withQuery.headers().location, withQuery.url());
    expect(`${location.pathname}${location.search}`).toBe(
      `${prefix}/atlas/${scenes.gravesSauternais.slug}?x=1&y=2`,
    );
  });

  test(`${locale} entity pages embed the most specific scene`, async ({ page }) => {
    await page.goto(`${prefix}/appellations/saint-emilion`);
    const libournais = page.locator(`[data-entity-atlas="${scenes.libournais.id}"]`);
    await expect(libournais).toBeVisible();
    await expect(libournais.locator("a.atlas-link[aria-current='page']")).toHaveAttribute(
      "href",
      `${prefix}/appellations/saint-emilion`,
    );
    await expect(libournais.locator("a.atlas-area-link[aria-current='page']")).toHaveAttribute(
      "href",
      `${prefix}/appellations/saint-emilion`,
    );

    await page.goto(`${prefix}/appellations/cotes-de-bordeaux`);
    await expect(page.locator(`[data-entity-atlas="${scenes.bordeaux.id}"]`)).toBeVisible();
  });

  test(`${locale} Bordeaux draws water above the areas without blocking selection`, async ({
    page,
  }) => {
    await page.goto(`${prefix}/atlas/${scenes.bordeaux.slug}`);
    const scene = page.locator(`[data-atlas-scene="${scenes.bordeaux.id}"]`);
    const map = scene.locator("svg.atlas-map");
    await enhanced(scene);
    const waterAfterAreas = await map.evaluate((svg) => {
      const selectable = svg.querySelector(".atlas-layer-selectable");
      const water = svg.querySelector(".atlas-layer-water");
      return Boolean(
        selectable &&
        water &&
        selectable.compareDocumentPosition(water) & Node.DOCUMENT_POSITION_FOLLOWING,
      );
    });
    expect(waterAfterAreas).toBe(true);

    // A point on the Garonne that lies inside an area, away from town markers and on screen.
    await map.scrollIntoViewIfNeeded();
    const point = await map.evaluate((svg) => {
      const river = svg.querySelector<SVGGeometryElement>('[data-feature-id="geo.river.garonne"]');
      const ctm = river?.getScreenCTM();
      if (!river || !ctm) return null;
      const areas = Array.from(
        svg.querySelectorAll<SVGGeometryElement>(
          'path[data-role="selectable"], path[data-role="context"]',
        ),
      );
      const towns = Array.from(svg.querySelectorAll(".atlas-place circle")).map((circle) => {
        const box = circle.getBoundingClientRect();
        return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
      });
      const total = river.getTotalLength();
      for (let step = 1; step < 200; step += 1) {
        const onRiver = river.getPointAtLength((total * step) / 200);
        const local = new DOMPoint(onRiver.x, onRiver.y);
        if (!areas.some((area) => area.isPointInFill(local))) continue;
        const client = local.matrixTransform(ctm);
        if (client.x < 0 || client.y < 0) continue;
        if (client.x > window.innerWidth || client.y > window.innerHeight) continue;
        if (towns.some((town) => Math.hypot(town.x - client.x, town.y - client.y) < 24)) continue;
        return { x: client.x, y: client.y };
      }
      return null;
    });
    expect(point, "Test data: the Garonne should cross an area on screen").not.toBeNull();
    if (!point) return;
    const hits = await hitsAt(page, point);
    expect([...hits.selectable, ...hits.context].length).toBeGreaterThan(0);
    const start = page.url();
    await page.mouse.click(point.x, point.y);
    const chooser = page.locator(".atlas-chooser[role='dialog']");
    await expect.poll(async () => page.url() !== start || (await chooser.isVisible())).toBe(true);
  });

  test(`${locale} Bordeaux lists the regional umbrellas as overarching areas`, async ({ page }) => {
    await page.goto(`${prefix}/atlas/${scenes.bordeaux.slug}`);
    const scene = page.locator(`[data-atlas-scene="${scenes.bordeaux.id}"]`);
    const group = scene.locator(".atlas-feature-list .atlas-list-group").filter({
      has: page.locator(".atlas-list-group-title", { hasText: copy.contextHeading }),
    });
    await expect(group).toHaveCount(1);
    for (const id of ["appellation.bordeaux-superieur", "appellation.cremant-de-bordeaux"]) {
      const featureId = `geo.appellation-area.${id.split(".")[1]}`;
      await expect(group.locator(`[data-feature-id="${featureId}"]`)).toHaveCount(1);
      await expect(group).toContainText(readEntity(id).names[locale]);
      await expect(
        scene.locator(`svg.atlas-map path[data-feature-id="${featureId}"][data-role="selectable"]`),
      ).toHaveCount(0);
      await expect(
        scene.locator(`svg.atlas-map path[data-feature-id="${featureId}"][data-role="context"]`),
      ).toHaveCount(1);
    }
  });

  for (const sceneKey of ["medoc", "bordeaux"] as const) {
    test(`${locale} ${sceneKey} shows area and town labels at 320px`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await page.goto(`${prefix}/atlas/${scenes[sceneKey].slug}`);
      const scene = page.locator(`[data-atlas-scene="${scenes[sceneKey].id}"]`);
      await enhanced(scene);
      // Tolerant on purpose: label planning may evolve, but the base view is never bare.
      await expect(
        scene.locator('.atlas-labels text.atlas-label[data-visible="true"]').first(),
      ).toBeVisible();
      await expect(scene.locator('.atlas-place text[data-visible="true"]').first()).toBeVisible();
    });
  }
}

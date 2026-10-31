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

type FocusKind = "list" | "svg" | "toolbar" | "frame" | "chooser" | "other" | "none";

async function focusedTarget(page: Page): Promise<{ kind: FocusKind; href: string | null }> {
  return page.evaluate(() => {
    const active = document.activeElement;
    if (!active || active === document.body) return { kind: "none" as const, href: null };
    const href = active.getAttribute("href");
    if (active.closest(".atlas-chooser")) return { kind: "chooser" as const, href };
    if (active.matches(".atlas-map-frame")) return { kind: "frame" as const, href };
    if (active.closest("svg")) return { kind: "svg" as const, href };
    if (active.matches("a.atlas-area-link")) return { kind: "list" as const, href };
    if (active.closest(".atlas-toolbar")) return { kind: "toolbar" as const, href };
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
          useMap: "Kaart bedienen",
          zoomIn: "Inzoomen",
          reset: "Beginstand",
          coverage: (shown: number, intended: number) =>
            `${shown} van de ${intended} appellaties van deze kaart zijn getekend.`,
          coverageComplete: (count: number) =>
            `Alle ${count} appellaties van deze kaart zijn getekend.`,
          contextHeading: /^Overkoepelend/,
          missingIntro: "Nog niet op de kaart:",
          chooserHeading: "Meerdere gebieden op deze plek",
          surrounding: "Overkoepelend gebied",
          reusedUnder: ", hergebruikt onder ",
          attributionLabel: "Bronvermelding",
          independence: /onafhankelijk/g,
          foldOthers: /^Toon de andere (\d+) gebieden$/,
          unavailable: (name: string) => `${name} staat nog niet op de kaart: `,
          viewInAtlas: "Bekijk in de Atlas",
          draftIntro:
            "Deze regio wordt nog voorbereid. De kaart is al te bekijken; de pagina over de regio volgt.",
        }
      : {
          overviewHeading: "Map of Bordeaux",
          medocHeading: "Map of Médoc",
          useMap: "Use the map",
          zoomIn: "Zoom in",
          reset: "Reset view",
          coverage: (shown: number, intended: number) =>
            `${shown} of this map's ${intended} appellations are drawn.`,
          coverageComplete: (count: number) => `All ${count} of this map's appellations are drawn.`,
          contextHeading: /^Overarching/,
          missingIntro: "Not yet on the map:",
          chooserHeading: "Several areas at this spot",
          surrounding: "Overarching area",
          reusedUnder: ", reused under ",
          attributionLabel: "Attribution:",
          independence: /independently/g,
          foldOthers: /^Show the other (\d+) areas$/,
          unavailable: (name: string) => `${name} is not on the map yet: `,
          viewInAtlas: "View in the Atlas",
          draftIntro: "This region is still being prepared.",
        };

  test(`${locale} Atlas overview renders the Bordeaux scene with legend and one credit line per source`, async ({
    page,
  }) => {
    await page.goto(`${prefix}/atlas`);
    const scene = page.locator(`[data-atlas-scene="${scenes.bordeaux.id}"]`);
    await expect(scene).toBeVisible();
    await expect(
      scene.getByRole("heading", { level: 2, name: copy.overviewHeading }),
    ).toBeVisible();
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
  });

  test(`${locale} Atlas overview lists every active-owner scene and not the draft one`, async ({
    page,
  }) => {
    await page.goto(`${prefix}/atlas`);
    const list = page.locator(".atlas-scene-list");
    for (const { slug } of activeOwnerScenes) {
      await expect(list.locator(`a[href="${prefix}/atlas/${slug}"]`)).toHaveCount(1);
    }
    await expect(list.locator(`a[href="${prefix}/atlas/${scenes.champagne.slug}"]`)).toHaveCount(0);
    await expect(
      page.locator(`main a[href="${prefix}/atlas/${scenes.champagne.slug}"]`),
    ).toHaveCount(0);
  });

  test(`${locale} Atlas overview states coverage from computed data`, async ({ page }) => {
    // Expectations follow the scene data, so publishing a held record does not break the suite.
    const { coverage } = readScene(scenes.bordeaux.id);
    const missingNames = coverage.missing.map((entry) => readEntity(entry.entity).names[locale]);
    await page.goto(`${prefix}/atlas`);
    const statement = page.locator(
      `[data-atlas-scene="${scenes.bordeaux.id}"] .atlas-legend-coverage`,
    );
    await expect(statement.locator("p").first()).toHaveText(
      missingNames.length === 0
        ? copy.coverageComplete(coverage.shown.length)
        : copy.coverage(coverage.shown.length, coverage.intended.length),
    );
    if (missingNames.length === 0) {
      await expect(statement.locator(".atlas-legend-missing")).toHaveCount(0);
    } else {
      await expect(statement).toContainText(`${copy.missingIntro} ${missingNames[0]}`);
      for (const name of missingNames) await expect(statement).toContainText(name);
    }
  });

  test(`${locale} every scene route loads without pipeline vocabulary`, async ({ page }) => {
    for (const route of [
      `${prefix}/atlas`,
      ...Object.values(scenes).map(({ slug }) => `${prefix}/atlas/${slug}`),
    ]) {
      const response = await page.goto(route);
      expect(response?.status(), route).toBe(200);
      await expect(page.locator("[data-atlas-scene]").first()).toBeVisible();
      const text = await page.locator("main").innerText();
      for (const term of forbiddenTerms) {
        expect(text.includes(term), `${route} shows "${term}"`).toBe(false);
      }
    }
  });

  test(`${locale} Médoc scene offers the same areas on the map and in the list`, async ({
    page,
  }) => {
    await page.goto(`${prefix}/atlas/${scenes.medoc.slug}`);
    const scene = page.locator(`[data-atlas-scene="${scenes.medoc.id}"]`);
    await expect(scene.getByRole("heading", { level: 2, name: copy.medocHeading })).toBeVisible();
    const pauillac = `${prefix}/appellations/pauillac`;
    await expect(scene.locator(`a.atlas-link[href="${pauillac}"]`)).toHaveCount(1);
    await expect(scene.locator(`a.atlas-area-link[href="${pauillac}"]`)).toHaveCount(1);
    // The list is sorted per locale and the SVG keeps draw order: compare sets, not order.
    expect((await hrefs(scene.locator("a.atlas-link"))).sort()).toEqual(
      (await hrefs(scene.locator("a.atlas-area-link"))).sort(),
    );
    await enhanced(scene);
    const frame = scene.locator(".atlas-map-frame");
    await expect(frame).toHaveAttribute("data-engaged", "false");
    // The toggle keeps one name; its state is carried by aria-pressed.
    const toggle = scene.getByRole("button", { name: copy.useMap, exact: true });
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expect(frame).toHaveAttribute("data-engaged", "true");
    await scene.getByRole("button", { name: copy.zoomIn, exact: true }).click();
    await expect(scene.locator("svg.atlas-map")).toHaveAttribute("data-zoom", "1.50");
    await scene.getByRole("button", { name: copy.reset, exact: true }).click();
    await expect(scene.locator("svg.atlas-map")).toHaveAttribute("data-zoom", "1.00");
  });

  test(`${locale} selection works without JavaScript through the SVG link`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    try {
      await page.goto(`${prefix}/atlas/${scenes.medoc.slug}`);
      const scene = page.locator(`[data-atlas-scene="${scenes.medoc.id}"]`);
      await expect(scene).toBeVisible();
      await expect(scene.locator("svg.atlas-map")).not.toHaveAttribute("data-zoom", /./);
      await expect(scene.locator(".atlas-toolbar")).toBeHidden();
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

  test(`${locale} Tab walks the Médoc list, then the toolbar, then the map frame, never an SVG link`, async ({
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
    for (let step = 0; step < listHrefs.length + 12; step += 1) {
      await page.keyboard.press("Tab");
      const target = await focusedTarget(page);
      steps.push(target);
      if (target.kind === "frame") break;
    }
    // One step past the frame still never lands inside the SVG.
    await page.keyboard.press("Tab");
    steps.push(await focusedTarget(page));

    expect(steps.map((step) => step.kind)).not.toContain("svg");
    expect(steps.slice(0, listHrefs.length)).toEqual(
      listHrefs.map((href) => ({ kind: "list", href })),
    );
    const afterList = steps.slice(listHrefs.length, -1).map((step) => step.kind);
    expect(afterList.at(-1)).toBe("frame");
    expect(afterList.length).toBeGreaterThan(1);
    expect(afterList.slice(0, -1).every((kind) => kind === "toolbar")).toBe(true);
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

  test(`${locale} overlap chooser lists Barsac, Sauternes and the surrounding area`, async ({
    page,
  }) => {
    await page.goto(`${prefix}/atlas/${scenes.gravesSauternais.slug}`);
    const scene = page.locator(`[data-atlas-scene="${scenes.gravesSauternais.id}"]`);
    const chooser = await openChooserAtBarsac(page, scene);
    await expect(chooser).toContainText(copy.chooserHeading);
    const items = chooser.locator("li");
    await expect(items.filter({ hasText: "Barsac" })).toHaveCount(1);
    await expect(items.filter({ hasText: "Sauternes" })).toHaveCount(1);
    await expect(items.last()).toHaveClass(/atlas-chooser-context/);
    await expect(items.last()).toHaveText(new RegExp(`^${copy.surrounding}: .*Bordeaux`));
    await expect(page).toHaveURL(new RegExp(`${prefix}/atlas/${scenes.gravesSauternais.slug}$`));
    await chooser.getByRole("link", { name: "Sauternes", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${prefix}/appellations/sauternes$`));
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
    await expect(frame).not.toHaveAttribute("data-engaged", "true");
    const before = await scrollY(page);
    await wheelOverMap(page, scene.locator("svg.atlas-map"), 400);
    await expect.poll(() => scrollY(page)).toBeGreaterThan(before);
    await expect(scene.locator("svg.atlas-map")).toHaveAttribute("data-zoom", "1.00");
  });

  test(`${locale} the wheel scrolls the page until the map is engaged, then zooms`, async ({
    page,
  }) => {
    await page.goto(`${prefix}/atlas/${scenes.medoc.slug}`);
    const scene = page.locator(`[data-atlas-scene="${scenes.medoc.id}"]`);
    const map = scene.locator("svg.atlas-map");
    await enhanced(scene);
    await map.scrollIntoViewIfNeeded();
    const before = await scrollY(page);
    await wheelOverMap(page, map, 300);
    await expect.poll(() => scrollY(page)).toBeGreaterThan(before);
    await expect(map).toHaveAttribute("data-zoom", "1.00");

    await scene.getByRole("button", { name: copy.useMap, exact: true }).click();
    await expect(scene.locator(".atlas-map-frame")).toHaveAttribute("data-engaged", "true");
    await wheelOverMap(page, map, -400);
    await expect(map).not.toHaveAttribute("data-zoom", "1.00");
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
    // The highlighted entry stays visible; the others fold behind a summary that counts them.
    const fold = embedded.locator(".atlas-feature-list details");
    const summary = (await fold.locator("summary").innerText()).trim();
    const folded = copy.foldOthers.exec(summary);
    expect(folded, summary).not.toBeNull();
    await expect(fold.locator("[data-feature-id]")).toHaveCount(Number(folded?.[1]));

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
      const listBeforeMap = (scene: Locator) =>
        scene.evaluate((root) => {
          const list = root.querySelector(".atlas-feature-list");
          const map = root.querySelector(".atlas-map-panel");
          return Boolean(
            list && map && list.compareDocumentPosition(map) & Node.DOCUMENT_POSITION_FOLLOWING,
          );
        });
      await page.setViewportSize({ width, height: 1000 });

      await page.goto(`${prefix}/atlas`);
      const overview = page.locator(`[data-atlas-scene="${scenes.bordeaux.id}"]`);
      await enhanced(overview);
      await noHorizontalOverflow(page, width);
      await expect(overview.locator(".atlas-feature-list")).toBeVisible();
      if (width === 320) expect(await listBeforeMap(overview)).toBe(true);

      await page.goto(`${prefix}/regions/medoc`);
      const embedded = page.locator(`[data-entity-atlas="${scenes.medoc.id}"]`);
      await enhanced(embedded);
      await noHorizontalOverflow(page, width);
      if (width === 320) {
        expect(await listBeforeMap(embedded)).toBe(true);
        await expect(embedded.locator(".atlas-feature-list details > summary")).toBeVisible();
      }
    });
  }

  test(`${locale} draft owner scene is reachable but not indexed`, async ({ page }) => {
    const response = await page.goto(`${prefix}/atlas/${scenes.champagne.slug}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator(`[data-atlas-scene="${scenes.champagne.id}"]`)).toBeVisible();
    await expect(page.locator(".page-intro")).toContainText(copy.draftIntro);
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

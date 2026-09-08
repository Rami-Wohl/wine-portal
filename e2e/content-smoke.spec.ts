import { expect, test } from "@playwright/test";

test("draft narrative degrades honestly and keeps its knowledge context", async ({ page }) => {
  await page.goto("/verdiepingen/regional-deep-dives/bordeaux-pipeline-proef");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Bordeaux: verdieping in voorbereiding",
  );
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "Deze verdieping wordt zorgvuldig opgebouwd.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "Verbonden onderwerpen",
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Pauillac/ })).toBeVisible();
});

test("active entity content flows comfortably across desktop and mobile", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/regions/bordeaux");

  const desktopFlow = await page.evaluate(() => {
    const header = document.querySelector(".entity-header")?.getBoundingClientRect();
    const body = document.querySelector(".entity-body")?.getBoundingClientRect();
    return { headerHeight: header?.height ?? 0, bodyTop: body?.top ?? Infinity };
  });
  expect(desktopFlow.headerHeight).toBeLessThan(320);
  expect(desktopFlow.bodyTop).toBeLessThan(500);

  await page.setViewportSize({ width: 375, height: 812 });

  await expect(page.getByRole("heading", { level: 1, name: "Bordeaux" })).toBeVisible();
  const regionPhoto = page.getByRole("img", { name: /Panoramisch uitzicht over/ });
  await expect(regionPhoto).toBeVisible();
  await expect(regionPhoto).toHaveJSProperty("complete", true);
  await expect(page.getByText(/Varvac via Wikimedia Commons/)).toBeVisible();
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "Een streek gevormd door beweging",
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "cabernet sauvignon", exact: true })).toHaveAttribute(
    "href",
    "/grapes/cabernet-sauvignon",
  );
  const dimensions = await page.evaluate(() => {
    const header = document.querySelector(".entity-header")?.getBoundingClientRect();
    const figure = document.querySelector(".content-block-figure")?.getBoundingClientRect();
    return {
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
      headerHeight: header?.height ?? 0,
      figureTop: figure?.top ?? Infinity,
    };
  });
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
  expect(dimensions.headerHeight).toBeLessThan(260);
  expect(dimensions.figureTop).toBeLessThan(1000);
});

test("knowledge depth progressively reveals additional Bordeaux content", async ({ page }) => {
  await page.goto("/regions/bordeaux");

  const depthControl = page.getByRole("group", {
    name: "Kies hoeveel detail je wilt zien",
  });
  const intermediateHeading = page.getByRole("heading", {
    level: 3,
    name: "Samenstellen en opvoeden",
  });
  const advancedBlock = page.locator("#landschap-bodem-en-drainage");

  await expect(depthControl.getByRole("button", { name: "Basis" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(intermediateHeading).toBeHidden();
  await expect(advancedBlock).toBeHidden();

  await depthControl.getByRole("button", { name: "Verdieping" }).click();
  await expect(intermediateHeading).toBeVisible();
  await expect(advancedBlock).toBeHidden();

  await depthControl.getByRole("button", { name: "Gevorderd" }).click();
  await expect(intermediateHeading).toBeVisible();
  await expect(advancedBlock).toBeVisible();
  await expect(
    advancedBlock.getByRole("heading", {
      level: 3,
      name: "Grind, klei, kalk — en wat daartussen ligt",
    }),
  ).toBeVisible();

  await depthControl.getByRole("button", { name: "Basis" }).click();
  await expect(intermediateHeading).toBeHidden();
  await expect(advancedBlock).toBeHidden();
});

test("Saint-Émilion classification reveals its current ranks progressively", async ({ page }) => {
  await page.goto("/classifications/classificatie-saint-emilion");

  await expect(
    page.getByRole("heading", { level: 1, name: "Classificatie van Saint-Émilion" }),
  ).toBeVisible();
  await expect(page.getByRole("img", { name: /Diagram van de classificatie/ })).toBeVisible();

  const depthControl = page.getByRole("group", {
    name: "Kies hoeveel detail je wilt zien",
  });
  const premiers = page.locator("#premiers-2022");
  const grands = page.locator("#grands-2022");

  await expect(premiers).toBeHidden();
  await expect(grands).toBeHidden();

  await depthControl.getByRole("button", { name: "Verdieping" }).click();
  await expect(premiers).toBeVisible();
  await expect(premiers.getByRole("link")).toHaveCount(14);
  await expect(grands).toBeHidden();

  await depthControl.getByRole("button", { name: "Gevorderd" }).click();
  await expect(grands).toBeVisible();
  await expect(grands.getByRole("link")).toHaveCount(71);
  await expect(premiers.getByRole("link", { name: "Château Figeac (A)" })).toHaveAttribute(
    "href",
    "/producers/chateau-figeac",
  );
});

test("Château Figeac presents both documentary images and layered producer knowledge", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/producers/chateau-figeac");

  await expect(page.getByRole("heading", { level: 1, name: "Château Figeac" })).toBeVisible();
  await expect(page.getByRole("img", { name: /lichte stenen gevel/ })).toBeVisible();
  await expect(page.getByRole("img", { name: /Fles Château Figeac 1995/ })).toBeVisible();

  const depthControl = page.getByRole("group", {
    name: "Kies hoeveel detail je wilt zien",
  });
  const secondWine = page.locator("#overige-wijnen");
  const advancedHistory = page.locator("#het-oude-figeac");

  await expect(secondWine).toBeHidden();
  await expect(advancedHistory).toBeHidden();

  await depthControl.getByRole("button", { name: "Verdieping" }).click();
  await expect(secondWine).toBeVisible();
  await expect(advancedHistory).toBeHidden();

  await depthControl.getByRole("button", { name: "Gevorderd" }).click();
  await expect(advancedHistory).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
});

test("Château Cheval Blanc separates its historic rank from current status", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/producers/chateau-cheval-blanc");

  await expect(page.getByRole("heading", { level: 1, name: "Château Cheval Blanc" })).toBeVisible();
  await expect(page.getByRole("img", { name: /lichte stenen gevel/ })).toBeVisible();
  const bottle = page.getByRole("img", { name: /Fles Château Cheval Blanc 1989/ });
  await bottle.scrollIntoViewIfNeeded();
  await expect(bottle).toBeVisible();
  await expect
    .poll(() => bottle.evaluate((image: HTMLImageElement) => image.naturalWidth))
    .toBeGreaterThan(0);
  await expect(page.getByText(/historisch A, momenteel ongeklasseerd/i)).toBeVisible();

  const depthControl = page.getByRole("group", {
    name: "Kies hoeveel detail je wilt zien",
  });
  const otherWines = page.locator("#overige-wijnen");
  const institutionalSignal = page.locator("#de-keuze-als-institutioneel-signaal");

  await expect(otherWines).toBeHidden();
  await expect(institutionalSignal).toBeHidden();

  await depthControl.getByRole("button", { name: "Verdieping" }).click();
  await expect(otherWines).toBeVisible();
  await expect(institutionalSignal).toBeHidden();

  await depthControl.getByRole("button", { name: "Gevorderd" }).click();
  await expect(institutionalSignal).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
});

test("Château Pavie presents its vineyard, historic bottle and layered producer knowledge", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/producers/chateau-pavie");

  await expect(page.getByRole("heading", { level: 1, name: "Château Pavie" })).toBeVisible();
  await expect(
    page.getByRole("img", { name: /Rijen wijnstokken van Château Pavie/ }),
  ).toBeVisible();
  await expect(page.getByRole("img", { name: /Fles Château Pavie 1990/ })).toBeVisible();

  const depthControl = page.getByRole("group", {
    name: "Kies hoeveel detail je wilt zien",
  });
  const secondWine = page.locator("#overige-wijnen");
  const estateExpansion = page.locator("#een-groeiend-domein");

  await expect(secondWine).toBeHidden();
  await expect(estateExpansion).toBeHidden();

  await depthControl.getByRole("button", { name: "Verdieping" }).click();
  await expect(secondWine).toBeVisible();
  await expect(estateExpansion).toBeHidden();

  await depthControl.getByRole("button", { name: "Gevorderd" }).click();
  await expect(estateExpansion).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
});

test("entity relationships are grouped by their meaning", async ({ page }) => {
  await page.goto("/appellations/pauillac");

  const panel = page.getByRole("region", { name: "Ga verder vanuit Pauillac" });
  await expect(panel.getByRole("heading", { level: 3, name: "Onderdeel van" })).toBeVisible();
  await expect(panel.getByRole("heading", { level: 3, name: "Belangrijke druif" })).toBeVisible();
  await expect(panel.getByRole("heading", { level: 3, name: "Hier gevestigd" })).toBeVisible();
  await expect(panel.getByText("Belangrijke druif", { exact: true })).toHaveCount(1);

  await page.goto("/regions/bordeaux");
  const bordeauxPanel = page.getByRole("region", { name: "Ga verder vanuit Bordeaux" });
  await expect(bordeauxPanel.getByRole("heading", { level: 3, name: "Bevat" })).toBeVisible();
  await expect(
    bordeauxPanel.getByRole("heading", { level: 3, name: "Belangrijke druif" }),
  ).toBeVisible();
  await expect(bordeauxPanel.getByRole("link", { name: "Médoc Regio" })).toBeVisible();
  await expect(bordeauxPanel.getByRole("link", { name: "Sémillon Druif" })).toBeVisible();
});

test("Pauillac media and appellation details follow the knowledge-depth contract", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/appellations/pauillac");

  await expect(page.getByRole("heading", { level: 1, name: "Pauillac" })).toBeVisible();
  await expect(page.getByRole("img", { name: /Wijngaarden van Pauillac/ })).toBeVisible();

  const depthControl = page.getByRole("group", {
    name: "Kies hoeveel detail je wilt zien",
  });
  const intermediateBlock = page.locator("#wettelijke-grens");
  const advancedBlock = page.locator("#drie-landschappen");

  await expect(depthControl.getByRole("button", { name: "Basis" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(intermediateBlock).toBeHidden();
  await expect(advancedBlock).toBeHidden();

  await depthControl.getByRole("button", { name: "Verdieping" }).click();
  await expect(intermediateBlock).toBeVisible();
  await expect(advancedBlock).toBeHidden();

  await depthControl.getByRole("button", { name: "Gevorderd" }).click();
  await expect(advancedBlock).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
});

test("a deep block anchor reveals the required knowledge depth", async ({ page }) => {
  await page.goto("/regions/bordeaux#landschap-bodem-en-drainage");

  await expect(page.locator("#landschap-bodem-en-drainage")).toBeVisible();
  await expect(page.getByRole("button", { name: "Gevorderd" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("the chosen knowledge depth persists across navigation and refresh", async ({ page }) => {
  await page.goto("/regions/bordeaux");
  await page.getByRole("button", { name: "Verdieping" }).click();

  await page.goto("/appellations/pauillac");
  await expect(page.getByRole("button", { name: "Verdieping" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await page.reload();
  await expect(page.getByRole("button", { name: "Verdieping" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("the full document remains readable without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/regions/bordeaux");

  await expect(page.locator("#landschap-bodem-en-drainage")).toBeVisible();
  await expect(page.getByRole("group", { name: "Kies hoeveel detail je wilt zien" })).toBeHidden();

  await context.close();
});

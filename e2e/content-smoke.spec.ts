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
      name: "Regio en appellation zijn niet hetzelfde",
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "cabernet sauvignon" })).toHaveAttribute(
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
  expect(dimensions.figureTop).toBeLessThan(800);
});

test("knowledge depth progressively reveals additional Bordeaux content", async ({ page }) => {
  await page.goto("/regions/bordeaux");

  const depthControl = page.getByRole("group", {
    name: "Kies hoeveel detail je wilt zien",
  });
  const intermediateHeading = page.getByRole("heading", {
    level: 2,
    name: "Assemblage: bouwen met losse delen",
  });
  const advancedHeading = page.getByRole("heading", {
    level: 2,
    name: "Een cuvée lezen op drie schalen",
  });

  await expect(depthControl.getByRole("button", { name: "Basis" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(intermediateHeading).toBeHidden();
  await expect(advancedHeading).toBeHidden();

  await depthControl.getByRole("button", { name: "Verdieping" }).click();
  await expect(intermediateHeading).toBeVisible();
  await expect(advancedHeading).toBeHidden();

  await depthControl.getByRole("button", { name: "Gevorderd" }).click();
  await expect(intermediateHeading).toBeVisible();
  await expect(advancedHeading).toBeVisible();
  await expect(page.getByText("Belangrijke uitzondering")).toBeVisible();

  await depthControl.getByRole("button", { name: "Basis" }).click();
  await expect(intermediateHeading).toBeHidden();
  await expect(advancedHeading).toBeHidden();
});

test("a deep block anchor reveals the required knowledge depth", async ({ page }) => {
  await page.goto("/regions/bordeaux#assemblage-op-drie-schalen");

  await expect(
    page.getByRole("heading", { level: 2, name: "Een cuvée lezen op drie schalen" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Gevorderd" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("the full document remains readable without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/regions/bordeaux");

  await expect(
    page.getByRole("heading", { level: 2, name: "Een cuvée lezen op drie schalen" }),
  ).toBeVisible();
  await expect(page.getByRole("group", { name: "Kies hoeveel detail je wilt zien" })).toBeHidden();

  await context.close();
});

import { expect, test } from "@playwright/test";

test("draft narrative degrades honestly and keeps its knowledge context", async ({ page }) => {
  await page.goto("/learn/regional-deep-dives/bordeaux-pipeline-proef");

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
  expect(desktopFlow.bodyTop).toBeLessThan(460);

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
  expect(dimensions.figureTop).toBeLessThan(720);
});

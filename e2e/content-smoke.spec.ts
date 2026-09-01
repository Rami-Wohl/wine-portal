import { expect, test } from "@playwright/test";

test("draft narrative degrades honestly and keeps its knowledge context", async ({ page }) => {
  await page.goto("/learn/regional-deep-dives/bordeaux-pipeline-proef");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Bordeaux: verdieping in voorbereiding",
  );
  await expect(page.getByRole("heading", {
    level: 2,
    name: "Deze verdieping wordt zorgvuldig opgebouwd.",
  })).toBeVisible();
  await expect(page.getByRole("heading", {
    level: 2,
    name: "Verbonden onderwerpen",
  })).toBeVisible();
  await expect(page.getByRole("link", { name: /Pauillac/ })).toBeVisible();
});

test("active entity content and links remain readable on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/regions/bordeaux");

  await expect(page.getByRole("heading", { level: 1, name: "Bordeaux" })).toBeVisible();
  const regionPhoto = page.getByRole("img", { name: /Panoramisch uitzicht over/ });
  await expect(regionPhoto).toBeVisible();
  await expect(regionPhoto).toHaveJSProperty("complete", true);
  await expect(page.getByText(/Varvac via Wikimedia Commons/)).toBeVisible();
  await expect(page.getByRole("heading", {
    level: 2,
    name: "Regio en appellation zijn niet hetzelfde",
  })).toBeVisible();
  await expect(page.getByRole("link", { name: "cabernet sauvignon" })).toHaveAttribute(
    "href",
    "/grapes/cabernet-sauvignon",
  );
  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
});

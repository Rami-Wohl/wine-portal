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

test("entity route remains readable without horizontal overflow on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/regions/bordeaux");

  await expect(page.getByRole("heading", { level: 1, name: "Bordeaux" })).toBeVisible();
  await expect(page.getByText("De inhoud van deze pagina wordt zorgvuldig voorbereid.")).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
});

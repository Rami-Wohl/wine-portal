import { expect, test } from "@playwright/test";

test("legacy localized slugs redirect permanently to canonical English slugs", async ({
  page,
  request,
}) => {
  const legacyEntity = await request.get("/concepts/druifluis-phylloxera", {
    maxRedirects: 0,
  });
  expect(legacyEntity.status()).toBe(308);
  expect(legacyEntity.headers().location).toBe("/concepts/phylloxera");

  await page.goto("/concepts/druifluis-phylloxera");
  await expect(page).toHaveURL(/\/concepts\/phylloxera$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Druifluis (phylloxera)" }),
  ).toBeVisible();

  await page.goto("/classifications/classificatie-saint-emilion#producent-chateau-badette");
  await expect(page).toHaveURL(
    /\/classifications\/saint-emilion-classification#producent-chateau-badette$/,
  );
  await expect(page.locator("#producent-chateau-badette")).toBeVisible();

  const legacyNarrative = await request.get(
    "/verdiepingen/regional-deep-dives/bordeaux-pipeline-proef",
    { maxRedirects: 0 },
  );
  expect(legacyNarrative.status()).toBe(308);
  expect(legacyNarrative.headers().location).toBe(
    "/verdiepingen/regional-deep-dives/bordeaux-pipeline-proof",
  );
});

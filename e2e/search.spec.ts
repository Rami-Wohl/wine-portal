import { expect, test } from "@playwright/test";

test("empty search focuses its field without moving the page", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/search");

  await expect(page.getByRole("searchbox", { name: "Zoekterm" })).toBeFocused();
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test("submitted search reveals and focuses results while respecting reduced motion and history", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    const nativeScrollIntoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function scrollIntoView(options) {
      if (typeof options === "object") {
        document.documentElement.dataset.testScrollBehavior = options.behavior ?? "auto";
      }
      nativeScrollIntoView.call(this, options);
    };
  });
  await page.goto("/search");

  await page.getByRole("searchbox", { name: "Zoekterm" }).fill("Pennsylvania");
  await page.getByRole("button", { name: "Zoeken" }).click();

  await expect(page).toHaveURL(/\/search\?q=Pennsylvania/);
  const results = page.getByRole("region", { name: /Voor “Pennsylvania”/ });
  await expect(page.getByRole("heading", { name: /Voor “Pennsylvania”/ })).toBeFocused();
  await expect(results).toBeVisible();
  await expect
    .poll(
      async () =>
        (await page.getByRole("heading", { name: /Voor “Pennsylvania”/ }).boundingBox())?.y,
    )
    .toBeGreaterThanOrEqual(0);
  await expect(page.locator("html")).toHaveAttribute("data-test-scroll-behavior", "auto");

  await page.goBack();
  await expect(page).toHaveURL(/\/search$/);
  await expect(page.getByRole("searchbox", { name: "Zoekterm" })).toBeFocused();
});

test("search ranks entities and links article matches to their depth-aware block", async ({
  page,
}) => {
  await page.goto("/search?q=Cabernet+Sauvignon");

  const exactEntity = page.locator(".search-result-card").first();
  await expect(exactEntity.getByRole("heading", { name: "Cabernet Sauvignon" })).toBeVisible();
  await expect(exactEntity).toHaveAttribute("href", "/grapes/cabernet-sauvignon");

  await page.goto("/search?q=absolute+immuniteit");
  const contentResult = page.getByRole("link", { name: /Druifluis \(phylloxera\)/ });
  await expect(contentResult).toContainText("Gevorderd");
  await expect(contentResult).toContainText("Gevonden in Resistentie is geen absolute immuniteit");
  await expect(contentResult).toHaveAttribute(
    "href",
    "/concepts/phylloxera#resistentie-heeft-grenzen",
  );

  await contentResult.click();
  await expect(page).toHaveURL(/\/concepts\/phylloxera#resistentie-heeft-grenzen$/);
  await expect(page.locator("#resistentie-heeft-grenzen")).toBeVisible();
});

test("search includes captions used by published pages", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/search?q=Pennsylvania");

  const captionResult = page.getByRole("link", { name: /Druifluis \(phylloxera\)/ });
  await expect(captionResult).toContainText("Gevonden in een beeldbijschrift");
  await expect(captionResult).toContainText("Pennsylvania");
  await expect(captionResult).toHaveAttribute("href", "/concepts/phylloxera#bladgallen");
  await expect(page.locator("body")).not.toHaveCSS("overflow-x", "scroll");
});

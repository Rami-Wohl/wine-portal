import { expect, test } from "@playwright/test";

for (const viewport of [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 1000 },
]) {
  test(`homepage hero remains legible and contained on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/");

    const hero = page.locator(".home-hero");
    const image = hero.locator(".home-hero-image");
    await expect(hero.getByRole("heading", { level: 1, name: "Oenocademy" })).toBeVisible();
    await expect(image).toHaveAttribute("alt", "");
    await expect
      .poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      viewport.width,
    );
  });
}

test("browse pagination is available above and below the list and returns to its heading", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/explore/concepts");

  const topPagination = page.getByRole("navigation", {
    name: "Pagina's met concepten, boven de lijst",
  });
  const bottomPagination = page.getByRole("navigation", {
    name: "Pagina's met concepten, onder de lijst",
  });
  await expect(topPagination).toBeVisible();
  await expect(bottomPagination).toBeVisible();

  await topPagination.getByRole("link", { name: "Ga naar pagina 2", exact: true }).click();
  await expect(page).toHaveURL(/\/explore\/concepts\?page=2#browse-results$/);
  await expect(topPagination.getByText(/Pagina 2 van/)).toBeVisible();

  await expect
    .poll(() =>
      page.locator("#browse-results").evaluate((element) => element.getBoundingClientRect().top),
    )
    .toBeLessThan(160);
  expect(
    await page
      .locator("#browse-results")
      .evaluate((element) => element.getBoundingClientRect().top),
  ).toBeGreaterThanOrEqual(0);
  await expect(page.locator("#browse-results-title")).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test("search pagination uses the same list-targeted controls", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/search?type=concept");

  const topPagination = page.getByRole("navigation", {
    name: "Pagina's met zoekresultaten, boven de lijst",
  });
  const bottomPagination = page.getByRole("navigation", {
    name: "Pagina's met zoekresultaten, onder de lijst",
  });
  await expect(topPagination).toBeVisible();
  await expect(bottomPagination).toBeVisible();

  await topPagination.getByRole("link", { name: "Ga naar pagina 2", exact: true }).click();
  await expect(page).toHaveURL(/\/search\?type=concept&page=2#search-results$/);
  await expect(topPagination.getByText(/Pagina 2 van/)).toBeVisible();
  await expect(page.locator("#results-title")).toBeFocused();

  await expect
    .poll(() =>
      page.locator("#search-results").evaluate((element) => element.getBoundingClientRect().top),
    )
    .toBeLessThan(160);
  expect(
    await page
      .locator("#search-results")
      .evaluate((element) => element.getBoundingClientRect().top),
  ).toBeGreaterThanOrEqual(0);
});

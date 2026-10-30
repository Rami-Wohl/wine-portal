import { expect, test } from "@playwright/test";

for (const locale of ["nl", "en"] as const) {
  const prefix = locale === "en" ? "/en" : "";
  for (const width of [320, 768, 1440]) {
    test(`${locale} homepage offers Explore and Learn at ${width}px`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(prefix || "/");

      const hero = page.locator(".home-hero");
      const image = hero.locator(".home-hero-image");
      await expect(hero.getByRole("heading", { level: 1, name: "Oenocademy" })).toBeVisible();
      await expect(image).toHaveAttribute("alt", "");
      await expect
        .poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth))
        .toBeGreaterThan(0);
      const modes = page.locator(".mode-grid > a");
      await expect(modes).toHaveCount(2);
      const boxes = await modes.evaluateAll((links) =>
        links.map((link) => {
          const { x, y, width, height } = link.getBoundingClientRect();
          return { x, y, width, height };
        }),
      );
      if (width > 620) {
        expect(boxes[0].y).toBe(boxes[1].y);
        expect(Math.abs(boxes[0].width - boxes[1].width)).toBeLessThan(1);
      } else {
        expect(boxes[1].y).toBeGreaterThanOrEqual(boxes[0].y + boxes[0].height);
      }
      await expect(page.getByRole("link", { name: /Atlas/ })).toHaveCount(0);
      await page.screenshot({
        path: testInfo.outputPath(`home-${locale}-${width}.png`),
        fullPage: true,
      });
      if (width <= 860) {
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page
          .getByRole("button", {
            name: locale === "nl" ? "Navigatiemenu openen" : "Open navigation menu",
            exact: true,
          })
          .click();
      }
      const navigation = width <= 860 ? page.getByRole("dialog") : page.locator(".site-nav");
      await expect(navigation.getByRole("link", { name: /Atlas/ })).toHaveCount(0);
      await expect(
        navigation.getByRole("link", {
          name: locale === "nl" ? "Ontdekken" : "Explore",
          exact: true,
        }),
      ).toHaveAttribute("href", `${prefix}/explore`);
      await navigation
        .getByRole("link", { name: locale === "nl" ? "Leren" : "Learn", exact: true })
        .click();
      await expect(page).toHaveURL(`${prefix}/learn`);
      await expect(page.getByRole("main")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
    });
  }
  test(`${locale} retired Atlas route returns 404`, async ({ request }) => {
    const response = await request.get(`${prefix}/atlas`);
    expect(response.status()).toBe(404);
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

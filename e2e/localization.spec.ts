import { expect, test, type Page } from "@playwright/test";

async function chooseLanguage(page: Page, name: "English" | "Nederlands") {
  await page
    .getByRole("banner")
    .getByLabel(/Taal kiezen|Choose language/)
    .click();
  await page.getByRole("link", { name, exact: true }).click();
}

test("language routes preserve the document and use public URLs", async ({ page, request }) => {
  await page.goto("/concepts/winemaking-routes");
  await expect(page.locator("html")).toHaveAttribute("lang", "nl");
  const documentStarted = await page.evaluate(() => performance.timeOrigin);
  await chooseLanguage(page, "English");
  await expect(page).toHaveURL(/\/en\/concepts\/winemaking-routes$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(documentStarted);
  await chooseLanguage(page, "Nederlands");
  await expect(page).toHaveURL(/\/concepts\/winemaking-routes$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "nl");
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(documentStarted);
  const alias = await request.get("/nl/concepts/winemaking-routes?path=a&path=b", {
    maxRedirects: 0,
  });
  expect(alias.status()).toBe(308);
  expect(new URL(alias.headers().location, alias.url()).pathname).toBe(
    "/concepts/winemaking-routes",
  );
  expect(new URL(alias.headers().location, alias.url()).searchParams.getAll("path")).toEqual([
    "a",
    "b",
  ]);
});

const lessonPath = "/verdiepingen/lessons/three-routes-for-still-wine";
const pathSlug = "from-grape-to-still-wine";

test("English content, links and history remain in the selected language", async ({ page }) => {
  await page.goto("/en/concepts/winemaking-routes");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Still wine production routes");
  await expect(page.locator('a[hreflang="en"]')).toHaveAttribute("aria-current", "true");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/en\/concepts\/winemaking-routes$/,
  );
  await expect(page.locator('link[hreflang="nl"]')).toHaveAttribute(
    "href",
    /\/concepts\/winemaking-routes$/,
  );
  await chooseLanguage(page, "Nederlands");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Productieroutes voor stille wijn",
  );
  await page.goBack();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Still wine production routes");
  await page
    .getByRole("navigation", { name: "Main navigation", exact: true })
    .getByRole("link", { name: "Learn", exact: true })
    .click();
  await expect(page).toHaveURL(/\/en\/learn$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Learn in a thoughtful sequence",
  );
  await expect(page.locator('.site-nav a[aria-current="page"]')).toHaveText("Learn");
});

test("language switches retain validated filters and reset pagination", async ({ page }) => {
  await page.goto("/search?q=wine&type=concept&page=2&unknown=discard");
  await chooseLanguage(page, "English");
  await expect(page).toHaveURL(/\/en\/search\?q=wine&type=concept$/);
  await expect(page.getByLabel("Search term", { exact: true })).toHaveValue("wine");
  await expect(page.locator(".search-result-card").first()).toHaveAttribute("href", /^\/en\//);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.locator('link[rel="alternate"]')).toHaveCount(0);
  await page.goto("/explore/producers?context=pauillac&initial=C&page=2&unknown=discard");
  await chooseLanguage(page, "English");
  await expect(page).toHaveURL(/\/en\/explore\/producers\?context=pauillac&initial=C$/);
  await expect(page.locator('select[name="context"]')).toHaveValue("pauillac");
  await expect(page.locator(".discovery-entity-card").first()).toHaveAttribute("href", /^\/en\//);
});

for (const query of [`path=${pathSlug}`, `path=${pathSlug}&path=${pathSlug}`, "path=unknown"]) {
  test(`lesson context is validated when switching: ${query}`, async ({ page }) => {
    const valid = query === `path=${pathSlug}`;
    await page.goto(`${lessonPath}?${query}`);
    await chooseLanguage(page, "English");
    await expect(page).toHaveURL(`/en${lessonPath}${valid ? `?path=${pathSlug}` : ""}`);
    await expect(page.getByRole("region", { name: "Position in the learning path" })).toHaveCount(
      valid ? 1 : 0,
    );
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Three routes for still wine");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      new RegExp(`/en${lessonPath}$`),
    );
  });
}

test("temporary progress and depth survive switching with blocked storage", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error("Storage unavailable");
    };
    Storage.prototype.getItem = () => {
      throw new Error("Storage unavailable");
    };
  });
  await page.goto(`${lessonPath}?path=${pathSlug}`);
  const started = await page.evaluate(() => performance.timeOrigin);
  await page
    .getByRole("button", { name: /Markeer als voltooid/ })
    .first()
    .click();
  await chooseLanguage(page, "English");
  await expect(page.getByRole("button", { name: /Lesson complete/ })).toHaveCount(2);
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(started);
  await page
    .getByRole("region", { name: "Position in the learning path" })
    .getByRole("link")
    .click();
  await expect(page.getByRole("progressbar", { name: "1 of 7 complete" })).toBeVisible();
  await chooseLanguage(page, "Nederlands");
  await expect(page.getByRole("progressbar", { name: "1 van 7 voltooid" })).toBeVisible();

  await page.goto("/concepts/alcoholic-fermentation");
  await page.getByRole("button", { name: "Gevorderd", exact: true }).click();
  const depthStarted = await page.evaluate(() => performance.timeOrigin);
  await chooseLanguage(page, "English");
  await expect(page.getByRole("button", { name: "Advanced", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(depthStarted);
});

test("deep passages and source anchors retain their identity", async ({ page }) => {
  await page.goto("/concepts/alcoholic-fermentation#spontaan-is-geen-herkomstbewijs");
  await chooseLanguage(page, "English");
  await expect(page).toHaveURL(
    /\/en\/concepts\/alcoholic-fermentation#spontaan-is-geen-herkomstbewijs$/,
  );
  await expect(page.locator("#spontaan-is-geen-herkomstbewijs")).toBeInViewport();
  await page.goto("/en/concepts/winemaking-routes#source-1");
  const source = await page.locator("#source-1").textContent();
  await chooseLanguage(page, "Nederlands");
  await expect(page).toHaveURL(/\/concepts\/winemaking-routes#source-1$/);
  await expect(page.locator("#source-1")).toHaveText(source!);
  await expect(page.locator("#source-1")).toBeInViewport();
});

test("aliases preserve language, duplicate queries and embedded owner anchors", async ({
  page,
  request,
}) => {
  const alias = await request.get("/en/concepts/productieroutes-voor-stille-wijn?path=a&path=b", {
    maxRedirects: 0,
  });
  expect(alias.status()).toBe(308);
  const destination = new URL(alias.headers().location, alias.url());
  expect(destination.pathname).toBe("/en/concepts/winemaking-routes");
  expect(destination.searchParams.getAll("path")).toEqual(["a", "b"]);
  await page.goto("/en/producers/chateau-batailley#old-anchor");
  await expect(page).toHaveURL(/\/en\/classifications\/bordeaux-1855#producent-chateau-batailley$/);
  await expect(page.locator("#producent-chateau-batailley")).toBeVisible();
  await chooseLanguage(page, "Nederlands");
  await expect(page).toHaveURL(/\/classifications\/bordeaux-1855#producent-chateau-batailley$/);
});

test("localized errors and completion pages are not indexed", async ({ page }) => {
  const missing = await page.goto("/en/unknown-page");
  expect(missing?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("This page does not exist.");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  const unsupported = await page.goto("/fr/concepts/winemaking-routes");
  expect(unsupported?.status()).toBe(404);
  await page.goto(`/en/learn/${pathSlug}/complete`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Looking back on the learning path",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.locator('link[rel="alternate"]')).toHaveCount(0);
  await chooseLanguage(page, "Nederlands");
  await expect(page).toHaveURL(`/learn/${pathSlug}/complete`);
});

test("language links work without JavaScript, including validated lesson context", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  await page.goto(`${lessonPath}?path=${pathSlug}`);
  await chooseLanguage(page, "English");
  await expect(page).toHaveURL(`/en${lessonPath}?path=${pathSlug}`);
  await expect(page.getByRole("region", { name: "Position in the learning path" })).toBeVisible();
  await page.goto("/en/concepts/winemaking-routes");
  await chooseLanguage(page, "Nederlands");
  await expect(page).toHaveURL("/concepts/winemaking-routes");
  await page.goto("/search?q=wine&type=concept&page=2");
  await chooseLanguage(page, "English");
  await expect(page).toHaveURL("/en/search?q=wine&type=concept");
  await page.goto("/explore/producers?context=pauillac&initial=C&page=2");
  await chooseLanguage(page, "English");
  await expect(page).toHaveURL("/en/explore/producers?context=pauillac&initial=C");
  await context.close();
});

test("English mobile navigation and language controls fit the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`/en${lessonPath}?path=${pathSlug}`);
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await page
    .getByRole("navigation", { name: "Main mobile navigation" })
    .getByRole("link", { name: "Explore" })
    .click();
  await expect(page).toHaveURL("/en/explore");
  await expect(page.getByRole("banner").getByLabel(/Choose language/)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page
    .getByRole("banner")
    .getByLabel(/Choose language/)
    .click();
  await page.getByRole("link", { name: "Nederlands", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL("/explore");
});

import { expect, test } from "@playwright/test";

const lessons = [
  {
    slug: "vine-through-year",
    alias: "de-wijnstok-door-het-jaar",
    nl: "De wijnstok door het jaar",
    en: "The vine through the year",
    figure: "plant-in-beeld",
    markers: 8,
    reference: "/concepts/vine-as-living-system",
  },
  {
    slug: "climate-site-and-season",
    alias: "klimaat-weer-en-de-plek-van-de-stok",
    nl: "Klimaat, weer en de plek van de stok",
    en: "Climate, weather and the vine’s site",
    figure: "vier-schalen",
    markers: 4,
    reference: "/concepts/climate-weather-site-microclimate",
  },
  {
    slug: "soil-roots-and-water",
    alias: "bodem-wortels-en-beschikbaar-water",
    nl: "Bodem, wortels en beschikbaar water",
    en: "Soil, roots and available water",
    figure: "waterroute-in-beeld",
    markers: 6,
    reference: "/concepts/vineyard-soils",
  },
] as const;

for (const locale of ["nl", "en"] as const) {
  const prefix = locale === "en" ? "/en" : "";

  for (const width of [320, 1440]) {
    test(`vineyard lessons remain readable standalone in ${locale} at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const lesson of lessons) {
        await page.goto(`${prefix}/verdiepingen/lessons/${lesson.slug}`);
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(lesson[locale]);
        await expect(page.locator("html")).toHaveAttribute("lang", locale);
        await expect(page.locator(".lesson-path-context, .lesson-path-footer")).toHaveCount(0);
        const figure = page.locator(`#${lesson.figure}`);
        const illustration = figure.getByRole("img");
        await illustration.scrollIntoViewIfNeeded();
        await expect(illustration).toHaveAttribute("src", /\.png(?:%3F|\?|$)/i);
        await expect(illustration).not.toHaveAttribute("alt", "");
        await expect
          .poll(() => illustration.evaluate((img) => (img as HTMLImageElement).naturalWidth))
          .toBeGreaterThan(0);
        await expect(figure.locator(".content-figure-description li")).toHaveCount(lesson.markers);
        await expect(page.locator("#centraal-inzicht")).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
          width,
        );
        // Follow a real reference and its generated backlink, preserving language.
        await page.locator(`article a[href="${prefix}${lesson.reference}"]`).first().click();
        await expect(page).toHaveURL(`${prefix}${lesson.reference}`);
        const selector = `a[href="${prefix}/verdiepingen/lessons/${lesson.slug}"]`;
        const backlink = page.getByRole("main").locator(selector);
        await expect(backlink).toHaveCount(1);
        const disclosure = page.locator("main details").filter({ has: page.locator(selector) });
        if ((await disclosure.getAttribute("open")) === null) {
          await disclosure.locator("summary").click();
        }
        await expect(backlink).toBeVisible();
        await backlink.click();
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(lesson[locale]);
      }
    });
  }

  test(`vineyard lessons are discoverable through library and search in ${locale}`, async ({
    page,
  }) => {
    for (const lesson of lessons) {
      const route = `${prefix}/verdiepingen/lessons/${lesson.slug}`;
      await page.goto(`${prefix}/verdiepingen`);
      await expect(page.locator(`.learning-list a[href="${route}"]`)).toContainText(lesson[locale]);
      await page.goto(`${prefix}/learn`);
      await expect(page.locator(`.standalone-lesson-list a[href="${route}"]`)).toContainText(
        lesson[locale],
      );
      await page.goto(`${prefix}/search?q=${encodeURIComponent(lesson[locale])}`);
      const result = page.locator(`.search-result-card[href="${route}"]`);
      await expect(result).toBeVisible();
      await result.focus();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(route);
    }
  });

  test.describe(`without JavaScript (${locale})`, () => {
    test.use({ javaScriptEnabled: false });

    test("the lessons keep their prose, images and references without invented path membership", async ({
      page,
    }) => {
      for (const lesson of lessons) {
        await page.goto(
          `${prefix}/verdiepingen/lessons/${lesson.slug}?path=from-grape-to-still-wine`,
          { waitUntil: "domcontentloaded" },
        );
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(lesson[locale]);
        await expect(page.locator("#leerdoelen li")).toHaveCount(3);
        await expect(page.locator("#waarom-in-het-glas")).toBeVisible();
        const illustration = page.locator(`#${lesson.figure} img`);
        await illustration.scrollIntoViewIfNeeded();
        await expect
          .poll(() => illustration.evaluate((img) => (img as HTMLImageElement).naturalWidth))
          .toBeGreaterThan(0);
        await expect(page.locator(".lesson-path-context, .lesson-path-footer")).toHaveCount(0);
        await page.locator(`article a[href="${prefix}${lesson.reference}"]`).first().click();
        await expect(page).toHaveURL(`${prefix}${lesson.reference}`);
      }
    });
  });
}

test("language switching retains the lesson and shared block anchor", async ({ page }) => {
  await page.goto("/verdiepingen/lessons/soil-roots-and-water#probeer-het-zelf");
  const trigger = page.getByRole("banner").getByLabel(/Taal kiezen/);
  await trigger.focus();
  await page.keyboard.press("Enter");
  await page.getByRole("link", { name: "English", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL("/en/verdiepingen/lessons/soil-roots-and-water#probeer-het-zelf");
  await expect(page.locator("#probeer-het-zelf")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(lessons[2].en);
});

test("localized aliases redirect permanently to the lesson's canonical route", async ({
  request,
}) => {
  for (const lesson of lessons) {
    for (const prefix of ["", "/en"]) {
      const response = await request.get(`${prefix}/verdiepingen/lessons/${lesson.alias}`, {
        maxRedirects: 0,
      });
      expect(response.status()).toBe(308);
      expect(response.headers().location).toBe(`${prefix}/verdiepingen/lessons/${lesson.slug}`);
    }
  }
});

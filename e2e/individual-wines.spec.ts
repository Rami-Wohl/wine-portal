import { expect, test } from "@playwright/test";

const wines = [
  {
    slug: "port",
    parent: "douro",
    title: "Port",
    family: "fortified-wines",
    detail: "bottelmoment",
  },
  {
    slug: "sherry",
    parent: "jerez",
    title: "Sherry",
    family: "fortified-wines",
    detail: "rijping-en-oogstjaar",
  },
  {
    slug: "champagne",
    parent: "champagne",
    title: "Champagne",
    family: "sparkling-wines",
    detail: "rijping-voor-en-na-degorgement",
  },
] as const;

for (const locale of ["nl", "en"] as const) {
  const prefix = locale === "en" ? "/en" : "";

  for (const wine of wines) {
    test(`${wine.title} connects origin and process in ${locale} at small and large widths`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${prefix}/concepts/${wine.family}`);
      await page.locator(`article a[href="${prefix}/appellations/${wine.slug}"]`).first().click();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(wine.title);
      await expect(page.locator(`a[href="${prefix}/regions/${wine.parent}"]`)).toHaveCount(0);
      await expect(page.locator(".relation-clusters a[href*='/grapes/']")).toHaveCount(0);
      await expect(page.locator("#etiket-en-aankoop")).toBeVisible();
      await expect(page.locator(`#${wine.detail}`)).toBeHidden();

      const photo = page.locator("article figure img").first();
      await photo.scrollIntoViewIfNeeded();
      await expect(photo).toHaveAttribute("alt", /\S/);
      await expect
        .poll(() => photo.evaluate((img: HTMLImageElement) => img.naturalWidth))
        .toBeGreaterThan(0);
      await expect(page.locator("article figure figcaption").first()).toContainText("CC BY-SA");

      await page
        .getByRole("button", { name: locale === "nl" ? "Verdieping" : "Intermediate", exact: true })
        .click();
      await expect(page.locator(`#${wine.detail}`)).toBeVisible();
      for (const width of [320, 768, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
          ),
        ).toBe(true);
      }
      await page.locator(`#verder-ontdekken a[href="${prefix}/concepts/${wine.family}"]`).click();
      await expect(page).toHaveURL(`${prefix}/concepts/${wine.family}`);
      await page.goto(`${prefix}/appellations/${wine.slug}#${wine.detail}`);
      await expect(page.locator(`#${wine.detail}`)).toBeVisible();
    });
  }

  test(`individual wine names are searchable without publishing their regional drafts in ${locale}`, async ({
    page,
  }) => {
    for (const wine of wines) {
      await page.goto(`${prefix}/search?q=${wine.title}`);
      await expect(
        page.locator(`.search-result-card[href="${prefix}/appellations/${wine.slug}"]`),
      ).toBeVisible();
      await expect(
        page.locator(`.search-result-card[href="${prefix}/regions/${wine.parent}"]`),
      ).toHaveCount(0);
    }
    await page.goto(`${prefix}/appellations/sherry`);
    await expect(page.locator("#appellationregels")).toContainText(
      locale === "nl" ? "zonder versterking" : "without fortification",
    );
    await expect(page.locator("#ligging-en-afbakening")).toContainText(
      "Manzanilla-Sanlúcar de Barrameda",
    );
  });

  test(`individual wine explanations and deeper sections remain readable without JavaScript in ${locale}`, async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    try {
      const page = await context.newPage();
      for (const wine of wines) {
        await page.goto(`${prefix}/appellations/${wine.slug}`, { waitUntil: "domcontentloaded" });
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(wine.title);
        await expect(page.locator(`#${wine.detail}`)).toBeVisible();
        await expect(page.locator("#etiket-en-aankoop")).toBeVisible();
      }
    } finally {
      await context.close();
    }
  });
}

test("sitemap publishes wine appellations while their geographic parents remain drafts", async ({
  request,
}) => {
  const response = await request.get("/sitemap.xml");
  expect(response.ok()).toBe(true);
  const sitemap = await response.text();
  for (const prefix of ["", "/en"]) {
    for (const wine of wines) {
      expect(sitemap).toContain(`${prefix}/appellations/${wine.slug}</loc>`);
    }
    for (const region of ["douro", "jerez", "champagne"]) {
      expect(sitemap).not.toContain(`${prefix}/regions/${region}</loc>`);
    }
  }
});

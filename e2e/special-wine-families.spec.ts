import { expect, test } from "@playwright/test";

const familyPages = [
  {
    slug: "sweet-wines",
    alias: "zoete-wijnen",
    title: { nl: "Zoete wijnen", en: "Sweet wines" },
    figure: "twee-suikermomenten",
    scenes: 2,
    detail: "concentratie-en-restsuiker",
    process: "appassimento",
  },
  {
    slug: "sparkling-wines",
    alias: "mousserende-wijnen",
    title: { nl: "Mousserende wijnen", en: "Sparkling wines" },
    figure: "drie-bruisroutes",
    scenes: 3,
    detail: "voortgezette-gisting-en-transfer",
    process: "traditional-method",
  },
  {
    slug: "fortified-wines",
    alias: "versterkte-wijnen",
    title: { nl: "Versterkte wijnen", en: "Fortified wines" },
    figure: "toevoegen-en-rijpen",
    scenes: 2,
    detail: "flor-en-solera",
    process: "fortification",
  },
] as const;

for (const locale of ["nl", "en"] as const) {
  const prefix = locale === "en" ? "/en" : "";

  for (const family of familyPages) {
    test(`process page opens independent ${family.slug} page in ${locale}`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${prefix}/concepts/${family.process}`);
      await page.locator(`article a[href="${prefix}/concepts/${family.slug}"]`).first().click();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(family.title[locale]);
      await expect(page.locator("article section h2")).toHaveCount(8);
      await expect(page.locator(`#${family.detail}`)).toBeHidden();
      const figure = page.locator(`#${family.figure}`);
      await figure.scrollIntoViewIfNeeded();
      await expect(figure.locator("li")).toHaveCount(family.scenes);
      const image = figure.getByRole("img");
      await expect(image).toHaveAttribute("src", /\.png/);
      await expect
        .poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth))
        .toBeGreaterThan(0);
      await page
        .getByRole("button", { name: locale === "nl" ? "Verdieping" : "Intermediate", exact: true })
        .click();
      await expect(page.locator(`#${family.detail}`)).toBeVisible();
      for (const width of [390, 768, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
          ),
        ).toBe(true);
      }
      await page.locator(`article a[href="${prefix}/concepts/${family.process}"]`).first().click();
      await expect(page).toHaveURL(`${prefix}/concepts/${family.process}`);
      await page.goto(`${prefix}/concepts/${family.slug}#${family.detail}`);
      await expect(page.locator(`#${family.detail}`)).toBeVisible();
    });
  }

  test(`each family is independently searchable in ${locale}`, async ({ page }) => {
    for (const family of familyPages) {
      await page.goto(`${prefix}/search?q=${encodeURIComponent(family.title[locale])}`);
      const result = page.locator(`.search-result-card[href="${prefix}/concepts/${family.slug}"]`);
      await expect(result).toBeVisible();
      await expect(result.getByRole("heading")).toHaveText(family.title[locale]);
    }
  });

  test(`fortification and passito retain their focused explanations in ${locale}`, async ({
    page,
  }) => {
    await page.goto(`${prefix}/concepts/fortification`);
    await expect(
      page.locator(`#overzicht a[href="${prefix}/concepts/fortified-wines"]`),
    ).toBeVisible();
    await expect(page.locator("#werking tbody tr")).toHaveCount(3);
    await page.locator(`#betekenis-voor-wijn a[href="${prefix}/concepts/passito"]`).click();
    await expect(page.locator("h1")).toHaveText("Passito");
    await expect(page.locator("#toepassing-en-keuzes")).toContainText(
      "Pantelleria passito liquoroso",
    );
    for (const slug of ["sweet-wines", "fortified-wines"]) {
      await expect(
        page.locator(`#betekenis-voor-wijn a[href="${prefix}/concepts/${slug}"]`),
      ).toBeVisible();
    }
  });

  test(`existing drying and harvest pages reach active term owners in ${locale}`, async ({
    page,
  }) => {
    await page.goto(`${prefix}/concepts/appassimento`);
    await page.locator(`article a[href="${prefix}/concepts/passito"]`).first().click();
    await expect(page.locator("#bewijs-en-grenzen")).toBeVisible();
    await page.goto(`${prefix}/concepts/late-harvest`);
    await page.locator(`#etiket-en-herkomst a[href="${prefix}/concepts/spatlese"]`).click();
    await expect(page.locator("h1")).toHaveText("Spätlese");
    await expect(page.locator("#toepassing-en-keuzes strong")).toHaveText("trocken");
    await page.locator(`#betekenis-voor-wijn a[href="${prefix}/concepts/sweet-wines"]`).click();
    await expect(page).toHaveURL(`${prefix}/concepts/sweet-wines`);
    await page.goto(`${prefix}/concepts/traditional-method`);
    await page.locator(`#afbakening a[href="${prefix}/concepts/sparkling-wines"]`).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      locale === "nl" ? "Mousserende wijnen" : "Sparkling wines",
    );
  });
}

const retiredSlugs = ["sweet-sparkling-fortified-wines", "zoete-mousserende-versterkte-wijnen"];

for (const prefix of ["", "/en"]) {
  test(`retired overview and alias return 404 and stay out of search in ${prefix || "nl"}`, async ({
    page,
    request,
  }) => {
    for (const slug of retiredSlugs) {
      const response = await request.get(`${prefix}/concepts/${slug}`);
      expect(response.status()).toBe(404);
    }
    await page.goto(
      `${prefix}/search?q=${encodeURIComponent(
        prefix ? "Sweet, sparkling and fortified wines" : "Zoete, mousserende en versterkte wijn",
      )}`,
    );
    for (const slug of retiredSlugs) {
      await expect(page.locator(`a[href="${prefix}/concepts/${slug}"]`)).toHaveCount(0);
    }
  });
}

test("sitemap lists independent wine families and omits the retired overview", async ({
  request,
}) => {
  const response = await request.get("/sitemap.xml");
  expect(response.ok()).toBe(true);
  const sitemap = await response.text();
  for (const family of familyPages) {
    for (const prefix of ["", "/en"]) {
      expect(sitemap).toContain(`${prefix}/concepts/${family.slug}</loc>`);
    }
  }
  for (const slug of retiredSlugs) expect(sitemap).not.toContain(`/concepts/${slug}`);
});

test("independent family pages retain Dutch aliases and their full explanation without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    for (const family of familyPages) {
      await page.goto(`/concepts/${family.alias}`, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(`/concepts/${family.slug}`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(family.title.nl);
      await expect(page.locator(`#${family.detail}`)).toBeVisible();
      await expect(page.locator(`#${family.figure} li`)).toHaveCount(family.scenes);
    }
  } finally {
    await context.close();
  }
});

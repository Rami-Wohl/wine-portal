import { expect, test } from "@playwright/test";

const slug = "wine-perception-and-development";

for (const locale of ["nl", "en"] as const) {
  const prefix = locale === "en" ? "/en" : "";
  const title =
    locale === "nl" ? "Waarneming en wijnontwikkeling" : "Sensory perception and wine development";

  test(`perception connects senses, evidence and depth in ${locale}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${prefix}/concepts/${slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(page.locator("article section h2")).toHaveCount(8);
    await expect(page.locator("#opbouw-en-samenhang tbody tr")).toHaveCount(5);
    await expect(page.locator("#bewijs-en-grenzen tbody tr")).toHaveCount(4);
    for (const id of [
      "drempels-en-mengsels",
      "minerality-als-proefwoord",
      "vergelijkbaar-onderzoek",
    ]) {
      await expect(page.locator(`#${id}`)).toBeHidden();
    }
    const mobileTable = page.locator("#opbouw-en-samenhang .content-table-scroll");
    await mobileTable.press("ArrowRight");
    await expect
      .poll(() => mobileTable.evaluate((element) => element.scrollLeft))
      .toBeGreaterThan(0);
    const figure = page.locator("#ruiken-proeven-en-tijd");
    await figure.scrollIntoViewIfNeeded();
    await expect(figure.locator("li")).toHaveCount(3);
    const image = figure.getByRole("img");
    await expect(image).toHaveAttribute("src", /smelling-tasting-and-time\.png/);
    await expect(image).toHaveAttribute("alt", /.+/);
    await expect
      .poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0);
    await page
      .getByRole("button", {
        name: locale === "nl" ? "Verdieping" : "Intermediate",
        exact: true,
      })
      .click();
    await expect(page.locator("#drempels-en-mengsels")).toBeVisible();
    await expect(page.locator("#minerality-als-proefwoord")).toBeVisible();
    await expect(page.locator("#vergelijkbaar-onderzoek")).toBeHidden();
    await page
      .getByRole("button", {
        name: locale === "nl" ? "Gevorderd" : "Advanced",
        exact: true,
      })
      .click();
    await expect(page.locator("#vergelijkbaar-onderzoek")).toBeVisible();
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
        ),
      ).toBe(true);
      if (width >= 768) {
        for (const table of await page.locator("article .content-table-scroll").all()) {
          expect(
            await table.evaluate((element) => element.scrollWidth <= element.clientWidth),
          ).toBe(true);
        }
      }
    }
    await page.locator(`#overzicht a[href="${prefix}/concepts/wine-composition"]`).click();
    await expect(page).toHaveURL(`${prefix}/concepts/wine-composition`);
  });

  test(`existing owners and the final lesson reach perception in ${locale}`, async ({ page }) => {
    for (const owner of [
      "wine-composition",
      "acidity-in-wine",
      "tannin",
      "oxidation",
      "elevage",
      "bottling",
      "vineyard-soils",
    ]) {
      await page.goto(`${prefix}/concepts/${owner}`);
      await page.locator(`article a[href="${prefix}/concepts/${slug}"]`).click();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    }
    await page.goto(
      `${prefix}/verdiepingen/lessons/cellar-to-bottle?path=from-grape-to-still-wine`,
    );
    await page.locator(`#waarom-in-het-glas a[href="${prefix}/concepts/${slug}"]`).click();
    await expect(page).toHaveURL(`${prefix}/concepts/${slug}`);
  });

  test(`perception is searchable, listed and keeps its depth link across languages in ${locale}`, async ({
    page,
    request,
  }) => {
    await page.goto(`${prefix}/search?q=${encodeURIComponent(title)}`);
    await page.locator(`.search-result-card[href="${prefix}/concepts/${slug}"]`).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBe(true);
    expect(await sitemap.text()).toContain(`${prefix}/concepts/${slug}</loc>`);
    await page.goto(`${prefix}/concepts/${slug}#minerality-als-proefwoord`);
    await expect(page.locator("#minerality-als-proefwoord")).toBeVisible();
    await page
      .getByRole("banner")
      .getByLabel(/Taal kiezen|Choose language/)
      .click();
    await page
      .getByRole("link", { name: locale === "nl" ? "English" : "Nederlands", exact: true })
      .click();
    await expect(page).toHaveURL(
      new RegExp(`${locale === "nl" ? "/en" : ""}/concepts/${slug}#minerality-als-proefwoord$`),
    );
    await expect(page.locator("#minerality-als-proefwoord")).toBeVisible();
  });
}

test("Dutch perception alias reveals directly linked research detail", async ({ page }) => {
  await page.goto("/concepts/waarneming-en-wijnontwikkeling#vergelijkbaar-onderzoek");
  await expect(page).toHaveURL(
    /\/concepts\/wine-perception-and-development#vergelijkbaar-onderzoek$/,
  );
  await expect(page.locator("#vergelijkbaar-onderzoek")).toBeVisible();
});

test("perception tables, visual equivalent and all details work without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(`/en/concepts/${slug}`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("#opbouw-en-samenhang tbody tr")).toHaveCount(5);
    await expect(page.locator("#ruiken-proeven-en-tijd li")).toHaveCount(3);
    for (const id of [
      "drempels-en-mengsels",
      "minerality-als-proefwoord",
      "vergelijkbaar-onderzoek",
    ]) {
      await expect(page.locator(`#${id}`)).toBeVisible();
    }
  } finally {
    await context.close();
  }
});

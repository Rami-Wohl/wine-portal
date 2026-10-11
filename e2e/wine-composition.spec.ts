import { expect, test } from "@playwright/test";

for (const locale of ["nl", "en"] as const) {
  const prefix = locale === "en" ? "/en" : "";
  const title = locale === "nl" ? "Wijnsamenstelling" : "Wine composition";

  test(`composition connects substances, measurement and depth in ${locale}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${prefix}/concepts/wine-composition`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(page.locator("article section h2")).toHaveCount(8);
    await expect(page.locator("#opbouw-en-samenhang tbody tr")).toHaveCount(10);
    await expect(page.locator("#bewijs-en-grenzen tbody tr")).toHaveCount(6);
    await expect(page.locator("#vrij-en-gebonden")).toBeHidden();
    await expect(page.locator("#wat-een-meetmethode-telt")).toBeHidden();
    const mobileTable = page.locator("#opbouw-en-samenhang .content-table-scroll");
    await mobileTable.press("ArrowRight");
    await expect
      .poll(() => mobileTable.evaluate((element) => element.scrollLeft))
      .toBeGreaterThan(0);
    const figure = page.locator("#druif-gisting-en-rijping");
    await figure.scrollIntoViewIfNeeded();
    await expect(figure.locator("li")).toHaveCount(3);
    const image = figure.getByRole("img");
    await expect(image).toHaveAttribute("src", /grape-fermentation-and-ageing\.png/);
    await expect(image).toHaveAttribute("alt", /.+/);
    await expect
      .poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0);
    await page
      .getByRole("button", { name: locale === "nl" ? "Verdieping" : "Intermediate", exact: true })
      .click();
    await expect(page.locator("#vrij-en-gebonden")).toBeVisible();
    await expect(page.locator("#wat-een-meetmethode-telt")).toBeHidden();
    await page
      .getByRole("button", { name: locale === "nl" ? "Gevorderd" : "Advanced", exact: true })
      .click();
    await expect(page.locator("#wat-een-meetmethode-telt")).toBeVisible();
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
    await page.locator(`#overzicht a[href="${prefix}/concepts/acidity-in-wine"]`).click();
    await expect(page).toHaveURL(`${prefix}/concepts/acidity-in-wine`);
  });

  test(`existing owners and the raw-material lesson reach composition in ${locale}`, async ({
    page,
  }) => {
    for (const slug of [
      "acidity-in-wine",
      "tannin",
      "methoxypyrazines",
      "volatile-thiols",
      "alcoholic-fermentation",
      "sulfur-dioxide",
    ]) {
      await page.goto(`${prefix}/concepts/${slug}`);
      await page.locator(`article a[href="${prefix}/concepts/wine-composition"]`).click();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    }
    await page.goto(
      `${prefix}/verdiepingen/lessons/grape-as-raw-material?path=from-grape-to-still-wine`,
    );
    await page
      .locator(`#grondstof-en-kelder a[href="${prefix}/concepts/wine-composition"]`)
      .click();
    await expect(page).toHaveURL(`${prefix}/concepts/wine-composition`);
  });

  test(`composition is searchable and listed in the sitemap in ${locale}`, async ({
    page,
    request,
  }) => {
    await page.goto(`${prefix}/search?q=${encodeURIComponent(title)}`);
    await page.locator(`.search-result-card[href="${prefix}/concepts/wine-composition"]`).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBe(true);
    expect(await sitemap.text()).toContain(`${prefix}/concepts/wine-composition</loc>`);
  });
}

test("Dutch composition alias reveals the directly linked measurement detail", async ({ page }) => {
  await page.goto("/concepts/wijnsamenstelling#wat-een-meetmethode-telt");
  await expect(page).toHaveURL(/\/concepts\/wine-composition#wat-een-meetmethode-telt$/);
  await expect(page.locator("#wat-een-meetmethode-telt")).toBeVisible();
});

test("composition tables, visual equivalent and detail work without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto("/en/concepts/wine-composition", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#opbouw-en-samenhang tbody tr")).toHaveCount(10);
    await expect(page.locator("#druif-gisting-en-rijping li")).toHaveCount(3);
    await expect(page.locator("#vrij-en-gebonden")).toBeVisible();
    await expect(page.locator("#wat-een-meetmethode-telt")).toBeVisible();
  } finally {
    await context.close();
  }
});

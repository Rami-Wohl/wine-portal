import { expect, test } from "@playwright/test";

for (const locale of ["nl", "en"] as const) {
  const prefix = locale === "en" ? "/en" : "";

  test(`a direct deeper link lands on its passage after hydration in ${locale}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto(`${prefix}/concepts/wine-composition#aroma-oorsprong`);
    const detail = page.locator("#aroma-oorsprong");
    await expect(detail).toBeVisible();
    await expect.poll(async () => (await detail.boundingBox())?.y).toBeLessThan(220);
    await expect.poll(async () => (await detail.boundingBox())?.y).toBeGreaterThanOrEqual(0);
    await page.reload();
    await expect.poll(async () => (await detail.boundingBox())?.y).toBeLessThan(220);
    await expect(detail).toBeVisible();
  });

  test(`foundation topics are searchable and reveal their deeper explanations in ${locale}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 844 });
    for (const topic of [
      {
        query: "Winkler",
        slug: "climate-weather-site-microclimate",
        block: "klimaatklassen-en-indices",
      },
      {
        query: locale === "nl" ? "aroma-oorsprong" : "aroma origins",
        slug: "wine-composition",
        block: "aroma-oorsprong",
      },
    ]) {
      await page.goto(`${prefix}/search?q=${encodeURIComponent(topic.query)}`);
      await page
        .locator(`.search-result-card[href="${prefix}/concepts/${topic.slug}#${topic.block}"]`)
        .click();
      await expect(page.locator(`#${topic.block}`)).toBeVisible();
      for (const width of [320, 768, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
          ),
        ).toBe(true);
      }
    }
    for (const topic of [
      { query: locale === "nl" ? "eiken" : "oak", slug: "maturation" },
      { query: locale === "nl" ? "stille wijn" : "still wine", slug: "winemaking-routes" },
    ]) {
      await page.goto(`${prefix}/search?q=${encodeURIComponent(topic.query)}`);
      await expect(
        page.locator(`.search-result-card[href^="${prefix}/concepts/${topic.slug}"]`),
      ).toBeVisible();
    }
  });

  test(`lessons reach their owners while draft mentions remain readable in ${locale}`, async ({
    page,
  }) => {
    await page.goto(
      `${prefix}/verdiepingen/lessons/grape-as-raw-material?path=from-grape-to-still-wine`,
    );
    await page
      .locator(
        `#rijpheid-heeft-meerdere-kanten a[href="${prefix}/concepts/berry-development-veraison-ripeness"]`,
      )
      .click();
    await expect(page).toHaveURL(`${prefix}/concepts/berry-development-veraison-ripeness`);
    await page.goto(`${prefix}/concepts/cuvee`);
    await page.locator(`article a[href="${prefix}/appellations/champagne"]`).first().click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Champagne");
    await page.goto(`${prefix}/concepts/botrytis-noble-rot`);
    await expect(page.locator("#waar-edele-rotting-wijn-maakt")).toContainText("Furmint");
    await expect(page.locator(`article a[href="${prefix}/grapes/furmint"]`)).toHaveCount(0);
    await expect(page.locator(`article a[href="${prefix}/regions/tokaj"]`)).toHaveCount(0);
    await expect(
      page.locator(`article a[href="${prefix}/concepts/sweet-wines"]`).first(),
    ).toBeVisible();
    await page.goto(`${prefix}/concepts/clonal-selection#selectie-en-diversiteit`);
    await expect(page.locator("#selectie-en-diversiteit")).toContainText(
      locale === "nl" ? "massale selectie" : "massal selection",
    );
    await expect(page.locator(`article a[href="${prefix}/concepts/massal-selection"]`)).toHaveCount(
      0,
    );
  });
}

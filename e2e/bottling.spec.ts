import { expect, test } from "@playwright/test";

for (const locale of ["nl", "en"] as const) {
  test(`bottling connects stability, packaging and depth in ${locale}`, async ({ page }) => {
    const prefix = locale === "en" ? "/en" : "";
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${prefix}/concepts/bottling`);
    await expect(page.locator("#werking tbody tr")).toHaveCount(3);
    await expect(page.locator("#zuurstof-rond-botteling")).toBeVisible();
    await expect(page.locator("#verpakking-en-sluiting")).toBeVisible();
    await expect(page.locator("#totale-verpakkingszuurstof")).toBeHidden();
    const figure = page.locator("#van-kelder-naar-fles");
    await figure.scrollIntoViewIfNeeded();
    await expect(figure.locator("li")).toHaveCount(3);
    const image = figure.getByRole("img");
    await expect(image).toHaveAttribute("src", /final-preparation-and-bottling\.png/);
    await expect
      .poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0);
    await page
      .getByRole("button", { name: locale === "nl" ? "Verdieping" : "Intermediate", exact: true })
      .click();
    await expect(page.locator("#totale-verpakkingszuurstof")).toBeVisible();
    await expect(page.locator("#tartraat-en-temperatuur")).toBeVisible();
    await expect(page.locator("#test-en-monster")).toBeHidden();
    await page
      .getByRole("button", { name: locale === "nl" ? "Gevorderd" : "Advanced", exact: true })
      .click();
    await expect(page.locator("#test-en-monster")).toBeVisible();
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
        ),
      ).toBe(true);
    }
    for (const slug of ["clarification-and-fining", "sulfur-dioxide", "blending"]) {
      await expect(
        page.locator(`#klaar-voor-verpakken a[href="${prefix}/concepts/${slug}"]`),
      ).toHaveCount(1);
    }
    await page.goto(
      `${prefix}/verdiepingen/lessons/cellar-to-bottle?path=from-grape-to-still-wine`,
    );
    await page.locator(`#stabilisatie-en-filtratie a[href="${prefix}/concepts/bottling"]`).click();
    await expect(page).toHaveURL(`${prefix}/concepts/bottling`);
  });
}

test("bottling preserves aliases and existing anchors", async ({ page }) => {
  await page.goto("/concepts/botteling#verpakking-en-sluiting");
  await expect(page).toHaveURL(/\/concepts\/bottling#verpakking-en-sluiting$/);
  await expect(page.locator("#verpakking-en-sluiting")).toBeVisible();
  for (const id of [
    "orientatie",
    "klaar-voor-verpakken",
    "schone-overdracht",
    "zuurstof-rond-botteling",
    "van-kelder-naar-fles",
    "estate-bottling",
    "waarom-in-het-glas",
    "centraal-inzicht",
  ]) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }
});

test("stability explanation and image equivalent work without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto("/en/concepts/bottling", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#werking tbody tr")).toHaveCount(3);
    await expect(page.locator("#van-kelder-naar-fles li")).toHaveCount(3);
    await expect(page.locator("#test-en-monster")).toBeVisible();
  } finally {
    await context.close();
  }
});

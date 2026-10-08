import { expect, test } from "@playwright/test";

for (const locale of ["nl", "en"] as const) {
  test(`fault investigation connects prevention, evidence and learning in ${locale}`, async ({
    page,
  }) => {
    const prefix = locale === "en" ? "/en" : "";
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${prefix}/concepts/cellar-hygiene-wine-faults`);
    await expect(page.locator("#werking strong")).toHaveCount(7);
    await expect(page.locator("#moeilijke-contactpunten")).toBeHidden();
    const figure = page.locator("#preventie-en-onderzoek");
    await figure.scrollIntoViewIfNeeded();
    await expect(figure.locator("li")).toHaveCount(4);
    const image = figure.getByRole("img");
    await expect(image).toHaveAttribute("src", /prevention-and-investigation\.png/);
    await expect
      .poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0);
    await page
      .getByRole("button", { name: locale === "nl" ? "Verdieping" : "Intermediate", exact: true })
      .click();
    await expect(page.locator("#moeilijke-contactpunten")).toBeVisible();
    await expect(page.locator("#cellen-en-gevormde-stoffen")).toBeVisible();
    await expect(page.locator("#latente-zwavelbronnen")).toBeHidden();
    await page
      .getByRole("button", { name: locale === "nl" ? "Gevorderd" : "Advanced", exact: true })
      .click();
    await expect(page.locator("#latente-zwavelbronnen")).toBeVisible();
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
        ),
      ).toBe(true);
    }
    for (const slug of [
      "oxidation",
      "alcoholic-fermentation",
      "malolactic-fermentation",
      "bottling",
    ]) {
      await expect(page.locator(`#werking a[href="${prefix}/concepts/${slug}"]`)).toHaveCount(1);
    }
    await page.goto(
      `${prefix}/verdiepingen/lessons/maturation-and-protection?path=from-grape-to-still-wine`,
    );
    await page.locator(`article a[href="${prefix}/concepts/cellar-hygiene-wine-faults"]`).click();
    await expect(page).toHaveURL(`${prefix}/concepts/cellar-hygiene-wine-faults`);
  });
}

test("Dutch hygiene alias reveals a directly linked advanced explanation", async ({ page }) => {
  await page.goto("/concepts/kelderhygiene-en-wijnfouten#latente-zwavelbronnen");
  await expect(page).toHaveURL(/\/concepts\/cellar-hygiene-wine-faults#latente-zwavelbronnen$/);
  await expect(page.locator("#latente-zwavelbronnen")).toBeVisible();
});

test("fault families and the visual equivalent remain readable without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto("/en/concepts/cellar-hygiene-wine-faults", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#werking strong")).toHaveCount(7);
    await expect(page.locator("#preventie-en-onderzoek li")).toHaveCount(4);
    await expect(page.locator("#latente-zwavelbronnen")).toBeVisible();
  } finally {
    await context.close();
  }
});

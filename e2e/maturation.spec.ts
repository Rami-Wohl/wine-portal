import { expect, test } from "@playwright/test";

for (const locale of ["nl", "en"] as const) {
  test(`maturation connects its choices, illustration and depth in ${locale}`, async ({ page }) => {
    const prefix = locale === "en" ? "/en" : "";
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${prefix}/concepts/maturation`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      locale === "nl" ? "Élevage" : "Maturation",
    );
    const figure = page.locator("#opvoedingskeuzes-in-beeld");
    await figure.scrollIntoViewIfNeeded();
    await expect(figure.locator("li")).toHaveCount(4);
    const image = figure.getByRole("img");
    await expect(image).toHaveAttribute("src", /maturation-decisions\.png/);
    await expect
      .poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0);
    await expect(page.locator("#overlappende-timing")).toBeHidden();
    await page
      .getByRole("button", { name: locale === "nl" ? "Verdieping" : "Intermediate", exact: true })
      .click();
    await expect(page.locator("#overlappende-timing")).toBeVisible();
    await expect(page.locator("#zuurstof-is-meer-dan-vatwand")).toBeHidden();
    await page
      .getByRole("button", { name: locale === "nl" ? "Gevorderd" : "Advanced", exact: true })
      .click();
    await expect(page.locator("#zuurstof-is-meer-dan-vatwand")).toBeVisible();
    await expect(page.locator("#proefopzet-en-samenlopende-keuzes")).toBeVisible();
    for (const slug of [
      "malolactic-fermentation",
      "lees-ageing",
      "autolysis",
      "batonnage",
      "oxidation",
    ]) {
      await expect(page.locator(`#werking a[href="${prefix}/concepts/${slug}"]`)).toHaveCount(1);
    }
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
        ),
      ).toBe(true);
    }
    await page.goto(
      `${prefix}/verdiepingen/lessons/after-main-fermentation?path=from-grape-to-still-wine`,
    );
    const lees = page.locator("#lies-en-autolyse");
    await expect(lees.locator(`a[href="${prefix}/concepts/lees-ageing"]`)).toHaveCount(1);
    await lees.locator(`a[href="${prefix}/concepts/autolysis"]`).click();
    await expect(page).toHaveURL(`${prefix}/concepts/autolysis`);
  });
}

test("maturation retains its alias and published deep links", async ({ page }) => {
  await page.goto("/concepts/elevage#zuurstof-is-meer-dan-vatwand");
  await expect(page).toHaveURL(/\/concepts\/maturation#zuurstof-is-meer-dan-vatwand$/);
  await expect(page.locator("#zuurstof-is-meer-dan-vatwand")).toBeVisible();
  for (const id of [
    "orientatie",
    "jonge-wijn-begeleiden",
    "vatenkelder",
    "vatkeuze",
    "maat-leeftijd-en-toast",
    "werk-in-de-kelder",
    "lies-en-zuurstof",
    "richting-botteling",
    "voorbereiden-is-geen-uniform-recept",
    "centraal-inzicht",
  ]) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }
});

test("the maturation explanation and legend work without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto("/en/concepts/maturation", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#opvoedingskeuzes-in-beeld li")).toHaveCount(4);
    await expect(page.locator("#overlappende-timing")).toBeVisible();
    await expect(page.locator("#proefopzet-en-samenlopende-keuzes")).toBeVisible();
  } finally {
    await context.close();
  }
});

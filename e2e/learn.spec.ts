import { expect, test } from "@playwright/test";

for (const viewport of [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 1000 },
]) {
  test(`Learn exposes the complete path and keeps its lesson context usable on ${viewport.name}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/learn");

    await expect(
      page.getByRole("heading", { level: 1, name: "Leer in een doordachte volgorde" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 3,
        name: "Van druif naar stille wijn — hoe wijn wordt gemaakt",
      }),
    ).toBeVisible();
    const pathLink = page.getByRole("link", { name: /Bekijk het leerpad/ });
    await pathLink.focus();
    await expect(pathLink).toBeFocused();
    await pathLink.click();

    await expect(page).toHaveURL(/\/learn\/from-grape-to-still-wine$/);
    await expect(page.getByText("7 kernlessen")).toBeVisible();
    const startLink = page.getByRole("link", { name: /Start met de eerste les/ });
    await expect(startLink).toHaveAttribute(
      "href",
      "/verdiepingen/lessons/grape-as-raw-material?path=from-grape-to-still-wine",
    );
    await startLink.click();

    await expect(page).toHaveURL(
      /\/verdiepingen\/lessons\/grape-as-raw-material\?path=from-grape-to-still-wine$/,
    );
    await expect(page.getByText("Onderdeel van het leerpad")).toBeVisible();
    await expect(page.getByText("Les 1 van 7", { exact: true })).toBeVisible();
    const nextLesson = page.getByRole("link", { name: /Volgende les.*Van druif naar most/ });
    await nextLesson.focus();
    await expect(nextLesson).toBeFocused();
    await nextLesson.click();

    await expect(page).toHaveURL(
      /\/verdiepingen\/lessons\/grape-to-must\?path=from-grape-to-still-wine$/,
    );
    await expect(page.getByText("Les 2 van 7", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Vorige les.*De druif als grondstof/ }),
    ).toBeVisible();

    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      viewport.width,
    );
  });
}

test("the final core lesson leads to the authored completion page", async ({ page }) => {
  await page.goto("/verdiepingen/lessons/cellar-to-bottle?path=from-grape-to-still-wine");
  await expect(page.getByText("Les 7 van 7", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: /Naar de afsluiting.*Bekijk wat je nu kunt/ }).click();
  await expect(page).toHaveURL("/learn/from-grape-to-still-wine/complete");
  await expect(page.getByRole("heading", { level: 1, name: "Wat je nu kunt" })).toBeVisible();
});

test("standalone, invalid and duplicated path context remain safe", async ({ page }) => {
  const lesson = "/verdiepingen/lessons/grape-as-raw-material";

  await page.goto(lesson);
  await expect(page.getByText("Onderdeel van het leerpad")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { level: 1, name: "De druif als grondstof" }),
  ).toBeVisible();

  await page.goto(`${lesson}?path=unknown`);
  await expect(page.getByText("Onderdeel van het leerpad")).toHaveCount(0);

  await page.goto(`${lesson}?path=from-grape-to-still-wine&path=unknown`);
  await expect(page.getByText("Onderdeel van het leerpad")).toHaveCount(0);
});

test("the localized path alias redirects and unknown paths remain private", async ({ page }) => {
  await page.goto("/learn/van-druif-naar-stille-wijn");
  await expect(page).toHaveURL("/learn/from-grape-to-still-wine");

  const response = await page.goto("/learn/unknown-learning-path");
  expect(response?.status()).toBe(404);
});

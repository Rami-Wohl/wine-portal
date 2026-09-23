import { expect, test } from "@playwright/test";

for (const viewport of [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 1000 },
]) {
  test(`Learn keeps draft paths private and published lessons usable on ${viewport.name}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/learn");

    await expect(
      page.getByRole("heading", { level: 1, name: "Leer in een doordachte volgorde" }),
    ).toBeVisible();
    await expect(page.getByText("Het eerste volledige leerpad wordt opgebouwd.")).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 3, name: /Van druif naar stille wijn/ }),
    ).toHaveCount(0);

    const lesson = page.getByRole("link", { name: /De druif als grondstof/ });
    await expect(lesson).toBeVisible();
    await lesson.focus();
    await expect(lesson).toBeFocused();
    await lesson.click();
    await expect(page).toHaveURL(/\/verdiepingen\/lessons\/grape-as-raw-material$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "De druif als grondstof" }),
    ).toBeVisible();
    await expect(page.getByText("Onderdeel van het leerpad")).toHaveCount(0);

    await page.goto("/verdiepingen/lessons/grape-as-raw-material?path=from-grape-to-still-wine");
    await expect(page.getByText("Onderdeel van het leerpad")).toHaveCount(0);
    await expect(
      page.getByRole("heading", { level: 1, name: "De druif als grondstof" }),
    ).toBeVisible();

    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      viewport.width,
    );
  });
}

test("a draft learning path has no public detail route", async ({ page }) => {
  const response = await page.goto("/learn/from-grape-to-still-wine");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { level: 1, name: "Deze pagina bestaat niet." }),
  ).toBeVisible();
});

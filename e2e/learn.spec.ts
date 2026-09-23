import { expect, test } from "@playwright/test";

const pathId = "learning-path.from-grape-to-still-wine";
const progressKey = `oenocademy:learning-progress:v1:${encodeURIComponent(pathId)}`;
const stepIds = [
  "grape-as-raw-material",
  "grape-to-must",
  "alcoholic-fermentation",
  "three-still-wine-routes",
  "after-main-fermentation",
  "maturation-and-protection",
  "cellar-to-bottle",
];

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
    const startLink = page.getByRole("link", { name: "Start het leerpad" });
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
  await expect(
    page.getByRole("heading", { level: 1, name: "Terugblik op het leerpad" }),
  ).toBeVisible();
});

test("a deliberate lesson toggle persists, synchronizes and can be reset", async ({ page }) => {
  await page.goto("/verdiepingen/lessons/grape-as-raw-material?path=from-grape-to-still-wine");

  const incompleteToggles = page.getByRole("button", {
    name: /Nog te leren.*Markeer als voltooid/,
  });
  await expect(incompleteToggles).toHaveCount(2);
  await incompleteToggles.first().click();
  await expect(page.getByRole("button", { name: /Les voltooid/ })).toHaveCount(2);
  await expect(page.getByRole("button", { name: /Les voltooid/ }).first()).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await page.reload();
  await expect(page.getByRole("button", { name: /Les voltooid/ })).toHaveCount(2);

  await page.goto("/learn/from-grape-to-still-wine");
  await expect(page.getByRole("progressbar", { name: "1 van 7 voltooid" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Ga verder/ })).toHaveAttribute(
    "href",
    "/verdiepingen/lessons/grape-to-must?path=from-grape-to-still-wine",
  );
  await expect(page.getByText("Voltooid", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Wis voortgang" }).click();
  await expect(
    page.getByText("Alle lesmarkeringen voor dit leerpad worden op dit apparaat verwijderd."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Ja, wis voortgang" }).click();
  await expect(page.getByRole("progressbar", { name: "0 van 7 voltooid" })).toBeVisible();
});

test("progress controls keep stable dimensions and usable touch targets on a narrow screen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/learn/from-grape-to-still-wine");
  const progressPanel = page.locator(".learning-progress-panel");
  await expect(page.getByRole("heading", { name: "Klaar om te beginnen" })).toBeVisible();
  const initialPanelBox = await progressPanel.boundingBox();

  await page.goto("/verdiepingen/lessons/grape-as-raw-material?path=from-grape-to-still-wine");
  const topToggle = page.locator(".lesson-path-context").getByRole("button");
  await expect(topToggle).toBeVisible();
  const incompleteToggleBox = await topToggle.boundingBox();
  await topToggle.click();
  const completeToggleBox = await topToggle.boundingBox();

  expect(completeToggleBox?.width).toBe(incompleteToggleBox?.width);
  expect(completeToggleBox?.height).toBe(incompleteToggleBox?.height);
  expect(completeToggleBox?.height ?? 0).toBeGreaterThanOrEqual(44);

  await page.goto("/learn/from-grape-to-still-wine");
  await expect(page.getByRole("heading", { name: "Ga verder waar je was" })).toBeVisible();
  const continuedPanelBox = await progressPanel.boundingBox();
  expect(Math.abs((continuedPanelBox?.height ?? 0) - (initialPanelBox?.height ?? 0))).toBeLessThan(
    1,
  );

  const resetButton = page.getByRole("button", { name: "Wis voortgang" });
  const resetButtonBox = await resetButton.boundingBox();
  expect(resetButtonBox?.height ?? 0).toBeGreaterThanOrEqual(44);
  await resetButton.focus();
  await expect(resetButton).toBeFocused();
});

test("navigation alone does not complete a lesson", async ({ page }) => {
  await page.goto("/verdiepingen/lessons/grape-as-raw-material?path=from-grape-to-still-wine");
  await page.getByRole("link", { name: /Volgende les.*Van druif naar most/ }).click();
  await page.goto("/learn/from-grape-to-still-wine");

  await expect(page.getByRole("progressbar", { name: "0 van 7 voltooid" })).toBeVisible();
});

test("the completion page only makes a personal completion claim for complete local progress", async ({
  page,
}) => {
  await page.goto("/learn/from-grape-to-still-wine/complete");
  await expect(
    page.getByRole("heading", { name: "Je leerpad is nog niet voltooid" }),
  ).toBeVisible();

  await page.evaluate(
    ({ key, id, steps }) => {
      window.localStorage.setItem(
        key,
        JSON.stringify({
          schema_version: 1,
          path_id: id,
          completed_step_ids: steps,
          updated_at: new Date().toISOString(),
        }),
      );
    },
    { key: progressKey, id: pathId, steps: stepIds },
  );
  await page.reload();

  await expect(page.getByRole("heading", { name: "Je hebt alle lessen voltooid" })).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "7 van 7 voltooid" })).toBeVisible();
});

test("corrupt or blocked browser storage never blocks the learning experience", async ({
  page,
}) => {
  await page.addInitScript(({ key }) => window.localStorage.setItem(key, "corrupt"), {
    key: progressKey,
  });
  await page.goto("/learn/from-grape-to-still-wine");
  await expect(page.getByRole("heading", { name: "Klaar om te beginnen" })).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "0 van 7 voltooid" })).toBeVisible();

  const blockedPage = await page.context().newPage();
  await blockedPage.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error("storage blocked");
    };
    Storage.prototype.setItem = () => {
      throw new Error("storage blocked");
    };
    Storage.prototype.removeItem = () => {
      throw new Error("storage blocked");
    };
  });
  await blockedPage.goto("/learn/from-grape-to-still-wine");
  await expect(blockedPage.getByText(/Opslaan in deze browser is niet beschikbaar/)).toBeVisible();
  await expect(blockedPage.getByRole("link", { name: "Start het leerpad" })).toBeVisible();
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

test.describe("without client-side JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the authored path and lesson order remain fully navigable", async ({ page }) => {
    await page.goto("/learn/from-grape-to-still-wine");
    const firstLesson = page.getByRole("link", { name: "De druif als grondstof" });
    await expect(firstLesson).toHaveAttribute(
      "href",
      "/verdiepingen/lessons/grape-as-raw-material?path=from-grape-to-still-wine",
    );
    await firstLesson.click();
    await expect(
      page.getByRole("heading", { level: 1, name: "De druif als grondstof" }),
    ).toBeVisible();
  });
});

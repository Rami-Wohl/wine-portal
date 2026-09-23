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
const lessonRoutes = [
  "grape-as-raw-material",
  "grape-to-must",
  "alcoholic-fermentation-lesson",
  "three-routes-for-still-wine",
  "after-main-fermentation",
  "maturation-and-protection",
  "cellar-to-bottle",
].map((slug) => `/verdiepingen/lessons/${slug}?path=from-grape-to-still-wine`);

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

test("published Learn pages keep a coherent document structure", async ({ page }) => {
  for (const route of [
    "/learn",
    "/learn/from-grape-to-still-wine",
    ...lessonRoutes,
    "/learn/from-grape-to-still-wine/complete",
  ]) {
    await page.goto(route);

    const audit = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
      const levels = headings.map((heading) => Number(heading.tagName.slice(1)));
      return {
        mains: document.querySelectorAll("main").length,
        h1s: document.querySelectorAll("h1").length,
        headingJump: levels.some((level, index) => index > 0 && level > levels[index - 1] + 1),
        duplicateIds:
          document.querySelectorAll("[id]").length -
          new Set(Array.from(document.querySelectorAll("[id]"), (node) => node.id)).size,
        imagesWithoutText: Array.from(document.images).filter(
          (image) => !image.hasAttribute("alt") || image.alt.trim().length === 0,
        ).length,
        unnamedControls: Array.from(document.querySelectorAll("a, button")).filter(
          (element) =>
            !element.textContent?.trim() &&
            !element.getAttribute("aria-label") &&
            !element.getAttribute("aria-labelledby"),
        ).length,
      };
    });

    expect(audit, route).toEqual({
      mains: 1,
      h1s: 1,
      headingJump: false,
      duplicateIds: 0,
      imagesWithoutText: 0,
      unnamedControls: 0,
    });
  }
});

test("all published lesson media assets and internal lesson links resolve", async ({ page }) => {
  for (const route of lessonRoutes) {
    await page.goto(route);
    const lessonImages = page.locator("article img");
    await expect(lessonImages.first()).toBeVisible();
    for (let index = 0; index < (await lessonImages.count()); index += 1) {
      const image = lessonImages.nth(index);
      await image.scrollIntoViewIfNeeded();
      const optimizedSource = await image.getAttribute("src");
      expect(optimizedSource, `${route} image ${index + 1}`).toBeTruthy();
      const assetPath = new URL(optimizedSource!, "http://127.0.0.1").searchParams.get("url");
      expect(assetPath, `${route} image ${index + 1}`).toBeTruthy();
      const response = await page.request.get(assetPath!);
      expect(response.status(), `${route} -> ${assetPath}`).toBeLessThan(400);
      expect(response.headers()["content-type"], `${route} -> ${assetPath}`).toMatch(/^image\//);
    }

    const internalHrefs = await page
      .locator("article a[href^='/']")
      .evaluateAll((links) =>
        Array.from(new Set(links.map((link) => (link as HTMLAnchorElement).getAttribute("href")))),
      );
    for (const href of internalHrefs) {
      if (!href) continue;
      const response = await page.request.get(href.split("#")[0]);
      expect(response.status(), `${route} -> ${href}`).toBeLessThan(400);
    }
  }
});

test("keyboard focus, reset disclosure and reduced motion remain accessible", async ({ page }) => {
  await page.goto("/learn/from-grape-to-still-wine");
  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Ga naar de inhoud" });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main#main-content")).toBeFocused();

  await page.goto(lessonRoutes[0]);
  await page
    .getByRole("button", { name: /Nog te leren.*Markeer als voltooid/ })
    .first()
    .click();
  await page.goto("/learn/from-grape-to-still-wine");
  const resetButton = page.getByRole("button", { name: "Wis voortgang", exact: true });
  await resetButton.focus();
  await page.keyboard.press("Enter");
  await expect(resetButton).toBeFocused();
  await expect(resetButton).toHaveAttribute("aria-expanded", "true");
  const cancelButton = page.getByRole("button", { name: "Annuleren" });
  await cancelButton.focus();
  await page.keyboard.press("Enter");
  await expect(resetButton).toBeFocused();

  await page.emulateMedia({ reducedMotion: "reduce" });
  const transitionDuration = await resetButton.evaluate(
    (element) => getComputedStyle(element).transitionDuration,
  );
  expect(Number.parseFloat(transitionDuration)).toBeLessThanOrEqual(0.001);
});

test("the Learn flow reflows at a 200 percent zoom-equivalent width", async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 720 });
  for (const route of [
    "/learn",
    "/learn/from-grape-to-still-wine",
    lessonRoutes[0],
    "/learn/from-grape-to-still-wine/complete",
  ]) {
    await page.goto(route);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
      route,
    ).toBeLessThanOrEqual(640);
  }
});

test("the complete Learn journey has no horizontal overflow at release breakpoints", async ({
  page,
}) => {
  const routes = [
    "/learn",
    "/learn/from-grape-to-still-wine",
    ...lessonRoutes,
    "/learn/from-grape-to-still-wine/complete",
  ];

  for (const width of [375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(route);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
        `${route} at ${width}px`,
      ).toBeLessThanOrEqual(width);
    }
  }
});

test("canonical reference links support a complete Learn to Explore and back journey", async ({
  page,
}) => {
  await page.goto(lessonRoutes[1]);
  await page.locator('a[href="/concepts/pressing"]').first().click();
  await expect(page).toHaveURL("/concepts/pressing");
  await expect(page.getByRole("heading", { level: 1, name: "Persen" })).toBeVisible();

  const lessonBacklink = page.locator(
    'a[href="/verdiepingen/lessons/grape-to-must?path=from-grape-to-still-wine"]',
  );
  await expect(lessonBacklink).toHaveAttribute(
    "href",
    "/verdiepingen/lessons/grape-to-must?path=from-grape-to-still-wine",
  );
  await lessonBacklink.click();
  await expect(page).toHaveURL(lessonRoutes[1]);
  await expect(page.getByText("Les 2 van 7", { exact: true })).toBeVisible();
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

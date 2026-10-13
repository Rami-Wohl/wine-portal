import { expect, test, type Page } from "@playwright/test";

const pathId = "learning-path.vine-and-vineyard";
const oldPathId = "learning-path.from-grape-to-still-wine";
const progressKey = `oenocademy:learning-progress:v1:${encodeURIComponent(pathId)}`;
const oldProgressKey = `oenocademy:learning-progress:v1:${encodeURIComponent(oldPathId)}`;
const steps = [
  "vine-through-year",
  "climate-site-and-season",
  "soil-roots-and-water",
  "pruning-canopy-and-crop",
  "nutrition-and-vineyard-floor",
  "vineyard-risks-and-protection",
  "ripeness-and-harvest",
  "vineyard-systems-and-adaptation",
];

const copy = {
  nl: {
    title: "Wijnstok en wijngaard — hoe druiven groeien",
    start: "Start het leerpad",
    next: /Volgende les/,
    previous: /Vorige les/,
    conclude: /Naar de afsluiting/,
    toggle: /Nog te leren.*Markeer als voltooid/,
    complete: /Les voltooid/,
    position: "Positie binnen het leerpad",
    reset: "Wis voortgang",
    confirm: "Ja, wis voortgang",
    allComplete: "Je hebt alle lessen voltooid",
    notComplete: "Je leerpad is nog niet voltooid",
    meter: (count: number, total = 8) => `${count} van ${total} voltooid`,
    step: (position: number) => `Les ${position} van 8`,
    storage: /Opslaan in deze browser is niet beschikbaar/,
  },
  en: {
    title: "Vine and vineyard — how grapes grow",
    start: "Start the learning path",
    next: /Next lesson/,
    previous: /Previous lesson/,
    conclude: /Go to the conclusion/,
    toggle: /Still to learn.*Mark as complete/,
    complete: /Lesson complete/,
    position: "Position in the learning path",
    reset: "Clear progress",
    confirm: "Yes, clear progress",
    allComplete: "You have completed every lesson",
    notComplete: "Your learning path is not complete yet",
    meter: (count: number, total = 8) => `${count} of ${total} complete`,
    step: (position: number) => `Lesson ${position} of 8`,
    storage: /Storage is unavailable in this browser/,
  },
};

async function switchLanguage(page: Page, name: "English" | "Nederlands") {
  await page
    .getByRole("banner")
    .getByLabel(/Taal kiezen|Choose language/)
    .click();
  await page.getByRole("link", { name, exact: true }).click();
}

for (const locale of ["nl", "en"] as const) {
  const prefix = locale === "en" ? "/en" : "";
  const pathRoute = `${prefix}/learn/vine-and-vineyard`;
  const lessonRoute = (step: string) =>
    `${prefix}/verdiepingen/lessons/${step}?path=vine-and-vineyard`;
  const text = copy[locale];

  for (const width of [320, 1440]) {
    test(`the eight-lesson vineyard journey preserves order and context in ${locale} at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${prefix}/learn`);
      const card = page.locator(".learning-path-card").filter({ hasText: text.title });
      await expect(card).toBeVisible();
      await expect(card).toContainText(locale === "nl" ? "8 lessen" : "8 lessons");
      await card.locator(`a[href="${pathRoute}"]`).click();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(text.title);
      await expect(page.locator(".learning-path-hero .eyebrow")).toContainText(
        locale === "nl" ? "Leerpad" : "Learning path",
      );
      await expect(page.locator(".learning-path-objectives li")).toHaveCount(6);
      expect(
        await page
          .locator(".learning-step-list a")
          .evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
      ).toEqual(steps.map(lessonRoute));
      await page.getByRole("link", { name: text.start, exact: true }).click();

      for (const [index, step] of steps.entries()) {
        await expect(page).toHaveURL(lessonRoute(step));
        await expect(page.locator(".lesson-path-context")).toContainText(text.step(index + 1));
        await expect(page.locator(".lesson-path-context")).toContainText(text.title);
        await expect(page.getByRole("button", { name: text.toggle })).toHaveCount(2);
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
          "href",
          new RegExp(`/verdiepingen/lessons/${step}$`),
        );
        if (index > 0) {
          await expect(page.getByRole("link", { name: text.previous })).toHaveAttribute(
            "href",
            lessonRoute(steps[index - 1]),
          );
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
          width,
        );
        const next = page.getByRole("link", { name: index === 7 ? text.conclude : text.next });
        await next.focus();
        await page.keyboard.press("Enter");
      }

      await expect(page).toHaveURL(`${pathRoute}/complete`);
      await expect(
        page.getByRole("heading", { name: text.notComplete, exact: true }),
      ).toBeVisible();
      await expect(page.getByRole("progressbar", { name: text.meter(0) })).toBeVisible();
      await expect(page.locator(".learning-recap li")).toHaveCount(8);
      await expect(page.locator(".learning-suggestion-grid a")).toHaveCount(4);
      await expect(page.locator(".learning-suggestion-grid a").first()).toHaveAttribute(
        "href",
        `${prefix}/learn/from-grape-to-still-wine`,
      );
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
      for (const link of await page.locator(".learning-suggestion-grid a").all()) {
        const href = await link.getAttribute("href");
        expect((await page.request.get(href!)).status()).toBe(200);
      }
    });
  }

  test(`vineyard progress survives language switching and reset preserves the original path in ${locale}`, async ({
    page,
  }) => {
    const oldRecord = JSON.stringify({
      schema_version: 1,
      path_id: oldPathId,
      completed_step_ids: ["grape-as-raw-material"],
      updated_at: "2026-10-12T12:00:00.000Z",
    });
    await page.goto(`${prefix}/learn`);
    await page.evaluate(({ key, record }) => localStorage.setItem(key, record), {
      key: oldProgressKey,
      record: oldRecord,
    });
    await page.goto(`${lessonRoute(steps[0])}#probeer-het-zelf`);
    await page.getByRole("button", { name: text.toggle }).first().focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: text.complete })).toHaveCount(2);
    await page.reload();
    await expect(page.getByRole("button", { name: text.complete })).toHaveCount(2);
    const other = locale === "nl" ? "en" : "nl";
    const otherPrefix = other === "en" ? "/en" : "";
    await switchLanguage(page, other === "en" ? "English" : "Nederlands");
    await expect(page).toHaveURL(
      `${otherPrefix}/verdiepingen/lessons/${steps[0]}?path=vine-and-vineyard#probeer-het-zelf`,
    );
    await expect(page.getByRole("button", { name: copy[other].complete })).toHaveCount(2);
    await page.getByRole("region", { name: copy[other].position }).getByRole("link").click();
    await expect(page.getByRole("progressbar", { name: copy[other].meter(1) })).toBeVisible();
    const next = page.locator(".learning-progress-panel a").first();
    await expect(next).toHaveAttribute(
      "href",
      `${otherPrefix}/verdiepingen/lessons/${steps[1]}?path=vine-and-vineyard`,
    );
    const persisted = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!),
      progressKey,
    );
    expect(persisted.path_id).toBe(pathId);
    expect(persisted.completed_step_ids).toEqual([steps[0]]);

    await page.goto(`${prefix}/learn`);
    await expect(
      page
        .locator(".learning-path-card")
        .filter({ has: page.locator(`a[href="${pathRoute}"]`) })
        .getByRole("progressbar", { name: text.meter(1) }),
    ).toBeVisible();
    await expect(
      page
        .locator(".learning-path-card")
        .filter({ has: page.locator(`a[href="${prefix}/learn/from-grape-to-still-wine"]`) })
        .getByRole("progressbar", { name: text.meter(1, 7) }),
    ).toBeVisible();
    await page.evaluate(
      ({ key, id, ids }) =>
        localStorage.setItem(
          key,
          JSON.stringify({
            schema_version: 1,
            path_id: id,
            completed_step_ids: ids,
            updated_at: "2026-10-12T13:00:00.000Z",
          }),
        ),
      { key: progressKey, id: pathId, ids: steps },
    );
    await page.goto(`${pathRoute}/complete`);
    await expect(page.getByRole("heading", { name: text.allComplete, exact: true })).toBeVisible();
    await expect(page.getByRole("progressbar", { name: text.meter(8) })).toBeVisible();
    await page.goto(pathRoute);
    await page.getByRole("button", { name: text.reset, exact: true }).click();
    await page.getByRole("button", { name: text.confirm, exact: true }).click();
    await expect(page.getByRole("progressbar", { name: text.meter(0) })).toBeVisible();
    expect(await page.evaluate((key) => localStorage.getItem(key), oldProgressKey)).toBe(oldRecord);
    expect(await page.evaluate((key) => localStorage.getItem(key), progressKey)).toBeNull();
    await page.goto(`${prefix}/learn/from-grape-to-still-wine`);
    await expect(page.getByRole("progressbar", { name: text.meter(1, 7) })).toBeVisible();
  });

  test(`blocked storage keeps vineyard progress temporary through language switching in ${locale}`, async ({
    page,
  }) => {
    await page.addInitScript(() => {
      for (const method of ["getItem", "setItem", "removeItem"] as const) {
        Storage.prototype[method] = () => {
          throw new Error("Storage unavailable");
        };
      }
    });
    await page.goto(lessonRoute(steps[0]));
    await page.getByRole("button", { name: text.toggle }).first().click();
    const other = locale === "nl" ? "en" : "nl";
    await switchLanguage(page, other === "en" ? "English" : "Nederlands");
    await expect(page.getByRole("button", { name: copy[other].complete })).toHaveCount(2);
    await page.getByRole("region", { name: copy[other].position }).getByRole("link").click();
    await expect(page.getByText(copy[other].storage)).toBeVisible();
    await expect(page.getByRole("progressbar", { name: copy[other].meter(1) })).toBeVisible();
    await page.getByRole("button", { name: copy[other].reset, exact: true }).click();
    await page.getByRole("button", { name: copy[other].confirm, exact: true }).click();
    await expect(page.getByRole("progressbar", { name: copy[other].meter(0) })).toBeVisible();
  });

  test.describe(`vineyard path without JavaScript in ${locale}`, () => {
    test.use({ javaScriptEnabled: false });

    test("catalog, every step and the authored conclusion remain navigable", async ({ page }) => {
      await page.goto(`${prefix}/learn`);
      await page.locator(`.learning-path-card a[href="${pathRoute}"]`).click();
      await expect(page.locator(".learning-step-list a")).toHaveCount(8);
      await page.locator(".learning-step-list a").first().click();
      for (const [index, step] of steps.entries()) {
        await expect(page).toHaveURL(lessonRoute(step));
        await expect(page.locator(".lesson-path-context")).toContainText(text.step(index + 1));
        const toggles = page.getByRole("button", { name: text.toggle });
        await expect(toggles).toHaveCount(2);
        for (const toggle of await toggles.all()) await expect(toggle).toBeDisabled();
        await page.getByRole("link", { name: index === 7 ? text.conclude : text.next }).click();
      }
      await expect(page).toHaveURL(`${pathRoute}/complete`);
      await expect(page.locator(".learning-recap li")).toHaveCount(8);
      await expect(page.locator(".learning-suggestion-grid a")).toHaveCount(4);
      await page.locator(".learning-suggestion-grid a").first().click();
      await expect(page).toHaveURL(`${prefix}/learn/from-grape-to-still-wine`);
      await expect(page.locator(".learning-step-list a")).toHaveCount(7);
    });
  });
}

test("vineyard path aliases, localized metadata and sitemap use canonical routes", async ({
  page,
  request,
}) => {
  for (const prefix of ["", "/en"]) {
    for (const suffix of ["", "/complete"]) {
      const response = await request.get(`${prefix}/learn/wijnstok-en-wijngaard${suffix}`, {
        maxRedirects: 0,
      });
      expect(response.status()).toBe(308);
      expect(response.headers().location).toBe(`${prefix}/learn/vine-and-vineyard${suffix}`);
    }
    await page.goto(`${prefix}/learn/vine-and-vineyard`);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      new RegExp(`${prefix}/learn/vine-and-vineyard$`),
    );
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
      "href",
      /\/en\/learn\/vine-and-vineyard$/,
    );
    await expect(page.locator('link[rel="alternate"][hreflang="nl"]')).toHaveAttribute(
      "href",
      /(?<!\/en)\/learn\/vine-and-vineyard$/,
    );
  }
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toMatch(/<loc>[^<]+\/learn\/vine-and-vineyard<\/loc>/);
  expect(sitemap).toMatch(/<loc>[^<]+\/en\/learn\/vine-and-vineyard<\/loc>/);
  expect(sitemap).not.toContain("wijnstok-en-wijngaard");
  expect(sitemap).not.toContain("/vine-and-vineyard/complete");
});

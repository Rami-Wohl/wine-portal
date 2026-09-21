import { expect, test } from "@playwright/test";

const grapes = [
  {
    slug: "carmenere",
    name: "Carménère",
    intermediateDetail: "rijpheid-en-stijl",
    advancedDetail: "oogstvenster",
  },
  {
    slug: "colombard",
    name: "Colombard",
    intermediateDetail: "twee-oogstdoelen",
    advancedDetail: null,
  },
  {
    slug: "ugni-blanc",
    name: "Ugni Blanc",
    intermediateDetail: "basiswijn-als-tussenstap",
    advancedDetail: null,
  },
  { slug: "merlot-blanc", name: "Merlot Blanc", intermediateDetail: null, advancedDetail: null },
];

for (const width of [390, 1440]) {
  test(`four final grape pages expose image and knowledge depth at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });

    for (const grape of grapes) {
      await page.goto(`/grapes/${grape.slug}`);
      await expect(page.getByRole("heading", { level: 1, name: grape.name })).toBeVisible();

      const control = page.getByRole("group", { name: "Kies hoeveel detail je wilt zien" });
      await control.getByRole("button", { name: "Basis", exact: true }).click();
      await expect(page.locator("#identiteit")).toBeVisible();
      await expect(page.locator("#groeicyclus")).toBeHidden();
      await expect(page.locator("#verwantschap")).toBeHidden();

      const photo = page.locator(".content-block-figure img").first();
      await photo.scrollIntoViewIfNeeded();
      await expect(photo).toBeVisible();
      await expect
        .poll(() => photo.evaluate((element) => (element as HTMLImageElement).naturalWidth))
        .toBeGreaterThan(0);

      await control.getByRole("button", { name: "Verdieping", exact: true }).click();
      await expect(page.locator("#groeicyclus")).toBeVisible();
      if (grape.intermediateDetail) {
        await expect(page.locator(`#${grape.intermediateDetail}`)).toBeVisible();
      }
      if (grape.slug === "merlot-blanc") {
        await expect(page.locator("#verwantschap")).toBeVisible();
        await expect(
          page.locator(
            '[data-depth-run="intermediate"]:has(#verwantschap) > .content-depth-marker',
          ),
        ).toHaveText("Verdieping");
      } else {
        await expect(page.locator("#verwantschap")).toBeHidden();
      }

      if (grape.slug === "merlot-blanc") {
        await expect(control.getByRole("button", { name: "Gevorderd", exact: true })).toHaveCount(
          0,
        );
      } else {
        await control.getByRole("button", { name: "Gevorderd", exact: true }).click();
        await expect(page.locator("#verwantschap")).toBeVisible();
        if (grape.advancedDetail) {
          await expect(page.locator(`#${grape.advancedDetail}`)).toBeVisible();
        }
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
    }
  });
}

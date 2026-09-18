import { expect, test } from "@playwright/test";

for (const width of [390, 1440]) {
  test(`Bordeaux grape completion exposes images and cumulative depth at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });

    for (const grape of [
      {
        slug: "petit-verdot",
        name: "Petit Verdot",
        foundationImages: 1,
        fullImages: 1,
        detail: "structuur-en-rijping",
      },
      {
        slug: "muscadelle",
        name: "Muscadelle",
        foundationImages: 1,
        fullImages: 2,
        detail: "zoet-is-niet-een-proces",
      },
      {
        slug: "malbec",
        name: "Malbec",
        foundationImages: 2,
        fullImages: 2,
        detail: "geschiedenis-en-verspreiding",
      },
      {
        slug: "sauvignon-gris",
        name: "Sauvignon Gris",
        foundationImages: 1,
        fullImages: 1,
        detail: "colchagua-als-voorbeeld",
      },
    ]) {
      await page.goto(`/grapes/${grape.slug}`);
      await expect(page.getByRole("heading", { level: 1, name: grape.name })).toBeVisible();

      const depthControl = page.getByRole("group", {
        name: "Kies hoeveel detail je wilt zien",
      });
      await depthControl.getByRole("button", { name: "Basis", exact: true }).click();
      await expect(page.locator("#identiteit")).toBeVisible();
      await expect(page.locator("#groeicyclus")).toBeHidden();
      await expect(page.locator("#verwantschap")).toBeHidden();
      await expect(page.locator(".content-block-figure:visible img")).toHaveCount(
        grape.foundationImages,
      );

      await depthControl.getByRole("button", { name: "Verdieping", exact: true }).click();
      await expect(page.locator("#groeicyclus")).toBeVisible();
      await expect(page.locator("#verwantschap")).toBeHidden();
      await expect(page.locator(`#${grape.detail}`)).toBeVisible();
      await expect(page.locator(`#${grape.detail}`).getByRole("heading")).toBeHidden();

      await depthControl.getByRole("button", { name: "Gevorderd", exact: true }).click();
      await expect(page.locator("#groeicyclus")).toBeVisible();
      await expect(page.locator("#verwantschap")).toBeVisible();
      await expect(page.locator("#verwantschap").getByRole("heading")).toBeVisible();
      await expect(page.locator(".content-block-figure:visible img")).toHaveCount(grape.fullImages);

      for (const image of await page.locator(".content-block-figure img").all()) {
        await image.scrollIntoViewIfNeeded();
        await expect(image).toHaveJSProperty("complete", true);
        await expect
          .poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth))
          .toBeGreaterThan(0);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
    }
  });
}

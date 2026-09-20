import { expect, test } from "@playwright/test";

const concepts = [
  {
    path: "/concepts/clairet",
    title: "Clairet",
    intermediate: "kleur-is-geen-recept",
    advanced: "regels-veranderen",
  },
  {
    path: "/concepts/claret",
    title: "Claret",
    intermediate: "stijl-en-techniek",
    advanced: "huidige-regels",
  },
  {
    path: "/concepts/druifluis-phylloxera",
    title: "Druifluis (phylloxera)",
    intermediate: "blad-en-wortelvormen",
    advanced: "resistentie-heeft-grenzen",
  },
  {
    path: "/concepts/onderstam",
    title: "Onderstam",
    intermediate: "eigen-wortels",
    advanced: "grenzen-van-oplossing",
  },
];

for (const width of [390, 1440]) {
  test(`Bordeaux foundations expose photography and progressive depth at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });

    for (const concept of concepts) {
      await page.goto(concept.path);
      await expect(page.getByRole("heading", { level: 1, name: concept.title })).toBeVisible();

      const depthControl = page.getByRole("group", {
        name: "Kies hoeveel detail je wilt zien",
      });
      const intermediate = page.locator(`#${concept.intermediate}`);
      const advanced = page.locator(`#${concept.advanced}`);

      await depthControl.getByRole("button", { name: "Basis", exact: true }).click();
      await expect(intermediate).toBeHidden();
      await expect(advanced).toBeHidden();

      const photo = page.locator(".content-block-figure img").first();
      await photo.scrollIntoViewIfNeeded();
      await expect(photo).toBeVisible();
      await expect
        .poll(() => photo.evaluate((element) => (element as HTMLImageElement).naturalWidth))
        .toBeGreaterThan(0);

      await depthControl.getByRole("button", { name: "Verdieping", exact: true }).click();
      await expect(intermediate).toBeVisible();
      await expect(advanced).toBeHidden();
      await depthControl.getByRole("button", { name: "Gevorderd", exact: true }).click();
      await expect(advanced).toBeVisible();
      await expect(advanced.locator("h3")).toBeHidden();

      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
    }
  });
}

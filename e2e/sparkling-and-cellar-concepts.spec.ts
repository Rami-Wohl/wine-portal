import { expect, test } from "@playwright/test";

const concepts = [
  {
    slug: "traditionele-methode",
    title: "Traditionele methode",
    intermediate: "gistcontact",
    advanced: "grenzen",
  },
  {
    slug: "tweede-vergisting",
    title: "Tweede vergisting",
    intermediate: "waar-gebeurt-het",
    advanced: "druk-en-stijl",
  },
  {
    slug: "liqueur-de-tirage",
    title: "Liqueur de tirage",
    intermediate: "samenstelling",
    advanced: "geen-recept",
  },
  {
    slug: "remuage",
    title: "Remuage",
    intermediate: "hand-en-machine",
    advanced: "uitzonderingen",
  },
  { slug: "degorgement", title: "Dégorgement", intermediate: "varianten", advanced: "zuurstof" },
  { slug: "dosage", title: "Dosage", intermediate: "smaakbalans", advanced: "etiket-en-grenzen" },
  { slug: "cuvee", title: "Cuvée", intermediate: "geen-garantie", advanced: "context" },
  { slug: "oxidation", title: "Oxidatie", intermediate: "kwetsbaarheid", advanced: "chemie" },
];

test("eight new concepts render images and cumulative knowledge depth", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const concept of concepts) {
    await page.goto(`/concepts/${concept.slug}`);
    await expect(page.getByRole("heading", { level: 1, name: concept.title })).toBeVisible();

    const depthControl = page.getByRole("group", { name: "Kies hoeveel detail je wilt zien" });
    const intermediate = page.locator(`#${concept.intermediate}`);
    const advanced = page.locator(`#${concept.advanced}`);

    await depthControl.getByRole("button", { name: "Basis", exact: true }).click();
    await expect(intermediate).toBeHidden();
    await expect(advanced).toBeHidden();

    const image = page.locator("figure img").first();
    await image.scrollIntoViewIfNeeded();
    await expect(image).toBeVisible();
    await expect
      .poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);

    await depthControl.getByRole("button", { name: "Verdieping", exact: true }).click();
    await expect(intermediate).toBeVisible();
    await expect(advanced).toBeHidden();

    await depthControl.getByRole("button", { name: "Gevorderd", exact: true }).click();
    await expect(intermediate).toBeVisible();
    await expect(advanced).toBeVisible();
    await expect(advanced.locator("h3")).toBeHidden();

    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      390,
    );
  }
});

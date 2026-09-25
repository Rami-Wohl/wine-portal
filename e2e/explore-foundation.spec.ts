import { expect, test } from "@playwright/test";

test("the flowering and fruit-set system publishes its visual, depth layers and satellites", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/concepts/bloei-vruchtzetting-en-opbrengstvorming");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Bloei, vruchtzetting en opbrengstvorming",
    }),
  ).toBeVisible();

  const figure = page.locator("#bloem-tot-vruchtzetting");
  await figure.scrollIntoViewIfNeeded();
  await expect(
    figure.getByRole("img", { name: /zeven nummers van gesloten wijnstokbloem/ }),
  ).toBeVisible();
  await expect(figure.locator("li")).toHaveCount(7);

  await expect(page.locator("#niet-iedere-bloem-wordt-een-bes")).toBeHidden();
  await expect(page.locator("#bestuiving-is-niet-hetzelfde-als-zetting")).toBeHidden();

  await page.getByRole("button", { name: "Verdieping" }).click();
  await expect(page.locator("#niet-iedere-bloem-wordt-een-bes")).toBeVisible();
  await expect(page.locator("#bestuiving-is-niet-hetzelfde-als-zetting")).toBeHidden();

  await page.getByRole("button", { name: "Gevorderd" }).click();
  await expect(page.locator("#bestuiving-is-niet-hetzelfde-als-zetting")).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);

  for (const satellite of [
    { path: "/concepts/coulure", title: "Coulure" },
    { path: "/concepts/millerandage", title: "Millerandage" },
  ]) {
    await page.goto(satellite.path);
    await expect(page.getByRole("heading", { level: 1, name: satellite.title })).toBeVisible();
    await expect(page.locator("figure img")).toHaveJSProperty("complete", true);
  }
});

test("the berry-development hub presents both teaching models and progressive depth", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/concepts/berry-development-veraison-ripeness");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Besontwikkeling, véraison en rijpheid",
    }),
  ).toBeVisible();

  const sequence = page.locator("#besontwikkeling-in-beeld");
  await sequence.scrollIntoViewIfNeeded();
  await expect(sequence.getByRole("img", { name: /zes genummerde stappen/ })).toBeVisible();
  await expect(sequence.locator("li")).toHaveCount(6);

  const ripenessModel = page.locator("#rijpheid-als-meervoudige-afweging");
  await expect(ripenessModel).toBeHidden();
  await page.getByRole("button", { name: "Verdieping" }).click();
  await ripenessModel.scrollIntoViewIfNeeded();
  await expect(ripenessModel).toBeVisible();
  await expect(
    ripenessModel.getByRole("img", { name: /zeven genummerde waarnemingen/ }),
  ).toBeVisible();
  await expect(ripenessModel.locator("li")).toHaveCount(7);
  await expect(page.locator("#water-en-groei-zijn-geen-eenvoudige-pomp")).toBeHidden();

  await page.getByRole("button", { name: "Gevorderd" }).click();
  await expect(page.locator("#water-en-groei-zijn-geen-eenvoudige-pomp")).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
});

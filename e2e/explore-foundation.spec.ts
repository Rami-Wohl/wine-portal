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

test("the climate and microclimate hub keeps its nested scales and evidence layers legible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/concepts/climate-weather-site-microclimate");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Klimaat, weer, standplaats en microklimaat",
    }),
  ).toBeVisible();

  const scaleFigure = page.locator("#omgeving-op-vier-schalen");
  await scaleFigure.scrollIntoViewIfNeeded();
  await expect(scaleFigure.getByRole("img", { name: /vier genummerde zoomniveaus/ })).toBeVisible();
  await expect(scaleFigure.locator("li")).toHaveCount(4);

  await expect(page.locator("#schaalnamen-zijn-gereedschap")).toBeHidden();
  await page.getByRole("button", { name: "Verdieping" }).click();
  await expect(page.locator("#schaalnamen-zijn-gereedschap")).toBeVisible();
  await expect(page.locator("#indices-vereenvoudigen")).toBeHidden();

  await page.getByRole("button", { name: "Gevorderd" }).click();
  await expect(page.locator("#indices-vereenvoudigen")).toBeVisible();
  await expect(page.locator("#weer-klimaat-en-attributie")).toBeVisible();

  const mobileDimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(mobileDimensions.documentWidth).toBeLessThanOrEqual(mobileDimensions.viewportWidth);

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.reload();
  await expect(scaleFigure).toBeVisible();
  const desktopDimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(desktopDimensions.documentWidth).toBeLessThanOrEqual(desktopDimensions.viewportWidth);
});

test("the vine water hub distinguishes its pathway, water states and progressive depth", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/concepts/vine-water-relations-drought-irrigation");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Waterrelaties, droogte en irrigatie bij de wijnstok",
    }),
  ).toBeVisible();

  const pathway = page.locator("#waterroute-in-beeld");
  await pathway.scrollIntoViewIfNeeded();
  await expect(
    pathway.getByRole("img", { name: /genummerde doorsnede volgt water/ }),
  ).toBeVisible();
  await expect(pathway.locator("li")).toHaveCount(6);

  const states = page.locator("#vier-waterstanden");
  await states.scrollIntoViewIfNeeded();
  await expect(states.getByRole("img", { name: /vier genummerde panelen/i })).toBeVisible();
  await expect(states.locator("li")).toHaveCount(4);

  await expect(page.locator("#matige-beperking-is-geen-recept")).toBeHidden();
  await page.getByRole("button", { name: "Verdieping" }).click();
  await expect(page.locator("#matige-beperking-is-geen-recept")).toBeVisible();
  await expect(page.locator("#hydraulische-grenzen")).toBeHidden();

  await page.getByRole("button", { name: "Gevorderd" }).click();
  await expect(page.locator("#hydraulische-grenzen")).toBeVisible();
  await expect(page.locator("#drempels-zijn-methodespecifiek")).toBeVisible();

  const mobileDimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(mobileDimensions.documentWidth).toBeLessThanOrEqual(mobileDimensions.viewportWidth);

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.reload();
  await expect(pathway).toBeVisible();
  const desktopDimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(desktopDimensions.documentWidth).toBeLessThanOrEqual(desktopDimensions.viewportWidth);
});

test("the vineyard-soils hub stays scannable and links its focused satellites", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/concepts/vineyard-soils");

  await expect(page.getByRole("heading", { level: 1, name: "Wijngaardbodems" })).toBeVisible();

  const profile = page.locator("#profiel-in-beeld");
  await profile.scrollIntoViewIfNeeded();
  await expect(profile.getByRole("img", { name: /genummerde doorsnede/i })).toBeVisible();
  await expect(profile.locator("li")).toHaveCount(8);

  const comparison = page.locator("#eigenschappen-vergelijken");
  await comparison.scrollIntoViewIfNeeded();
  await expect(
    comparison.getByRole("img", { name: /vier genummerde bodemdoorsneden/i }),
  ).toBeVisible();
  await expect(comparison.locator("li")).toHaveCount(4);

  const rockGallery = page.locator(".content-media-gallery");
  await rockGallery.scrollIntoViewIfNeeded();
  await expect(rockGallery.locator("figure")).toHaveCount(10);
  await expect(rockGallery.locator("img")).toHaveCount(10);
  for (const image of await rockGallery.locator("img").all()) {
    await expect(image).toHaveJSProperty("complete", true);
  }
  await expect(rockGallery.locator("figcaption").first()).toContainText("Basalt");
  await expect(rockGallery.locator("figcaption").last()).toContainText("Tufsteen");

  const directory = page.locator("#bodemtypen-van-a-tot-z");
  await directory.scrollIntoViewIfNeeded();
  await expect(directory.getByRole("heading", { level: 3 })).toHaveCount(18);
  await expect(directory.getByRole("link", { name: "kalkrijke wijngaardbodems" })).toBeVisible();
  await expect(
    directory.getByRole("link", { name: "vulkanische wijngaardbodems" }).first(),
  ).toBeVisible();

  await expect(page.locator("#water-in-porien")).toBeHidden();
  await page.getByRole("button", { name: "Verdieping" }).click();
  await expect(page.locator("#water-in-porien")).toBeVisible();
  await expect(page.locator("#levende-bodem")).toBeHidden();
  await page.getByRole("button", { name: "Gevorderd" }).click();
  await expect(page.locator("#levende-bodem")).toBeVisible();

  const mobileDimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(mobileDimensions.documentWidth).toBeLessThanOrEqual(mobileDimensions.viewportWidth);

  for (const satellite of [
    { path: "/concepts/calcareous-vineyard-soils", title: "Kalkrijke wijngaardbodems" },
    { path: "/concepts/volcanic-vineyard-soils", title: "Vulkanische wijngaardbodems" },
  ]) {
    await page.goto(satellite.path);
    await expect(page.getByRole("heading", { level: 1, name: satellite.title })).toBeVisible();
    await expect(page.locator("figure img")).toHaveJSProperty("complete", true);
  }
});

import { expect, test } from "@playwright/test";

test("Explore remains compact and delegates large categories to browse results", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/explore");

  const categories = page.locator(".category-card");
  await expect(categories).toHaveCount(8);
  for (let index = 0; index < (await categories.count()); index += 1) {
    expect(
      await categories.nth(index).locator(".category-preview .entity-link").count(),
    ).toBeLessThanOrEqual(5);
  }
  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);

  const concepts = categories.filter({ hasText: "Concepten" });
  const browseConcepts = concepts.locator(".category-browse-link");
  await expect(browseConcepts).toBeVisible();
  await browseConcepts.click();
  await expect(page).toHaveURL(/\/search\?type=concept/);
  await expect(page.getByRole("heading", { name: "Concepten" })).toBeVisible();
});

test("Pomerol collection profiles reveal together and producer routes target stable anchors", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/appellations/pomerol");

  const lePin = page.locator("#producent-le-pin");
  const gazin = page.locator("#producent-chateau-gazin");
  await expect(lePin).toBeHidden();
  await expect(gazin).toBeHidden();

  const depthControl = page.getByRole("group", {
    name: "Kies hoeveel detail je wilt zien",
  });
  await depthControl.getByRole("button", { name: "Verdieping" }).click();
  await expect(lePin).toBeVisible();
  await expect(gazin).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);

  await page.goto("/producers/le-pin");
  await expect(page).toHaveURL(/\/appellations\/pomerol#producent-le-pin$/);
  await expect(page.locator("#producent-le-pin")).toBeVisible();
});

test("Petrus presents documentary images and progressive producer knowledge", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/producers/petrus");

  await expect(page.getByRole("heading", { level: 1, name: "Petrus" })).toBeVisible();
  await expect(page.getByRole("img", { name: /Rijen wijnstokken van Petrus/ })).toBeVisible();

  const depthControl = page.getByRole("group", {
    name: "Kies hoeveel detail je wilt zien",
  });
  const intermediate = page.locator("#mensen-achter-de-naam");
  const advanced = page.locator("#marktstatus-zonder-rang");
  await expect(intermediate).toBeHidden();
  await expect(advanced).toBeHidden();

  await depthControl.getByRole("button", { name: "Verdieping" }).click();
  await expect(intermediate).toBeVisible();
  await expect(advanced).toBeHidden();
  await expect(page.getByRole("img", { name: /Fles Petrus 1973/ })).toBeVisible();

  await depthControl.getByRole("button", { name: "Gevorderd" }).click();
  await expect(advanced).toBeVisible();
});

test("draft narrative degrades honestly and keeps its knowledge context", async ({ page }) => {
  await page.goto("/verdiepingen/regional-deep-dives/bordeaux-pipeline-proef");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Bordeaux: verdieping in voorbereiding",
  );
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "Deze verdieping wordt zorgvuldig opgebouwd.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "Verbonden onderwerpen",
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Pauillac/ })).toBeVisible();
});

test("active entity content flows comfortably across desktop and mobile", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/regions/bordeaux");

  const desktopFlow = await page.evaluate(() => {
    const header = document.querySelector(".entity-header")?.getBoundingClientRect();
    const body = document.querySelector(".entity-body")?.getBoundingClientRect();
    return { headerHeight: header?.height ?? 0, bodyTop: body?.top ?? Infinity };
  });
  expect(desktopFlow.headerHeight).toBeLessThan(320);
  expect(desktopFlow.bodyTop).toBeLessThan(500);

  await page.setViewportSize({ width: 375, height: 812 });

  await expect(page.getByRole("heading", { level: 1, name: "Bordeaux" })).toBeVisible();
  const regionPhoto = page.getByRole("img", { name: /Panoramisch uitzicht over/ });
  await expect(regionPhoto).toBeVisible();
  await expect(regionPhoto).toHaveJSProperty("complete", true);
  await expect(page.getByText(/Varvac via Wikimedia Commons/)).toBeVisible();
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "Een streek gevormd door beweging",
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "cabernet sauvignon", exact: true })).toHaveAttribute(
    "href",
    "/grapes/cabernet-sauvignon",
  );
  const dimensions = await page.evaluate(() => {
    const header = document.querySelector(".entity-header")?.getBoundingClientRect();
    const figure = document.querySelector(".content-block-figure")?.getBoundingClientRect();
    return {
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
      headerHeight: header?.height ?? 0,
      figureTop: figure?.top ?? Infinity,
    };
  });
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
  expect(dimensions.headerHeight).toBeLessThan(260);
  expect(dimensions.figureTop).toBeLessThan(1000);
});

test("knowledge depth progressively reveals additional Bordeaux content", async ({ page }) => {
  await page.goto("/regions/bordeaux");

  const depthControl = page.getByRole("group", {
    name: "Kies hoeveel detail je wilt zien",
  });
  const intermediateHeading = page.getByRole("heading", {
    level: 3,
    name: "Samenstellen en opvoeden",
  });
  const advancedBlock = page.locator("#landschap-bodem-en-drainage");

  await expect(depthControl.getByRole("button", { name: "Basis" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(intermediateHeading).toBeHidden();
  await expect(advancedBlock).toBeHidden();

  await depthControl.getByRole("button", { name: "Verdieping" }).click();
  await expect(intermediateHeading).toBeVisible();
  await expect(advancedBlock).toBeHidden();

  await depthControl.getByRole("button", { name: "Gevorderd" }).click();
  await expect(intermediateHeading).toBeVisible();
  await expect(advancedBlock).toBeVisible();
  await expect(
    advancedBlock.getByRole("heading", {
      level: 3,
      name: "Grind, klei, kalk — en wat daartussen ligt",
    }),
  ).toBeVisible();

  await depthControl.getByRole("button", { name: "Basis" }).click();
  await expect(intermediateHeading).toBeHidden();
  await expect(advancedBlock).toBeHidden();
});

test("Médoc keeps its regional distinctions, imagery and depth layers usable on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/regions/medoc");

  await expect(page.getByRole("heading", { level: 1, name: "Médoc" })).toBeVisible();
  await expect(
    page.getByRole("img", { name: /Wijngaarden van Pauillac gezien vanaf de Gironde/ }),
  ).toHaveJSProperty("complete", true);
  await expect(
    page.getByRole("img", { name: /Vissershutten op palen langs het brede Gironde-estuarium/ }),
  ).toHaveJSProperty("complete", true);
  await expect(
    page.locator("#overzicht").getByRole("link", { name: "Moulis-en-Médoc", exact: true }),
  ).toHaveAttribute("href", "/appellations/moulis-en-medoc");

  const depthControl = page.getByRole("group", {
    name: "Kies hoeveel detail je wilt zien",
  });
  const intermediate = page.locator("#regio-aop-en-linkeroever");
  const advanced = page.locator("#wit-in-de-medoc");
  await expect(intermediate).toBeHidden();
  await expect(advanced).toBeHidden();

  await depthControl.getByRole("button", { name: "Verdieping" }).click();
  await expect(intermediate).toBeVisible();
  await expect(advanced).toBeHidden();

  await depthControl.getByRole("button", { name: "Gevorderd" }).click();
  await expect(intermediate).toBeVisible();
  await expect(advanced).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
});

test("Saint-Émilion classification reveals its current ranks progressively", async ({ page }) => {
  await page.goto("/classifications/classificatie-saint-emilion");

  await expect(
    page.getByRole("heading", { level: 1, name: "Classificatie van Saint-Émilion" }),
  ).toBeVisible();
  await expect(page.getByRole("img", { name: /Diagram van de classificatie/ })).toBeVisible();

  const depthControl = page.getByRole("group", {
    name: "Kies hoeveel detail je wilt zien",
  });
  const premiers = page.locator("#premiers-2022");
  const grands = page.locator("#grands-2022");

  await expect(premiers).toBeHidden();
  await expect(grands).toBeHidden();

  await depthControl.getByRole("button", { name: "Verdieping" }).click();
  await expect(premiers).toBeVisible();
  await expect(premiers.getByRole("link")).toHaveCount(14);
  await expect(grands).toBeHidden();

  await depthControl.getByRole("button", { name: "Gevorderd" }).click();
  await expect(grands).toBeVisible();
  await expect(grands.getByRole("link")).toHaveCount(71);
  await expect(premiers.getByRole("link", { name: "Château Figeac (A)" })).toHaveAttribute(
    "href",
    "/producers/chateau-figeac",
  );
});

test("Château Figeac presents both documentary images and layered producer knowledge", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/producers/chateau-figeac");

  await expect(page.getByRole("heading", { level: 1, name: "Château Figeac" })).toBeVisible();
  await expect(page.getByRole("img", { name: /lichte stenen gevel/ })).toBeVisible();
  await expect(page.getByRole("img", { name: /Fles Château Figeac 1995/ })).toBeVisible();

  const depthControl = page.getByRole("group", {
    name: "Kies hoeveel detail je wilt zien",
  });
  const secondWine = page.locator("#overige-wijnen");
  const advancedHistory = page.locator("#het-oude-figeac");

  await expect(secondWine).toBeHidden();
  await expect(advancedHistory).toBeHidden();

  await depthControl.getByRole("button", { name: "Verdieping" }).click();
  await expect(secondWine).toBeVisible();
  await expect(advancedHistory).toBeHidden();

  await depthControl.getByRole("button", { name: "Gevorderd" }).click();
  await expect(advancedHistory).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
});

test("Château Cheval Blanc separates its historic rank from current status", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/producers/chateau-cheval-blanc");

  await expect(page.getByRole("heading", { level: 1, name: "Château Cheval Blanc" })).toBeVisible();
  await expect(page.getByRole("img", { name: /lichte stenen gevel/ })).toBeVisible();
  const bottle = page.getByRole("img", { name: /Fles Château Cheval Blanc 1989/ });
  await bottle.scrollIntoViewIfNeeded();
  await expect(bottle).toBeVisible();
  await expect
    .poll(() => bottle.evaluate((image: HTMLImageElement) => image.naturalWidth))
    .toBeGreaterThan(0);
  await expect(page.getByText(/historisch A, momenteel ongeklasseerd/i)).toBeVisible();

  const depthControl = page.getByRole("group", {
    name: "Kies hoeveel detail je wilt zien",
  });
  const otherWines = page.locator("#overige-wijnen");
  const institutionalSignal = page.locator("#de-keuze-als-institutioneel-signaal");

  await expect(otherWines).toBeHidden();
  await expect(institutionalSignal).toBeHidden();

  await depthControl.getByRole("button", { name: "Verdieping" }).click();
  await expect(otherWines).toBeVisible();
  await expect(institutionalSignal).toBeHidden();

  await depthControl.getByRole("button", { name: "Gevorderd" }).click();
  await expect(institutionalSignal).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
});

test("new Saint-Émilion producer pages remain layered and readable on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  const producers = [
    {
      slug: "chateau-ausone",
      name: "Château Ausone",
      status: /historisch, niet actueel/i,
      advancedBlock: "#romeinse-verleiding",
    },
    {
      slug: "chateau-angelus",
      name: "Château Angélus",
      status: /A-rang is dus historisch/i,
      advancedBlock: "#ligging-is-geen-recept",
    },
    {
      slug: "chateau-canon",
      name: "Château Canon",
      status: /zonder onderscheiding A/i,
      advancedBlock: "#canon-als-plateaureferentie",
    },
  ];

  for (const producer of producers) {
    await page.goto(`/producers/${producer.slug}`);
    const heading = page.getByRole("heading", { level: 1, name: producer.name });
    await expect(heading).toBeVisible();
    await expect(page.getByText(producer.status).first()).toBeVisible();
    await expect(page.locator("article img").first()).toHaveJSProperty("complete", true);

    const layout = await page.evaluate(() => {
      const eyebrow = document.querySelector<HTMLElement>(".entity-header .eyebrow");
      const heading = document.querySelector<HTMLElement>(".entity-header h1");
      return {
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth,
        eyebrowBottom: eyebrow?.getBoundingClientRect().bottom ?? 0,
        headingTop: heading?.getBoundingClientRect().top ?? 0,
      };
    });
    expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth);
    expect(layout.headingTop).toBeGreaterThanOrEqual(layout.eyebrowBottom);

    const depthControl = page.getByRole("group", {
      name: "Kies hoeveel detail je wilt zien",
    });
    await depthControl.getByRole("button", { name: "Gevorderd" }).click();
    await expect(page.locator(producer.advancedBlock)).toBeVisible();
  }
});

test("Château Pavie presents its vineyard, historic bottle and layered producer knowledge", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/producers/chateau-pavie");

  await expect(page.getByRole("heading", { level: 1, name: "Château Pavie" })).toBeVisible();
  await expect(
    page.getByRole("img", { name: /Rijen wijnstokken van Château Pavie/ }),
  ).toBeVisible();
  await expect(page.getByRole("img", { name: /Fles Château Pavie 1990/ })).toBeVisible();

  const depthControl = page.getByRole("group", {
    name: "Kies hoeveel detail je wilt zien",
  });
  const secondWine = page.locator("#overige-wijnen");
  const estateExpansion = page.locator("#een-groeiend-domein");

  await expect(secondWine).toBeHidden();
  await expect(estateExpansion).toBeHidden();

  await depthControl.getByRole("button", { name: "Verdieping" }).click();
  await expect(secondWine).toBeVisible();
  await expect(estateExpansion).toBeHidden();

  await depthControl.getByRole("button", { name: "Gevorderd" }).click();
  await expect(estateExpansion).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
});

test("entity relationships are grouped by their meaning", async ({ page }) => {
  await page.goto("/appellations/pauillac");

  const panel = page.getByRole("region", { name: "Ga verder vanuit Pauillac" });
  await expect(panel.getByRole("heading", { level: 3, name: "Onderdeel van" })).toBeVisible();
  await expect(panel.getByRole("heading", { level: 3, name: "Belangrijke druif" })).toBeVisible();
  await expect(panel.getByRole("heading", { level: 3, name: "Hier gevestigd" })).toBeVisible();
  await expect(panel.getByText("Belangrijke druif", { exact: true })).toHaveCount(1);

  await page.goto("/regions/bordeaux");
  const bordeauxPanel = page.getByRole("region", { name: "Ga verder vanuit Bordeaux" });
  await expect(bordeauxPanel.getByRole("heading", { level: 3, name: "Bevat" })).toBeVisible();
  await expect(
    bordeauxPanel.getByRole("heading", { level: 3, name: "Belangrijke druif" }),
  ).toBeVisible();
  await expect(bordeauxPanel.getByRole("link", { name: "Médoc Regio" })).toBeVisible();
  await expect(bordeauxPanel.getByRole("link", { name: "Sémillon Druif" })).toBeVisible();
});

test("Pauillac media and appellation details follow the knowledge-depth contract", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/appellations/pauillac");

  await expect(page.getByRole("heading", { level: 1, name: "Pauillac" })).toBeVisible();
  await expect(page.getByRole("img", { name: /Wijngaarden van Pauillac/ })).toBeVisible();

  const depthControl = page.getByRole("group", {
    name: "Kies hoeveel detail je wilt zien",
  });
  const intermediateBlock = page.locator("#wettelijke-grens");
  const advancedBlock = page.locator("#drie-landschappen");

  await expect(depthControl.getByRole("button", { name: "Basis" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(intermediateBlock).toBeHidden();
  await expect(advancedBlock).toBeHidden();

  await depthControl.getByRole("button", { name: "Verdieping" }).click();
  await expect(intermediateBlock).toBeVisible();
  await expect(advancedBlock).toBeHidden();

  await depthControl.getByRole("button", { name: "Gevorderd" }).click();
  await expect(advancedBlock).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
});

test("Libournais orients the region with contrasting landscapes and progressive depth", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/regions/libournais");

  await expect(page.getByRole("heading", { level: 1, name: "Libournais" })).toBeVisible();
  await expect(
    page.getByRole("img", { name: /Panoramisch uitzicht over de kalkstenen daken/ }),
  ).toBeVisible();
  await expect(page.getByRole("img", { name: /Lage rijen wijnstokken in Pomerol/ })).toBeVisible();

  const depthControl = page.getByRole("group", {
    name: "Kies hoeveel detail je wilt zien",
  });
  const intermediateBlock = page.locator("#libournais-geen-aop");
  const advancedBlock = page.locator("#rechteroever-als-verkorting");

  await expect(intermediateBlock).toBeHidden();
  await expect(advancedBlock).toBeHidden();

  await depthControl.getByRole("button", { name: "Verdieping" }).click();
  await expect(intermediateBlock).toBeVisible();
  await expect(advancedBlock).toBeHidden();

  await depthControl.getByRole("button", { name: "Gevorderd" }).click();
  await expect(advancedBlock).toBeVisible();
  await expect(page.getByRole("link", { name: "Saint-Émilion" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Pomerol" }).first()).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
});

test("a deep block anchor reveals the required knowledge depth", async ({ page }) => {
  await page.goto("/regions/bordeaux#landschap-bodem-en-drainage");

  await expect(page.locator("#landschap-bodem-en-drainage")).toBeVisible();
  await expect(page.getByRole("button", { name: "Gevorderd" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("the chosen knowledge depth persists across navigation and refresh", async ({ page }) => {
  await page.goto("/regions/bordeaux");
  await page.getByRole("button", { name: "Verdieping" }).click();

  await page.goto("/appellations/pauillac");
  await expect(page.getByRole("button", { name: "Verdieping" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await page.reload();
  await expect(page.getByRole("button", { name: "Verdieping" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("the full document remains readable without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/regions/bordeaux");

  await expect(page.locator("#landschap-bodem-en-drainage")).toBeVisible();
  await expect(page.getByRole("group", { name: "Kies hoeveel detail je wilt zien" })).toBeHidden();

  await context.close();
});

import { expect, test } from "@playwright/test";

const lesson = "/verdiepingen/lessons/three-routes-for-still-wine?path=from-grape-to-still-wine";

for (const locale of ["nl", "en"]) {
  for (const width of [320, 375, 620, 768, 860, 861, 1024, 1280, 1440]) {
    test(`${locale} language dropdown fits at ${width}px`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${locale === "en" ? "/en" : ""}${lesson}`);
      const trigger = page.getByRole("banner").getByLabel(/Taal kiezen|Choose language/);
      const header = page.locator(".site-header");
      await expect(trigger).toBeVisible();
      const triggerBox = (await trigger.boundingBox())!;
      expect(triggerBox.width).toBeGreaterThanOrEqual(44);
      expect(triggerBox.height).toBeGreaterThanOrEqual(44);
      expect((await header.boundingBox())!.height).toBeLessThanOrEqual(76);
      const brandBox = (await header.locator(".brand").boundingBox())!;
      const actionsBox = (await header.locator(".site-actions").boundingBox())!;
      expect(brandBox.x + brandBox.width).toBeLessThanOrEqual(actionsBox.x);
      expect(actionsBox.x + actionsBox.width).toBeLessThanOrEqual(width);
      if (width > 860) {
        const utilityBox = (await header.locator(".utility-nav").boundingBox())!;
        expect(utilityBox.x + utilityBox.width).toBeLessThanOrEqual(triggerBox.x);
        expect(Math.abs(utilityBox.y - triggerBox.y)).toBeLessThan(2);
        const mainBox = (await header.locator(".site-nav").boundingBox())!;
        expect(brandBox.x + brandBox.width).toBeLessThanOrEqual(mainBox.x);
        expect(mainBox.x + mainBox.width).toBeLessThanOrEqual(actionsBox.x);
      }
      await trigger.click();
      const panel = page.locator(".site-header .language-options");
      await expect(panel).toBeVisible();
      const panelBox = (await panel.boundingBox())!;
      expect(panelBox.x).toBeGreaterThanOrEqual(0);
      expect(panelBox.x + panelBox.width).toBeLessThanOrEqual(width);
      expect(panelBox.y).toBeGreaterThan(triggerBox.y + triggerBox.height);
      for (const name of ["Nederlands", "English"]) {
        const link = page.getByRole("link", { name, exact: true });
        await expect(link).toBeVisible();
        expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      }
      await expect(panel.locator('[aria-current="true"]')).toHaveText(
        locale === "nl" ? /Nederlands/ : /English/,
      );
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      if ([320, 375, 861, 1440].includes(width)) {
        await page.screenshot({ path: testInfo.outputPath(`language-${locale}-${width}.png`) });
      }
    });
  }
}

test("language disclosure supports keyboard, Escape, outside clicks and focus departure", async ({
  page,
}) => {
  await page.goto("/concepts/winemaking-routes");
  const trigger = page.getByRole("banner").getByLabel(/Taal kiezen/);
  const disclosure = page.locator(".site-header .language-switcher");
  const accessibility = await page.context().newCDPSession(page);
  const expandedState = async () => {
    const { nodes } = await accessibility.send("Accessibility.getFullAXTree");
    const control = nodes.find(
      (node) => node.name?.value === "Taal kiezen, huidige taal: Nederlands",
    );
    return control?.properties?.find((property) => property.name === "expanded")?.value.value;
  };
  expect(await expandedState()).toBe(false);
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(disclosure).toHaveAttribute("open", "");
  expect(await expandedState()).toBe(true);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Nederlands", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "English", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(disclosure).not.toHaveAttribute("open");
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Space");
  await expect(disclosure).toHaveAttribute("open", "");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(disclosure).not.toHaveAttribute("open");
  await trigger.click();
  await page.getByRole("heading", { level: 1 }).click();
  await expect(disclosure).not.toHaveAttribute("open");
  await trigger.click();
  await page.getByRole("link", { name: "English", exact: true }).click();
  await expect(page).toHaveURL("/en/concepts/winemaking-routes");
  await expect(disclosure).not.toHaveAttribute("open");
  await expect(
    page.getByRole("banner").getByLabel("Choose language, current language: English"),
  ).toBeVisible();
  await expect(disclosure.locator("summary .language-flag")).toHaveText("🇬🇧");
});

test("mobile language disclosure closes before the navigation dialog opens", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`/en${lesson}`);
  await page
    .getByRole("banner")
    .getByLabel(/Choose language/)
    .click();
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await expect(page.locator(".site-header .language-switcher")).not.toHaveAttribute("open");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page
    .getByRole("banner")
    .getByLabel(/Choose language/)
    .click();
  await expect(page.getByRole("link", { name: "Nederlands", exact: true })).toBeVisible();
});

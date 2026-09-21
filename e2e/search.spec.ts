import { expect, test } from "@playwright/test";

test("search ranks entities and links article matches to their depth-aware block", async ({
  page,
}) => {
  await page.goto("/search?q=Cabernet+Sauvignon");

  const exactEntity = page.locator(".search-result-card").first();
  await expect(exactEntity.getByRole("heading", { name: "Cabernet Sauvignon" })).toBeVisible();
  await expect(exactEntity).toHaveAttribute("href", "/grapes/cabernet-sauvignon");

  await page.goto("/search?q=absolute+immuniteit");
  const contentResult = page.getByRole("link", { name: /Druifluis \(phylloxera\)/ });
  await expect(contentResult).toContainText("Gevorderd");
  await expect(contentResult).toContainText("Gevonden in Resistentie is geen absolute immuniteit");
  await expect(contentResult).toHaveAttribute(
    "href",
    "/concepts/phylloxera#resistentie-heeft-grenzen",
  );

  await contentResult.click();
  await expect(page).toHaveURL(/\/concepts\/phylloxera#resistentie-heeft-grenzen$/);
  await expect(page.locator("#resistentie-heeft-grenzen")).toBeVisible();
});

test("search includes captions used by published pages", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/search?q=Pennsylvania");

  const captionResult = page.getByRole("link", { name: /Druifluis \(phylloxera\)/ });
  await expect(captionResult).toContainText("Gevonden in een beeldbijschrift");
  await expect(captionResult).toContainText("Pennsylvania");
  await expect(captionResult).toHaveAttribute("href", "/concepts/phylloxera#bladgallen");
  await expect(page.locator("body")).not.toHaveCSS("overflow-x", "scroll");
});

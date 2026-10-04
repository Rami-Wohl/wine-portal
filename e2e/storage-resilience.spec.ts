import { expect, test } from "@playwright/test";

const pathId = "learning-path.from-grape-to-still-wine";
const progressKey = `oenocademy:learning-progress:v1:${encodeURIComponent(pathId)}`;
const lessonUrl = "/verdiepingen/lessons/grape-as-raw-material?path=from-grape-to-still-wine";

for (const operation of ["save", "reset"] as const) {
  test(`progress survives a failed ${operation} while old storage remains readable`, async ({
    page,
  }) => {
    await page.addInitScript(
      ({ key, id, operation }) => {
        localStorage.setItem(
          key,
          JSON.stringify({
            schema_version: 1,
            path_id: id,
            completed_step_ids: operation === "reset" ? ["grape-as-raw-material"] : [],
            updated_at: "2026-10-03T12:00:00.000Z",
          }),
        );
        if (operation === "save") {
          const original = Storage.prototype.setItem;
          Storage.prototype.setItem = function (storageKey: string, value: string) {
            if (storageKey === key) throw new Error("Storage mutation unavailable");
            return original.call(this, storageKey, value);
          };
        } else {
          const original = Storage.prototype.removeItem;
          Storage.prototype.removeItem = function (storageKey: string) {
            if (storageKey === key) throw new Error("Storage mutation unavailable");
            return original.call(this, storageKey);
          };
        }
      },
      { key: progressKey, id: pathId, operation },
    );

    if (operation === "save") {
      await page.goto(lessonUrl);
      await page
        .getByRole("button", { name: /Markeer als voltooid/ })
        .first()
        .click();
      await expect(page.getByRole("button", { name: /Les voltooid/ })).toHaveCount(2);
      await page
        .getByRole("region", { name: "Positie binnen het leerpad" })
        .getByRole("link", { name: "Van druif naar stille wijn — hoe wijn wordt gemaakt" })
        .click();
      await expect(page.getByRole("progressbar", { name: "1 van 7 voltooid" })).toBeVisible();
    } else {
      await page.goto("/learn/from-grape-to-still-wine");
      await expect(page.getByRole("progressbar", { name: "1 van 7 voltooid" })).toBeVisible();
      await page.getByRole("button", { name: "Wis voortgang" }).click();
      await page.getByRole("button", { name: "Ja, wis voortgang" }).click();
      await expect(page.getByRole("progressbar", { name: "0 van 7 voltooid" })).toBeVisible();
    }

    await expect(page.getByText(/Opslaan in deze browser is niet beschikbaar/)).toBeVisible();
    const stored = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!),
      progressKey,
    );
    expect(stored.completed_step_ids).toEqual(
      operation === "reset" ? ["grape-as-raw-material"] : [],
    );

    if (operation === "reset") {
      await page.getByRole("link", { name: "Start het leerpad" }).click();
      await expect(page.getByRole("button", { name: /Markeer als voltooid/ })).toHaveCount(2);
    }
  });
}

test("knowledge depth uses the latest choice when writes fail but reads succeed", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const key = "oenocademy:knowledge-depth";
    localStorage.setItem(key, "foundation");
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (storageKey: string, value: string) {
      if (storageKey === key) throw new Error("Storage full");
      return original.call(this, storageKey, value);
    };
  });
  await page.goto("/concepts/alcoholic-fermentation");
  const selector = page.getByRole("group", { name: "Kies hoeveel detail je wilt zien" });
  await selector.getByRole("button", { name: "Gevorderd", exact: true }).click();
  await expect(selector.getByRole("button", { name: "Gevorderd", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator("#spontaan-is-geen-herkomstbewijs")).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("oenocademy:knowledge-depth"))).toBe(
    "foundation",
  );
  await selector.getByRole("button", { name: "Basis", exact: true }).click();
  await expect(page.locator("#spontaan-is-geen-herkomstbewijs")).toBeHidden();
});

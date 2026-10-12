import { expect, test } from "@playwright/test";
import { KINDS, kinds, states, type Locale } from "./copy";

const sample = "This is deliberately synthetic sample text for reviewing the feedback form.";
for (const locale of ["nl", "en"] as const) {
  const root = locale === "nl" ? "/" : "/en";
  for (const kind of KINDS) {
    test(`${locale}: ${kind} can be submitted without leaking input into the URL`, async ({
      page,
    }) => {
      await page.goto(root);
      await page.getByRole("button", { name: kinds[kind][locale].title }).click();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(kinds[kind][locale].title);
      await page.locator("#body").fill(sample);
      if (kind === "factual")
        await page.locator("#source").fill("Synthetic book reference, sample author, page 12");
      await page
        .getByRole("button", { name: locale === "nl" ? "Melding sturen" : "Send report" })
        .click();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(states.received[locale][0]);
      expect(page.url()).not.toContain("synthetic");
      expect(page.url()).not.toContain("body=");
    });
  }
  test(`${locale}: source errors preserve input and language/type changes keep the draft`, async ({
    page,
  }) => {
    await page.goto(`${root}?kind=factual`);
    await page.locator("#body").fill(sample);
    await page
      .getByRole("button", { name: locale === "nl" ? "Melding sturen" : "Send report" })
      .click();
    await expect(page.locator("#source")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#body")).toHaveValue(sample);
    await expect(page.locator("#source-error")).toBeVisible();
    const other: Locale = locale === "nl" ? "en" : "nl";
    await page
      .getByRole("button", { name: other === "en" ? "English" : "Nederlands", exact: true })
      .click();
    await expect(page.locator("html")).toHaveAttribute("lang", other);
    await expect(page.locator("#body")).toHaveValue(sample);
    await page
      .getByRole("button", {
        name: other === "en" ? "Choose a different type" : "Andere soort kiezen",
      })
      .click();
    await page.getByRole("button", { name: kinds.explanation[other].title }).click();
    await expect(page.locator("#body")).toHaveValue(sample);
  });
  test(`${locale}: reply and outcome states are accessible and fit narrow layouts`, async ({
    page,
  }) => {
    for (const [screen, copy] of Object.entries(states)) {
      await page.goto(`${root}?screen=${screen}`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(copy[locale][0]);
      expect(
        await page
          .locator("body")
          .evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true);
    }
    await page.goto(`${root}?screen=needs_info`);
    await page.locator("#body").fill(sample);
    await page.getByRole("button", { name: states.needs_info[locale][2] }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(states.replied[locale][0]);
  });
}

test("section, page and general entries keep distinct human-readable context", async ({ page }) => {
  for (const [label, expected] of [
    ["Klopt dit niet?", "Een voorbeeldsectie"],
    ["Iets over deze pagina melden", "De pagina als geheel"],
    ["Een idee voor Oenocademy delen", "Een idee voor het platform"],
  ]) {
    await page.goto("/?screen=article");
    await page.locator(".sample-block").focus();
    await page.getByRole("link", { name: label, exact: false }).click();
    await expect(page.getByRole("complementary")).toContainText(expected);
  }
});

test("keyboard reaches the form and error links; text never becomes executable markup", async ({
  page,
}) => {
  await page.goto("/?kind=factual");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Ga naar de inhoud" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#heading")).toBeFocused();
  await page
    .locator("#body")
    .fill("<script>window.bad = true</script> Synthetic input, not a factual claim.");
  await page.getByRole("button", { name: "Melding sturen" }).click();
  await expect(page.locator("#body")).toHaveValue(/<script>/);
  await expect(page.locator("script")).toHaveCount(0);
  await page.locator('.error-summary a[href="#source"]').click();
  await expect(page.locator("#source")).toBeFocused();
});

test("server enforces caps and rejects cross-origin POSTs", async ({ request }) => {
  const headers = { Origin: "http://127.0.0.1:3103" };
  const links = await request.post("/?kind=broken", {
    headers,
    form: { body: `${sample} ${"https://example.test ".repeat(6)}` },
  });
  expect(links.status()).toBe(422);
  expect(await links.text()).toContain("maximaal vijf links");
  const size = await request.post("/?kind=broken", { headers, form: { body: "x".repeat(20_000) } });
  expect(size.status()).toBe(413);
  const origin = await request.post("/?kind=broken", {
    headers: { Origin: "https://example.test" },
    form: { body: sample },
  });
  expect(origin.status()).toBe(403);
});

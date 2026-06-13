import { expect, test } from "@playwright/test";
import { optionalEnv } from "./helpers/env";

const storeSlug = optionalEnv("E2E_TEST_STORE_SLUG");

const publicPages = [
  { name: "homepage", path: "/" },
  { name: "pricing", path: "/pricing" },
  { name: "request", path: "/request?plan=medium" },
] as const;

for (const { name, path } of publicPages) {
  test.describe(`Accessibility & UI — ${name}`, () => {
    test("main CTAs and accessibility widget are visible", async ({ page }) => {
      await page.goto(path);

      await expect(page.locator('a[href="/pricing"]').first()).toBeVisible();

      const a11yButton = page.getByRole("button", {
        name: /accessibility|נגישות|إمكانية الوصول/i,
      });
      await expect(a11yButton).toBeVisible();
      await a11yButton.click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toBeHidden();
    });

    test("keyboard can reach primary CTA", async ({ page }) => {
      await page.goto(path);
      await page.keyboard.press("Tab");
      const focused = page.locator(":focus");
      await expect(focused).toBeVisible();
    });
  });
}

test.describe("Accessibility & UI — public menu", () => {
  test.skip(!storeSlug, "Set E2E_TEST_STORE_SLUG for menu accessibility checks");

  test("menu page has accessibility widget on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/${storeSlug}/menu`);

    const a11yButton = page.getByRole("button", {
      name: /accessibility|נגישות|إمكانية الوصول/i,
    });
    await expect(a11yButton).toBeVisible();
  });
});

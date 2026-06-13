import { expect, test } from "@playwright/test";
import { optionalEnv } from "./helpers/env";

const storeSlug = optionalEnv("E2E_TEST_STORE_SLUG");

test.describe("Customer menu flow", () => {
  test.skip(!storeSlug, "Set E2E_TEST_STORE_SLUG to a dedicated test store slug");

  test("menu loads, language switch, contact buttons, offers", async ({
    page,
  }) => {
    await page.goto(`/${storeSlug}/menu`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const localeBar = page.getByRole("group").filter({ has: page.getByRole("button") });
    await expect(localeBar).toBeVisible();

    for (const lang of ["العربية", "English", "עברית"] as const) {
      await page.getByRole("button", { name: lang }).click();
      await page.waitForLoadState("networkidle");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }

    const whatsapp = page.getByRole("link").filter({ hasText: /whatsapp|واتساب|וואטסאפ/i });
    const phone = page.locator('a[href^="tel:"]');

    const hasWhatsApp = (await whatsapp.count()) > 0;
    const hasPhone = (await phone.count()) > 0;
    expect(hasWhatsApp || hasPhone).toBeTruthy();

    const offersHeading = page.getByRole("heading", {
      name: /عروض|מבצעים|offers/i,
    });
    if ((await offersHeading.count()) > 0) {
      await expect(offersHeading.first()).toBeVisible();
    }
  });

  test("menu works on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/${storeSlug}/menu`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("group").first()).toBeVisible();
  });
});

import { expect, test } from "@playwright/test";
import { uniqueTestEmail } from "./helpers/env";

test.describe("Public website flow", () => {
  test("homepage → pricing → request form → success", async ({ page }) => {
    const testEmail = uniqueTestEmail("signup");

    await page.goto("/");
    await expect(page).toHaveURL("/");

    await page.locator('a[href="/pricing"]').first().click();
    await expect(page).toHaveURL("/pricing");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await page.locator('a[href="/request?plan=medium"]').click();
    await expect(page).toHaveURL(/\/request\?plan=medium/);

    await page.getByLabel("الاسم الكامل").fill("E2E Test User");
    await page.getByLabel("اسم المطعم").fill("E2E Test Restaurant");
    await page.getByLabel("البريد الإلكتروني").fill(testEmail);
    await page.getByLabel("واتساب").fill("+972501234567");
    await page.getByRole("button", { name: "إرسال الطلب" }).click();

    await expect(page.getByTestId("signup-success")).toBeVisible();
    await expect(page.getByRole("heading", { name: "تم استلام طلبك!" })).toBeVisible();

    process.env.E2E_LAST_SIGNUP_EMAIL = testEmail;
  });
});

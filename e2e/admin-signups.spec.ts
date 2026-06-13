import { expect, test } from "@playwright/test";
import { loginWithCredentials } from "./helpers/auth";
import {
  isTruthyEnv,
  optionalEnv,
  requireEnv,
  uniqueTestEmail,
} from "./helpers/env";

const runApproveFlow = isTruthyEnv("E2E_ALLOW_SIGNUP_APPROVE");

test.describe("Admin signups flow", () => {
  test.beforeEach(async ({ page }) => {
    const email = requireEnv("E2E_ADMIN_EMAIL");
    const password = requireEnv("E2E_ADMIN_PASSWORD");
    await loginWithCredentials(page, email, password);
    await page.goto("/admin/signups?status=pending");
  });

  test("pending signups page loads", async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/signups/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: "قيد الانتظار" })).toBeVisible();
  });

  test("approve flow with test signup only", async ({ page }) => {
    test.skip(!runApproveFlow, "Set E2E_ALLOW_SIGNUP_APPROVE=true to run approve flow");

    const targetEmail =
      optionalEnv("E2E_APPROVE_SIGNUP_EMAIL") ?? uniqueTestEmail("approve");

    if (!optionalEnv("E2E_APPROVE_SIGNUP_EMAIL")) {
      await page.goto("/request?plan=basic");
      await page.getByLabel("الاسم الكامل").fill("E2E Approve User");
      await page.getByLabel("اسم المطعم").fill("E2E Approve Restaurant");
      await page.getByLabel("البريد الإلكتروني").fill(targetEmail);
      await page.getByLabel("واتساب").fill("+972509999999");
      await page.getByRole("button", { name: "إرسال الطلب" }).click();
      await expect(page.getByTestId("signup-success")).toBeVisible();

      const email = requireEnv("E2E_ADMIN_EMAIL");
      const password = requireEnv("E2E_ADMIN_PASSWORD");
      await loginWithCredentials(page, email, password);
      await page.goto("/admin/signups?status=pending");
    }

    const row = page.locator("tbody tr").filter({ hasText: targetEmail });
    await expect(row).toBeVisible();

    page.once("dialog", (dialog) => dialog.accept());
    await row.getByRole("button", { name: "✓ موافقة" }).click();

    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("heading", { name: /تم إنشاء الحساب بنجاح/ })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "نسخ كل المعلومات" })
    ).toBeVisible();
  });
});

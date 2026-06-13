import { expect, test } from "@playwright/test";
import { loginWithCredentials } from "./helpers/auth";
import { optionalEnv, requireEnv, uniqueTestSlug } from "./helpers/env";

const hasOwnerCredentials = Boolean(
  process.env.E2E_OWNER_EMAIL?.trim() && process.env.E2E_OWNER_PASSWORD?.trim()
);

test.describe("Owner dashboard flow", () => {
  test.skip(!hasOwnerCredentials, "Set E2E_OWNER_EMAIL and E2E_OWNER_PASSWORD");

  test("dashboard, CRUD category/item, edit price", async ({ page }) => {
    const email = requireEnv("E2E_OWNER_EMAIL");
    const password = requireEnv("E2E_OWNER_PASSWORD");
    const storeSlug = optionalEnv("E2E_TEST_STORE_SLUG");

    const categoryName = `E2E Category ${Date.now()}`;
    const categorySlug = uniqueTestSlug("e2e-cat");
    const itemName = `E2E Item ${Date.now()}`;
    const itemSlug = uniqueTestSlug("e2e-item");
    const initialPrice = "42";
    const updatedPrice = "55";

    await loginWithCredentials(page, email, password);
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/dashboard");
    await expect(page.getByRole("navigation").first()).toBeVisible();

    await page.goto("/dashboard/categories");
    await expect(page).toHaveURL(/\/dashboard\/categories/);

    await page.goto("/dashboard/menu-items");
    await expect(page).toHaveURL(/\/dashboard\/menu-items/);

    await page.goto("/dashboard/categories/new");
    const categoryForm = page.locator("form").first();
    await categoryForm.locator('input[type="text"]').nth(0).fill(categoryName);
    await categoryForm.locator('input[type="text"]').nth(1).fill(categorySlug);
    await categoryForm.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/dashboard\/categories/);

    await page.goto("/dashboard/menu-items/new");
    const itemForm = page.locator("form").first();
    await itemForm.locator('input[type="text"]').nth(0).fill(itemName);
    await itemForm.locator('input[type="text"]').nth(1).fill(itemSlug);
    await itemForm.locator('input[type="number"]').first().fill(initialPrice);
    await itemForm.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/dashboard\/menu-items/);
    await expect(page.getByText(itemName)).toBeVisible();

    await page
      .locator("li")
      .filter({ hasText: itemName })
      .getByRole("link", { name: /edit|تعديل|עריכה/i })
      .click();
    await expect(page).toHaveURL(/\/dashboard\/menu-items\/.+\/edit/);

    const editForm = page.locator("form").first();
    const priceInput = editForm.locator('input[type="number"]').first();
    await priceInput.fill(updatedPrice);
    await editForm.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/dashboard\/menu-items/);

    if (storeSlug) {
      await page.goto(`/${storeSlug}/menu`);
      await expect(page.getByText(itemName)).toBeVisible();
      await expect(page.getByText(updatedPrice)).toBeVisible();
    }
  });
});

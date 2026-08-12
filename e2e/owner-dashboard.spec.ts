import { expect, test } from "@playwright/test";
import { loginWithCredentials } from "./helpers/auth";
import { optionalEnv, requireEnv } from "./helpers/env";

const hasOwnerCredentials = Boolean(
  process.env.E2E_OWNER_EMAIL?.trim() && process.env.E2E_OWNER_PASSWORD?.trim()
);

function expectedSlugFromName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

test.describe("Owner dashboard flow", () => {
  test.skip(!hasOwnerCredentials, "Set E2E_OWNER_EMAIL and E2E_OWNER_PASSWORD");

  test("dashboard, CRUD category/item, edit price", async ({ page }) => {
    const email = requireEnv("E2E_OWNER_EMAIL");
    const password = requireEnv("E2E_OWNER_PASSWORD");
    const storeSlug = optionalEnv("E2E_TEST_STORE_SLUG");

    const categoryName = `E2E Category ${Date.now()}`;
    const itemName = `E2E Item ${Date.now()}`;
    const duplicateItemName = `E2E Dup ${Date.now()}`;
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
    await categoryForm.getByRole("textbox").nth(0).fill(categoryName);
    const categoryCreateResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/menu-categories") &&
        response.request().method() === "POST"
    );
    await categoryForm.locator('button[type="submit"]').click();
    const categoryCreateResponse = await categoryCreateResponsePromise;
    expect(categoryCreateResponse.ok()).toBeTruthy();
    const categoryBody = (await categoryCreateResponse.json()) as {
      category?: { slug?: string };
    };
    expect(categoryBody.category?.slug).toBe(expectedSlugFromName(categoryName));
    await expect(page).toHaveURL(/\/dashboard\/categories/);

    await page.goto("/dashboard/menu-items/new");
    const itemForm = page.locator("form").first();
    await itemForm.getByRole("textbox").nth(0).fill(itemName);
    await itemForm.locator('input[type="number"]').first().fill(initialPrice);
    const itemCreateResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/menu-items") &&
        !response.url().includes("/import") &&
        response.request().method() === "POST"
    );
    await itemForm.locator('button[type="submit"]').click();
    const itemCreateResponse = await itemCreateResponsePromise;
    expect(itemCreateResponse.ok()).toBeTruthy();
    const itemBody = (await itemCreateResponse.json()) as {
      menuItem?: { slug?: string };
    };
    expect(itemBody.menuItem?.slug).toBe(expectedSlugFromName(itemName));
    await expect(page).toHaveURL(/\/dashboard\/menu-items/);
    await expect(page.getByText(itemName)).toBeVisible();

    await page.goto("/dashboard/menu-items/new");
    const dupForm1 = page.locator("form").first();
    await dupForm1.getByRole("textbox").nth(0).fill(duplicateItemName);
    await dupForm1.locator('input[type="number"]').first().fill("10");
    const dupCreate1Promise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/menu-items") &&
        !response.url().includes("/import") &&
        response.request().method() === "POST"
    );
    await dupForm1.locator('button[type="submit"]').click();
    const dupCreate1 = await dupCreate1Promise;
    expect(dupCreate1.ok()).toBeTruthy();
    const dupBody1 = (await dupCreate1.json()) as {
      menuItem?: { slug?: string };
    };
    const expectedDupBase = expectedSlugFromName(duplicateItemName);
    expect(dupBody1.menuItem?.slug).toBe(expectedDupBase);
    await expect(page).toHaveURL(/\/dashboard\/menu-items/);

    await page.goto("/dashboard/menu-items/new");
    const dupForm2 = page.locator("form").first();
    await dupForm2.getByRole("textbox").nth(0).fill(duplicateItemName);
    await dupForm2.locator('input[type="number"]').first().fill("11");
    const dupCreate2Promise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/menu-items") &&
        !response.url().includes("/import") &&
        response.request().method() === "POST"
    );
    await dupForm2.locator('button[type="submit"]').click();
    const dupCreate2 = await dupCreate2Promise;
    expect(dupCreate2.ok()).toBeTruthy();
    const dupBody2 = (await dupCreate2.json()) as {
      menuItem?: { slug?: string };
    };
    expect(dupBody2.menuItem?.slug).toBe(`${expectedDupBase}-2`);
    expect(dupBody2.menuItem?.slug).not.toBe(dupBody1.menuItem?.slug);
    await expect(page).toHaveURL(/\/dashboard\/menu-items/);

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

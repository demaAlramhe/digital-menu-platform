import { expect, test, type Browser, type BrowserContext, type Page } from "@playwright/test";
import { loginWithCredentials } from "./helpers/auth";
import { requireEnv, uniqueTestSlug } from "./helpers/env";

const hasIsolationCredentials = Boolean(
  process.env.E2E_OWNER_EMAIL?.trim() &&
    process.env.E2E_OWNER_PASSWORD?.trim() &&
    process.env.E2E_OWNER_B_EMAIL?.trim() &&
    process.env.E2E_OWNER_B_PASSWORD?.trim()
);

const OWNER_B_CATEGORY_NAME = "Isolation Test Category";
const OWNER_B_ITEM_NAME = "Isolation Test Item";
const OWNER_A_CATEGORY_NAME = "Isolation Owner A Category";
const OWNER_A_ITEM_NAME = "Isolation Owner A Item";

type ApiJson = {
  error?: string;
  category?: { id: string };
  menuItem?: { id: string };
};

async function createAuthenticatedContext(
  browser: Browser,
  email: string,
  password: string
): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext();
  const page = await context.newPage();
  await loginWithCredentials(page, email, password);
  await expect(page).toHaveURL(/\/dashboard/);
  return { context, page };
}

async function createCategory(
  page: Page,
  name: string,
  slug: string
): Promise<string> {
  const response = await page.request.post("/api/menu-categories", {
    data: {
      name,
      slug,
      sortOrder: 0,
      isActive: true,
    },
  });
  const body = (await response.json()) as ApiJson;
  expect(response.status(), JSON.stringify(body)).toBe(200);
  expect(body.category?.id).toBeTruthy();
  return body.category!.id;
}

async function createMenuItem(
  page: Page,
  name: string,
  slug: string,
  price: number,
  categoryId: string
): Promise<string> {
  const response = await page.request.post("/api/menu-items", {
    data: {
      name,
      slug,
      price,
      categoryId,
      isActive: true,
      isFeatured: false,
      sortOrder: 0,
    },
  });
  const body = (await response.json()) as ApiJson;
  expect(response.status(), JSON.stringify(body)).toBe(200);
  expect(body.menuItem?.id).toBeTruthy();
  return body.menuItem!.id;
}

async function deleteMenuItem(page: Page, menuItemId: string | null) {
  if (!menuItemId) return;
  await page.request.delete(`/api/menu-items/${menuItemId}`);
}

async function deleteCategory(page: Page, categoryId: string | null) {
  if (!categoryId) return;
  await page.request.delete(`/api/menu-categories/${categoryId}`);
}

test.describe("Cross-tenant isolation", () => {
  test.skip(
    !hasIsolationCredentials,
    "Set E2E_OWNER_EMAIL, E2E_OWNER_PASSWORD, E2E_OWNER_B_EMAIL, and E2E_OWNER_B_PASSWORD"
  );

  let ownerAContext: BrowserContext;
  let ownerBContext: BrowserContext;
  let ownerAPage: Page;
  let ownerBPage: Page;

  let ownerBCategoryId: string | null = null;
  let ownerBMenuItemId: string | null = null;
  let ownerACategoryId: string | null = null;
  let ownerAMenuItemId: string | null = null;

  test.beforeAll(async ({ browser }) => {
    const ownerAEmail = requireEnv("E2E_OWNER_EMAIL");
    const ownerAPassword = requireEnv("E2E_OWNER_PASSWORD");
    const ownerBEmail = requireEnv("E2E_OWNER_B_EMAIL");
    const ownerBPassword = requireEnv("E2E_OWNER_B_PASSWORD");

    const ownerB = await createAuthenticatedContext(
      browser,
      ownerBEmail,
      ownerBPassword
    );
    ownerBContext = ownerB.context;
    ownerBPage = ownerB.page;

    ownerBCategoryId = await createCategory(
      ownerBPage,
      OWNER_B_CATEGORY_NAME,
      uniqueTestSlug("iso-cat")
    );
    ownerBMenuItemId = await createMenuItem(
      ownerBPage,
      OWNER_B_ITEM_NAME,
      uniqueTestSlug("iso-item"),
      10,
      ownerBCategoryId
    );

    const ownerA = await createAuthenticatedContext(
      browser,
      ownerAEmail,
      ownerAPassword
    );
    ownerAContext = ownerA.context;
    ownerAPage = ownerA.page;

    ownerACategoryId = await createCategory(
      ownerAPage,
      OWNER_A_CATEGORY_NAME,
      uniqueTestSlug("iso-a-cat")
    );
    ownerAMenuItemId = await createMenuItem(
      ownerAPage,
      OWNER_A_ITEM_NAME,
      uniqueTestSlug("iso-a-item"),
      12,
      ownerACategoryId
    );
  });

  test.afterAll(async () => {
    try {
      if (ownerBPage) {
        await deleteMenuItem(ownerBPage, ownerBMenuItemId);
        await deleteCategory(ownerBPage, ownerBCategoryId);
      }
      if (ownerAPage) {
        await deleteMenuItem(ownerAPage, ownerAMenuItemId);
        await deleteCategory(ownerAPage, ownerACategoryId);
      }
    } finally {
      await ownerAContext?.close();
      await ownerBContext?.close();
    }
  });

  test("Owner A cannot update Owner B's category", async () => {
    const response = await ownerAPage.request.patch(
      `/api/menu-categories/${ownerBCategoryId}`,
      {
        data: {
          name: "Hijacked",
          slug: "hijacked",
          sortOrder: 0,
          isActive: true,
        },
      }
    );
    const body = (await response.json()) as ApiJson;
    const payload = JSON.stringify(body);

    expect(response.status()).toBe(404);
    expect(body.error).toBe("Category not found.");
    expect(payload).not.toContain(OWNER_B_CATEGORY_NAME);
  });

  test("Owner A cannot delete Owner B's category", async () => {
    const response = await ownerAPage.request.delete(
      `/api/menu-categories/${ownerBCategoryId}`
    );
    const body = (await response.json()) as ApiJson;

    expect(response.status()).toBe(404);
    expect(body.error).toBe("Category not found.");

    const verify = await ownerBPage.goto(
      `/dashboard/categories/${ownerBCategoryId}/edit`
    );
    expect(verify?.status()).toBe(200);
    await expect(
      ownerBPage.getByRole("textbox").first()
    ).toHaveValue(OWNER_B_CATEGORY_NAME);
  });

  test("Owner A cannot update Owner B's menu item", async () => {
    const response = await ownerAPage.request.patch(
      `/api/menu-items/${ownerBMenuItemId}`,
      {
        data: {
          name: "Hijacked Item",
          slug: "hijacked-item",
          price: 1,
          categoryId: null,
        },
      }
    );
    const body = (await response.json()) as ApiJson;
    const payload = JSON.stringify(body);

    expect(response.status()).toBe(404);
    expect(body.error).toBe("Menu item not found.");
    expect(payload).not.toContain(OWNER_B_ITEM_NAME);
  });

  test("Owner A cannot delete Owner B's menu item", async () => {
    const response = await ownerAPage.request.delete(
      `/api/menu-items/${ownerBMenuItemId}`
    );
    const body = (await response.json()) as ApiJson;

    expect(response.status()).toBe(404);
    expect(body.error).toBe("Menu item not found.");
  });

  test("Owner A cannot create a menu item on Owner B's category", async () => {
    const response = await ownerAPage.request.post("/api/menu-items", {
      data: {
        name: "Cross Store Item",
        slug: uniqueTestSlug("cross-item"),
        price: 5,
        categoryId: ownerBCategoryId,
      },
    });
    const body = (await response.json()) as ApiJson;

    expect(response.status()).toBe(400);
    expect(body.error).toBe("Category does not belong to this store.");
  });

  test("Owner A cannot reassign own item to Owner B's category", async () => {
    const response = await ownerAPage.request.patch(
      `/api/menu-items/${ownerAMenuItemId}`,
      {
        data: {
          name: OWNER_A_ITEM_NAME,
          slug: uniqueTestSlug("iso-a-item-reassign"),
          price: 12,
          categoryId: ownerBCategoryId,
        },
      }
    );
    const body = (await response.json()) as ApiJson;

    expect(response.status()).toBe(400);
    expect(body.error).toBe("Category does not belong to this store.");
  });

  test("Owner A cannot view Owner B's edit pages", async () => {
    const categoryResponse = await ownerAPage.goto(
      `/dashboard/categories/${ownerBCategoryId}/edit`
    );
    expect(categoryResponse?.status()).toBe(404);
    await expect(ownerAPage.getByText(OWNER_B_CATEGORY_NAME)).toHaveCount(0);

    const itemResponse = await ownerAPage.goto(
      `/dashboard/menu-items/${ownerBMenuItemId}/edit`
    );
    expect(itemResponse?.status()).toBe(404);
    await expect(ownerAPage.getByText(OWNER_B_ITEM_NAME)).toHaveCount(0);
  });
});

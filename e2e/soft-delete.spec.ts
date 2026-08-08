import { expect, test } from "@playwright/test";
import { loginWithCredentials } from "./helpers/auth";
import {
  optionalEnv,
  requireEnv,
  uniqueTestEmail,
  uniqueTestSlug,
} from "./helpers/env";
import {
  createE2EAdminClient,
  deleteAuthUserIfExists,
  deleteStoreBySlugIfExists,
} from "./helpers/supabase-admin";

const hasAdminCredentials = Boolean(
  process.env.E2E_ADMIN_EMAIL?.trim() &&
    process.env.E2E_ADMIN_PASSWORD?.trim() &&
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
);

const hasOwnerCredentials = Boolean(
  process.env.E2E_OWNER_EMAIL?.trim() && process.env.E2E_OWNER_PASSWORD?.trim()
);

test.describe("Soft-delete", () => {
  test("admin store delete hides storefront and cascades deleted_at", async ({
    page,
  }) => {
    test.skip(
      !hasAdminCredentials,
      "Set E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD, NEXT_PUBLIC_SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY"
    );

    const email = requireEnv("E2E_ADMIN_EMAIL");
    const password = requireEnv("E2E_ADMIN_PASSWORD");
    await loginWithCredentials(page, email, password);
    await expect(page).toHaveURL(/\/admin/);

    const payload = {
      storeName: `E2E SoftDel ${Date.now()}`,
      storeSlug: uniqueTestSlug("softdel"),
      ownerEmail: uniqueTestEmail("softdel"),
      ownerPassword: "SoftDelTest1!",
      ownerFullName: "Soft Delete Owner",
    };

    try {
      const createResponse = await page.request.post("/api/admin/stores", {
        data: payload,
      });
      const createBody = (await createResponse.json()) as {
        error?: string;
        store?: { id: string; slug?: string };
      };
      expect(createResponse.status(), JSON.stringify(createBody)).toBe(200);
      const storeId = createBody.store!.id;

      const supabase = createE2EAdminClient();
      const { data: category } = await supabase
        .from("menu_categories")
        .select("id")
        .eq("store_id", storeId)
        .is("deleted_at", null)
        .limit(1)
        .maybeSingle();
      expect(category?.id).toBeTruthy();

      await supabase.from("menu_items").insert({
        store_id: storeId,
        category_id: category!.id,
        name: "SoftDel Item",
        slug: uniqueTestSlug("softdel-item"),
        price: 10,
        is_active: true,
      });

      const deleteResponse = await page.request.delete(
        `/api/admin/stores/${storeId}`
      );
      expect(deleteResponse.status()).toBe(200);

      const { data: storeRow } = await supabase
        .from("stores")
        .select("id, deleted_at, slug, status")
        .eq("id", storeId)
        .maybeSingle();
      expect(storeRow?.deleted_at).toBeTruthy();

      const { data: liveBySlug } = await supabase
        .from("stores")
        .select("id")
        .eq("slug", payload.storeSlug)
        .eq("status", "active")
        .is("deleted_at", null)
        .maybeSingle();
      expect(liveBySlug).toBeNull();

      // Soft-delete hides the storefront (Next.js notFound UI). Status may be
      // 404 or 200 depending on runtime; assert by content + DB filters above.
      await page.goto(`/${payload.storeSlug}`, {
        waitUntil: "domcontentloaded",
      });
      await expect(page.getByText(/this page could not be found/i)).toBeVisible();
      await expect(page.getByText(payload.storeName)).toHaveCount(0);

      await page.goto(`/${payload.storeSlug}/menu`, {
        waitUntil: "domcontentloaded",
      });
      await expect(page.getByText(/this page could not be found/i)).toBeVisible();
      await expect(page.getByText("SoftDel Item")).toHaveCount(0);

      const { data: categories } = await supabase
        .from("menu_categories")
        .select("id, deleted_at")
        .eq("store_id", storeId);
      expect(categories?.length).toBeGreaterThan(0);
      expect(categories?.every((row) => row.deleted_at != null)).toBe(true);

      const { data: items } = await supabase
        .from("menu_items")
        .select("id, deleted_at")
        .eq("store_id", storeId);
      expect(items?.length).toBeGreaterThan(0);
      expect(items?.every((row) => row.deleted_at != null)).toBe(true);

      const { data: liveCategories } = await supabase
        .from("menu_categories")
        .select("id")
        .eq("store_id", storeId)
        .is("deleted_at", null);
      expect(liveCategories ?? []).toEqual([]);

      const { data: liveItems } = await supabase
        .from("menu_items")
        .select("id")
        .eq("store_id", storeId)
        .is("deleted_at", null);
      expect(liveItems ?? []).toEqual([]);
    } finally {
      await deleteStoreBySlugIfExists(payload.storeSlug);
      await deleteAuthUserIfExists(payload.ownerEmail);
    }
  });

  test("owner category/item delete hides from dashboard+public; inactive sibling stays", async ({
    page,
  }) => {
    test.skip(
      !hasOwnerCredentials,
      "Set E2E_OWNER_EMAIL and E2E_OWNER_PASSWORD"
    );

    const email = requireEnv("E2E_OWNER_EMAIL");
    const password = requireEnv("E2E_OWNER_PASSWORD");
    const stamp = Date.now();
    const categoryName = `SoftDel Cat ${stamp}`;
    const deletedItemName = `SoftDel Deleted Item ${stamp}`;
    const inactiveItemName = `SoftDel Inactive Item ${stamp}`;

    await loginWithCredentials(page, email, password);
    await expect(page).toHaveURL(/\/dashboard/);

    const categoryResponse = await page.request.post("/api/menu-categories", {
      data: {
        name: categoryName,
        slug: uniqueTestSlug("softdel-cat"),
        sortOrder: 0,
        isActive: true,
      },
    });
    const categoryBody = (await categoryResponse.json()) as {
      category?: { id: string };
      error?: string;
    };
    expect(categoryResponse.status(), JSON.stringify(categoryBody)).toBe(200);
    const categoryId = categoryBody.category!.id;

    const deletedItemResponse = await page.request.post("/api/menu-items", {
      data: {
        name: deletedItemName,
        slug: uniqueTestSlug("softdel-del-item"),
        price: 12,
        categoryId,
        isActive: true,
      },
    });
    const deletedItemBody = (await deletedItemResponse.json()) as {
      menuItem?: { id: string };
      error?: string;
    };
    expect(deletedItemResponse.status(), JSON.stringify(deletedItemBody)).toBe(
      200
    );
    const deletedItemId = deletedItemBody.menuItem!.id;

    const inactiveItemResponse = await page.request.post("/api/menu-items", {
      data: {
        name: inactiveItemName,
        slug: uniqueTestSlug("softdel-inactive-item"),
        price: 14,
        categoryId,
        isActive: false,
      },
    });
    const inactiveItemBody = (await inactiveItemResponse.json()) as {
      menuItem?: { id: string };
      error?: string;
    };
    expect(
      inactiveItemResponse.status(),
      JSON.stringify(inactiveItemBody)
    ).toBe(200);
    const inactiveItemId = inactiveItemBody.menuItem!.id;

    try {
      const deleteItem = await page.request.delete(
        `/api/menu-items/${deletedItemId}`
      );
      expect(deleteItem.status()).toBe(200);

      await page.goto("/dashboard/menu-items");
      await expect(page.getByText(deletedItemName)).toHaveCount(0);
      await expect(page.getByText(inactiveItemName)).toBeVisible();

      const storeSlug = optionalEnv("E2E_TEST_STORE_SLUG");
      if (storeSlug) {
        await page.goto(`/${storeSlug}/menu`);
        await expect(page.getByText(deletedItemName)).toHaveCount(0);
        await expect(page.getByText(inactiveItemName)).toHaveCount(0);
      }

      const supabase = createE2EAdminClient();
      const { data: deletedRow } = await supabase
        .from("menu_items")
        .select("deleted_at, is_active")
        .eq("id", deletedItemId)
        .maybeSingle();
      expect(deletedRow?.deleted_at).toBeTruthy();

      const { data: inactiveRow } = await supabase
        .from("menu_items")
        .select("deleted_at, is_active")
        .eq("id", inactiveItemId)
        .maybeSingle();
      expect(inactiveRow?.deleted_at).toBeNull();
      expect(inactiveRow?.is_active).toBe(false);

      const deleteCategory = await page.request.delete(
        `/api/menu-categories/${categoryId}`
      );
      expect(deleteCategory.status()).toBe(200);

      await page.goto("/dashboard/categories");
      await expect(page.getByText(categoryName)).toHaveCount(0);

      // Soft-deleted category cascades deleted_at to its items.
      await page.goto("/dashboard/menu-items");
      await expect(page.getByText(inactiveItemName)).toHaveCount(0);
      if (storeSlug) {
        await page.goto(`/${storeSlug}/menu`);
        await expect(page.getByText(inactiveItemName)).toHaveCount(0);
      }

      const { data: categoryRow } = await supabase
        .from("menu_categories")
        .select("deleted_at")
        .eq("id", categoryId)
        .maybeSingle();
      expect(categoryRow?.deleted_at).toBeTruthy();

      const { data: cascadedItem } = await supabase
        .from("menu_items")
        .select("category_id, deleted_at")
        .eq("id", inactiveItemId)
        .maybeSingle();
      expect(cascadedItem?.category_id).toBe(categoryId);
      expect(cascadedItem?.deleted_at).toBeTruthy();
    } finally {
      const supabase = createE2EAdminClient();
      await supabase
        .from("menu_items")
        .update({ deleted_at: new Date().toISOString() })
        .in("id", [deletedItemId, inactiveItemId]);
      await supabase
        .from("menu_categories")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", categoryId);
    }
  });
});

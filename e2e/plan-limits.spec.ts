import { expect, test } from "@playwright/test";
import { loginWithCredentials } from "./helpers/auth";
import {
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

test.describe("Plan item limits", () => {
  test("small plan allows 25th item and rejects 26th", async ({ page }) => {
    test.skip(
      !hasAdminCredentials,
      "Set E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD, NEXT_PUBLIC_SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY"
    );

    const adminEmail = requireEnv("E2E_ADMIN_EMAIL");
    const adminPassword = requireEnv("E2E_ADMIN_PASSWORD");
    const stamp = Date.now();
    const payload = {
      storeName: `E2E PlanLimit ${stamp}`,
      storeSlug: uniqueTestSlug("planlimit"),
      ownerEmail: uniqueTestEmail("planlimit"),
      ownerPassword: "PlanLimitTest1!",
      ownerFullName: "Plan Limit Owner",
      plan: "small" as const,
    };

    const seededItemIds: string[] = [];
    let createdItemId: string | null = null;

    await loginWithCredentials(page, adminEmail, adminPassword);
    await expect(page).toHaveURL(/\/admin/);

    try {
      const createResponse = await page.request.post("/api/admin/stores", {
        data: payload,
      });
      const createBody = (await createResponse.json()) as {
        error?: string;
        store?: { id: string };
      };
      expect(createResponse.status(), JSON.stringify(createBody)).toBe(200);
      const storeId = createBody.store!.id;

      const supabase = createE2EAdminClient();
      await supabase.from("stores").update({ plan: "small" }).eq("id", storeId);

      const { data: category } = await supabase
        .from("menu_categories")
        .select("id")
        .eq("store_id", storeId)
        .is("deleted_at", null)
        .limit(1)
        .maybeSingle();
      expect(category?.id).toBeTruthy();

      const seedRows = Array.from({ length: 24 }, (_, index) => ({
        store_id: storeId,
        category_id: category!.id,
        name: `PlanLimit Seed ${stamp} ${index + 1}`,
        slug: `planlimit-seed-${stamp}-${index + 1}`,
        price: 10,
        is_active: true,
      }));

      const { data: seeded, error: seedError } = await supabase
        .from("menu_items")
        .insert(seedRows)
        .select("id");
      expect(seedError, JSON.stringify(seedError)).toBeNull();
      seededItemIds.push(...(seeded ?? []).map((row) => row.id));
      expect(seededItemIds.length).toBe(24);

      await page.context().clearCookies();
      await loginWithCredentials(
        page,
        payload.ownerEmail,
        payload.ownerPassword
      );
      await expect(page).toHaveURL(/\/dashboard/);

      const item25Name = `PlanLimit Item 25 ${stamp}`;
      const create25 = await page.request.post("/api/menu-items", {
        data: {
          name: item25Name,
          slug: uniqueTestSlug("planlimit-25"),
          price: 12,
          categoryId: category!.id,
          isActive: true,
        },
      });
      const body25 = (await create25.json()) as {
        error?: string;
        menuItem?: { id: string };
      };
      expect(create25.status(), JSON.stringify(body25)).toBe(200);
      createdItemId = body25.menuItem?.id ?? null;
      expect(createdItemId).toBeTruthy();

      const create26 = await page.request.post("/api/menu-items", {
        data: {
          name: `PlanLimit Item 26 ${stamp}`,
          slug: uniqueTestSlug("planlimit-26"),
          price: 13,
          categoryId: category!.id,
          isActive: true,
        },
      });
      const body26 = (await create26.json()) as { error?: string };
      expect(create26.status(), JSON.stringify(body26)).toBe(400);
      expect(body26.error).toBe(
        "Reached the item limit for your current plan (25 items). Contact us to upgrade."
      );
    } finally {
      const supabase = createE2EAdminClient();
      const idsToDelete = [
        ...seededItemIds,
        ...(createdItemId ? [createdItemId] : []),
      ];
      if (idsToDelete.length > 0) {
        await supabase.from("menu_items").delete().in("id", idsToDelete);
      }
      await deleteStoreBySlugIfExists(payload.storeSlug);
      await deleteAuthUserIfExists(payload.ownerEmail);
    }
  });
});

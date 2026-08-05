import { expect, test } from "@playwright/test";
import { loginWithCredentials } from "./helpers/auth";
import {
  requireEnv,
  uniqueTestEmail,
  uniqueTestSlug,
} from "./helpers/env";
import {
  deleteAuthUserIfExists,
  deleteStoreBySlugIfExists,
  findLatestAuditLog,
} from "./helpers/supabase-admin";

const hasAdminCredentials = Boolean(
  process.env.E2E_ADMIN_EMAIL?.trim() &&
    process.env.E2E_ADMIN_PASSWORD?.trim() &&
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
);

test.describe("Admin audit log", () => {
  test.skip(
    !hasAdminCredentials,
    "Set E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD, NEXT_PUBLIC_SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY"
  );

  test("records store.status_change after PATCH status", async ({ page }) => {
    const email = requireEnv("E2E_ADMIN_EMAIL");
    const password = requireEnv("E2E_ADMIN_PASSWORD");
    await loginWithCredentials(page, email, password);
    await expect(page).toHaveURL(/\/admin/);

    const payload = {
      storeName: `E2E Audit ${Date.now()}`,
      storeSlug: uniqueTestSlug("audit"),
      ownerEmail: uniqueTestEmail("audit"),
      ownerPassword: "AuditTest1!",
      ownerFullName: "Audit Owner",
    };

    try {
      const createResponse = await page.request.post("/api/admin/stores", {
        data: payload,
      });
      const createBody = (await createResponse.json()) as {
        error?: string;
        store?: { id: string };
      };
      expect(createResponse.status(), JSON.stringify(createBody)).toBe(200);
      expect(createBody.store?.id).toBeTruthy();
      const storeId = createBody.store!.id;

      const statusResponse = await page.request.patch(
        `/api/admin/stores/${storeId}/status`,
        { data: { status: "inactive" } }
      );
      const statusBody = (await statusResponse.json()) as { error?: string };
      expect(statusResponse.status(), JSON.stringify(statusBody)).toBe(200);

      await expect
        .poll(
          async () =>
            findLatestAuditLog({
              action: "store.status_change",
              targetType: "store",
              targetId: storeId,
            }),
          { timeout: 15_000 }
        )
        .toMatchObject({
          action: "store.status_change",
          target_type: "store",
          target_id: storeId,
        });
    } finally {
      await deleteStoreBySlugIfExists(payload.storeSlug);
      await deleteAuthUserIfExists(payload.ownerEmail);
    }
  });
});

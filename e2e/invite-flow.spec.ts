import { expect, test } from "@playwright/test";
import { loginWithCredentials } from "./helpers/auth";
import { requireEnv, uniqueTestEmail } from "./helpers/env";
import {
  createE2EAdminClient,
  deleteAuthUserIfExists,
  deleteStoreBySlugIfExists,
  findAuthUserByEmail,
  findProfileById,
} from "./helpers/supabase-admin";

const hasAdminCredentials = Boolean(
  process.env.E2E_ADMIN_EMAIL?.trim() &&
    process.env.E2E_ADMIN_PASSWORD?.trim() &&
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
);

test.describe("Invite flow (signup approve)", () => {
  test("approve invites user without password in API response", async ({
    page,
  }) => {
    test.skip(
      !hasAdminCredentials,
      "Set E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD, NEXT_PUBLIC_SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY"
    );

    const adminEmail = requireEnv("E2E_ADMIN_EMAIL");
    const adminPassword = requireEnv("E2E_ADMIN_PASSWORD");
    const stamp = Date.now();
    const ownerEmail = uniqueTestEmail("invite");
    const restaurantName = `E2E Invite ${stamp}`;
    let storeSlug: string | null = null;
    let signupId: string | null = null;

    const supabase = createE2EAdminClient();

    await loginWithCredentials(page, adminEmail, adminPassword);
    await expect(page).toHaveURL(/\/admin/);

    try {
      const { data: signup, error: signupError } = await supabase
        .from("pending_signups")
        .insert({
          full_name: "E2E Invite Owner",
          restaurant_name: restaurantName,
          email: ownerEmail,
          whatsapp: "+972501111111",
          plan: "medium",
          status: "pending",
        })
        .select("id")
        .single();

      expect(signupError, JSON.stringify(signupError)).toBeNull();
      signupId = signup!.id;

      const approveResponse = await page.request.post(
        `/api/admin/signups/${signupId}/approve`
      );
      const approveBody = (await approveResponse.json()) as {
        error?: string;
        credentials?: Record<string, unknown>;
      };
      expect(approveResponse.status(), JSON.stringify(approveBody)).toBe(200);
      expect(approveBody.credentials).toBeTruthy();
      expect(approveBody.credentials).not.toHaveProperty("password");
      expect(approveBody.credentials?.email).toBe(ownerEmail);
      expect(typeof approveBody.credentials?.store_slug).toBe("string");
      storeSlug = String(approveBody.credentials!.store_slug);

      const authUser = await findAuthUserByEmail(ownerEmail);
      expect(authUser?.id).toBeTruthy();
      expect(authUser?.email?.toLowerCase()).toBe(ownerEmail);

      // Current approve route still creates the profile immediately at approval
      // (before the invitee sets a password). Keep asserting that behavior.
      const profile = await findProfileById(authUser!.id);
      expect(profile?.id).toBe(authUser!.id);
      expect(profile?.store_id).toBeTruthy();
    } finally {
      if (storeSlug) {
        await deleteStoreBySlugIfExists(storeSlug);
      }
      await deleteAuthUserIfExists(ownerEmail);
      if (signupId) {
        await supabase.from("pending_signups").delete().eq("id", signupId);
      }
    }
  });
});

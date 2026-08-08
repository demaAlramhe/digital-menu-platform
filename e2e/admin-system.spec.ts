import { expect, test } from "@playwright/test";
import { loginWithCredentials } from "./helpers/auth";
import { requireEnv } from "./helpers/env";
import { createE2EAdminClient } from "./helpers/supabase-admin";

const hasOwnerCredentials = Boolean(
  process.env.E2E_OWNER_EMAIL?.trim() && process.env.E2E_OWNER_PASSWORD?.trim()
);

const hasAdminCredentials = Boolean(
  process.env.E2E_ADMIN_EMAIL?.trim() &&
    process.env.E2E_ADMIN_PASSWORD?.trim() &&
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
);

const FAKE_UUID = "00000000-0000-0000-0000-000000000000";

test.describe("Admin system page", () => {
  test.describe("Store owner", () => {
    test.skip(
      !hasOwnerCredentials,
      "Set E2E_OWNER_EMAIL and E2E_OWNER_PASSWORD"
    );

    test("redirects /admin/system to /dashboard", async ({ page }) => {
      const email = requireEnv("E2E_OWNER_EMAIL");
      const password = requireEnv("E2E_OWNER_PASSWORD");

      await loginWithCredentials(page, email, password);
      await page.goto("/admin/system");
      expect(new URL(page.url()).pathname).toBe("/dashboard");
    });

    test("cannot POST system-integrations API", async ({ page }) => {
      const email = requireEnv("E2E_OWNER_EMAIL");
      const password = requireEnv("E2E_OWNER_PASSWORD");

      await loginWithCredentials(page, email, password);

      const response = await page.request.post("/api/admin/system-integrations", {
        data: {
          name: "blocked",
          category: "other",
        },
      });
      const body = (await response.json()) as { error?: string };

      expect(response.status()).toBe(403);
      expect(body.error).toBe("Forbidden.");
    });

    test("cannot DELETE system-integrations API", async ({ page }) => {
      const email = requireEnv("E2E_OWNER_EMAIL");
      const password = requireEnv("E2E_OWNER_PASSWORD");

      await loginWithCredentials(page, email, password);

      const response = await page.request.delete(
        `/api/admin/system-integrations/${FAKE_UUID}`
      );
      const body = (await response.json()) as { error?: string };

      expect(response.status()).toBe(403);
      expect(body.error).toBe("Forbidden.");
    });
  });

  test.describe("Super admin", () => {
    test.skip(
      !hasAdminCredentials,
      "Set E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD, NEXT_PUBLIC_SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY"
    );

    test("views system page with customer overview cards matching DB", async ({
      page,
    }) => {
      const email = requireEnv("E2E_ADMIN_EMAIL");
      const password = requireEnv("E2E_ADMIN_PASSWORD");
      const supabase = createE2EAdminClient();

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [
        { data: storePlans },
        { data: signupStatuses },
        { count: signupsLast30Days },
      ] = await Promise.all([
        supabase.from("stores").select("plan").is("deleted_at", null),
        supabase.from("pending_signups").select("status"),
        supabase
          .from("pending_signups")
          .select("id", { count: "exact", head: true })
          .gte("created_at", thirtyDaysAgo.toISOString()),
      ]);

      const planCounts = countBy(storePlans ?? [], (row) => row.plan as string);
      const signupStatusCounts = countBy(
        signupStatuses ?? [],
        (row) => row.status as string
      );
      const totalStores = (storePlans ?? []).length;

      await loginWithCredentials(page, email, password);
      await page.goto("/admin/system");

      await expect(page).toHaveURL(/\/admin\/system/);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "الخدمات المربوطة" })
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "نظرة عامة على الزباين" })
      ).toBeVisible();
      await expect(page.getByRole("heading", { name: "الدفع" })).toBeVisible();
      await expect(
        page.getByRole("button", { name: "ربط معالج الدفع قريباً" })
      ).toBeDisabled();

      await expect(page.getByTestId("stat-total-stores")).toContainText(
        String(totalStores)
      );
      await expect(page.getByTestId("stat-plan-small")).toContainText(
        String(planCounts.small ?? 0)
      );
      await expect(page.getByTestId("stat-plan-medium")).toContainText(
        String(planCounts.medium ?? 0)
      );
      await expect(page.getByTestId("stat-plan-large")).toContainText(
        String(planCounts.large ?? 0)
      );
      await expect(page.getByTestId("stat-plan-custom")).toContainText(
        String(planCounts.custom ?? 0)
      );
      await expect(page.getByTestId("stat-signups-pending")).toContainText(
        String(signupStatusCounts.pending ?? 0)
      );
      await expect(page.getByTestId("stat-signups-approved")).toContainText(
        String(signupStatusCounts.approved ?? 0)
      );
      await expect(page.getByTestId("stat-signups-rejected")).toContainText(
        String(signupStatusCounts.rejected ?? 0)
      );
      await expect(page.getByTestId("stat-signups-last-30")).toContainText(
        String(signupsLast30Days ?? 0)
      );
    });
  });
});

function countBy<T>(
  rows: T[],
  keyFn: (row: T) => string
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    const key = keyFn(row);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

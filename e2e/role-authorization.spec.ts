import { expect, test } from "@playwright/test";
import { loginWithCredentials } from "./helpers/auth";
import { requireEnv } from "./helpers/env";

const FAKE_UUID = "00000000-0000-0000-0000-000000000000";

const hasOwnerCredentials = Boolean(
  process.env.E2E_OWNER_EMAIL?.trim() && process.env.E2E_OWNER_PASSWORD?.trim()
);

const hasAdminCredentials = Boolean(
  process.env.E2E_ADMIN_EMAIL?.trim() && process.env.E2E_ADMIN_PASSWORD?.trim()
);

test.describe("Role-based authorization", () => {
  test.describe("Unauthenticated visitor", () => {
    test("redirects /dashboard to /auth/login", async ({ page }) => {
      await page.goto("/dashboard");
      expect(new URL(page.url()).pathname).toBe("/auth/login");
    });

    test("redirects /admin to /auth/login", async ({ page }) => {
      await page.goto("/admin");
      expect(new URL(page.url()).pathname).toBe("/auth/login");
    });
  });

  test.describe("Store owner", () => {
    test.skip(
      !hasOwnerCredentials,
      "Set E2E_OWNER_EMAIL and E2E_OWNER_PASSWORD"
    );

    test("redirects /admin to /dashboard", async ({ page }) => {
      const email = requireEnv("E2E_OWNER_EMAIL");
      const password = requireEnv("E2E_OWNER_PASSWORD");

      await loginWithCredentials(page, email, password);
      await page.goto("/admin");
      expect(new URL(page.url()).pathname).toBe("/dashboard");
    });

    test("redirects /admin/stores to /dashboard", async ({ page }) => {
      const email = requireEnv("E2E_OWNER_EMAIL");
      const password = requireEnv("E2E_OWNER_PASSWORD");

      await loginWithCredentials(page, email, password);
      await page.goto("/admin/stores");
      expect(new URL(page.url()).pathname).toBe("/dashboard");
    });

    test("cannot PATCH admin store status API", async ({ page }) => {
      const email = requireEnv("E2E_OWNER_EMAIL");
      const password = requireEnv("E2E_OWNER_PASSWORD");

      await loginWithCredentials(page, email, password);

      const response = await page.request.patch(
        `/api/admin/stores/${FAKE_UUID}/status`,
        {
          data: { status: "inactive" },
        }
      );
      const body = (await response.json()) as { error?: string };

      expect(response.status()).toBe(403);
      expect(body.error).toBe("Forbidden.");
    });
  });

  test.describe("Super admin", () => {
    test.skip(
      !hasAdminCredentials,
      "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD"
    );

    test("redirects /dashboard to /admin", async ({ page }) => {
      const email = requireEnv("E2E_ADMIN_EMAIL");
      const password = requireEnv("E2E_ADMIN_PASSWORD");

      await loginWithCredentials(page, email, password);
      await page.goto("/dashboard");
      expect(new URL(page.url()).pathname).toBe("/admin");
    });

    test("cannot PATCH owner menu-categories API", async ({ page }) => {
      const email = requireEnv("E2E_ADMIN_EMAIL");
      const password = requireEnv("E2E_ADMIN_PASSWORD");

      await loginWithCredentials(page, email, password);

      const response = await page.request.patch(
        `/api/menu-categories/${FAKE_UUID}`,
        {
          data: {
            name: "test",
            slug: "test",
            sortOrder: 0,
            isActive: true,
          },
        }
      );
      const body = (await response.json()) as { error?: string };

      expect(response.status()).toBe(403);
      expect(body.error).toBe("Forbidden.");
    });
  });
});

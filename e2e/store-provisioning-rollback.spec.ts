import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { loginWithCredentials } from "./helpers/auth";
import {
  requireEnv,
  uniqueTestEmail,
  uniqueTestSlug,
} from "./helpers/env";
import {
  deleteAuthUserIfExists,
  deleteStoreBySlugIfExists,
  findAuthUserByEmail,
  findProfileById,
  findStoreBySlug,
} from "./helpers/supabase-admin";

const hasAdminCredentials = Boolean(
  process.env.E2E_ADMIN_EMAIL?.trim() &&
    process.env.E2E_ADMIN_PASSWORD?.trim() &&
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
);

type FailAt = "store" | "profile" | "category";

type CreateStoreBody = {
  storeName: string;
  storeSlug: string;
  ownerEmail: string;
  ownerPassword: string;
  ownerFullName: string;
};

function buildPayload(prefix: string): CreateStoreBody {
  const stamp = Date.now();
  return {
    storeName: `E2E Rollback ${prefix} ${stamp}`,
    storeSlug: uniqueTestSlug(`rollback-${prefix}`),
    ownerEmail: uniqueTestEmail(`rollback-${prefix}`),
    ownerPassword: "RollbackTest1!",
    ownerFullName: `Rollback Owner ${prefix}`,
  };
}

async function postCreateStore(
  request: APIRequestContext,
  payload: CreateStoreBody,
  failAt?: FailAt
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (failAt) {
    headers["x-test-fail-at"] = failAt;
  }

  const response = await request.post("/api/admin/stores", {
    headers,
    data: payload,
  });
  const body = (await response.json()) as {
    error?: string;
    success?: boolean;
    store?: { id: string; slug: string };
    ownerUserId?: string;
    details?: unknown;
  };
  return { response, body };
}

async function assertFullyRolledBack(payload: CreateStoreBody) {
  await expect
    .poll(async () => findStoreBySlug(payload.storeSlug), { timeout: 15_000 })
    .toBeNull();

  const authUser = await findAuthUserByEmail(payload.ownerEmail);
  expect(authUser, `auth user still exists for ${payload.ownerEmail}`).toBeNull();

  // Profile is keyed by auth user id — if auth user is gone, profile must be gone too.
  // Double-check by slug linkage in case a profile row was left with a dangling id.
  const store = await findStoreBySlug(payload.storeSlug);
  expect(store).toBeNull();
}

test.describe("Store provisioning rollback", () => {
  test.skip(
    !hasAdminCredentials,
    "Set E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD, NEXT_PUBLIC_SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY"
  );

  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    const email = requireEnv("E2E_ADMIN_EMAIL");
    const password = requireEnv("E2E_ADMIN_PASSWORD");
    await loginWithCredentials(page, email, password);
    await expect(page).toHaveURL(/\/admin/);
  });

  for (const failAt of ["store", "profile", "category"] as const) {
    test(`rolls back when x-test-fail-at=${failAt}`, async () => {
      const payload = buildPayload(failAt);

      try {
        const { response, body } = await postCreateStore(
          page.request,
          payload,
          failAt
        );

        expect(response.ok(), JSON.stringify(body)).toBe(false);
        expect(body.error).toBeTruthy();
        expect(body.success).not.toBe(true);

        await assertFullyRolledBack(payload);

        if (failAt === "store" || failAt === "profile") {
          const authUser = await findAuthUserByEmail(payload.ownerEmail);
          expect(authUser).toBeNull();
        }
      } finally {
        await deleteStoreBySlugIfExists(payload.storeSlug);
        await deleteAuthUserIfExists(payload.ownerEmail);
      }
    });
  }

  test("happy path still creates store + owner", async () => {
    const payload = buildPayload("ok");
    let ownerUserId: string | undefined;

    try {
      const { response, body } = await postCreateStore(page.request, payload);

      expect(response.status(), JSON.stringify(body)).toBe(200);
      expect(body.success).toBe(true);
      expect(body.store?.id).toBeTruthy();
      expect(body.store?.slug).toBe(payload.storeSlug);
      expect(body.ownerUserId).toBeTruthy();
      ownerUserId = body.ownerUserId;

      const store = await findStoreBySlug(payload.storeSlug);
      expect(store?.id).toBe(body.store!.id);

      const authUser = await findAuthUserByEmail(payload.ownerEmail);
      expect(authUser?.id).toBe(ownerUserId);

      const profile = await findProfileById(ownerUserId!);
      expect(profile?.store_id).toBe(body.store!.id);
    } finally {
      await deleteStoreBySlugIfExists(payload.storeSlug);
      await deleteAuthUserIfExists(payload.ownerEmail);
    }
  });
});

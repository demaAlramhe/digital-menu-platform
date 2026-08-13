import { expect, test, type Page } from "@playwright/test";
import { loginWithCredentials } from "./helpers/auth";
import { requireEnv } from "./helpers/env";

const hasOwnerCredentials = Boolean(
  process.env.E2E_OWNER_EMAIL?.trim() && process.env.E2E_OWNER_PASSWORD?.trim()
);

async function setLastActivityCookie(page: Page, epochMs: number): Promise<void> {
  const origin = new URL(page.url()).origin;
  await page.context().addCookies([
    {
      name: "last_activity",
      value: String(epochMs),
      url: `${origin}/`,
      httpOnly: true,
      sameSite: "Lax",
      expires: Math.floor(Date.now() / 1000) + 60 * 60,
    },
  ]);
}

test.describe("Idle timeout", () => {
  test.skip(!hasOwnerCredentials, "Set E2E_OWNER_EMAIL and E2E_OWNER_PASSWORD");

  test("login then dashboard navigation still works", async ({ page }) => {
    const email = requireEnv("E2E_OWNER_EMAIL");
    const password = requireEnv("E2E_OWNER_PASSWORD");

    await loginWithCredentials(page, email, password);
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("navigation").first()).toBeVisible();

    await page.goto("/dashboard/categories");
    await expect(page).toHaveURL(/\/dashboard\/categories/);
  });

  test("stale last_activity cookie redirects to session_expired login", async ({
    page,
  }) => {
    const email = requireEnv("E2E_OWNER_EMAIL");
    const password = requireEnv("E2E_OWNER_PASSWORD");

    await loginWithCredentials(page, email, password);
    await expect(page).toHaveURL(/\/dashboard/);

    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    await setLastActivityCookie(page, twoHoursAgo);

    await page.goto("/dashboard");

    const url = new URL(page.url());
    expect(url.pathname).toBe("/auth/login");
    expect(url.searchParams.get("error")).toBe("session_expired");
    await expect(
      page.getByText(
        /session expired due to inactivity|انتهت جلستك بسبب عدم النشاط|פג תוקף ההפעלה שלך עקב חוסר פעילות/i
      )
    ).toBeVisible();

    await page.goto("/dashboard");
    expect(new URL(page.url()).pathname).toBe("/auth/login");
  });

  test("fresh last_activity cookie does not redirect", async ({ page }) => {
    const email = requireEnv("E2E_OWNER_EMAIL");
    const password = requireEnv("E2E_OWNER_PASSWORD");

    await loginWithCredentials(page, email, password);
    await expect(page).toHaveURL(/\/dashboard/);

    await setLastActivityCookie(page, Date.now());

    await page.goto("/dashboard/categories");
    expect(new URL(page.url()).pathname).toBe("/dashboard/categories");
    expect(page.url()).not.toContain("session_expired");
  });
});

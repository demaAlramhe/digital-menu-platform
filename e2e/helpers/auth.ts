import type { Page } from "@playwright/test";

export async function loginWithCredentials(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await page.goto("/auth/login");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('form button[type="submit"]').click();
  await page.waitForURL(
    (url) =>
      url.pathname === "/dashboard" ||
      url.pathname.startsWith("/admin") ||
      url.pathname === "/auth/redirect",
    { timeout: 30_000 }
  );

  if (page.url().includes("/auth/redirect")) {
    await page.waitForURL(/\/(dashboard|admin)/, { timeout: 30_000 });
  }
}

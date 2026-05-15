import { headers } from "next/headers";

export function buildMenuPath(storeSlug: string) {
  return `/${storeSlug}/menu`;
}

export async function getSiteOrigin(): Promise<string> {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  const headersList = await headers();
  const host = headersList.get("host");

  if (!host) {
    return "";
  }

  const protocol = headersList.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
}

export async function buildPublicMenuUrl(storeSlug: string): Promise<string> {
  const origin = await getSiteOrigin();
  const path = buildMenuPath(storeSlug);

  return origin ? `${origin}${path}` : path;
}

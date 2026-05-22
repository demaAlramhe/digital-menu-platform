import type { Locale } from "@/lib/i18n/types";

/**
 * Appends ?lang= for shareable public store/menu links.
 * Middleware sets the locale cookie and redirects to a clean URL.
 */
export function withPublicLangParam(path: string, locale: Locale): string {
  const base = path.startsWith("/") ? path : `/${path}`;
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}lang=${locale}`;
}

export function appendLangToAbsoluteUrl(url: string, locale: Locale): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("lang", locale);
    return parsed.toString();
  } catch {
    return withPublicLangParam(url, locale);
  }
}

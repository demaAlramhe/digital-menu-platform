import { NextResponse, type NextRequest } from "next/server";
import { isLocale, LOCALE_COOKIE } from "@/lib/i18n/types";

const RESERVED_SEGMENTS = new Set([
  "dashboard",
  "admin",
  "auth",
  "api",
  "test",
  "_next",
]);

export function isPublicStorePath(pathname: string): boolean {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return false;
  if (RESERVED_SEGMENTS.has(segments[0])) return false;
  if (segments.length === 1) return true;
  if (segments.length === 2 && segments[1] === "menu") return true;
  return false;
}

/**
 * When ?lang=ar|he|en on a public store route: set cookie and redirect without the param.
 */
export function applyPublicLocaleFromQuery(
  request: NextRequest,
  response: NextResponse
): NextResponse | null {
  if (!isPublicStorePath(request.nextUrl.pathname)) {
    return null;
  }

  const langParam = request.nextUrl.searchParams.get("lang");
  if (!isLocale(langParam)) {
    return null;
  }

  const url = request.nextUrl.clone();
  url.searchParams.delete("lang");

  const redirect = NextResponse.redirect(url);
  redirect.cookies.set(LOCALE_COOKIE, langParam, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return redirect;
}

export function setLocaleCookieOnResponse(
  locale: string,
  response: NextResponse
): void {
  if (!isLocale(locale)) return;
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}

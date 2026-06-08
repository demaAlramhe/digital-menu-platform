import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  applyPublicLocaleFromQuery,
  setLocaleCookieOnResponse,
} from "@/lib/middleware/public-locale";
import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_COOKIE,
  type Locale,
} from "@/lib/i18n/types";
import { getSupabaseUrl } from "@/lib/supabase/url";

type CookieToSet = {
  name: string;
  value: string;
  options?: {
    domain?: string;
    expires?: Date;
    httpOnly?: boolean;
    maxAge?: number;
    path?: string;
    sameSite?: "lax" | "strict" | "none" | boolean;
    secure?: boolean;
  };
};

export async function middleware(request: NextRequest) {
  const localeRedirect = applyPublicLocaleFromQuery(
    request,
    NextResponse.next({ request })
  );
  if (localeRedirect) {
    return localeRedirect;
  }

  let response = NextResponse.next({ request });

  const langParam = request.nextUrl.searchParams.get("lang");
  if (isLocale(langParam)) {
    setLocaleCookieOnResponse(langParam, response);
  } else {
    const existingLocale = request.cookies.get(LOCALE_COOKIE)?.value;
    if (!isLocale(existingLocale)) {
      const detected = detectLocaleFromAcceptLanguage(
        request.headers.get("accept-language")
      );
      setLocaleCookieOnResponse(detected, response);
    }
  }

  const pathname = request.nextUrl.pathname;
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginRoute = pathname.startsWith("/auth/login");
  const needsAuth =
    isDashboardRoute || isAdminRoute || isLoginRoute || pathname === "/auth/redirect";

  if (!needsAuth) {
    return response;
  }

  const supabase = createServerClient(
    getSupabaseUrl(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if ((isDashboardRoute || isAdminRoute) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  if (isLoginRoute && user && !request.nextUrl.searchParams.has("error")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/redirect";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

function detectLocaleFromAcceptLanguage(header: string | null): Locale {
  if (!header) {
    return DEFAULT_LOCALE;
  }

  const first = header.split(",")[0]?.trim().toLowerCase() ?? "";

  if (first.startsWith("ar")) {
    return "ar";
  }
  if (first.startsWith("he")) {
    return "he";
  }
  if (first.startsWith("en")) {
    return "en";
  }

  return DEFAULT_LOCALE;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};

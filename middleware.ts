import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { resolvePostLoginPath } from "@/lib/auth/resolve-post-login-path";
import {
  applyPublicLocaleFromQuery,
  isPublicStorePath,
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
      const pathname = request.nextUrl.pathname;
      const useArabicDefault =
        pathname === "/" || isPublicStorePath(pathname);
      const initialLocale = useArabicDefault
        ? DEFAULT_LOCALE
        : detectLocaleFromAcceptLanguage(
            request.headers.get("accept-language")
          );
      setLocaleCookieOnResponse(initialLocale, response);
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

  if (isDashboardRoute || isAdminRoute) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      return NextResponse.redirect(url);
    }

    const parsedIdleMinutes = Number.parseInt(
      process.env.IDLE_TIMEOUT_MINUTES ?? "",
      10
    );
    const idleTimeoutMinutes =
      Number.isFinite(parsedIdleMinutes) && parsedIdleMinutes > 0
        ? parsedIdleMinutes
        : 30;
    const idleTimeoutMs = idleTimeoutMinutes * 60 * 1000;
    const lastActivityCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: Math.floor(idleTimeoutMs / 1000),
    };

    const lastActivity = request.cookies.get("last_activity")?.value;
    if (!lastActivity) {
      response.cookies.set(
        "last_activity",
        String(Date.now()),
        lastActivityCookieOptions
      );
    } else {
      const lastActivityAt = Number(lastActivity);
      if (Date.now() - lastActivityAt > idleTimeoutMs) {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/login";
        url.search = "?error=session_expired";
        const redirectResponse = NextResponse.redirect(url);

        // signOut() writes session-clearing cookies via setAll onto `response`.
        // Point that binding at the redirect first, and copy cookies already
        // set on the next() response (locale, token refresh) so they are not lost.
        for (const cookie of response.cookies.getAll()) {
          redirectResponse.cookies.set(cookie);
        }
        response = redirectResponse;
        await supabase.auth.signOut();
        response.cookies.delete("last_activity");
        return response;
      }

      response.cookies.set(
        "last_activity",
        String(Date.now()),
        lastActivityCookieOptions
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    // Fail open on a genuine query error (network/transient) — let the page-level guard
    // (require-super-admin.ts / require-store-owner.ts) handle it, don't bounce a
    // legitimate user due to a transient failure here.
    if (!profileError) {
      const requiredRole = isAdminRoute ? "super_admin" : "store_owner";
      if (profile?.role !== requiredRole) {
        const target = resolvePostLoginPath(profile);
        const [path, query] = target.split("?");
        const url = request.nextUrl.clone();
        url.pathname = path;
        url.search = query ? `?${query}` : "";
        return NextResponse.redirect(url);
      }
    }
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

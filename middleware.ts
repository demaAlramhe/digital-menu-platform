import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  applyPublicLocaleFromQuery,
  setLocaleCookieOnResponse,
} from "@/lib/middleware/public-locale";
import { isLocale } from "@/lib/i18n/types";
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

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};

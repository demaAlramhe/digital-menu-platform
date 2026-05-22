import { NextResponse } from "next/server";
import { LOCALE_COOKIE } from "@/lib/i18n/types";
import { parseJsonBody } from "@/lib/api/validation";
import { localePostSchema } from "@/lib/api/schemas";

export async function POST(req: Request) {
  try {
    const parsed = await parseJsonBody(req, localePostSchema);
    if (parsed.error) {
      return parsed.error;
    }

    const { locale } = parsed.data;

    const response = NextResponse.json({ success: true, locale });
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Failed to set locale." },
      { status: 500 }
    );
  }
}

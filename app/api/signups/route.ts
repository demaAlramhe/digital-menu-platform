import { NextResponse } from "next/server";
import { signupPostSchema } from "@/lib/api/schemas";
import { parseJsonBody } from "@/lib/api/validation";
import { verifyTurnstileToken } from "@/lib/security/verify-turnstile";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const parsed = await parseJsonBody(req, signupPostSchema);
    if (parsed.error) {
      return parsed.error;
    }

    const {
      full_name,
      restaurant_name,
      email,
      whatsapp,
      plan,
      notes,
      estimated_items,
      turnstileToken,
    } = parsed.data;

    const turnstileOk = await verifyTurnstileToken(
      turnstileToken,
      req.headers.get("x-forwarded-for") ?? undefined
    );
    if (!turnstileOk) {
      return NextResponse.json(
        { error: "فشل التحقق الأمني. حاول مرة أخرى." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const normalizedEmail = email.trim().toLowerCase();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: recentSignup, error: recentError } = await supabase
      .from("pending_signups")
      .select("id")
      .eq("email", normalizedEmail)
      .gte("created_at", since)
      .maybeSingle();

    if (recentError) {
      return NextResponse.json(
        { error: "Failed to validate signup request." },
        { status: 500 }
      );
    }

    if (recentSignup) {
      return NextResponse.json(
        {
          error:
            "تم إرسال طلب بهذا الإيميل خلال آخر 24 ساعة. سنتواصل معك قريباً.",
        },
        { status: 429 }
      );
    }

    const { error: insertError } = await supabase.from("pending_signups").insert({
      full_name,
      restaurant_name,
      email: normalizedEmail,
      whatsapp,
      plan,
      notes: notes?.trim() || null,
      estimated_items: estimated_items?.trim() || null,
      status: "pending",
    });

    if (insertError) {
      return NextResponse.json(
        { error: "Failed to submit signup request." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}

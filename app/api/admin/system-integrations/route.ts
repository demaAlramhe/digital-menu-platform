import { NextResponse } from "next/server";
import { requireApiSuperAdmin } from "@/lib/auth/api-auth";
import { logAdminAction } from "@/lib/auth/audit-log";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseJsonBody } from "@/lib/api/validation";
import { systemIntegrationPostSchema } from "@/lib/api/schemas";

export async function POST(req: Request) {
  try {
    const auth = await requireApiSuperAdmin();
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const parsed = await parseJsonBody(req, systemIntegrationPostSchema);
    if (parsed.error) {
      return parsed.error;
    }

    const { name, category, status, expires_at, renewal_url, notes } =
      parsed.data;

    const supabase = createAdminClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("system_integrations")
      .insert({
        name,
        category,
        status: status ?? "active",
        expires_at: expires_at ?? null,
        renewal_url: renewal_url ?? null,
        notes: notes ?? null,
        updated_at: now,
      })
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        {
          error: "Failed to create system integration.",
          details: error,
        },
        { status: 500 }
      );
    }

    await logAdminAction(supabase, {
      actorId: auth.auth.user.id,
      actorEmail: auth.auth.user.email,
      action: "system_integration.create",
      targetType: "system_integration",
      targetId: data.id,
      metadata: {
        name: data.name,
        category: data.category,
        status: data.status,
      },
    });

    return NextResponse.json({ success: true, integration: data });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unexpected server error.",
        details: String(error),
      },
      { status: 500 }
    );
  }
}

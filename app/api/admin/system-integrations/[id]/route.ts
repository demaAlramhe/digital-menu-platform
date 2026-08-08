import { NextResponse } from "next/server";
import { requireApiSuperAdmin } from "@/lib/auth/api-auth";
import { logAdminAction } from "@/lib/auth/audit-log";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseJsonBody } from "@/lib/api/validation";
import { systemIntegrationPatchSchema } from "@/lib/api/schemas";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const auth = await requireApiSuperAdmin();
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const parsed = await parseJsonBody(req, systemIntegrationPatchSchema);
    if (parsed.error) {
      return parsed.error;
    }

    const { id } = await params;
    const body = parsed.data;

    if (Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: "No fields to update." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: existing, error: existingError } = await supabase
      .from("system_integrations")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json(
        {
          error: "Failed to load system integration before update.",
          details: existingError,
        },
        { status: 500 }
      );
    }

    if (!existing) {
      return NextResponse.json(
        { error: "System integration not found." },
        { status: 404 }
      );
    }

    const updatePayload: {
      updated_at: string;
      name?: string;
      category?: string;
      status?: string;
      expires_at?: string | null;
      renewal_url?: string | null;
      notes?: string | null;
    } = {
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) updatePayload.name = body.name;
    if (body.category !== undefined) updatePayload.category = body.category;
    if (body.status !== undefined) updatePayload.status = body.status;
    if (body.expires_at !== undefined) updatePayload.expires_at = body.expires_at;
    if (body.renewal_url !== undefined) {
      updatePayload.renewal_url = body.renewal_url;
    }
    if (body.notes !== undefined) updatePayload.notes = body.notes;

    const { data: updated, error: updateError } = await supabase
      .from("system_integrations")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (updateError) {
      return NextResponse.json(
        {
          error: "Failed to update system integration.",
          details: updateError,
        },
        { status: 500 }
      );
    }

    if (!updated) {
      return NextResponse.json(
        { error: "System integration update returned no row." },
        { status: 404 }
      );
    }

    await logAdminAction(supabase, {
      actorId: auth.auth.user.id,
      actorEmail: auth.auth.user.email,
      action: "system_integration.update",
      targetType: "system_integration",
      targetId: id,
      metadata: {
        before: {
          name: existing.name,
          category: existing.category,
          status: existing.status,
          expires_at: existing.expires_at,
        },
        after: {
          name: updated.name,
          category: updated.category,
          status: updated.status,
          expires_at: updated.expires_at,
        },
      },
    });

    return NextResponse.json({ success: true, integration: updated });
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

export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    const auth = await requireApiSuperAdmin();
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const { id } = await params;
    const supabase = createAdminClient();

    const { data: existing, error: existingError } = await supabase
      .from("system_integrations")
      .select("id, name, category, status")
      .eq("id", id)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json(
        {
          error: "Failed to load system integration before delete.",
          details: existingError,
        },
        { status: 500 }
      );
    }

    if (!existing) {
      return NextResponse.json(
        { error: "System integration not found." },
        { status: 404 }
      );
    }

    const { error: deleteError } = await supabase
      .from("system_integrations")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json(
        {
          error: "Failed to delete system integration.",
          details: deleteError,
        },
        { status: 500 }
      );
    }

    await logAdminAction(supabase, {
      actorId: auth.auth.user.id,
      actorEmail: auth.auth.user.email,
      action: "system_integration.delete",
      targetType: "system_integration",
      targetId: id,
      metadata: {
        name: existing.name,
        category: existing.category,
        status: existing.status,
      },
    });

    return NextResponse.json({ success: true });
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

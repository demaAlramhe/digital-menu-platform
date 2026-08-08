import { NextResponse } from "next/server";
import { requireApiSuperAdmin } from "@/lib/auth/api-auth";
import { logAdminAction } from "@/lib/auth/audit-log";
import { createAdminClient } from "../../../../../lib/supabase/admin";
import { parseJsonBody } from "@/lib/api/validation";
import { adminPatchStoreSchema } from "@/lib/api/schemas";

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const auth = await requireApiSuperAdmin();
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const parsed = await parseJsonBody(req, adminPatchStoreSchema);
    if (parsed.error) {
      return parsed.error;
    }

    const { storeId } = await params;
    const {
      name,
      slug,
      logoUrl,
      bannerUrl,
      primaryColor,
      secondaryColor,
      phone,
      email,
      address,
      status,
      plan,
    } = parsed.data;

    const supabase = createAdminClient();

    const { data: updatedStore, error } = await supabase
      .from("stores")
      .update({
        name: name.trim(),
        slug: normalizeSlug(slug),
        logo_url: logoUrl || null,
        banner_url: bannerUrl || null,
        primary_color: primaryColor || "#111827",
        secondary_color: secondaryColor || "#f59e0b",
        phone: phone || null,
        email: email || null,
        address: address || null,
        status: status || "active",
        ...(plan !== undefined ? { plan } : {}),
      })
      .eq("id", storeId)
      .is("deleted_at", null)
      .select()
      .single();

    if (error || !updatedStore) {
      return NextResponse.json(
        { error: "Failed to update store.", details: error },
        { status: 500 }
      );
    }

    await logAdminAction(supabase, {
      actorId: auth.auth.user.id,
      actorEmail: auth.auth.user.email,
      action: "store.update",
      targetType: "store",
      targetId: storeId,
      metadata: { changes: parsed.data },
    });

    return NextResponse.json({
      success: true,
      store: updatedStore,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected server error.", details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const auth = await requireApiSuperAdmin();
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const { storeId } = await params;
    const supabase = createAdminClient();

    const { data: store, error: loadError } = await supabase
      .from("stores")
      .select("id, name")
      .eq("id", storeId)
      .is("deleted_at", null)
      .maybeSingle();

    if (loadError) {
      return NextResponse.json(
        { error: "Failed to load store.", details: loadError },
        { status: 500 }
      );
    }

    if (!store) {
      return NextResponse.json({ error: "Store not found." }, { status: 404 });
    }

    const deletedAt = new Date().toISOString();

    const { data: softDeleted, error: deleteError } = await supabase
      .from("stores")
      .update({ deleted_at: deletedAt })
      .eq("id", storeId)
      .is("deleted_at", null)
      .select("id, deleted_at")
      .maybeSingle();

    if (deleteError || !softDeleted?.deleted_at) {
      return NextResponse.json(
        { error: "Failed to delete store.", details: deleteError },
        { status: 500 }
      );
    }

    await supabase
      .from("menu_categories")
      .update({ deleted_at: deletedAt })
      .eq("store_id", storeId)
      .is("deleted_at", null);

    await supabase
      .from("menu_items")
      .update({ deleted_at: deletedAt })
      .eq("store_id", storeId)
      .is("deleted_at", null);

    await logAdminAction(supabase, {
      actorId: auth.auth.user.id,
      actorEmail: auth.auth.user.email,
      action: "store.delete",
      targetType: "store",
      targetId: storeId,
      metadata: { storeName: store.name },
    });

    return NextResponse.json({ success: true, storeName: store.name });
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected server error.", details: String(error) },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { requireApiSuperAdmin } from "@/lib/auth/api-auth";
import { createAdminClient } from "../../../../../../lib/supabase/admin";
import { parseJsonBody } from "@/lib/api/validation";
import { adminStoreStatusSchema } from "@/lib/api/schemas";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const auth = await requireApiSuperAdmin();
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const parsed = await parseJsonBody(req, adminStoreStatusSchema);
    if (parsed.error) {
      return parsed.error;
    }

    const { storeId } = await params;
    const { status } = parsed.data;

    const supabase = createAdminClient();

    const { data: existingStore, error: existingStoreError } = await supabase
      .from("stores")
      .select("id, name, status")
      .eq("id", storeId)
      .maybeSingle();

    if (existingStoreError) {
      return NextResponse.json(
        {
          error: "Failed to load store before update.",
          details: existingStoreError,
        },
        { status: 500 }
      );
    }

    if (!existingStore) {
      return NextResponse.json(
        { error: "Store not found." },
        { status: 404 }
      );
    }

    const { data: updatedStore, error: updateError } = await supabase
      .from("stores")
      .update({
        status,
      })
      .eq("id", storeId)
      .select()
      .maybeSingle();

    if (updateError) {
      return NextResponse.json(
        {
          error: "Failed to update store status.",
          details: updateError,
        },
        { status: 500 }
      );
    }

    if (!updatedStore) {
      return NextResponse.json(
        {
          error: "Store status update returned no row.",
          storeId,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      store: updatedStore,
    });
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
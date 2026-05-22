import { NextResponse } from "next/server";
import { requireApiSuperAdmin } from "@/lib/auth/api-auth";
import { createAdminClient } from "../../../../../../lib/supabase/admin";
import { parseJsonBody } from "@/lib/api/validation";
import { adminUserStoreSchema } from "@/lib/api/schemas";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const auth = await requireApiSuperAdmin();
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const parsed = await parseJsonBody(req, adminUserStoreSchema);
    if (parsed.error) {
      return parsed.error;
    }

    const { userId } = await params;
    const { storeId } = parsed.data;

    const supabase = createAdminClient();

    const { data: existingProfile, error: existingProfileError } = await supabase
      .from("profiles")
      .select("id, role, store_id")
      .eq("id", userId)
      .maybeSingle();

    if (existingProfileError) {
      return NextResponse.json(
        {
          error: "Failed to load user profile before update.",
          details: existingProfileError,
        },
        { status: 500 }
      );
    }

    if (!existingProfile) {
      return NextResponse.json(
        { error: "User profile not found." },
        { status: 404 }
      );
    }

    if (existingProfile.role === "super_admin") {
      return NextResponse.json(
        { error: "Super admin cannot be assigned to a store." },
        { status: 400 }
      );
    }

    if (storeId) {
      const { data: existingStore, error: storeError } = await supabase
        .from("stores")
        .select("id")
        .eq("id", storeId)
        .maybeSingle();

      if (storeError) {
        return NextResponse.json(
          {
            error: "Failed to validate selected store.",
            details: storeError,
          },
          { status: 500 }
        );
      }

      if (!existingStore) {
        return NextResponse.json(
          { error: "Selected store not found." },
          { status: 404 }
        );
      }
    }

    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({
        store_id: storeId,
      })
      .eq("id", userId)
      .select()
      .single();

    if (updateError || !updatedProfile) {
      return NextResponse.json(
        {
          error: "Failed to update user store assignment.",
          details: updateError,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
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

import { NextResponse } from "next/server";
import { requireApiSuperAdmin } from "@/lib/auth/api-auth";
import { createAdminClient } from "../../../../../../lib/supabase/admin";
import { parseJsonBody } from "@/lib/api/validation";
import { adminUserRoleSchema } from "@/lib/api/schemas";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const auth = await requireApiSuperAdmin();
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const parsed = await parseJsonBody(req, adminUserRoleSchema);
    if (parsed.error) {
      return parsed.error;
    }

    const { userId } = await params;
    const { role } = parsed.data;

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

    if (role === "store_owner" && !existingProfile.store_id) {
      return NextResponse.json(
        {
          error: "Cannot assign role store_owner to a user without an assigned store. Assign a store first.",
        },
        { status: 400 }
      );
    }

    const updatePayload =
      role === "super_admin"
        ? {
            role,
            store_id: null,
          }
        : {
            role,
          };

    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", userId)
      .select()
      .single();

    if (updateError || !updatedProfile) {
      return NextResponse.json(
        {
          error: "Failed to update user role.",
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
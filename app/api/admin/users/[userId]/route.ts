import { NextResponse } from "next/server";
import { requireApiSuperAdmin } from "@/lib/auth/api-auth";
import { createAdminClient } from "../../../../../lib/supabase/admin";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const auth = await requireApiSuperAdmin();
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const { userId } = await params;

    if (userId === auth.auth.user.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: targetProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json(
        { error: "Failed to load user profile.", details: profileError },
        { status: 500 }
      );
    }

    const { data: authUserData, error: authUserError } =
      await supabase.auth.admin.getUserById(userId);

    if (authUserError && authUserError.status !== 404) {
      return NextResponse.json(
        {
          error: "Failed to load auth user.",
          details: authUserError.message,
        },
        { status: 500 }
      );
    }

    if (!targetProfile && !authUserData?.user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (targetProfile?.role === "super_admin") {
      const { count, error: countError } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "super_admin");

      if (countError) {
        return NextResponse.json(
          { error: "Failed to verify super admin count.", details: countError },
          { status: 500 }
        );
      }

      if ((count ?? 0) <= 1) {
        return NextResponse.json(
          { error: "Cannot delete the last super admin." },
          { status: 400 }
        );
      }
    }

    if (authUserData?.user) {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

      if (deleteError) {
        return NextResponse.json(
          {
            error: deleteError.message || "Failed to delete user.",
            details: deleteError,
          },
          { status: deleteError.status ?? 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    // Orphan profile: row in profiles without a matching auth.users record.
    const { error: profileDeleteError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileDeleteError) {
      return NextResponse.json(
        {
          error: "Failed to delete orphaned profile.",
          details: profileDeleteError,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, orphanedProfile: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected server error.", details: String(error) },
      { status: 500 }
    );
  }
}

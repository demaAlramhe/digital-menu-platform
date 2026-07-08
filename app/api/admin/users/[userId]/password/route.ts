import { NextResponse } from "next/server";
import { requireApiSuperAdmin } from "@/lib/auth/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseJsonBody } from "@/lib/api/validation";
import { adminUserPasswordPatchSchema } from "@/lib/api/schemas";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const auth = await requireApiSuperAdmin();
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const parsed = await parseJsonBody(req, adminUserPasswordPatchSchema);
    if (parsed.error) {
      return parsed.error;
    }

    const { userId } = await params;
    const password = parsed.data.password;

    const supabase = createAdminClient();

    const { data: existingProfile, error: existingProfileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (existingProfileError) {
      return NextResponse.json(
        {
          error: "Failed to load user profile before password update.",
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

    const { data: authUserData, error: authUserError } =
      await supabase.auth.admin.getUserById(userId);

    if (authUserError) {
      return NextResponse.json(
        {
          error: "Failed to load auth user before password update.",
          details: authUserError,
        },
        { status: 500 }
      );
    }

    if (!authUserData?.user) {
      return NextResponse.json(
        { error: "Auth user not found." },
        { status: 404 }
      );
    }

    const { data: updatedAuthUser, error: passwordUpdateError } =
      await supabase.auth.admin.updateUserById(userId, {
        password,
      });

    if (passwordUpdateError || !updatedAuthUser?.user) {
      return NextResponse.json(
        {
          error: "Failed to update user password.",
          details: passwordUpdateError,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      userId: updatedAuthUser.user.id,
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

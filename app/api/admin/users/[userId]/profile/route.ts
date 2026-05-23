import { NextResponse } from "next/server";
import { requireApiSuperAdmin } from "@/lib/auth/api-auth";
import { createAdminClient } from "../../../../../../lib/supabase/admin";
import { parseJsonBody } from "@/lib/api/validation";
import { adminUserProfilePatchSchema } from "@/lib/api/schemas";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isDuplicateEmailError(message: string | undefined) {
  if (!message) return false;
  const lower = message.toLowerCase();
  return (
    lower.includes("already") ||
    lower.includes("duplicate") ||
    lower.includes("registered") ||
    lower.includes("exists")
  );
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const auth = await requireApiSuperAdmin();
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const parsed = await parseJsonBody(req, adminUserProfilePatchSchema);
    if (parsed.error) {
      return parsed.error;
    }

    const { userId } = await params;
    const trimmedName = parsed.data.fullName.trim();
    const normalizedEmail = normalizeEmail(parsed.data.email);

    const supabase = createAdminClient();

    const { data: existingProfile, error: existingProfileError } = await supabase
      .from("profiles")
      .select("id, full_name, role, store_id")
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

    const { data: authUserData, error: authUserError } =
      await supabase.auth.admin.getUserById(userId);

    if (authUserError) {
      return NextResponse.json(
        {
          error: "Failed to load auth user before update.",
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

    const currentEmail = normalizeEmail(authUserData.user.email ?? "");
    const currentName = (existingProfile.full_name ?? "").trim();
    const nameChanged = trimmedName !== currentName;
    const emailChanged = normalizedEmail !== currentEmail;

    if (!nameChanged && !emailChanged) {
      return NextResponse.json({
        success: true,
        profile: existingProfile,
        email: authUserData.user.email,
        unchanged: true,
      });
    }

    let profile = existingProfile;

    if (nameChanged) {
      const { data: updatedProfile, error: profileUpdateError } = await supabase
        .from("profiles")
        .update({ full_name: trimmedName })
        .eq("id", userId)
        .select("id, full_name, role, store_id")
        .single();

      if (profileUpdateError || !updatedProfile) {
        return NextResponse.json(
          {
            error: "Failed to update user full name.",
            details: profileUpdateError,
          },
          { status: 500 }
        );
      }

      profile = updatedProfile;
    }

    if (emailChanged) {
      const { data: updatedAuthUser, error: emailUpdateError } =
        await supabase.auth.admin.updateUserById(userId, {
          email: normalizedEmail,
          email_confirm: true,
        });

      if (emailUpdateError || !updatedAuthUser.user) {
        const message = emailUpdateError?.message;
        const status = isDuplicateEmailError(message) ? 409 : 500;

        return NextResponse.json(
          {
            error: isDuplicateEmailError(message)
              ? "This email is already in use by another account."
              : "Failed to update user email.",
            details: emailUpdateError,
          },
          { status }
        );
      }
    }

    return NextResponse.json({
      success: true,
      profile,
      email: emailChanged ? normalizedEmail : authUserData.user.email,
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

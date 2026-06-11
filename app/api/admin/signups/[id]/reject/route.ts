import { NextResponse } from "next/server";
import { requireApiSuperAdmin } from "@/lib/auth/api-auth";
import { createAdminClient } from "../../../../../../lib/supabase/admin";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireApiSuperAdmin();
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const { id } = await params;
    const supabase = createAdminClient();

    const { data: signup, error: signupError } = await supabase
      .from("pending_signups")
      .select("id, status")
      .eq("id", id)
      .maybeSingle();

    if (signupError) {
      return NextResponse.json(
        { error: "Failed to load signup request." },
        { status: 500 }
      );
    }

    if (!signup) {
      return NextResponse.json({ error: "Signup not found." }, { status: 404 });
    }

    if (signup.status !== "pending") {
      return NextResponse.json(
        { error: "Only pending signups can be rejected." },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase
      .from("pending_signups")
      .update({ status: "rejected" })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to reject signup." },
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

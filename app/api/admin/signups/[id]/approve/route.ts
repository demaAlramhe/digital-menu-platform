import { NextResponse } from "next/server";
import { requireApiSuperAdmin } from "@/lib/auth/api-auth";
import { generateSecurePassword } from "@/lib/signups/generate-password";
import { generateUniqueStoreSlug } from "@/lib/signups/generate-store-slug";
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
      .select("*")
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
        { error: "Only pending signups can be approved." },
        { status: 400 }
      );
    }

    const slug = await generateUniqueStoreSlug(supabase, signup.restaurant_name);
    const password = generateSecurePassword(12);
    const normalizedEmail = signup.email.trim().toLowerCase();

    const { data: authLookup } = await supabase.auth.admin.listUsers();
    const emailTaken = authLookup?.users?.some(
      (user) => user.email?.toLowerCase() === normalizedEmail
    );

    if (emailTaken) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const { data: createdUser, error: userError } =
      await supabase.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true,
      });

    if (userError || !createdUser.user) {
      return NextResponse.json(
        { error: "Failed to create owner user.", details: userError },
        { status: 500 }
      );
    }

    const { data: store, error: storeError } = await supabase
      .from("stores")
      .insert({
        name: signup.restaurant_name.trim(),
        slug,
        status: "active",
        default_content_language: "ar",
        phone: signup.whatsapp.trim(),
        whatsapp_number: signup.whatsapp.trim(),
        email: normalizedEmail,
      })
      .select("id, slug, name")
      .single();

    if (storeError || !store) {
      await supabase.auth.admin.deleteUser(createdUser.user.id);
      return NextResponse.json(
        { error: "Failed to create store.", details: storeError },
        { status: 500 }
      );
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: createdUser.user.id,
      full_name: signup.full_name.trim(),
      role: "store_owner",
      store_id: store.id,
    });

    if (profileError) {
      await supabase.from("stores").delete().eq("id", store.id);
      await supabase.auth.admin.deleteUser(createdUser.user.id);
      return NextResponse.json(
        { error: "Failed to create profile.", details: profileError },
        { status: 500 }
      );
    }

    await supabase.from("menu_categories").insert({
      store_id: store.id,
      name: "General",
      slug: "general",
      sort_order: 0,
      is_active: true,
    });

    const { error: updateError } = await supabase
      .from("pending_signups")
      .update({
        status: "approved",
        approved_store_id: store.id,
      })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json(
        { error: "Store created but failed to update signup status." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      credentials: {
        full_name: signup.full_name,
        email: normalizedEmail,
        password,
        store_slug: slug,
        store_name: store.name,
        dashboard_url: "/dashboard",
        menu_url: `/${slug}`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected server error.", details: String(error) },
      { status: 500 }
    );
  }
}

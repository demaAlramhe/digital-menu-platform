import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { normalizeSlug } from "@/lib/utils/slug";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      slug,
      sortOrder,
      isActive,
    }: {
      name?: string;
      slug?: string;
      sortOrder?: number;
      isActive?: boolean;
    } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required." },
        { status: 400 }
      );
    }

    const userSupabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await userSupabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { data: profile, error: profileError } = await userSupabase
      .from("profiles")
      .select("store_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.store_id) {
      return NextResponse.json(
        { error: "No store is linked to this account." },
        { status: 403 }
      );
    }

    const supabase = createAdminClient();

    const { data: category, error: categoryError } = await supabase
      .from("menu_categories")
      .insert({
        store_id: profile.store_id,
        name: name.trim(),
        slug: normalizeSlug(slug),
        sort_order: sortOrder ?? 0,
        is_active: isActive ?? true,
      })
      .select()
      .single();

    if (categoryError || !category) {
      return NextResponse.json(
        { error: "Failed to create category.", details: categoryError },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected server error.", details: String(error) },
      { status: 500 }
    );
  }
}

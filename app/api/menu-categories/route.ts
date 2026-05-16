import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveOwnerStoreIdForApi } from "@/lib/auth/resolve-owner-store";
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

    const { storeId, errorResponse } = await resolveOwnerStoreIdForApi();
    if (errorResponse) {
      return errorResponse;
    }

    const supabase = createAdminClient();

    const { data: category, error: categoryError } = await supabase
      .from("menu_categories")
      .insert({
        store_id: storeId,
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

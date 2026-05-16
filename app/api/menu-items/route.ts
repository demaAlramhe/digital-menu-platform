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
      description,
      price,
      isActive,
      isFeatured,
      sortOrder,
      imageUrl,
      categoryId,
    }: {
      name?: string;
      slug?: string;
      description?: string;
      price?: number;
      isActive?: boolean;
      isFeatured?: boolean;
      sortOrder?: number;
      imageUrl?: string;
      categoryId?: string | null;
    } = body;

    if (!name || !slug || price === undefined || price === null) {
      return NextResponse.json(
        { error: "Name, slug, and price are required." },
        { status: 400 }
      );
    }

    const { storeId, errorResponse } = await resolveOwnerStoreIdForApi();
    if (errorResponse) {
      return errorResponse;
    }

    const supabase = createAdminClient();

    let resolvedCategoryId = categoryId ?? null;

    if (!resolvedCategoryId) {
      const { data: category } = await supabase
        .from("menu_categories")
        .select("id")
        .eq("store_id", storeId)
        .eq("slug", "general")
        .maybeSingle();

      resolvedCategoryId = category?.id ?? null;
    }

    const { data: menuItem, error: menuItemError } = await supabase
      .from("menu_items")
      .insert({
        store_id: storeId,
        category_id: resolvedCategoryId,
        name: name.trim(),
        slug: normalizeSlug(slug),
        description: description || null,
        image_url: imageUrl || null,
        price,
        is_active: isActive ?? true,
        is_featured: isFeatured ?? false,
        sort_order: sortOrder ?? 0,
      })
      .select()
      .single();

    if (menuItemError || !menuItem) {
      return NextResponse.json(
        { error: "Failed to create menu item.", details: menuItemError },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      menuItem,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected server error.", details: String(error) },
      { status: 500 }
    );
  }
}

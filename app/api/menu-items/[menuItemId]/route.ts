import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeSlug } from "@/lib/utils/slug";

type PatchBody = {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  imageUrl?: string;
  categoryId?: string | null;
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ menuItemId: string }> }
) {
  try {
    const { menuItemId } = await params;
    const body: PatchBody = await req.json();

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
    } = body;

    if (!name || !slug || price === undefined || price === null) {
      return NextResponse.json(
        { error: "Name, slug, and price are required." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: updatedMenuItem, error } = await supabase
      .from("menu_items")
      .update({
        name: name.trim(),
        slug: normalizeSlug(slug),
        description: description || null,
        image_url: imageUrl || null,
        price,
        is_active: isActive ?? true,
        is_featured: isFeatured ?? false,
        sort_order: sortOrder ?? 0,
        category_id: categoryId ?? null,
      })
      .eq("id", menuItemId)
      .select()
      .single();

    if (error || !updatedMenuItem) {
      return NextResponse.json(
        { error: "Failed to update menu item.", details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      menuItem: updatedMenuItem,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected server error.", details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ menuItemId: string }> }
) {
  try {
    const { menuItemId } = await params;
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", menuItemId);

    if (error) {
      return NextResponse.json(
        { error: "Failed to delete menu item.", details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected server error.", details: String(error) },
      { status: 500 }
    );
  }
}

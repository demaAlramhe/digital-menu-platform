import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeSlug } from "@/lib/utils/slug";

type PatchBody = {
  name?: string;
  slug?: string;
  sortOrder?: number;
  isActive?: boolean;
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params;
    const body: PatchBody = await req.json();

    const { name, slug, sortOrder, isActive } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: updatedCategory, error } = await supabase
      .from("menu_categories")
      .update({
        name: name.trim(),
        slug: normalizeSlug(slug),
        sort_order: sortOrder ?? 0,
        is_active: isActive ?? true,
      })
      .eq("id", categoryId)
      .select()
      .single();

    if (error || !updatedCategory) {
      return NextResponse.json(
        { error: "Failed to update category.", details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      category: updatedCategory,
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
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params;
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("menu_categories")
      .delete()
      .eq("id", categoryId);

    if (error) {
      return NextResponse.json(
        { error: "Failed to delete category.", details: error },
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

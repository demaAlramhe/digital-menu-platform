import { NextResponse } from "next/server";
import { requireApiStoreOwner } from "@/lib/auth/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeSlug } from "@/lib/utils/slug";
import { translateContentFields } from "@/lib/ai/translate-content";
import { getStoreDefaultContentLanguage } from "@/lib/content/store-language";
import { parseJsonBody } from "@/lib/api/validation";
import { menuCategoryPatchSchema } from "@/lib/api/schemas";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const auth = await requireApiStoreOwner();
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const parsed = await parseJsonBody(req, menuCategoryPatchSchema);
    if (parsed.error) {
      return parsed.error;
    }

    const { categoryId } = await params;
    const { name, slug, sortOrder, isActive } = parsed.data;

    const supabase = createAdminClient();

    const { data: existing } = await supabase
      .from("menu_categories")
      .select("store_id")
      .eq("id", categoryId)
      .maybeSingle();

    if (!existing?.store_id || existing.store_id !== auth.storeId) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    const sourceLocale = await getStoreDefaultContentLanguage(existing.store_id);
    const nameTrimmed = name.trim();

    const { translations, status: translationStatus } =
      await translateContentFields(sourceLocale, [
        { key: "name", text: nameTrimmed, kind: "category_name" },
      ]);

    const nameT = translations.name;

    const { data: updatedCategory, error } = await supabase
      .from("menu_categories")
      .update({
        name: nameTrimmed,
        name_ar: nameT?.ar || null,
        name_he: nameT?.he || null,
        name_en: nameT?.en || null,
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
      translation: { status: translationStatus },
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
    const auth = await requireApiStoreOwner();
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const { categoryId } = await params;
    const supabase = createAdminClient();

    const { data: existing } = await supabase
      .from("menu_categories")
      .select("store_id")
      .eq("id", categoryId)
      .maybeSingle();

    if (!existing?.store_id || existing.store_id !== auth.storeId) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    const { error } = await supabase
      .from("menu_categories")
      .delete()
      .eq("id", categoryId)
      .eq("store_id", auth.storeId);

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

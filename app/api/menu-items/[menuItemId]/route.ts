import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeSlug } from "@/lib/utils/slug";
import {
  translateContentFields,
  type TranslateFieldInput,
} from "@/lib/ai/translate-content";
import { getStoreDefaultContentLanguage } from "@/lib/content/store-language";

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

    const { data: existing } = await supabase
      .from("menu_items")
      .select("store_id")
      .eq("id", menuItemId)
      .maybeSingle();

    if (!existing?.store_id) {
      return NextResponse.json({ error: "Menu item not found." }, { status: 404 });
    }

    const sourceLocale = await getStoreDefaultContentLanguage(existing.store_id);
    const nameTrimmed = name.trim();
    const descriptionTrimmed = description?.trim() ?? "";

    const translateInputs: TranslateFieldInput[] = [
      { key: "name", text: nameTrimmed, kind: "menu_item_name" },
    ];
    if (descriptionTrimmed) {
      translateInputs.push({
        key: "description",
        text: descriptionTrimmed,
        kind: "menu_item_description",
      });
    }

    const translations = await translateContentFields(
      sourceLocale,
      translateInputs
    );

    const nameT = translations.name;
    const descT = translations.description;

    const { data: updatedMenuItem, error } = await supabase
      .from("menu_items")
      .update({
        name: nameTrimmed,
        name_ar: nameT?.ar || null,
        name_he: nameT?.he || null,
        name_en: nameT?.en || null,
        slug: normalizeSlug(slug),
        description: descriptionTrimmed || null,
        description_ar: descT?.ar || null,
        description_he: descT?.he || null,
        description_en: descT?.en || null,
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

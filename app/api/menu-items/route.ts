import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveOwnerStoreIdForApi } from "@/lib/auth/resolve-owner-store";
import { categoryBelongsToStore } from "@/lib/auth/verify-store-resource";
import { normalizeSlug } from "@/lib/utils/slug";
import {
  translateContentFields,
  type TranslateFieldInput,
} from "@/lib/ai/translate-content";
import { getStoreDefaultContentLanguage } from "@/lib/content/store-language";
import { parseJsonBody } from "@/lib/api/validation";
import { menuItemPostSchema } from "@/lib/api/schemas";

export async function POST(req: Request) {
  try {
    const parsed = await parseJsonBody(req, menuItemPostSchema);
    if (parsed.error) {
      return parsed.error;
    }

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
    } = parsed.data;

    const { storeId, errorResponse } = await resolveOwnerStoreIdForApi();
    if (errorResponse) {
      return errorResponse;
    }

    const sourceLocale = await getStoreDefaultContentLanguage(storeId);
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

    const { translations, status: translationStatus } =
      await translateContentFields(sourceLocale, translateInputs);

    const nameT = translations.name;
    const descT = translations.description;

    const supabase = createAdminClient();

    let resolvedCategoryId = categoryId ?? null;

    if (resolvedCategoryId) {
      const valid = await categoryBelongsToStore(resolvedCategoryId, storeId);
      if (!valid) {
        return NextResponse.json(
          { error: "Category does not belong to this store." },
          { status: 400 }
        );
      }
    }

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
      translation: { status: translationStatus },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected server error.", details: String(error) },
      { status: 500 }
    );
  }
}

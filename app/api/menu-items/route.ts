import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveOwnerStoreIdForApi } from "@/lib/auth/resolve-owner-store";
import { categoryBelongsToStore } from "@/lib/auth/verify-store-resource";
import { normalizeSlug } from "@/lib/utils/slug";
import {
  translateContentFields,
  type TranslateFieldInput,
} from "@/lib/ai/translate-content";
import { trilingualColumns } from "@/lib/ai/trilingual-db";
import { getStoreDefaultContentLanguage } from "@/lib/content/store-language";
import { parseJsonBody } from "@/lib/api/validation";
import { menuItemPostSchema } from "@/lib/api/schemas";
import { getPlanItemLimit } from "@/lib/billing/plan-limits";

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
      original_price,
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

    const supabase = createAdminClient();

    const { data: store, error: storeError } = await supabase
      .from("stores")
      .select("plan")
      .eq("id", storeId)
      .single();

    if (storeError || !store) {
      return NextResponse.json(
        { error: "Failed to load store plan.", details: storeError },
        { status: 500 }
      );
    }

    const { count: currentItemCount, error: countError } = await supabase
      .from("menu_items")
      .select("id", { count: "exact", head: true })
      .eq("store_id", storeId)
      .is("deleted_at", null);

    if (countError) {
      return NextResponse.json(
        { error: "Failed to count menu items.", details: countError },
        { status: 500 }
      );
    }

    const limit = getPlanItemLimit(store.plan ?? "large");
    if (limit !== null && (currentItemCount ?? 0) + 1 > limit) {
      return NextResponse.json(
        {
          error: `Reached the item limit for your current plan (${limit} items). Contact us to upgrade.`,
        },
        { status: 400 }
      );
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
        .is("deleted_at", null)
        .maybeSingle();

      resolvedCategoryId = category?.id ?? null;
    }

    if (!resolvedCategoryId) {
      return NextResponse.json(
        {
          error:
            "No categories found. Please create at least one category first.",
        },
        { status: 400 }
      );
    }

    const { data: menuItem, error: menuItemError } = await supabase
      .from("menu_items")
      .insert({
        store_id: storeId,
        category_id: resolvedCategoryId,
        name: nameTrimmed,
        ...trilingualColumns("name", nameT),
        slug: normalizeSlug(slug),
        description: descriptionTrimmed || null,
        ...trilingualColumns("description", descT),
        image_url: imageUrl || null,
        price,
        original_price: original_price ?? null,
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

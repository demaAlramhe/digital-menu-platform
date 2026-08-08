import { NextResponse } from "next/server";
import { requireApiStoreOwner } from "@/lib/auth/api-auth";
import { categoryBelongsToStore } from "@/lib/auth/verify-store-resource";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeSlug } from "@/lib/utils/slug";
import {
  translateContentFields,
  type TranslateFieldInput,
} from "@/lib/ai/translate-content";
import { trilingualColumns } from "@/lib/ai/trilingual-db";
import { getStoreDefaultContentLanguage } from "@/lib/content/store-language";
import { parseJsonBody } from "@/lib/api/validation";
import { menuItemPatchSchema } from "@/lib/api/schemas";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ menuItemId: string }> }
) {
  try {
    const auth = await requireApiStoreOwner();
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const parsed = await parseJsonBody(req, menuItemPatchSchema);
    if (parsed.error) {
      return parsed.error;
    }

    const { menuItemId } = await params;
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

    const supabase = createAdminClient();

    const { data: existing } = await supabase
      .from("menu_items")
      .select("store_id")
      .eq("id", menuItemId)
      .is("deleted_at", null)
      .maybeSingle();

    if (!existing?.store_id || existing.store_id !== auth.storeId) {
      return NextResponse.json({ error: "Menu item not found." }, { status: 404 });
    }

    let resolvedCategoryId = categoryId ?? null;

    if (!resolvedCategoryId) {
      const { data: category } = await supabase
        .from("menu_categories")
        .select("id")
        .eq("store_id", auth.storeId)
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

    const validCategory = await categoryBelongsToStore(
      resolvedCategoryId,
      auth.storeId
    );
    if (!validCategory) {
      return NextResponse.json(
        { error: "Category does not belong to this store." },
        { status: 400 }
      );
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

    const { translations, status: translationStatus } =
      await translateContentFields(sourceLocale, translateInputs);

    const nameT = translations.name;
    const descT = translations.description;

    const { data: updatedMenuItem, error } = await supabase
      .from("menu_items")
      .update({
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
        category_id: resolvedCategoryId,
      })
      .eq("id", menuItemId)
      .eq("store_id", auth.storeId)
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
  { params }: { params: Promise<{ menuItemId: string }> }
) {
  try {
    const auth = await requireApiStoreOwner();
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const { menuItemId } = await params;
    const supabase = createAdminClient();

    const { data: existing } = await supabase
      .from("menu_items")
      .select("store_id")
      .eq("id", menuItemId)
      .is("deleted_at", null)
      .maybeSingle();

    if (!existing?.store_id || existing.store_id !== auth.storeId) {
      return NextResponse.json({ error: "Menu item not found." }, { status: 404 });
    }

    const deletedAt = new Date().toISOString();

    const { error } = await supabase
      .from("menu_items")
      .update({ deleted_at: deletedAt })
      .eq("id", menuItemId)
      .eq("store_id", auth.storeId)
      .is("deleted_at", null);

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

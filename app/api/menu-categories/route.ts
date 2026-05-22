import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveOwnerStoreIdForApi } from "@/lib/auth/resolve-owner-store";
import { normalizeSlug } from "@/lib/utils/slug";
import { translateContentFields } from "@/lib/ai/translate-content";
import { getStoreDefaultContentLanguage } from "@/lib/content/store-language";

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

    const sourceLocale = await getStoreDefaultContentLanguage(storeId);
    const nameTrimmed = name.trim();

    const translations = await translateContentFields(sourceLocale, [
      { key: "name", text: nameTrimmed, kind: "category_name" },
    ]);

    const nameT = translations.name;
    const supabase = createAdminClient();

    const { data: category, error: categoryError } = await supabase
      .from("menu_categories")
      .insert({
        store_id: storeId,
        name: nameTrimmed,
        name_ar: nameT?.ar || null,
        name_he: nameT?.he || null,
        name_en: nameT?.en || null,
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

import { NextResponse } from "next/server";
import { z } from "zod";
import type { CSVRow } from "@/lib/dashboard/csv-import";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveOwnerStoreIdForApi } from "@/lib/auth/resolve-owner-store";
import { normalizeSlug } from "@/lib/utils/slug";
import {
  translateContentFields,
  type TranslateFieldInput,
} from "@/lib/ai/translate-content";
import { trilingualColumns } from "@/lib/ai/trilingual-db";
import { getStoreDefaultContentLanguage } from "@/lib/content/store-language";
import { parseJsonBody } from "@/lib/api/validation";

const csvRowSchema = z.object({
  category: z.string(),
  name: z.string().trim().min(1),
  description: z.string(),
  price: z.number().positive(),
  is_featured: z.boolean(),
});

const menuItemImportSchema = z.object({
  rows: z.array(csvRowSchema).min(1),
});

function slugFromName(name: string, fallbackIndex: number): string {
  const normalized = normalizeSlug(name);
  return normalized || `item-${fallbackIndex}`;
}

async function ensureUniqueSlug(
  supabase: ReturnType<typeof createAdminClient>,
  storeId: string,
  baseSlug: string
): Promise<string> {
  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    const { data } = await supabase
      .from("menu_items")
      .select("id")
      .eq("store_id", storeId)
      .eq("slug", slug)
      .maybeSingle();

    if (!data) {
      return slug;
    }

    slug = `${baseSlug}-${suffix}`;
    suffix++;
  }
}

async function importMenuItemRow(
  storeId: string,
  sourceLocale: Awaited<ReturnType<typeof getStoreDefaultContentLanguage>>,
  row: CSVRow,
  categoryMap: Map<string, string>,
  defaultCategoryId: string,
  rowIndex: number
): Promise<
  { ok: true; warning?: string } | { ok: false; error: string }
> {
  const nameTrimmed = row.name.trim();
  const descriptionTrimmed = row.description?.trim() ?? "";

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

  const { translations } = await translateContentFields(
    sourceLocale,
    translateInputs
  );

  const nameT = translations.name;
  const descT = translations.description;

  const supabase = createAdminClient();

  let categoryId = defaultCategoryId;
  let warning: string | undefined;
  const categoryName = row.category.trim();
  const categoryKey = categoryName.toLowerCase();

  if (categoryKey) {
    const matchedId = categoryMap.get(categoryKey);
    if (matchedId) {
      categoryId = matchedId;
    } else {
      warning = `Category '${categoryName}' not found — assigned to default category`;
    }
  }

  const baseSlug = slugFromName(nameTrimmed, rowIndex);
  const slug = await ensureUniqueSlug(supabase, storeId, baseSlug);

  const { error: menuItemError } = await supabase.from("menu_items").insert({
    store_id: storeId,
    category_id: categoryId,
    name: nameTrimmed,
    ...trilingualColumns("name", nameT),
    slug,
    description: descriptionTrimmed || null,
    ...trilingualColumns("description", descT),
    image_url: null,
    price: row.price,
    is_active: true,
    is_featured: row.is_featured,
    sort_order: 0,
  });

  if (menuItemError) {
    return {
      ok: false,
      error: `${nameTrimmed}: ${menuItemError.message}`,
    };
  }

  return warning ? { ok: true, warning } : { ok: true };
}

export async function POST(req: Request) {
  try {
    const parsed = await parseJsonBody(req, menuItemImportSchema);
    if (parsed.error) {
      return parsed.error;
    }

    const { storeId, errorResponse } = await resolveOwnerStoreIdForApi();
    if (errorResponse) {
      return errorResponse;
    }

    const supabase = createAdminClient();

    const { data: defaultCategory, error: defaultCategoryError } =
      await supabase
        .from("menu_categories")
        .select("id")
        .eq("store_id", storeId)
        .order("sort_order", { ascending: true })
        .limit(1)
        .single();

    if (defaultCategoryError || !defaultCategory?.id) {
      return NextResponse.json(
        {
          error:
            "No categories found. Please create at least one category first.",
        },
        { status: 400 }
      );
    }

    const { data: categories } = await supabase
      .from("menu_categories")
      .select("id, name")
      .eq("store_id", storeId);

    const categoryMap = new Map<string, string>();
    for (const category of categories ?? []) {
      categoryMap.set(category.name.trim().toLowerCase(), category.id);
    }

    const sourceLocale = await getStoreDefaultContentLanguage(storeId);

    let imported = 0;
    let failed = 0;
    const errors: string[] = [];
    const warnings: string[] = [];

    for (let i = 0; i < parsed.data.rows.length; i++) {
      const row = parsed.data.rows[i];
      const result = await importMenuItemRow(
        storeId,
        sourceLocale,
        row,
        categoryMap,
        defaultCategory.id,
        i + 1
      );

      if (result.ok) {
        imported++;
        if (result.warning) {
          warnings.push(`${row.name.trim()}: ${result.warning}`);
        }
      } else {
        failed++;
        errors.push(result.error);
      }
    }

    return NextResponse.json({ imported, failed, errors, warnings });
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected server error.", details: String(error) },
      { status: 500 }
    );
  }
}

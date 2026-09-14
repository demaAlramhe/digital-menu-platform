import { trilingualColumns } from "@/lib/ai/trilingual-db";
import type {
  TranslateFieldInput,
  TrilingualResult,
} from "@/lib/ai/translate-content";
import { createAdminClient } from "@/lib/supabase/admin";

export type MenuItemVariantInput = {
  id?: string;
  name: string;
  price: number;
  sortOrder?: number;
};

type AdminClient = ReturnType<typeof createAdminClient>;

export function variantTranslateInputs(
  variants: MenuItemVariantInput[]
): TranslateFieldInput[] {
  return variants.map((variant, index) => ({
    key: `variant_${index}`,
    text: variant.name.trim(),
    kind: "menu_item_name" as const,
  }));
}

function variantRow(
  menuItemId: string,
  variant: MenuItemVariantInput,
  index: number,
  translations: Record<string, TrilingualResult>
) {
  return {
    menu_item_id: menuItemId,
    name: variant.name.trim(),
    ...trilingualColumns("name", translations[`variant_${index}`]),
    price: variant.price,
    sort_order: variant.sortOrder ?? index,
    is_active: true,
    deleted_at: null,
  };
}

export async function insertMenuItemVariants(
  supabase: AdminClient,
  menuItemId: string,
  variants: MenuItemVariantInput[],
  translations: Record<string, TrilingualResult>
) {
  if (variants.length === 0) {
    return { error: null };
  }

  const { error } = await supabase.from("menu_item_variants").insert(
    variants.map((variant, index) =>
      variantRow(menuItemId, variant, index, translations)
    )
  );

  return { error };
}

export async function replaceMenuItemVariants(
  supabase: AdminClient,
  menuItemId: string,
  variants: MenuItemVariantInput[],
  translations: Record<string, TrilingualResult>
) {
  const { data: existing, error: existingError } = await supabase
    .from("menu_item_variants")
    .select("id")
    .eq("menu_item_id", menuItemId)
    .is("deleted_at", null);

  if (existingError) {
    return { error: existingError };
  }

  const ownedIds = new Set((existing ?? []).map((row) => row.id));
  const keepIds = new Set(
    variants
      .map((variant) => variant.id)
      .filter((id): id is string => Boolean(id && ownedIds.has(id)))
  );

  const toSoftDelete = [...ownedIds].filter((id) => !keepIds.has(id));
  const deletedAt = new Date().toISOString();

  if (toSoftDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("menu_item_variants")
      .update({ deleted_at: deletedAt })
      .eq("menu_item_id", menuItemId)
      .in("id", toSoftDelete)
      .is("deleted_at", null);

    if (deleteError) {
      return { error: deleteError };
    }
  }

  const toInsert: ReturnType<typeof variantRow>[] = [];

  for (const [index, variant] of variants.entries()) {
    const row = variantRow(menuItemId, variant, index, translations);
    if (variant.id && ownedIds.has(variant.id)) {
      const { error: updateError } = await supabase
        .from("menu_item_variants")
        .update(row)
        .eq("id", variant.id)
        .eq("menu_item_id", menuItemId);

      if (updateError) {
        return { error: updateError };
      }
    } else {
      toInsert.push(row);
    }
  }

  if (toInsert.length > 0) {
    const { error: insertError } = await supabase
      .from("menu_item_variants")
      .insert(toInsert);

    if (insertError) {
      return { error: insertError };
    }
  }

  return { error: null };
}

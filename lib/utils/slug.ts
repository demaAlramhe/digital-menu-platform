import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/db";

export type SlugTable = "menu_items" | "menu_categories";

export function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export function slugFromName(name: string, fallbackIndex: number = 1): string {
  const normalized = normalizeSlug(name);
  return normalized || `item-${fallbackIndex}`;
}

export async function ensureUniqueSlug(
  supabase: SupabaseClient<Database>,
  table: SlugTable,
  storeId: string,
  baseSlug: string
): Promise<string> {
  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    const { data } = await supabase
      .from(table)
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

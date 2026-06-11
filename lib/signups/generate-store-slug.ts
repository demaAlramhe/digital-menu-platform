import type { SupabaseClient } from "@supabase/supabase-js";

export function slugifyRestaurantName(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || "store";
}

export async function generateUniqueStoreSlug(
  supabase: SupabaseClient,
  restaurantName: string
): Promise<string> {
  const base = slugifyRestaurantName(restaurantName);
  let slug = base;
  let suffix = 2;

  while (true) {
    const { data } = await supabase
      .from("stores")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!data) {
      return slug;
    }

    slug = `${base}-${suffix}`;
    suffix += 1;
  }
}

import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Public storefront reads use the service-role client because RLS blocks anon
 * SELECT on stores / menu tables. Queries are scoped to active stores only.
 */
export function getPublicStoreClient() {
  return createAdminClient();
}

export async function getActiveStoreBySlug(slug: string) {
  const supabase = getPublicStoreClient();

  const { data: store, error } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  return { store, error };
}

export async function getPublicMenuForStore(storeId: string) {
  const supabase = getPublicStoreClient();

  const [{ data: categories, error: categoriesError }, { data: menuItems, error: menuItemsError }] =
    await Promise.all([
      supabase
        .from("menu_categories")
        .select("id, name, slug, sort_order")
        .eq("store_id", storeId)
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("menu_items")
        .select(
          "id, name, description, price, image_url, is_featured, sort_order, category_id"
        )
        .eq("store_id", storeId)
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
    ]);

  return {
    categories: categories ?? [],
    menuItems: menuItems ?? [],
    error: categoriesError ?? menuItemsError,
  };
}

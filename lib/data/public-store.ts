import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Public storefront reads use the service-role client because RLS blocks anon
 * SELECT on stores / menu tables. Queries are scoped to active stores only.
 */
export function getPublicStoreClient() {
  return createAdminClient();
}

function isMissingColumnError(error: { message?: string; code?: string } | null) {
  if (!error) return false;
  const message = (error.message ?? "").toLowerCase();
  return (
    error.code === "42703" ||
    message.includes("does not exist") ||
    (message.includes("column") &&
      (message.includes("name_ar") ||
        message.includes("name_he") ||
        message.includes("description_ar") ||
        message.includes("welcome_")))
  );
}

const CATEGORY_SELECT_FULL =
  "id, name, name_ar, name_he, name_en, slug, sort_order";
const CATEGORY_SELECT_LEGACY = "id, name, slug, sort_order";

const ITEM_SELECT_FULL =
  "id, name, name_ar, name_he, name_en, description, description_ar, description_he, description_en, price, image_url, is_featured, sort_order, category_id";
const ITEM_SELECT_LEGACY =
  "id, name, description, price, image_url, is_featured, sort_order, category_id";

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

  const categoriesFull = await supabase
    .from("menu_categories")
    .select(CATEGORY_SELECT_FULL)
    .eq("store_id", storeId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const categories =
    categoriesFull.error && isMissingColumnError(categoriesFull.error)
      ? (
          await supabase
            .from("menu_categories")
            .select(CATEGORY_SELECT_LEGACY)
            .eq("store_id", storeId)
            .eq("is_active", true)
            .order("sort_order", { ascending: true })
        ).data ?? []
      : (categoriesFull.data ?? []);

  const categoriesError =
    categoriesFull.error && !isMissingColumnError(categoriesFull.error)
      ? categoriesFull.error
      : null;

  const itemsFull = await supabase
    .from("menu_items")
    .select(ITEM_SELECT_FULL)
    .eq("store_id", storeId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const menuItems =
    itemsFull.error && isMissingColumnError(itemsFull.error)
      ? (
          await supabase
            .from("menu_items")
            .select(ITEM_SELECT_LEGACY)
            .eq("store_id", storeId)
            .eq("is_active", true)
            .order("sort_order", { ascending: true })
        ).data ?? []
      : (itemsFull.data ?? []);

  const menuItemsError =
    itemsFull.error && !isMissingColumnError(itemsFull.error)
      ? itemsFull.error
      : null;

  return {
    categories,
    menuItems,
    error: categoriesError ?? menuItemsError,
  };
}

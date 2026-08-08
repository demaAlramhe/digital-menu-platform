import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export async function categoryBelongsToStore(
  categoryId: string,
  storeId: string
): Promise<boolean> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("menu_categories")
    .select("store_id")
    .eq("id", categoryId)
    .is("deleted_at", null)
    .maybeSingle();

  return data?.store_id === storeId;
}

export async function menuItemBelongsToStore(
  menuItemId: string,
  storeId: string
): Promise<boolean> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("menu_items")
    .select("store_id")
    .eq("id", menuItemId)
    .is("deleted_at", null)
    .maybeSingle();

  return data?.store_id === storeId;
}

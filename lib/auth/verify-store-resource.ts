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
    .maybeSingle();

  return data?.store_id === storeId;
}

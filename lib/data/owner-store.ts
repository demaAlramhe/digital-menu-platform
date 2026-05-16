import "server-only";

import { redirect } from "next/navigation";
import { getOwnerStoreId } from "@/lib/auth/get-current-profile";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Resolves the authenticated owner's store_id (profile + admin fallback).
 * Uses the service-role client for store-scoped reads/writes because RLS often
 * blocks the anon client from reading menu_categories / menu_items even when
 * inserts via API succeed.
 */
export async function requireOwnerStoreId(): Promise<string> {
  const storeId = await getOwnerStoreId();
  if (!storeId) {
    redirect("/auth/login?error=no_store");
  }
  return storeId;
}

export function getOwnerStoreAdminClient() {
  return createAdminClient();
}

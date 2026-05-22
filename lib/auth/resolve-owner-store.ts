import { NextResponse } from "next/server";
import { requireApiStoreOwner } from "@/lib/auth/api-auth";

/**
 * Resolves the authenticated store owner's store_id for API routes.
 * Requires role `store_owner` with a linked `store_id`.
 */
export async function resolveOwnerStoreIdForApi(): Promise<
  | { storeId: string; errorResponse: null }
  | { storeId: null; errorResponse: NextResponse }
> {
  const auth = await requireApiStoreOwner();
  if (auth.errorResponse) {
    return { storeId: null, errorResponse: auth.errorResponse };
  }

  return { storeId: auth.storeId, errorResponse: null };
}

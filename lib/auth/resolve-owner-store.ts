import { NextResponse } from "next/server";
import { getOwnerStoreId } from "@/lib/auth/get-current-profile";

/**
 * Resolves the authenticated store owner's store_id for API routes.
 * Uses the same profile loading path as dashboard pages (incl. admin fallback).
 */
export async function resolveOwnerStoreIdForApi():
  Promise<
    | { storeId: string; errorResponse: null }
    | { storeId: null; errorResponse: NextResponse }
  > {
  const storeId = await getOwnerStoreId();

  if (!storeId) {
    return {
      storeId: null,
      errorResponse: NextResponse.json(
        { error: "No store is linked to this account." },
        { status: 403 }
      ),
    };
  }

  return { storeId, errorResponse: null };
}

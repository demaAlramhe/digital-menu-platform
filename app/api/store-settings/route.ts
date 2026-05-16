import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import { resolveOwnerStoreIdForApi } from "@/lib/auth/resolve-owner-store";

type PatchBody = {
  name?: string;
  logoUrl?: string;
  bannerUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  phone?: string;
  email?: string;
  address?: string;
};

export async function PATCH(req: Request) {
  try {
    const body: PatchBody = await req.json();

    const {
      name,
      logoUrl,
      bannerUrl,
      primaryColor,
      secondaryColor,
      phone,
      email,
      address,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Store name is required." },
        { status: 400 }
      );
    }

    const { storeId, errorResponse } = await resolveOwnerStoreIdForApi();
    if (errorResponse) {
      return errorResponse;
    }

    const supabase = createAdminClient();

    const { data: updatedStore, error: updateError } = await supabase
      .from("stores")
      .update({
        name: name.trim(),
        logo_url: logoUrl || null,
        banner_url: bannerUrl || null,
        primary_color: primaryColor || "#111827",
        secondary_color: secondaryColor || "#f59e0b",
        phone: phone || null,
        email: email || null,
        address: address || null,
      })
      .eq("id", storeId)
      .select()
      .single();

    if (updateError || !updatedStore) {
      return NextResponse.json(
        { error: "Failed to update store settings.", details: updateError },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      store: updatedStore,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected server error.", details: String(error) },
      { status: 500 }
    );
  }
}
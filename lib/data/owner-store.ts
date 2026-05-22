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

export type OwnerStoreBasic = {
  id: string;
  name: string | null;
  slug: string;
  showWelcomeScreen: boolean;
};

export type OwnerStoreQr = OwnerStoreBasic & {
  status: string;
  logo_url: string | null;
  phone: string | null;
  primary_color: string | null;
};

function isMissingColumnError(error: { message?: string; code?: string } | null) {
  if (!error) return false;
  const message = (error.message ?? "").toLowerCase();
  return (
    error.code === "42703" ||
    message.includes("show_welcome_screen") ||
    (message.includes("column") && message.includes("does not exist"))
  );
}

/**
 * Loads the owner's store row. Retries without `show_welcome_screen` when the
 * column has not been migrated yet (defaults welcome screen to off).
 */
export async function loadOwnerStoreBasic(
  storeId: string
): Promise<{ store: OwnerStoreBasic | null; error: unknown }> {
  const supabase = getOwnerStoreAdminClient();

  const withWelcome = await supabase
    .from("stores")
    .select("id, name, slug, show_welcome_screen")
    .eq("id", storeId)
    .maybeSingle();

  if (!withWelcome.error && withWelcome.data?.slug) {
    return {
      store: {
        id: withWelcome.data.id,
        name: withWelcome.data.name,
        slug: withWelcome.data.slug,
        showWelcomeScreen: withWelcome.data.show_welcome_screen === true,
      },
      error: null,
    };
  }

  if (withWelcome.error && isMissingColumnError(withWelcome.error)) {
    const basic = await supabase
      .from("stores")
      .select("id, name, slug")
      .eq("id", storeId)
      .maybeSingle();

    if (!basic.error && basic.data?.slug) {
      return {
        store: {
          id: basic.data.id,
          name: basic.data.name,
          slug: basic.data.slug,
          showWelcomeScreen: false,
        },
        error: null,
      };
    }

    return { store: null, error: basic.error ?? withWelcome.error };
  }

  return { store: null, error: withWelcome.error };
}

export async function loadOwnerStoreForQr(
  storeId: string
): Promise<{ store: OwnerStoreQr | null; error: unknown }> {
  const supabase = getOwnerStoreAdminClient();

  const withWelcome = await supabase
    .from("stores")
    .select(
      "id, name, slug, status, logo_url, phone, primary_color, show_welcome_screen"
    )
    .eq("id", storeId)
    .maybeSingle();

  if (!withWelcome.error && withWelcome.data?.slug) {
    return {
      store: {
        id: withWelcome.data.id,
        name: withWelcome.data.name,
        slug: withWelcome.data.slug,
        status: withWelcome.data.status ?? "inactive",
        logo_url: withWelcome.data.logo_url,
        phone: withWelcome.data.phone,
        primary_color: withWelcome.data.primary_color,
        showWelcomeScreen: withWelcome.data.show_welcome_screen === true,
      },
      error: null,
    };
  }

  if (withWelcome.error && isMissingColumnError(withWelcome.error)) {
    const basic = await supabase
      .from("stores")
      .select("id, name, slug, status, logo_url, phone, primary_color")
      .eq("id", storeId)
      .maybeSingle();

    if (!basic.error && basic.data?.slug) {
      return {
        store: {
          id: basic.data.id,
          name: basic.data.name,
          slug: basic.data.slug,
          status: basic.data.status ?? "inactive",
          logo_url: basic.data.logo_url,
          phone: basic.data.phone,
          primary_color: basic.data.primary_color,
          showWelcomeScreen: false,
        },
        error: null,
      };
    }

    return { store: null, error: basic.error ?? withWelcome.error };
  }

  return { store: null, error: withWelcome.error };
}

import { NextResponse } from "next/server";
import { requireApiSuperAdmin } from "@/lib/auth/api-auth";
import { logAdminAction } from "@/lib/auth/audit-log";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { parseJsonBody } from "@/lib/api/validation";
import { adminCreateStoreSchema } from "@/lib/api/schemas";

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

type TestFailAt = "store" | "profile" | "category";

function readTestFailAt(req: Request): TestFailAt | null {
  // Hard production gate — never honor this header in production traffic.
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const value = req.headers.get("x-test-fail-at");
  if (value === "store" || value === "profile" || value === "category") {
    return value;
  }
  return null;
}

async function runCompensation(
  cleanup: Array<() => Promise<void>>,
  originalError: unknown
) {
  for (let i = cleanup.length - 1; i >= 0; i -= 1) {
    try {
      await cleanup[i]();
    } catch (cleanupError) {
      console.error(
        "[store-provisioning] Compensation failed — a resource may be orphaned. " +
          `cleanupIndex=${i}. ` +
          `cleanupError=${cleanupError instanceof Error ? cleanupError.message : String(cleanupError)}. ` +
          `originalError=${originalError instanceof Error ? originalError.message : String(originalError)}`,
        { cleanupIndex: i, cleanupError, originalError }
      );
    }
  }
}

export async function POST(req: Request) {
  const cleanup: Array<() => Promise<void>> = [];

  try {
    const auth = await requireApiSuperAdmin();
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const parsed = await parseJsonBody(req, adminCreateStoreSchema);
    if (parsed.error) {
      return parsed.error;
    }

    const {
      storeName,
      storeSlug,
      ownerEmail,
      ownerPassword,
      ownerFullName,
      phone,
      email,
      address,
      plan,
    } = parsed.data;

    const supabase = createAdminClient();
    const failAt = readTestFailAt(req);
    const normalizedSlug = normalizeSlug(storeSlug);
    const storePlan = plan ?? "large";

    const { data: existingStore } = await supabase
      .from("stores")
      .select("id")
      .eq("slug", normalizedSlug)
      .maybeSingle();

    if (existingStore) {
      return NextResponse.json(
        { error: "A store with this slug already exists." },
        { status: 400 }
      );
    }

    const { data: createdUser, error: userError } =
      await supabase.auth.admin.createUser({
        email: ownerEmail.trim(),
        password: ownerPassword,
        email_confirm: true,
      });

    if (userError || !createdUser.user) {
      return NextResponse.json(
        { error: "Failed to create owner user.", details: userError },
        { status: 500 }
      );
    }

    const ownerUserId = createdUser.user.id;
    cleanup.push(async () => {
      const { error } = await supabase.auth.admin.deleteUser(ownerUserId);
      if (error) {
        throw new Error(
          `Failed to delete orphaned auth user id=${ownerUserId}: ${error.message}`
        );
      }
    });

    const { data: store, error: storeError } = await supabase
      .from("stores")
      .insert({
        name: storeName.trim(),
        slug: normalizedSlug,
        phone: phone || null,
        email: email || null,
        address: address || null,
        status: "active",
        primary_color: "#111827",
        secondary_color: "#f59e0b",
        plan: storePlan,
      })
      .select()
      .single();

    if (storeError || !store) {
      await runCompensation(cleanup, storeError);
      return NextResponse.json(
        { error: "Failed to create store.", details: storeError },
        { status: 500 }
      );
    }

    cleanup.push(async () => {
      const { error } = await supabase.from("stores").delete().eq("id", store.id);
      if (error) {
        throw new Error(
          `Failed to delete orphaned store id=${store.id}: ${error.message}`
        );
      }
    });

    if (failAt === "store") {
      throw new Error("Test failure injected at store step.");
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: ownerUserId,
        full_name: ownerFullName.trim(),
        role: "store_owner",
        store_id: store.id,
      });

    if (profileError) {
      await runCompensation(cleanup, profileError);
      return NextResponse.json(
        { error: "Failed to create profile.", details: profileError },
        { status: 500 }
      );
    }

    cleanup.push(async () => {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", ownerUserId);
      if (error) {
        throw new Error(
          `Failed to delete orphaned profile id=${ownerUserId}: ${error.message}`
        );
      }
    });

    if (failAt === "profile") {
      throw new Error("Test failure injected at profile step.");
    }

    const { error: categoryError } = await supabase
      .from("menu_categories")
      .insert({
        store_id: store.id,
        name: "General",
        slug: "general",
        sort_order: 0,
        is_active: true,
      });

    if (categoryError) {
      await runCompensation(cleanup, categoryError);
      return NextResponse.json(
        { error: "Failed to create default category.", details: categoryError },
        { status: 500 }
      );
    }

    if (failAt === "category") {
      throw new Error("Test failure injected at category step.");
    }

    await logAdminAction(supabase, {
      actorId: auth.auth.user.id,
      actorEmail: auth.auth.user.email,
      action: "store.create",
      targetType: "store",
      targetId: store.id,
      metadata: {
        storeName,
        storeSlug: normalizedSlug,
        ownerEmail,
        ownerUserId,
      },
    });

    return NextResponse.json({
      success: true,
      store,
      ownerUserId,
    });
  } catch (error) {
    await runCompensation(cleanup, error);
    return NextResponse.json(
      { error: "Unexpected server error.", details: String(error) },
      { status: 500 }
    );
  }
}

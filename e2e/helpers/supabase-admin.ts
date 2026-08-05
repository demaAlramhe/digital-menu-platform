import { createClient, type User } from "@supabase/supabase-js";
import { requireEnv } from "./env";

function getSupabaseUrl(): string {
  const raw = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  try {
    return new URL(raw).origin;
  } catch {
    return raw.replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
  }
}

/** Service-role client for e2e assertions (Playwright cannot import server-only modules). */
export function createE2EAdminClient() {
  return createClient(getSupabaseUrl(), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function findAuthUserByEmail(
  email: string
): Promise<User | null> {
  const supabase = createE2EAdminClient();
  const normalized = email.trim().toLowerCase();
  let page = 1;
  const perPage = 200;

  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw new Error(`listUsers failed: ${error.message}`);
    }

    const match =
      data.users.find((user) => user.email?.toLowerCase() === normalized) ??
      null;
    if (match) return match;
    if (data.users.length < perPage) return null;
    page += 1;
  }
}

export async function findStoreBySlug(slug: string) {
  const supabase = createE2EAdminClient();
  const { data, error } = await supabase
    .from("stores")
    .select("id, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`stores lookup failed: ${error.message}`);
  }
  return data;
}

export async function findProfileById(userId: string) {
  const supabase = createE2EAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, store_id")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`profiles lookup failed: ${error.message}`);
  }
  return data;
}

export async function deleteAuthUserIfExists(email: string) {
  const user = await findAuthUserByEmail(email);
  if (!user) return;
  const supabase = createE2EAdminClient();
  await supabase.auth.admin.deleteUser(user.id);
}

export async function deleteStoreBySlugIfExists(slug: string) {
  const store = await findStoreBySlug(slug);
  if (!store) return;
  const supabase = createE2EAdminClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id")
    .eq("store_id", store.id);

  await supabase.from("stores").delete().eq("id", store.id);

  for (const profile of profiles ?? []) {
    await supabase.from("profiles").delete().eq("id", profile.id);
    await supabase.auth.admin.deleteUser(profile.id);
  }
}

export async function findLatestAuditLog(params: {
  action: string;
  targetType: string;
  targetId: string;
}) {
  const supabase = createE2EAdminClient();
  const { data, error } = await supabase
    .from("audit_log")
    .select("id, action, target_type, target_id, metadata, actor_id, created_at")
    .eq("action", params.action)
    .eq("target_type", params.targetType)
    .eq("target_id", params.targetId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`audit_log lookup failed: ${error.message}`);
  }
  return data;
}

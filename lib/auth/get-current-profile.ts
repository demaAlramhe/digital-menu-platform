import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const PROFILE_SELECT = "id, full_name, role, store_id";

type ProfileRow = {
  id: string;
  full_name: string | null;
  role: string;
  store_id: string | null;
};

async function fetchProfileByUserId(
  userId: string,
  client: Awaited<ReturnType<typeof createClient>>
) {
  const { data, error } = await client
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data as ProfileRow | null;
}

function shouldUseAdminProfile(
  anonProfile: ProfileRow | null,
  adminProfile: ProfileRow | null
) {
  if (!adminProfile) return false;
  if (!anonProfile) return true;
  if (!anonProfile.store_id && adminProfile.store_id) return true;
  if (!anonProfile.role && adminProfile.role) return true;
  return false;
}

export async function getCurrentProfile() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const anonProfile = await fetchProfileByUserId(user.id, supabase);
  let profile = anonProfile;

  try {
    const admin = createAdminClient();
    const adminProfile = await fetchProfileByUserId(user.id, admin);

    if (shouldUseAdminProfile(anonProfile, adminProfile)) {
      profile = adminProfile;
    }
  } catch {
    // Service role unavailable; keep anon profile if any.
  }

  return { user, profile: profile ?? null };
}

export async function getOwnerStoreId(): Promise<string | null> {
  const current = await getCurrentProfile();
  const storeId = current?.profile?.store_id;
  return storeId && String(storeId).length > 0 ? storeId : null;
}

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const PROFILE_SELECT = "id, full_name, role, store_id";

export async function getCurrentProfile() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", user.id)
    .maybeSingle();

  if (profile) {
    return { user, profile };
  }

  // RLS may block the anon client from reading profiles; load own row via service role.
  try {
    const admin = createAdminClient();
    const { data: adminProfile } = await admin
      .from("profiles")
      .select(PROFILE_SELECT)
      .eq("id", user.id)
      .maybeSingle();

    if (adminProfile) {
      return { user, profile: adminProfile };
    }
  } catch {
    // Service role unavailable or profiles table missing.
  }

  return { user, profile: null };
}

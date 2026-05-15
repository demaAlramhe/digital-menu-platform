type ProfileRole = {
  role: string | null;
};

/**
 * Single source of truth for where to send a user after login.
 */
export function resolvePostLoginPath(profile: ProfileRole | null | undefined): string {
  if (!profile?.role) {
    return "/auth/login?error=no_profile";
  }

  if (profile.role === "super_admin") {
    return "/admin";
  }

  if (profile.role === "store_owner") {
    return "/dashboard";
  }

  return "/auth/login?error=unsupported_role";
}

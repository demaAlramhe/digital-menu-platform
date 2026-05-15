import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";

export async function requireSuperAdmin() {
  const current = await getCurrentProfile();

  if (!current) {
    redirect("/auth/login");
  }

  if (!current.profile) {
    redirect("/auth/login?error=no_profile");
  }

  if (current.profile.role === "store_owner") {
    redirect("/dashboard");
  }

  if (current.profile.role !== "super_admin") {
    redirect("/auth/login?error=unsupported_role");
  }

  return current;
}
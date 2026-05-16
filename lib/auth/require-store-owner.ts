import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";

export async function requireStoreOwner() {
  const current = await getCurrentProfile();

  if (!current) {
    redirect("/auth/login");
  }

  if (!current.profile) {
    redirect("/auth/login?error=no_profile");
  }

  if (current.profile.role === "super_admin") {
    redirect("/admin");
  }

  if (current.profile.role !== "store_owner") {
    redirect("/auth/login");
  }

  if (!current.profile.store_id) {
    redirect("/auth/login?error=no_store");
  }

  return current;
}
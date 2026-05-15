import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { resolvePostLoginPath } from "@/lib/auth/resolve-post-login-path";

export default async function AuthRedirectPage() {
  const current = await getCurrentProfile();

  if (!current) {
    redirect("/auth/login");
  }

  redirect(resolvePostLoginPath(current.profile));
}

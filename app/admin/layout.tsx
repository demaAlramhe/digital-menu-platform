import { InternalShell } from "@/components/dashboard/ui/internal-shell";
import { adminSidebarNav } from "@/lib/dashboard/sidebar-nav";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { getTranslations } from "@/lib/i18n/server";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireSuperAdmin();
  const { dict } = await getTranslations();

  const supabase = createAdminClient();
  const { count: pendingSignupsCount } = await supabase
    .from("pending_signups")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  return (
    <InternalShell
      navGroups={adminSidebarNav}
      brandLabel={dict.nav.admin}
      badges={{ signups: pendingSignupsCount ?? 0 }}
    >
      {children}
    </InternalShell>
  );
}

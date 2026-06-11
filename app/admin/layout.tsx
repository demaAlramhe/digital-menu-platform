import { AdminNav } from "@/components/i18n/admin-nav";
import { InternalAtmosphere } from "@/components/dashboard/ui/internal-atmosphere";
import { dash } from "@/components/dashboard/ui/styles";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireSuperAdmin();

  const supabase = createAdminClient();
  const { count: pendingSignupsCount } = await supabase
    .from("pending_signups")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  return (
    <div className={dash.shell}>
      <InternalAtmosphere />
      <AdminNav pendingSignupsCount={pendingSignupsCount ?? 0} />
      {children}
    </div>
  );
}

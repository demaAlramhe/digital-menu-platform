import { AdminNav } from "@/components/i18n/admin-nav";
import { InternalAtmosphere } from "@/components/dashboard/ui/internal-atmosphere";
import { dash } from "@/components/dashboard/ui/styles";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireSuperAdmin();

  return (
    <div className={dash.shell}>
      <InternalAtmosphere />
      <AdminNav />
      {children}
    </div>
  );
}

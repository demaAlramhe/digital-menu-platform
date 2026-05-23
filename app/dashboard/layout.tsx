import { DashboardNav } from "@/components/i18n/dashboard-nav";
import { InternalAtmosphere } from "@/components/dashboard/ui/internal-atmosphere";
import { dash } from "@/components/dashboard/ui/styles";
import { requireStoreOwner } from "@/lib/auth/require-store-owner";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireStoreOwner();

  return (
    <div className={dash.shell}>
      <InternalAtmosphere />
      <DashboardNav />
      {children}
    </div>
  );
}

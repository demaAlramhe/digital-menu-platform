import { DashboardNav } from "@/components/i18n/dashboard-nav";
import { requireStoreOwner } from "@/lib/auth/require-store-owner";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireStoreOwner();

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav />
      {children}
    </div>
  );
}

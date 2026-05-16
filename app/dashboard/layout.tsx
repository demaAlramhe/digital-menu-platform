import { DashboardNav } from "@/components/i18n/dashboard-nav";
import { requireStoreOwner } from "@/lib/auth/require-store-owner";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireStoreOwner();

  return (
    <div className="dashboard-shell min-h-screen bg-gradient-to-b from-stone-100 via-stone-50/90 to-white">
      <DashboardNav />
      {children}
    </div>
  );
}

import { InternalShell } from "@/components/dashboard/ui/internal-shell";
import { ownerSidebarNav } from "@/lib/dashboard/sidebar-nav";
import { requireStoreOwner } from "@/lib/auth/require-store-owner";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireStoreOwner();

  return (
    <InternalShell navGroups={ownerSidebarNav} brandLabel="Bel Afia">
      {children}
    </InternalShell>
  );
}

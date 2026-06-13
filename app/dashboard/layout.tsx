import { InternalShell } from "@/components/dashboard/ui/internal-shell";
import { ownerSidebarNav } from "@/lib/dashboard/sidebar-nav";
import { requireStoreOwner } from "@/lib/auth/require-store-owner";
import { getTranslations } from "@/lib/i18n/server";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireStoreOwner();
  const { dict } = await getTranslations();

  return (
    <InternalShell navGroups={ownerSidebarNav} brandLabel={dict.common.brand}>
      {children}
    </InternalShell>
  );
}

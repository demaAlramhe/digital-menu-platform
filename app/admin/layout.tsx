import { AdminNav } from "@/components/i18n/admin-nav";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireSuperAdmin();

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />
      {children}
    </div>
  );
}

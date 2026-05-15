import Link from "next/link";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { requireStoreOwner } from "@/lib/auth/require-store-owner";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireStoreOwner();

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 p-4 text-sm">
          <div className="flex items-center gap-4">
            <Link className="font-medium text-slate-900" href="/dashboard">
              Dashboard
            </Link>

            <Link className="text-slate-700" href="/dashboard/menu-items">
              Menu Items
            </Link>

            <Link className="text-slate-700" href="/dashboard/categories">
              Categories
            </Link>

            <Link className="text-slate-700" href="/dashboard/settings">
              Settings
            </Link>

            <Link className="text-slate-700" href="/dashboard/qr">
              QR Code
            </Link>
          </div>

          <LogoutButton />
        </div>
      </nav>

      {children}
    </div>
  );
}

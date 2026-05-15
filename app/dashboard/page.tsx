import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";

export default async function DashboardHomePage() {
  const current = await getCurrentProfile();

  if (!current) {
    redirect("/auth/login");
  }

  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="mb-2 text-4xl font-bold text-slate-900">Dashboard</h1>
      <p className="mb-2 text-slate-600">
        Welcome, {current.profile?.full_name || current.user.email}
      </p>
      <p className="mb-8 text-slate-600">
        Manage your digital menu, categories, and store settings.
      </p>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/dashboard/menu-items"
          className="rounded-xl border bg-white p-6 shadow-sm transition hover:bg-slate-50"
        >
          <h2 className="mb-2 text-xl font-semibold">Menu Items</h2>
          <p className="text-sm text-slate-600">
            View and manage dishes and drinks on your menu.
          </p>
        </Link>

        <Link
          href="/dashboard/categories"
          className="rounded-xl border bg-white p-6 shadow-sm transition hover:bg-slate-50"
        >
          <h2 className="mb-2 text-xl font-semibold">Categories</h2>
          <p className="text-sm text-slate-600">
            Organize your menu into sections like starters or drinks.
          </p>
        </Link>

        <Link
          href="/dashboard/menu-items/new"
          className="rounded-xl border bg-white p-6 shadow-sm transition hover:bg-slate-50"
        >
          <h2 className="mb-2 text-xl font-semibold">Add Menu Item</h2>
          <p className="text-sm text-slate-600">
            Create a new item for your digital menu.
          </p>
        </Link>

        <Link
          href="/dashboard/settings"
          className="rounded-xl border bg-white p-6 shadow-sm transition hover:bg-slate-50"
        >
          <h2 className="mb-2 text-xl font-semibold">Settings</h2>
          <p className="text-sm text-slate-600">
            Update branding, contact info, and store appearance.
          </p>
        </Link>

        <Link
          href="/dashboard/qr"
          className="rounded-xl border bg-white p-6 shadow-sm transition hover:bg-slate-50"
        >
          <h2 className="mb-2 text-xl font-semibold">QR Code</h2>
          <p className="text-sm text-slate-600">
            Get a QR code and link to your public menu.
          </p>
        </Link>
      </div>
    </main>
  );
}

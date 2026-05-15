import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { getTranslations } from "@/lib/i18n/server";

export default async function DashboardHomePage() {
  const current = await getCurrentProfile();
  const { dict } = await getTranslations();

  if (!current) {
    redirect("/auth/login");
  }

  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="mb-2 text-4xl font-bold text-slate-900">
        {dict.nav.dashboard}
      </h1>
      <p className="mb-2 text-slate-600">
        {dict.dashboard.welcome},{" "}
        {current.profile?.full_name || current.user.email}
      </p>
      <p className="mb-8 text-slate-600">{dict.dashboard.intro}</p>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/dashboard/menu-items"
          className="rounded-xl border bg-white p-6 shadow-sm transition hover:bg-slate-50"
        >
          <h2 className="mb-2 text-xl font-semibold">
            {dict.dashboard.cardMenuItems}
          </h2>
          <p className="text-sm text-slate-600">
            {dict.dashboard.cardMenuItemsDesc}
          </p>
        </Link>

        <Link
          href="/dashboard/categories"
          className="rounded-xl border bg-white p-6 shadow-sm transition hover:bg-slate-50"
        >
          <h2 className="mb-2 text-xl font-semibold">
            {dict.dashboard.cardCategories}
          </h2>
          <p className="text-sm text-slate-600">
            {dict.dashboard.cardCategoriesDesc}
          </p>
        </Link>

        <Link
          href="/dashboard/menu-items/new"
          className="rounded-xl border bg-white p-6 shadow-sm transition hover:bg-slate-50"
        >
          <h2 className="mb-2 text-xl font-semibold">
            {dict.dashboard.cardAddItem}
          </h2>
          <p className="text-sm text-slate-600">{dict.dashboard.cardAddItemDesc}</p>
        </Link>

        <Link
          href="/dashboard/settings"
          className="rounded-xl border bg-white p-6 shadow-sm transition hover:bg-slate-50"
        >
          <h2 className="mb-2 text-xl font-semibold">
            {dict.dashboard.cardSettings}
          </h2>
          <p className="text-sm text-slate-600">{dict.dashboard.cardSettingsDesc}</p>
        </Link>

        <Link
          href="/dashboard/qr"
          className="rounded-xl border bg-white p-6 shadow-sm transition hover:bg-slate-50"
        >
          <h2 className="mb-2 text-xl font-semibold">{dict.dashboard.cardQr}</h2>
          <p className="text-sm text-slate-600">{dict.dashboard.cardQrDesc}</p>
        </Link>
      </div>
    </main>
  );
}

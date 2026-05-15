import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { QrPoster } from "@/components/dashboard/qr-poster";
import { buildPublicMenuUrl } from "@/lib/utils/public-menu-url";
import { formatMessage } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

function storeStatusLabel(
  status: string,
  dict: Awaited<ReturnType<typeof getTranslations>>["dict"]
) {
  if (status === "active") return dict.common.statusActive;
  if (status === "inactive") return dict.common.statusInactive;
  if (status === "archived") return dict.common.statusArchived;
  return status;
}

export default async function DashboardQrPosterPage() {
  const current = await getCurrentProfile();
  const { dict } = await getTranslations();

  if (!current) {
    redirect("/auth/login");
  }

  if (!current.profile?.store_id) {
    return (
      <main className="p-8">
        <h1 className="mb-6 text-3xl font-bold">{dict.poster.title}</h1>
        <p>{dict.common.noStore}</p>
      </main>
    );
  }

  const supabase = await createClient();

  const { data: store, error } = await supabase
    .from("stores")
    .select("id, name, slug, logo_url, phone, primary_color, status")
    .eq("id", current.profile.store_id)
    .single();

  if (error || !store?.slug) {
    return (
      <main className="p-8">
        <h1 className="mb-6 text-3xl font-bold">{dict.poster.title}</h1>
        <p>{dict.common.loadStoreError}</p>
      </main>
    );
  }

  const menuUrl = await buildPublicMenuUrl(store.slug);

  return (
    <main className="p-8 print:p-0">
      <div className="mb-8 print:hidden">
        <h1 className="mb-2 text-3xl font-bold">{dict.poster.title}</h1>
        <p className="text-slate-600">{dict.poster.subtitle}</p>

        {store.status !== "active" && (
          <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {formatMessage(dict.common.storeInactiveWarning, {
              status: storeStatusLabel(store.status ?? "inactive", dict),
            })}
          </p>
        )}
      </div>

      <QrPoster
        storeName={store.name ?? dict.qr.store}
        menuUrl={menuUrl}
        logoUrl={store.logo_url}
        phone={store.phone}
        primaryColor={store.primary_color ?? "#111827"}
      />
    </main>
  );
}

import Link from "next/link";
import { StoreQrCard } from "@/components/dashboard/store-qr-card";
import {
  getOwnerStoreAdminClient,
  requireOwnerStoreId,
} from "@/lib/data/owner-store";
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

export default async function DashboardQrPage() {
  const storeId = await requireOwnerStoreId();
  const supabase = getOwnerStoreAdminClient();
  const { dict } = await getTranslations();

  const { data: store, error } = await supabase
    .from("stores")
    .select("id, name, slug, status")
    .eq("id", storeId)
    .single();

  if (error || !store?.slug) {
    return (
      <main className="p-8">
        <h1 className="mb-6 text-3xl font-bold">{dict.qr.title}</h1>
        <p>{dict.common.loadStoreError}</p>
      </main>
    );
  }

  const menuUrl = await buildPublicMenuUrl(store.slug);

  return (
    <main className="p-8">
      <h1 className="mb-2 text-3xl font-bold">{dict.qr.title}</h1>
      <p className="mb-8 text-slate-600">{dict.qr.subtitle}</p>

      {store.status !== "active" && (
        <p className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {formatMessage(dict.common.storeInactiveWarning, {
            status: storeStatusLabel(store.status ?? "inactive", dict),
          })}
        </p>
      )}

      <div className="mb-6">
        <Link
          href="/dashboard/qr/poster"
          className="inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-900 shadow-sm transition hover:bg-slate-50"
        >
          {dict.qr.printPoster}
        </Link>
      </div>

      <StoreQrCard
        storeName={store.name ?? dict.qr.store}
        storeSlug={store.slug}
        menuUrl={menuUrl}
      />
    </main>
  );
}

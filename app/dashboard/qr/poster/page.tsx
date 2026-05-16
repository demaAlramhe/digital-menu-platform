import { QrPoster } from "@/components/dashboard/qr-poster";
import { AlertBanner } from "@/components/dashboard/ui/alert-banner";
import { DashboardPage } from "@/components/dashboard/ui/dashboard-page";
import { PageHeader } from "@/components/dashboard/ui/page-header";
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

export default async function DashboardQrPosterPage() {
  const storeId = await requireOwnerStoreId();
  const supabase = getOwnerStoreAdminClient();
  const { dict } = await getTranslations();

  const { data: store, error } = await supabase
    .from("stores")
    .select("id, name, slug, logo_url, phone, primary_color, status")
    .eq("id", storeId)
    .single();

  if (error || !store?.slug) {
    return (
      <DashboardPage>
        <PageHeader title={dict.poster.title} />
        <p className="text-stone-600">{dict.common.loadStoreError}</p>
      </DashboardPage>
    );
  }

  const menuUrl = await buildPublicMenuUrl(store.slug);

  return (
    <DashboardPage className="print:max-w-none print:p-0">
      <div className="print:hidden">
        <PageHeader title={dict.poster.title} description={dict.poster.subtitle} />

        {store.status !== "active" && (
          <AlertBanner>
            {formatMessage(dict.common.storeInactiveWarning, {
              status: storeStatusLabel(store.status ?? "inactive", dict),
            })}
          </AlertBanner>
        )}
      </div>

      <QrPoster
        storeName={store.name ?? dict.qr.store}
        menuUrl={menuUrl}
        logoUrl={store.logo_url}
        phone={store.phone}
        primaryColor={store.primary_color ?? "#111827"}
      />
    </DashboardPage>
  );
}

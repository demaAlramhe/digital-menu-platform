import { PublicLinkActions } from "@/components/dashboard/public-link-actions";
import { StoreQrCard } from "@/components/dashboard/store-qr-card";
import { getOwnerPublicUrls } from "@/lib/data/owner-public-urls";
import { AlertBanner } from "@/components/dashboard/ui/alert-banner";
import { DashboardPage } from "@/components/dashboard/ui/dashboard-page";
import { PageHeader } from "@/components/dashboard/ui/page-header";
import {
  loadOwnerStoreForQr,
  requireOwnerStoreId,
} from "@/lib/data/owner-store";
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
  const { dict } = await getTranslations();

  const { store, error } = await loadOwnerStoreForQr(storeId);

  if (error || !store?.slug) {
    return (
      <DashboardPage>
        <PageHeader title={dict.qr.title} />
        <p className="text-stone-600">{dict.common.loadStoreError}</p>
      </DashboardPage>
    );
  }

  const { entryUrl, menuUrl } = await getOwnerPublicUrls(store.slug);

  return (
    <DashboardPage>
      <PageHeader title={dict.qr.title} description={dict.qr.subtitle} />

      <div className="mb-6">
        <PublicLinkActions entryUrl={entryUrl} menuUrl={menuUrl} compact />
      </div>

      {store.status !== "active" && (
        <AlertBanner>
          {formatMessage(dict.common.storeInactiveWarning, {
            status: storeStatusLabel(store.status ?? "inactive", dict),
          })}
        </AlertBanner>
      )}

      <StoreQrCard
        storeName={store.name ?? dict.qr.store}
        storeSlug={store.slug}
        menuUrl={entryUrl}
      />
    </DashboardPage>
  );
}

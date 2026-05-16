import { StoreSettingsForm } from "@/components/dashboard/store-settings-form";
import { DashboardPage } from "@/components/dashboard/ui/dashboard-page";
import { PageHeader } from "@/components/dashboard/ui/page-header";
import {
  getOwnerStoreAdminClient,
  requireOwnerStoreId,
} from "@/lib/data/owner-store";
import { getTranslations } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function DashboardSettingsPage() {
  const storeId = await requireOwnerStoreId();
  const supabase = getOwnerStoreAdminClient();
  const { dict } = await getTranslations();

  const { data: store, error } = await supabase
    .from("stores")
    .select("*")
    .eq("id", storeId)
    .single();

  if (error || !store) {
    return (
      <DashboardPage>
        <PageHeader title={dict.settings.title} />
        <p className="text-stone-600">{dict.common.loadStoreError}</p>
      </DashboardPage>
    );
  }

  return (
    <DashboardPage>
      <PageHeader
        title={dict.settings.title}
        description={dict.dashboard.cardSettingsDesc}
      />
      <StoreSettingsForm
        store={{
          id: store.id,
          name: store.name ?? "",
          logoUrl: store.logo_url ?? "",
          bannerUrl: store.banner_url ?? "",
          primaryColor: store.primary_color ?? "#111827",
          secondaryColor: store.secondary_color ?? "#f59e0b",
          phone: store.phone ?? "",
          email: store.email ?? "",
          address: store.address ?? "",
        }}
      />
    </DashboardPage>
  );
}

import { PublicLinkActions } from "@/components/dashboard/public-link-actions";
import { StoreSettingsForm } from "@/components/dashboard/store-settings-form";
import { getOwnerPublicUrls } from "@/lib/data/owner-public-urls";
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

  const publicUrls = store.slug
    ? await getOwnerPublicUrls(store.slug)
    : null;

  return (
    <DashboardPage>
      <PageHeader
        title={dict.settings.title}
        description={dict.dashboard.cardSettingsDesc}
      />
      {publicUrls && (
        <div className="mb-6">
          <PublicLinkActions
            entryUrl={publicUrls.entryUrl}
            menuUrl={publicUrls.menuUrl}
          />
        </div>
      )}
      <StoreSettingsForm
        store={{
          id: store.id,
          name: store.name ?? "",
          logoUrl: store.logo_url ?? "",
          bannerUrl: store.banner_url ?? "",
          heroImageUrl: store.hero_image_url ?? "",
          menuBackgroundUrl: store.menu_background_url ?? "",
          welcomeTitle: store.welcome_title ?? "",
          welcomeSubtitle: store.welcome_subtitle ?? "",
          welcomeButtonText: store.welcome_button_text ?? "",
          defaultContentLanguage: store.default_content_language ?? "ar",
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

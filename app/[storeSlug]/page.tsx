import { notFound } from "next/navigation";
import { getActiveStoreBySlug } from "@/lib/data/public-store";
import { StoreWelcomeScreen } from "@/components/storefront/store-welcome-screen";
import { resolveWelcomeContent } from "@/lib/store/welcome-content";
import { getTranslations } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

type StorePageProps = {
  params: Promise<{ storeSlug: string }>;
};

export default async function StorePage({ params }: StorePageProps) {
  const { storeSlug } = await params;
  const { dict, locale } = await getTranslations();

  const { store, error } = await getActiveStoreBySlug(storeSlug);

  if (error || !store) {
    notFound();
  }

  const storeName = store.name ?? dict.menu.digitalMenu;
  const content = resolveWelcomeContent(store, dict, locale);

  return (
    <StoreWelcomeScreen
      storeSlug={storeSlug}
      storeName={storeName}
      logoUrl={store.logo_url}
      content={content}
    />
  );
}

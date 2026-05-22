import { notFound } from "next/navigation";
import { getActiveStoreBySlug } from "@/lib/data/public-store";
import { StoreWelcomeScreen } from "@/components/storefront/store-welcome-screen";
import { storeRowToWelcomeSource } from "@/lib/types/mappers";
import { resolveWelcomeContent } from "@/lib/store/welcome-content";
import { withPublicLangParam } from "@/lib/i18n/public-locale-url";
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

  const content = resolveWelcomeContent(
    storeRowToWelcomeSource(store),
    dict,
    locale
  );

  return (
    <StoreWelcomeScreen
      storeSlug={storeSlug}
      logoUrl={store.logo_url}
      content={content}
      menuHref={withPublicLangParam(`/${storeSlug}/menu`, locale)}
    />
  );
}

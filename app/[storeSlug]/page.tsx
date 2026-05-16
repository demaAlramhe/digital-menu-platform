import Link from "next/link";
import { notFound } from "next/navigation";
import { getActiveStoreBySlug } from "@/lib/data/public-store";
import { StoreContact } from "@/components/storefront/store-contact";
import { StoreLocaleBar } from "@/components/storefront/store-locale-bar";
import { StoreMenuHeader } from "@/components/storefront/store-menu-header";
import { getTranslations } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

type StorePageProps = {
  params: Promise<{ storeSlug: string }>;
};

export default async function StorePage({ params }: StorePageProps) {
  const { storeSlug } = await params;
  const { dict } = await getTranslations();

  const { store, error } = await getActiveStoreBySlug(storeSlug);

  if (error || !store) {
    notFound();
  }

  const primaryColor = store.primary_color || "#111827";
  const secondaryColor = store.secondary_color || "#f59e0b";
  const storeName = store.name ?? "Restaurant";

  return (
    <main className="min-h-screen bg-slate-50 pb-10">
      <StoreLocaleBar />
      <StoreMenuHeader
        storeSlug={storeSlug}
        storeName={storeName}
        logoUrl={store.logo_url}
        bannerUrl={store.banner_url}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        showBackLink={false}
        labels={{
          digitalMenu: dict.menu.digitalMenu,
          backLinkText: `${dict.common.back} ${storeName}`,
        }}
      />

      <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 sm:px-5 sm:py-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2
            className="text-lg font-semibold sm:text-xl"
            style={{ color: primaryColor }}
          >
            {dict.store.aboutTitle}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
            {dict.store.aboutText}
          </p>

          <Link
            href={`/${storeSlug}/menu`}
            className="mt-6 flex min-h-14 w-full items-center justify-center rounded-xl px-6 text-base font-semibold text-white shadow-md transition active:scale-[0.98]"
            style={{ backgroundColor: primaryColor }}
          >
            {dict.store.viewMenu}
          </Link>
        </section>

        <StoreContact
          storeName={storeName}
          phone={store.phone}
          email={store.email}
          address={store.address}
          primaryColor={primaryColor}
        />
      </div>
    </main>
  );
}

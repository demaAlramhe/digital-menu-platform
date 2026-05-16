import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import {
  getActiveStoreBySlug,
  getPublicMenuForStore,
} from "@/lib/data/public-store";
import { MenuCategoryNav } from "@/components/storefront/menu-category-nav";
import { MenuItemCard } from "@/components/storefront/menu-item-card";
import { MenuSectionHeading } from "@/components/storefront/menu-section-heading";
import { StoreContact } from "@/components/storefront/store-contact";
import { StoreLocaleBar } from "@/components/storefront/store-locale-bar";
import { StoreMenuHeader } from "@/components/storefront/store-menu-header";
import { getTranslations } from "@/lib/i18n/server";
import type { Dictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type MenuPageProps = {
  params: Promise<{ storeSlug: string }>;
};

type MenuItemRow = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_featured: boolean;
  sort_order: number;
  category_id: string | null;
};

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
};

const SECTION_SCROLL_CLASS = "scroll-mt-[8.75rem]";

export default async function StoreMenuPage({ params }: MenuPageProps) {
  const { storeSlug } = await params;
  const { dict } = await getTranslations();

  const { store, error: storeError } = await getActiveStoreBySlug(storeSlug);

  if (storeError || !store) {
    notFound();
  }

  const { categories, menuItems } = await getPublicMenuForStore(store.id);

  const items = menuItems as MenuItemRow[];
  const cats = categories as CategoryRow[];

  const featuredItems = items.filter((item) => item.is_featured);

  const itemsByCategory = new Map<string, MenuItemRow[]>();
  const uncategorized: MenuItemRow[] = [];

  for (const item of items) {
    if (item.category_id) {
      const list = itemsByCategory.get(item.category_id) ?? [];
      list.push(item);
      itemsByCategory.set(item.category_id, list);
    } else {
      uncategorized.push(item);
    }
  }

  const navCategories = cats
    .filter((category) => (itemsByCategory.get(category.id) ?? []).length > 0)
    .map((category) => ({ id: category.id, name: category.name }));

  if (uncategorized.length > 0) {
    navCategories.push({ id: "other", name: dict.common.uncategorized });
  }

  const primaryColor = store.primary_color || "#111827";
  const secondaryColor = store.secondary_color || "#f59e0b";
  const isEmpty = cats.length === 0 && items.length === 0;
  const storeName = store.name ?? dict.menu.digitalMenu;
  const hasBanner = Boolean(store.banner_url);

  return (
    <main
      className="menu-page min-h-screen bg-gradient-to-b from-stone-100 via-stone-50 to-white pb-12"
      style={
        {
          "--menu-primary": primaryColor,
          "--menu-secondary": secondaryColor,
        } as CSSProperties
      }
    >
      <div className="relative">
        {hasBanner ? <StoreLocaleBar variant="overlay" /> : <StoreLocaleBar />}
        <StoreMenuHeader
          storeSlug={storeSlug}
          storeName={storeName}
          logoUrl={store.logo_url}
          bannerUrl={store.banner_url}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          labels={{
            digitalMenu: dict.menu.digitalMenu,
            backLinkText: `${dict.common.back} ${storeName}`,
          }}
        />
      </div>

      {!isEmpty && (
        <MenuCategoryNav
          categories={navCategories}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          showFeatured={featuredItems.length > 0}
        />
      )}

      <div className="mx-auto max-w-2xl px-4 py-7 sm:px-5 sm:py-9">
        {isEmpty ? (
          <EmptyMenuState primaryColor={primaryColor} dict={dict} />
        ) : (
          <div className="space-y-12 sm:space-y-14">
            {featuredItems.length > 0 && (
              <section
                id="menu-featured"
                className={`${SECTION_SCROLL_CLASS} rounded-3xl border border-white/80 bg-white/90 p-4 shadow-[0_12px_40px_rgba(15,23,42,0.07)] ring-1 ring-stone-200/60 sm:p-5`}
              >
                <MenuSectionHeading
                  title={dict.menu.featured}
                  subtitle={dict.menu.featuredSubtitle}
                  primaryColor={primaryColor}
                  accent="featured"
                />
                <ul className="space-y-4">
                  {featuredItems.map((item) => (
                    <li key={item.id}>
                      <MenuItemCard
                        item={item}
                        primaryColor={primaryColor}
                        secondaryColor={secondaryColor}
                        variant="featured"
                        showFeaturedBadge
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {cats.map((category) => {
              const categoryItems = itemsByCategory.get(category.id) ?? [];
              if (categoryItems.length === 0) return null;

              return (
                <section
                  key={category.id}
                  id={`category-${category.id}`}
                  className={SECTION_SCROLL_CLASS}
                >
                  <MenuSectionHeading
                    title={category.name}
                    primaryColor={primaryColor}
                  />
                  <ul className="space-y-3.5 sm:space-y-4">
                    {categoryItems.map((item) => (
                      <li key={item.id}>
                        <MenuItemCard
                          item={item}
                          primaryColor={primaryColor}
                          secondaryColor={secondaryColor}
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}

            {uncategorized.length > 0 && (
              <section id="category-other" className={SECTION_SCROLL_CLASS}>
                <MenuSectionHeading
                  title={dict.common.uncategorized}
                  primaryColor={primaryColor}
                />
                <ul className="space-y-3.5 sm:space-y-4">
                  {uncategorized.map((item) => (
                    <li key={item.id}>
                      <MenuItemCard
                        item={item}
                        primaryColor={primaryColor}
                        secondaryColor={secondaryColor}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        <div className="mt-12 sm:mt-14">
          <StoreContact
            storeName={storeName}
            phone={store.phone}
            email={store.email}
            address={store.address}
            primaryColor={primaryColor}
          />
        </div>
      </div>
    </main>
  );
}

function EmptyMenuState({
  primaryColor,
  dict,
}: {
  primaryColor: string;
  dict: Dictionary;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-stone-300/90 bg-white/90 px-6 py-16 text-center shadow-[0_8px_32px_rgba(15,23,42,0.06)]">
      <div
        className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl shadow-inner"
        style={{ backgroundColor: `${primaryColor}14`, color: primaryColor }}
        aria-hidden
      >
        🍽
      </div>
      <h2 className="text-xl font-semibold tracking-tight text-stone-900">
        {dict.menu.emptyTitle}
      </h2>
      <p className="mx-auto mt-2.5 max-w-xs text-[15px] leading-relaxed text-stone-600">
        {dict.menu.emptyText}
      </p>
    </div>
  );
}

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MenuCategoryNav } from "@/components/storefront/menu-category-nav";
import { MenuItemCard } from "@/components/storefront/menu-item-card";
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

const SECTION_SCROLL_CLASS = "scroll-mt-[7.5rem]";

export default async function StoreMenuPage({ params }: MenuPageProps) {
  const { storeSlug } = await params;
  const { dict } = await getTranslations();
  const supabase = await createClient();

  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", storeSlug)
    .single();

  if (storeError || !store || store.status !== "active") {
    notFound();
  }

  const [{ data: categories }, { data: menuItems }] = await Promise.all([
    supabase
      .from("menu_categories")
      .select("id, name, slug, sort_order")
      .eq("store_id", store.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("menu_items")
      .select(
        "id, name, description, price, image_url, is_featured, sort_order, category_id"
      )
      .eq("store_id", store.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  const items = (menuItems ?? []) as MenuItemRow[];
  const cats = (categories ?? []) as CategoryRow[];

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
        labels={{
          digitalMenu: dict.menu.digitalMenu,
          backLinkText: `${dict.common.back} ${storeName}`,
        }}
      />

      {!isEmpty && (
        <MenuCategoryNav
          categories={navCategories}
          primaryColor={primaryColor}
          showFeatured={featuredItems.length > 0}
        />
      )}

      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-5 sm:py-8">
        {isEmpty ? (
          <EmptyMenuState primaryColor={primaryColor} dict={dict} />
        ) : (
          <div className="space-y-10 sm:space-y-12">
            {featuredItems.length > 0 && (
              <section id="menu-featured" className={SECTION_SCROLL_CLASS}>
                <SectionHeading
                  title={dict.menu.featured}
                  subtitle={dict.menu.featuredSubtitle}
                  primaryColor={primaryColor}
                />
                <ul className="mt-4 space-y-4">
                  {featuredItems.map((item) => (
                    <li key={item.id}>
                      <MenuItemCard
                        item={item}
                        primaryColor={primaryColor}
                        secondaryColor={secondaryColor}
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
                  <SectionHeading
                    title={category.name}
                    primaryColor={primaryColor}
                  />
                  <ul className="mt-4 space-y-4">
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
                <SectionHeading
                  title={dict.common.uncategorized}
                  primaryColor={primaryColor}
                />
                <ul className="mt-4 space-y-4">
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

        <div className="mt-10 sm:mt-12">
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

function SectionHeading({
  title,
  subtitle,
  primaryColor,
}: {
  title: string;
  subtitle?: string;
  primaryColor: string;
}) {
  return (
    <div className="border-b border-slate-200 pb-3">
      <h2
        className="text-xl font-bold tracking-tight sm:text-2xl"
        style={{ color: primaryColor }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      )}
    </div>
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
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
      <div
        className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl"
        style={{ backgroundColor: `${primaryColor}18`, color: primaryColor }}
        aria-hidden
      >
        🍽
      </div>
      <h2 className="text-lg font-semibold text-slate-900">
        {dict.menu.emptyTitle}
      </h2>
      <p className="mx-auto mt-2 max-w-xs text-[15px] leading-relaxed text-slate-600">
        {dict.menu.emptyText}
      </p>
    </div>
  );
}

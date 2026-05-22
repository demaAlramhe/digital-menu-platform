import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import {
  getActiveStoreBySlug,
  getPublicMenuForStore,
} from "@/lib/data/public-store";
import {
  PublicMenuBrowser,
  type MenuBrowseSection,
} from "@/components/storefront/public-menu-browser";
import type { MenuItemDisplay } from "@/components/storefront/menu-item-card";
import { StoreLocaleBar } from "@/components/storefront/store-locale-bar";
import {
  getSourceLocaleFromStore,
  resolvePublicCategories,
  resolvePublicMenuItems,
  type MenuCategoryRow,
  type ResolvedMenuItem,
} from "@/lib/content/resolve-public-menu";
import { getTranslations } from "@/lib/i18n/server";
import type { Dictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type MenuPageProps = {
  params: Promise<{ storeSlug: string }>;
};

const FEATURED_SECTION_ID = "featured";
const UNCATEGORIZED_SECTION_ID = "other";

function toMenuItemDisplay(item: ResolvedMenuItem): MenuItemDisplay {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    image_url: item.image_url,
    is_featured: item.is_featured,
  };
}

function buildMenuSections(
  cats: { id: string; name: string; slug: string; sort_order: number }[],
  featuredItems: ResolvedMenuItem[],
  uncategorized: ResolvedMenuItem[],
  itemsByCategory: Map<string, ResolvedMenuItem[]>,
  dict: Dictionary
): MenuBrowseSection[] {
  const sections: MenuBrowseSection[] = [];

  if (featuredItems.length > 0) {
    sections.push({
      id: FEATURED_SECTION_ID,
      name: dict.menu.featured,
      items: featuredItems.map(toMenuItemDisplay),
      isFeatured: true,
    });
  }

  for (const category of cats) {
    const categoryItems = itemsByCategory.get(category.id) ?? [];
    if (categoryItems.length === 0) continue;

    sections.push({
      id: category.id,
      name: category.name,
      items: categoryItems.map(toMenuItemDisplay),
    });
  }

  if (uncategorized.length > 0) {
    sections.push({
      id: UNCATEGORIZED_SECTION_ID,
      name: dict.common.uncategorized,
      items: uncategorized.map(toMenuItemDisplay),
    });
  }

  return sections;
}

export default async function StoreMenuPage({ params }: MenuPageProps) {
  const { storeSlug } = await params;
  const { dict, locale } = await getTranslations();

  const { store, error: storeError } = await getActiveStoreBySlug(storeSlug);

  if (storeError || !store) {
    notFound();
  }

  const sourceLocale = getSourceLocaleFromStore(store);
  const { categories, menuItems, error: menuLoadError } =
    await getPublicMenuForStore(store.id);

  if (menuLoadError) {
    console.error("[public-menu] load failed:", menuLoadError);
  }

  const items = resolvePublicMenuItems(
    menuItems as Parameters<typeof resolvePublicMenuItems>[0],
    locale,
    sourceLocale
  );
  const cats = resolvePublicCategories(
    categories as MenuCategoryRow[],
    locale,
    sourceLocale
  );

  const activeCategoryIds = new Set(cats.map((c) => c.id));
  const featuredItems = items.filter((item) => item.is_featured);
  const nonFeatured = items.filter((item) => !item.is_featured);

  const itemsByCategory = new Map<string, ResolvedMenuItem[]>();
  const uncategorized: ResolvedMenuItem[] = [];

  for (const item of nonFeatured) {
    if (item.category_id && activeCategoryIds.has(item.category_id)) {
      const list = itemsByCategory.get(item.category_id) ?? [];
      list.push(item);
      itemsByCategory.set(item.category_id, list);
    } else {
      uncategorized.push(item);
    }
  }

  const menuSections = buildMenuSections(
    cats,
    featuredItems,
    uncategorized,
    itemsByCategory,
    dict
  );

  const primaryColor = store.primary_color || "#111827";
  const secondaryColor = store.secondary_color || "#f59e0b";
  const isEmpty = menuSections.length === 0;
  const storeName = store.name ?? dict.menu.digitalMenu;

  return (
    <main
      className="menu-page min-h-screen bg-[#f7f6f4] pb-10"
      style={
        {
          "--menu-primary": primaryColor,
          "--menu-secondary": secondaryColor,
        } as CSSProperties
      }
    >
      <StoreLocaleBar />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 xl:max-w-7xl">
        {isEmpty ? (
          <EmptyMenuState primaryColor={primaryColor} dict={dict} />
        ) : (
          <PublicMenuBrowser
            sections={menuSections}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            storeName={storeName}
            phone={store.phone}
            email={store.email}
            address={store.address}
          />
        )}
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
    <div className="mx-auto max-w-md rounded-3xl border border-dashed border-stone-300/90 bg-white px-6 py-16 text-center shadow-[0_8px_32px_rgba(15,23,42,0.06)]">
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

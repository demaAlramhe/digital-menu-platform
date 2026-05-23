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

import { StoreFloatingPhoneButton } from "@/components/storefront/store-floating-phone-button";
import { StorePremiumBackdrop } from "@/components/storefront/store-premium-backdrop";

import { StorePremiumGlass } from "@/components/storefront/store-premium-glass";

import {

  getSourceLocaleFromStore,

  resolvePublicCategories,

  resolvePublicMenuItems,

  type MenuCategoryRow,

  type ResolvedMenuItem,

} from "@/lib/content/resolve-public-menu";

import { getTranslations } from "@/lib/i18n/server";

import type { Dictionary } from "@/lib/i18n";

import {

  resolveStoreBackgroundUrl,

  STOREFRONT_GOLD,

  STOREFRONT_GOLD_LIGHT,

} from "@/lib/storefront/premium-theme";



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



function pickSectionImageUrl(items: ResolvedMenuItem[]): string | null {
  return items.find((item) => item.image_url)?.image_url ?? null;
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

      imageUrl: pickSectionImageUrl(featuredItems),

    });

  }



  for (const category of cats) {

    const categoryItems = itemsByCategory.get(category.id) ?? [];

    if (categoryItems.length === 0) continue;



    sections.push({

      id: category.id,

      name: category.name,

      items: categoryItems.map(toMenuItemDisplay),

      imageUrl: pickSectionImageUrl(categoryItems),

    });

  }



  if (uncategorized.length > 0) {

    sections.push({

      id: UNCATEGORIZED_SECTION_ID,

      name: dict.common.uncategorized,

      items: uncategorized.map(toMenuItemDisplay),

      imageUrl: pickSectionImageUrl(uncategorized),

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

  const backgroundImageUrl = resolveStoreBackgroundUrl(

    store.menu_background_url,

    store.banner_url,

    store.hero_image_url

  );



  return (

    <main className="menu-page relative min-h-screen overflow-x-hidden bg-[#0c0b0a] text-white">

      <StorePremiumBackdrop imageUrl={backgroundImageUrl} />

      <StoreFloatingPhoneButton phone={store.phone} persistKey={storeSlug} />

      <div className="relative z-10 flex min-h-screen flex-col px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 sm:py-8">

        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center">

          {isEmpty ? (

            <EmptyMenuState dict={dict} storeName={storeName} logoUrl={store.logo_url} />

          ) : (

            <PublicMenuBrowser

              sections={menuSections}

              primaryColor={primaryColor}

              secondaryColor={secondaryColor}

              storeName={storeName}

              logoUrl={store.logo_url}

            />

          )}

        </div>

      </div>

    </main>

  );

}



function EmptyMenuState({

  dict,

  storeName,

  logoUrl,

}: {

  dict: Dictionary;

  storeName: string;

  logoUrl: string | null;

}) {

  const initial = storeName?.charAt(0)?.toUpperCase() || "M";



  return (

    <StorePremiumGlass className="mx-auto text-center">

      {logoUrl ? (

        <img

          src={logoUrl}

          alt=""

          className="mx-auto mb-5 h-16 w-16 rounded-full object-cover ring-2 ring-[#d4b87a]/40"

        />

      ) : (

        <div

          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-semibold"

          style={{

            background: `linear-gradient(145deg, ${STOREFRONT_GOLD}33, rgba(0,0,0,0.4))`,

            color: STOREFRONT_GOLD_LIGHT,

            border: `1px solid ${STOREFRONT_GOLD}66`,

          }}

        >

          {initial}

        </div>

      )}

      <h2

        className="text-xl font-semibold tracking-tight"

        style={{ color: STOREFRONT_GOLD_LIGHT }}

      >

        {dict.menu.emptyTitle}

      </h2>

      <p className="mx-auto mt-2.5 max-w-xs text-[15px] leading-relaxed text-white/75">

        {dict.menu.emptyText}

      </p>

    </StorePremiumGlass>

  );

}


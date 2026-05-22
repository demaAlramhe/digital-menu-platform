"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import { formatMessage } from "@/lib/i18n";
import {
  MenuItemCard,
  type MenuItemDisplay,
} from "@/components/storefront/menu-item-card";
import { MenuSectionHeading } from "@/components/storefront/menu-section-heading";
import { StoreContact } from "@/components/storefront/store-contact";

export type MenuBrowseSection = {
  id: string;
  name: string;
  items: MenuItemDisplay[];
  isFeatured?: boolean;
};

type PublicMenuBrowserProps = {
  sections: MenuBrowseSection[];
  primaryColor: string;
  secondaryColor: string;
  storeName: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
};

const MENU_ITEM_GRID =
  "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-5";

const CATEGORY_GRID =
  "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4";

export function PublicMenuBrowser({
  sections,
  primaryColor,
  secondaryColor,
  storeName,
  phone,
  email,
  address,
}: PublicMenuBrowserProps) {
  const { dict } = useLocale();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedSection = useMemo(
    () => sections.find((section) => section.id === selectedId) ?? null,
    [sections, selectedId]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedId]);

  if (sections.length === 0) {
    return null;
  }

  if (selectedSection) {
    return (
      <div className="space-y-6 sm:space-y-7">
        <button
          type="button"
          onClick={() => setSelectedId(null)}
          className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-stone-200/90 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 shadow-sm transition hover:border-stone-300 hover:bg-stone-50 active:scale-[0.98]"
        >
          <BackChevron className="h-4 w-4 text-stone-500 transition group-hover:text-stone-800" />
          {dict.menu.backToCategories}
        </button>

        <MenuSectionHeading
          title={selectedSection.name}
          subtitle={
            selectedSection.isFeatured ? dict.menu.featuredSubtitle : undefined
          }
          primaryColor={primaryColor}
          accent={selectedSection.isFeatured ? "featured" : "default"}
        />

        <ul className={MENU_ITEM_GRID}>
          {selectedSection.items.map((item) => (
            <li key={item.id} className="min-w-0">
              <MenuItemCard
                item={item}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                variant={selectedSection.isFeatured ? "featured" : "default"}
                showFeaturedBadge={selectedSection.isFeatured || item.is_featured}
              />
            </li>
          ))}
        </ul>

        <div className="pt-4">
          <StoreContact
            storeName={storeName}
            phone={phone}
            email={email}
            address={address}
            primaryColor={primaryColor}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <header className="px-2 pb-8 pt-2 text-center sm:pb-10 sm:pt-4">
        <h1
          className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl"
          style={{ color: primaryColor }}
        >
          {dict.menu.categoriesTitle}
        </h1>
        <div
          className="mx-auto mt-3 h-0.5 w-12 rounded-full"
          style={{ backgroundColor: primaryColor }}
          aria-hidden
        />
      </header>

      <ul className={CATEGORY_GRID}>
        {sections.map((section) => (
          <li key={section.id} className="min-w-0">
            <CategoryTile
              section={section}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              onSelect={() => setSelectedId(section.id)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function CategoryTile({
  section,
  primaryColor,
  secondaryColor,
  onSelect,
}: {
  section: MenuBrowseSection;
  primaryColor: string;
  secondaryColor: string;
  onSelect: () => void;
}) {
  const { dict } = useLocale();
  const count = section.items.length;
  const itemCountLabel = formatMessage(dict.menu.itemsInCategory, {
    count: String(count),
  });
  const accentColor = section.isFeatured ? secondaryColor : primaryColor;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex aspect-square w-full flex-col items-center justify-center rounded-2xl border border-stone-200/70 bg-white px-3 py-5 text-center shadow-[0_8px_30px_rgba(15,23,42,0.07)] ring-1 ring-stone-100/90 transition duration-200 hover:-translate-y-0.5 hover:border-stone-300/80 hover:shadow-[0_14px_40px_rgba(15,23,42,0.1)] active:scale-[0.98] sm:rounded-3xl sm:px-4"
    >
      <span
        className="mb-3 h-1 w-8 rounded-full opacity-90 transition group-hover:w-10"
        style={{ backgroundColor: accentColor }}
        aria-hidden
      />
      <span className="line-clamp-3 text-[15px] font-semibold leading-snug tracking-tight text-stone-900 sm:text-base">
        {section.name}
      </span>
      <span className="mt-2 text-[11px] font-medium text-stone-400 sm:text-xs">
        {itemCountLabel}
      </span>
    </button>
  );
}

function BackChevron({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`shrink-0 rtl:rotate-180 ${className ?? ""}`}
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

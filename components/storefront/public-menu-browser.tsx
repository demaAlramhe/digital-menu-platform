"use client";

import { useEffect, useMemo, useState } from "react";
import { StorePremiumGlass } from "@/components/storefront/store-premium-glass";
import { useLocale } from "@/components/i18n/locale-provider";
import { formatMessage } from "@/lib/i18n";
import {
  premiumGlassTileStyle,
  STOREFRONT_GOLD,
  STOREFRONT_GOLD_LIGHT,
} from "@/lib/storefront/premium-theme";
import {
  MenuItemCard,
  type MenuItemDisplay,
} from "@/components/storefront/menu-item-card";
import { MenuSectionHeading } from "@/components/storefront/menu-section-heading";

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
  logoUrl?: string | null;
};

const MENU_ITEM_GRID =
  "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-5";

const CATEGORY_GRID =
  "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3";

export function PublicMenuBrowser({
  sections,
  primaryColor,
  secondaryColor,
  storeName,
  logoUrl,
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

  const initial = storeName?.charAt(0)?.toUpperCase() || "M";

  if (selectedSection) {
    return (
      <StorePremiumGlass size="wide" className="mx-auto">
        <div className="space-y-6 sm:space-y-7">
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-[#d4b87a]/50 bg-black/25 px-4 py-2.5 text-sm font-medium text-[#f5e6c8] backdrop-blur-sm transition hover:border-[#d4b87a] hover:bg-[#d4b87a]/15 active:scale-[0.98]"
          >
            <BackChevron className="h-4 w-4 text-[#d4b87a] transition group-hover:text-[#f5e6c8]" />
            {dict.menu.backToCategories}
          </button>

          <MenuSectionHeading
            title={selectedSection.name}
            subtitle={
              selectedSection.isFeatured ? dict.menu.featuredSubtitle : undefined
            }
            primaryColor={primaryColor}
            accent={selectedSection.isFeatured ? "featured" : "default"}
            theme="premium"
          />

          <ul className={MENU_ITEM_GRID}>
            {selectedSection.items.map((item) => (
              <li key={item.id} className="min-w-0">
                <MenuItemCard
                  item={item}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                  variant={selectedSection.isFeatured ? "featured" : "default"}
                  showFeaturedBadge={
                    selectedSection.isFeatured || item.is_featured
                  }
                  theme="premium"
                />
              </li>
            ))}
          </ul>
        </div>
      </StorePremiumGlass>
    );
  }

  return (
    <StorePremiumGlass size="wide" className="mx-auto">
      <header className="flex flex-col items-center pb-6 pt-1 text-center sm:pb-8">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt=""
            className="mb-4 h-16 w-16 rounded-full object-cover ring-2 ring-[#d4b87a]/40 sm:h-[4.5rem] sm:w-[4.5rem]"
          />
        ) : (
          <div
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-semibold sm:h-[4.5rem] sm:w-[4.5rem]"
            style={{
              background: `linear-gradient(145deg, ${STOREFRONT_GOLD}33, rgba(0,0,0,0.4))`,
              color: STOREFRONT_GOLD_LIGHT,
              border: `1px solid ${STOREFRONT_GOLD}66`,
            }}
          >
            {initial}
          </div>
        )}

        <p
          className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50"
          style={{ color: `${STOREFRONT_GOLD_LIGHT}99` }}
        >
          {storeName}
        </p>

        <h1
          className="mt-2 text-2xl font-semibold tracking-tight sm:text-[1.75rem]"
          style={{ color: STOREFRONT_GOLD_LIGHT }}
        >
          {dict.menu.categoriesTitle}
        </h1>
        <div
          className="mx-auto mt-3 h-0.5 w-12 rounded-full"
          style={{ backgroundColor: STOREFRONT_GOLD }}
          aria-hidden
        />
      </header>

      <ul className={CATEGORY_GRID}>
        {sections.map((section) => (
          <li key={section.id} className="min-w-0">
            <CategoryTile
              section={section}
              isFeatured={section.isFeatured}
              onSelect={() => setSelectedId(section.id)}
            />
          </li>
        ))}
      </ul>
    </StorePremiumGlass>
  );
}

function CategoryTile({
  section,
  isFeatured,
  onSelect,
}: {
  section: MenuBrowseSection;
  isFeatured?: boolean;
  onSelect: () => void;
}) {
  const { dict } = useLocale();
  const count = section.items.length;
  const itemCountLabel = formatMessage(dict.menu.itemsInCategory, {
    count: String(count),
  });

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex aspect-square w-full flex-col items-center justify-center rounded-2xl px-3 py-5 text-center transition duration-200 hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98] sm:rounded-[1.25rem] sm:px-4"
      style={
        isFeatured
          ? {
              ...premiumGlassTileStyle,
              border: `1px solid ${STOREFRONT_GOLD}`,
              boxShadow:
                "0 12px 40px rgba(201,169,98,0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
            }
          : premiumGlassTileStyle
      }
    >
      <span
        className="mb-3 h-1 w-8 rounded-full opacity-90 transition group-hover:w-10"
        style={{ backgroundColor: STOREFRONT_GOLD }}
        aria-hidden
      />
      <span
        className="line-clamp-3 text-[15px] font-semibold leading-snug tracking-tight sm:text-base"
        style={{ color: STOREFRONT_GOLD_LIGHT }}
      >
        {section.name}
      </span>
      <span className="mt-2 text-[11px] font-medium text-white/55 sm:text-xs">
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

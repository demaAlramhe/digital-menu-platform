"use client";

import { useEffect, useMemo, useState } from "react";
import { StorePremiumGlass } from "@/components/storefront/store-premium-glass";
import { useLocale } from "@/components/i18n/locale-provider";
import {
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
  imageUrl?: string | null;
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

const CATEGORY_LIST =
  "mx-auto flex w-full max-w-2xl flex-col gap-3 sm:gap-4";

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
          className="text-[11px] font-semibold uppercase tracking-[0.2em]"
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

      <ul className={CATEGORY_LIST}>
        {sections.map((section) => (
          <li key={section.id} className="min-w-0">
            <CategoryRow
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

function CategoryRow({
  section,
  isFeatured,
  onSelect,
}: {
  section: MenuBrowseSection;
  isFeatured?: boolean;
  onSelect: () => void;
}) {
  const imageUrl =
    section.imageUrl ??
    section.items.find((item) => item.image_url)?.image_url ??
    null;

  return (
    <button
      type="button"
      onClick={onSelect}
      dir="ltr"
      className="group flex w-full items-center justify-center gap-5 rounded-xl border px-4 py-3.5 transition duration-200 hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.99] sm:gap-6 sm:rounded-2xl sm:px-6 sm:py-4"
      style={{
        backgroundColor: "rgba(24, 24, 27, 0.92)",
        borderColor: isFeatured ? STOREFRONT_GOLD : `${STOREFRONT_GOLD}cc`,
        boxShadow: isFeatured
          ? "0 6px 24px rgba(201,169,98,0.2), inset 0 1px 0 rgba(255,255,255,0.06)"
          : "0 3px 16px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <span className="min-w-0 flex-1 text-center text-lg font-semibold leading-snug text-white [unicode-bidi:plaintext] sm:text-xl">
        {section.name}
      </span>
      <CategoryRowThumb imageUrl={imageUrl} label={section.name} />
    </button>
  );
}

function CategoryRowThumb({
  imageUrl,
  label,
}: {
  imageUrl: string | null;
  label: string;
}) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        className="h-14 w-14 shrink-0 rounded-lg object-cover ring-1 ring-[#d4b87a]/35 sm:h-16 sm:w-16 sm:rounded-xl"
      />
    );
  }

  const initial = label.charAt(0).toUpperCase() || "•";

  return (
    <div
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg text-lg font-semibold sm:h-16 sm:w-16 sm:rounded-xl"
      style={{
        background: `linear-gradient(145deg, ${STOREFRONT_GOLD}44, rgba(0,0,0,0.5))`,
        color: STOREFRONT_GOLD_LIGHT,
        border: `1px solid ${STOREFRONT_GOLD}55`,
      }}
      aria-hidden
    >
      {initial}
    </div>
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

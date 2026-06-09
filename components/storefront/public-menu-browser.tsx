"use client";

import { useEffect, useMemo, useState } from "react";
import { StorePremiumGlass } from "@/components/storefront/store-premium-glass";
import { useLocale } from "@/components/i18n/locale-provider";
import { formatMessage } from "@/lib/i18n";
import {
  STOREFRONT_GOLD,
  STOREFRONT_GOLD_LIGHT,
} from "@/lib/storefront/premium-theme";
import {
  MenuItemCard,
  type MenuItemDisplay,
} from "@/components/storefront/menu-item-card";
import { MenuSectionHeading } from "@/components/storefront/menu-section-heading";
import { WhatsAppOrderButton } from "@/components/storefront/whatsapp-order-button";

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
  whatsappNumber?: string | null;
  offerItems?: MenuItemDisplay[];
};

const MENU_ITEM_GRID =
  "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-5";

const CATEGORY_LIST =
  "mx-auto flex w-full max-w-2xl flex-col gap-2.5 sm:gap-3";

export function PublicMenuBrowser({
  sections,
  primaryColor,
  secondaryColor,
  storeName,
  logoUrl,
  whatsappNumber,
  offerItems = [],
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
        <div className="flex flex-col gap-5 sm:gap-6">
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            className="group inline-flex min-h-11 w-fit items-center gap-2.5 rounded-full border border-[#d4b87a]/70 bg-[#d4b87a]/10 px-5 py-2.5 text-sm font-semibold text-[#f5e6c8] shadow-[0_4px_16px_rgba(0,0,0,0.25)] backdrop-blur-sm transition-all duration-200 hover:border-[#d4b87a] hover:bg-[#d4b87a]/20 active:scale-[0.98]"
          >
            <BackChevron className="h-4 w-4 text-[#d4b87a] transition group-hover:text-[#f5e6c8]" />
            {dict.menu.backToCategories}
          </button>

          {selectedSection.isFeatured ? (
            <FeaturedSectionHeading
              title={selectedSection.name}
              subtitle={dict.menu.featuredSubtitle}
            />
          ) : (
            <MenuSectionHeading
              title={selectedSection.name}
              primaryColor={primaryColor}
              accent="default"
              theme="premium"
            />
          )}

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
      <header className="flex flex-col items-center gap-3 pb-5 pt-1 text-center sm:gap-4 sm:pb-6">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt=""
            className="h-16 w-16 rounded-full object-cover ring-2 ring-[#d4b87a]/40 sm:h-[4.5rem] sm:w-[4.5rem]"
          />
        ) : (
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-semibold sm:h-[4.5rem] sm:w-[4.5rem]"
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
          className="text-sm font-medium uppercase tracking-widest text-white/50"
          style={{ color: `${STOREFRONT_GOLD_LIGHT}88` }}
        >
          {storeName}
        </p>

        <div className="flex flex-col items-center gap-2">
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ color: STOREFRONT_GOLD_LIGHT }}
          >
            {dict.menu.categoriesTitle}
          </h1>
          <div
            className="h-0.5 w-16 rounded-full"
            style={{
              background: `linear-gradient(90deg, transparent, ${STOREFRONT_GOLD}, transparent)`,
            }}
            aria-hidden
          />
        </div>
      </header>

      {offerItems.length > 0 && (
        <section className="mx-auto mb-6 w-full max-w-2xl">
          <div className="mb-4 flex items-center gap-2">
            <span aria-hidden>🔥</span>
            <h2 className="text-xl font-bold text-amber-400">
              {dict.menu.offersTitle}
            </h2>
            <span aria-hidden>🔥</span>
          </div>
          <div
            className="mb-4 h-px w-full"
            style={{
              background: `linear-gradient(90deg, transparent, ${STOREFRONT_GOLD}99, transparent)`,
            }}
            aria-hidden
          />
          <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {offerItems.map((item) => (
              <div key={item.id} className="max-w-[160px] min-w-[160px]">
                <MenuItemCard
                  item={item}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                  showDiscount
                  theme="premium"
                />
              </div>
            ))}
          </div>
        </section>
      )}

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

      <div className="mx-auto mt-6 w-full max-w-2xl">
        <WhatsAppOrderButton
          whatsappNumber={whatsappNumber ?? null}
          storeName={storeName}
        />
      </div>
    </StorePremiumGlass>
  );
}

function FeaturedSectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h2
        className="flex items-center gap-2.5 text-xl font-bold sm:text-2xl"
        style={{ color: STOREFRONT_GOLD_LIGHT }}
      >
        <span className="text-lg sm:text-xl" aria-hidden>
          ⭐
        </span>
        {title}
      </h2>
      <p className="text-sm leading-relaxed text-white/65">{subtitle}</p>
      <div
        className="mt-1 h-px w-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${STOREFRONT_GOLD}99, transparent)`,
        }}
        aria-hidden
      />
    </div>
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
  const { dict } = useLocale();
  const imageUrl =
    section.imageUrl ??
    section.items.find((item) => item.image_url)?.image_url ??
    null;

  const itemCountLabel = formatMessage(dict.menu.itemsInCategory, {
    count: section.items.length,
  });

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex h-20 w-full items-center gap-3 rounded-xl border px-3 transition-all duration-200 hover:brightness-110 active:scale-[0.99] sm:h-24 sm:gap-4 sm:rounded-2xl sm:px-4"
      style={{
        backgroundColor: "rgba(24, 24, 27, 0.92)",
        borderColor: isFeatured ? STOREFRONT_GOLD : `${STOREFRONT_GOLD}cc`,
        boxShadow: isFeatured
          ? "0 6px 24px rgba(201,169,98,0.2), inset 0 1px 0 rgba(255,255,255,0.06)"
          : "0 3px 16px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <ForwardChevron className="h-5 w-5 shrink-0 text-[#d4b87a]/80 transition group-hover:text-[#f5e6c8]" />

      <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-start">
        <span className="line-clamp-2 text-lg font-semibold leading-snug text-white">
          {section.name}
        </span>
        <span className="text-xs text-white/50">{itemCountLabel}</span>
      </div>

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
        className="h-20 w-20 shrink-0 rounded-lg object-cover ring-1 ring-[#d4b87a]/35"
      />
    );
  }

  const initial = label.charAt(0).toUpperCase() || "•";

  return (
    <div
      className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg text-lg font-semibold"
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

function ForwardChevron({ className }: { className?: string }) {
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
        d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

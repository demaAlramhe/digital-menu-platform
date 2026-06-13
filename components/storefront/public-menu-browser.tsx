"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import { formatMessage } from "@/lib/i18n";
import {
  STOREFRONT_GOLD,
  STOREFRONT_GOLD_LIGHT,
} from "@/lib/storefront/premium-theme";
import { calculateDiscount } from "@/lib/storefront/discount";
import {
  MenuItemCard,
  type MenuItemDisplay,
} from "@/components/storefront/menu-item-card";

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
  offerItems?: MenuItemDisplay[];
};

const STICKY_TABS_CLASS =
  "sticky top-[max(3.25rem,env(safe-area-inset-top))] z-20";
const SECTION_SCROLL_MARGIN =
  "scroll-mt-[calc(max(3.25rem,env(safe-area-inset-top))+3.75rem)]";

const HORIZONTAL_SCROLL =
  "flex gap-3 overflow-x-auto overscroll-x-contain pb-2 snap-x snap-proximity [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

function sectionAnchorId(sectionId: string) {
  return `category-${sectionId}`;
}

export function PublicMenuBrowser({
  sections,
  primaryColor,
  secondaryColor,
  storeName,
  logoUrl,
}: PublicMenuBrowserProps) {
  const { dict } = useLocale();
  const [activeSectionId, setActiveSectionId] = useState(sections[0]?.id ?? "");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const scrollSpyEnabled = useRef(true);

  const setSectionRef = useCallback(
    (id: string) => (node: HTMLElement | null) => {
      sectionRefs.current[id] = node;
    },
    []
  );

  const scrollTabIntoView = useCallback((sectionId: string) => {
    tabRefs.current[sectionId]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, []);

  const scrollToSection = useCallback(
    (sectionId: string) => {
      const node = sectionRefs.current[sectionId];
      if (!node) return;

      scrollSpyEnabled.current = false;
      setActiveSectionId(sectionId);
      scrollTabIntoView(sectionId);

      node.scrollIntoView({ behavior: "smooth", block: "start" });

      window.setTimeout(() => {
        scrollSpyEnabled.current = true;
      }, 700);
    },
    [scrollTabIntoView]
  );

  useLayoutEffect(() => {
    if (sections.length === 0) return;

    let observer: IntersectionObserver | null = null;
    let rafId = 0;
    const visibleSections = new Map<string, number>();

    const attachObserver = () => {
      const nodes = sections
        .map((section) => sectionRefs.current[section.id])
        .filter((node): node is HTMLElement => node != null);

      if (nodes.length === 0) {
        rafId = requestAnimationFrame(attachObserver);
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          if (!scrollSpyEnabled.current) return;

          for (const entry of entries) {
            const id = entry.target.getAttribute("data-section-id");
            if (!id) continue;

            if (entry.isIntersecting) {
              visibleSections.set(id, entry.intersectionRatio);
            } else {
              visibleSections.delete(id);
            }
          }

          if (visibleSections.size === 0) return;

          let bestId = "";
          let bestRatio = -1;

          for (const [id, ratio] of visibleSections) {
            if (ratio > bestRatio) {
              bestRatio = ratio;
              bestId = id;
            }
          }

          if (bestId) {
            setActiveSectionId((current) => {
              if (current === bestId) return current;
              scrollTabIntoView(bestId);
              return bestId;
            });
          }
        },
        {
          root: null,
          rootMargin: "-20% 0px -55% 0px",
          threshold: [0, 0.15, 0.35, 0.55, 0.75, 1],
        }
      );

      for (const node of nodes) {
        observer.observe(node);
      }
    };

    attachObserver();

    return () => {
      cancelAnimationFrame(rafId);
      observer?.disconnect();
    };
  }, [sections, scrollTabIntoView]);

  useEffect(() => {
    if (!sections.some((section) => section.id === activeSectionId)) {
      setActiveSectionId(sections[0]?.id ?? "");
    }
  }, [sections, activeSectionId]);

  if (sections.length === 0) {
    return null;
  }

  const initial = storeName?.charAt(0)?.toUpperCase() || "M";

  return (
    <div className="mx-auto w-full">
      <header className="-mx-4 px-4 py-8 text-center sm:-mx-6 sm:px-6 sm:py-12">
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt=""
              className="h-16 w-16 rounded-full object-cover ring-2 ring-[#d4b87a]/40 drop-shadow-lg sm:h-[4.5rem] sm:w-[4.5rem]"
            />
          ) : (
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-semibold drop-shadow-lg sm:h-[4.5rem] sm:w-[4.5rem]"
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
            className="text-sm font-medium uppercase tracking-widest drop-shadow-md"
            style={{ color: `${STOREFRONT_GOLD_LIGHT}88` }}
          >
            {storeName}
          </p>
        </div>
      </header>

      <nav
        aria-label={dict.menu.categoriesTitle}
        className={`${STICKY_TABS_CLASS} -mx-4 mb-5 border-b border-[#d4b87a]/20 bg-[#0c0b0a]/90 px-4 py-2.5 backdrop-blur-md sm:-mx-6 sm:mb-6 sm:px-6`}
      >
        <div className={`${HORIZONTAL_SCROLL} gap-2`}>
          {sections.map((section) => {
            const isActive = activeSectionId === section.id;

            return (
              <button
                key={section.id}
                ref={(node) => {
                  tabRefs.current[section.id] = node;
                }}
                type="button"
                onClick={() => scrollToSection(section.id)}
                className={`shrink-0 snap-start whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition active:scale-[0.98] ${
                  isActive
                    ? "text-[#1a1408] shadow-[0_4px_16px_rgba(201,169,98,0.35)]"
                    : "border border-[#d4b87a]/35 bg-black/30 text-[#f5e6c8]/85 hover:border-[#d4b87a]/60 hover:bg-black/45"
                }`}
                style={
                  isActive
                    ? {
                        background: `linear-gradient(180deg, ${STOREFRONT_GOLD} 0%, #9A7B3C 100%)`,
                      }
                    : undefined
                }
                aria-current={isActive ? "true" : undefined}
              >
                {section.isFeatured && (
                  <span className="me-1" aria-hidden>
                    🔥
                  </span>
                )}
                {section.name}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="flex flex-col gap-8 sm:gap-10">
        {sections.map((section) => (
          <MenuCategorySection
            key={section.id}
            section={section}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            sectionRef={setSectionRef(section.id)}
            featuredSubtitle={dict.menu.featuredSubtitle}
          />
        ))}
      </div>
    </div>
  );
}

function MenuCategorySection({
  section,
  primaryColor,
  secondaryColor,
  sectionRef,
  featuredSubtitle,
}: {
  section: MenuBrowseSection;
  primaryColor: string;
  secondaryColor: string;
  sectionRef: (node: HTMLElement | null) => void;
  featuredSubtitle: string;
}) {
  const { dict } = useLocale();
  const itemCountLabel = formatMessage(dict.menu.itemsInCategory, {
    count: section.items.length,
  });

  return (
    <section
      ref={sectionRef}
      id={sectionAnchorId(section.id)}
      data-section-id={section.id}
      className={SECTION_SCROLL_MARGIN}
    >
      {section.isFeatured ? (
        <FeaturedSectionHeading
          title={section.name}
          subtitle={featuredSubtitle}
          itemCountLabel={itemCountLabel}
        />
      ) : (
        <CategorySectionHeading title={section.name} itemCountLabel={itemCountLabel} />
      )}

      <div className={HORIZONTAL_SCROLL}>
        {section.items.map((item) => {
          const { hasDiscount } = calculateDiscount(
            item.price,
            item.original_price ?? null
          );

          return (
            <div key={item.id} className="w-36 shrink-0 sm:w-40">
              <MenuItemCard
                item={item}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                variant={section.isFeatured ? "featured" : "default"}
                showFeaturedBadge={section.isFeatured || item.is_featured}
                showDiscount={hasDiscount}
                theme="premium"
                layout="scroll"
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

function FeaturedSectionHeading({
  title,
  subtitle,
  itemCountLabel,
}: {
  title: string;
  subtitle: string;
  itemCountLabel: string;
}) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:mb-5">
      <div className="flex flex-wrap items-center gap-2">
        <span aria-hidden>🔥</span>
        <h2
          className="text-xl font-bold sm:text-2xl"
          style={{ color: STOREFRONT_GOLD_LIGHT }}
        >
          {title}
        </h2>
        <span aria-hidden>🔥</span>
      </div>
      <p className="text-sm leading-relaxed text-white/65">{subtitle}</p>
      <p className="text-xs text-white/50">{itemCountLabel}</p>
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

function CategorySectionHeading({
  title,
  itemCountLabel,
}: {
  title: string;
  itemCountLabel: string;
}) {
  return (
    <div className="mb-4 flex flex-col gap-1 sm:mb-5">
      <div className="flex flex-wrap items-baseline gap-2">
        <h2
          className="text-lg font-bold sm:text-xl"
          style={{ color: STOREFRONT_GOLD_LIGHT }}
        >
          {title}
        </h2>
        <span className="text-xs text-white/50">{itemCountLabel}</span>
      </div>
      <div
        className="mt-1 h-px w-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${STOREFRONT_GOLD}55, transparent)`,
        }}
        aria-hidden
      />
    </div>
  );
}

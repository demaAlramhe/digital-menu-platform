"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";

type CategoryNavItem = {
  id: string;
  name: string;
};

type MenuCategoryNavProps = {
  categories: CategoryNavItem[];
  primaryColor: string;
  secondaryColor: string;
  showFeatured?: boolean;
};

type NavTarget = {
  id: string;
  label: string;
};

export function MenuCategoryNav({
  categories,
  primaryColor,
  secondaryColor,
  showFeatured = false,
}: MenuCategoryNavProps) {
  const { dict } = useLocale();
  const [activeId, setActiveId] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const targets = useMemo<NavTarget[]>(
    () => [
      ...(showFeatured ? [{ id: "menu-featured", label: dict.menu.featured }] : []),
      ...categories.map((category) => ({
        id: `category-${category.id}`,
        label: category.name,
      })),
    ],
    [categories, dict.menu.featured, showFeatured]
  );

  const targetIds = useMemo(() => targets.map((target) => target.id).join(","), [targets]);

  useEffect(() => {
    if (targets.length === 0) return;

    const sectionElements = targets
      .map((target) => document.getElementById(target.id))
      .filter((element): element is HTMLElement => element !== null);

    if (sectionElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-40% 0px -50% 0px",
        threshold: [0, 0.15, 0.35, 0.6],
      }
    );

    sectionElements.forEach((element) => observer.observe(element));
    setActiveId(sectionElements[0]?.id ?? null);

    return () => observer.disconnect();
  }, [targetIds, targets]);

  if (targets.length === 0) {
    return null;
  }

  function scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (!element) return;

    setActiveId(sectionId);
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav
      ref={navRef}
      className="sticky top-0 z-30 border-b border-stone-200/70 bg-white/90 shadow-[0_4px_20px_rgba(15,23,42,0.04)] backdrop-blur-xl"
      aria-label="Menu categories"
    >
      <div className="mx-auto max-w-2xl px-4 py-3 sm:py-3.5">
        <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-400">
          {dict.menu.jumpTo}
        </p>
        <div className="-mx-1 flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
          {targets.map((target) => {
            const isActive = activeId === target.id;
            const isFeatured = target.id === "menu-featured";

            return (
              <button
                key={target.id}
                type="button"
                onClick={() => scrollToSection(target.id)}
                className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 active:scale-[0.97] ${
                  isActive
                    ? "text-white shadow-md"
                    : "border border-stone-200/90 bg-white text-stone-700 shadow-sm hover:border-stone-300 hover:bg-stone-50"
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: isFeatured ? secondaryColor : primaryColor,
                        boxShadow: `0 6px 16px ${(isFeatured ? secondaryColor : primaryColor)}40`,
                      }
                    : undefined
                }
                aria-current={isActive ? "true" : undefined}
              >
                {target.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

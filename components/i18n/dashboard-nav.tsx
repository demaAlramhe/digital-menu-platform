"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useLocale } from "@/components/i18n/locale-provider";
import { LogoutButton } from "@/components/dashboard/logout-button";

const NAV_ITEMS = [
  { href: "/dashboard", labelKey: "dashboard" as const, exact: true },
  { href: "/dashboard/menu-items", labelKey: "menuItems" as const },
  { href: "/dashboard/categories", labelKey: "categories" as const },
  { href: "/dashboard/settings", labelKey: "settings" as const },
  { href: "/dashboard/qr", labelKey: "qr" as const },
];

export function DashboardNav() {
  const { dict } = useLocale();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/90 shadow-[0_1px_0_0_rgba(15,23,42,0.04)] backdrop-blur-xl print:hidden">
      <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="shrink-0 text-sm font-semibold tracking-tight text-stone-900 sm:text-base"
          >
            {dict.common.brand}
          </Link>

          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label={dict.nav.dashboard}
          >
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href, item.exact);
              const label = dict.nav[item.labelKey];

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-stone-900 text-white shadow-sm"
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <LanguageSwitcher compact />
            <LogoutButton />
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 text-stone-700 transition hover:bg-stone-50 md:hidden"
              aria-expanded={mobileOpen}
              aria-controls="dashboard-mobile-nav"
              aria-label={mobileOpen ? dict.common.dismiss : dict.nav.dashboard}
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? (
                <span className="text-xl leading-none" aria-hidden>
                  ×
                </span>
              ) : (
                <MenuIcon />
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav
            id="dashboard-mobile-nav"
            className="mt-3 grid grid-cols-2 gap-2 border-t border-stone-100 pt-3 md:hidden"
            aria-label={dict.nav.dashboard}
          >
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href, item.exact);
              const label = dict.nav[item.labelKey];

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-3 py-3 text-center text-sm font-medium transition ${
                    active
                      ? "bg-stone-900 text-white shadow-sm"
                      : "bg-stone-50 text-stone-700 hover:bg-stone-100"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-5 w-5"
      aria-hidden
    >
      <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

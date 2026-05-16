"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/90 shadow-[0_1px_0_0_rgba(15,23,42,0.04)] backdrop-blur-xl print:hidden">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <Link
            href="/dashboard"
            className="me-2 shrink-0 text-sm font-semibold tracking-tight text-stone-900 sm:me-4 sm:text-base"
          >
            {dict.common.brand}
          </Link>
          <nav
            className="flex flex-1 flex-wrap items-center gap-1"
            aria-label={dict.nav.dashboard}
          >
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href, item.exact);
              const label = dict.nav[item.labelKey];

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-2.5 py-2 text-sm font-medium transition sm:px-3 ${
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
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <LanguageSwitcher compact />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

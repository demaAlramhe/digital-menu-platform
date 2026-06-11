"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useLocale } from "@/components/i18n/locale-provider";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { dash } from "@/components/dashboard/ui/styles";

const NAV_ITEMS = [
  { href: "/admin", labelKey: "admin" as const, exact: true },
  { href: "/admin/stores", labelKey: "stores" as const },
  { href: "/admin/users", labelKey: "users" as const },
  { href: "/admin/signups", labelKey: "signups" as const, badge: true },
] as const;

type AdminNavProps = {
  pendingSignupsCount?: number;
};

export function AdminNav({ pendingSignupsCount = 0 }: AdminNavProps) {
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
    <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-white/85 shadow-[0_1px_0_0_rgba(15,23,42,0.04)] backdrop-blur-xl print:hidden">
      <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <Link href="/admin" className={dash.navBrand}>
            {dict.nav.admin}
          </Link>

          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label={dict.nav.admin}
          >
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href, "exact" in item ? item.exact : false);
              const label = dict.nav[item.labelKey];
              const showBadge =
                "badge" in item && item.badge && pendingSignupsCount > 0;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${active ? dash.navLinkActive : dash.navLink} inline-flex items-center gap-1.5`}
                  aria-current={active ? "page" : undefined}
                >
                  {label}
                  {showBadge && (
                    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {pendingSignupsCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <div className="rounded-xl border border-stone-200/80 bg-white/80 p-0.5 shadow-sm">
              <LanguageSwitcher compact />
            </div>
            <LogoutButton />
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200/90 bg-white text-stone-700 shadow-sm transition hover:bg-stone-50 md:hidden"
              aria-expanded={mobileOpen}
              aria-controls="admin-mobile-nav"
              aria-label={mobileOpen ? dict.common.dismiss : dict.nav.admin}
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
            id="admin-mobile-nav"
            className="mt-3 grid grid-cols-2 gap-2 border-t border-stone-100 pt-3 sm:grid-cols-4 md:hidden"
            aria-label={dict.nav.admin}
          >
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href, "exact" in item ? item.exact : false);
              const label = dict.nav[item.labelKey];
              const showBadge =
                "badge" in item && item.badge && pendingSignupsCount > 0;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${active ? dash.navMobileLinkActive : dash.navMobileLink} inline-flex items-center justify-center gap-1.5`}
                  aria-current={active ? "page" : undefined}
                >
                  {label}
                  {showBadge && (
                    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {pendingSignupsCount}
                    </span>
                  )}
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

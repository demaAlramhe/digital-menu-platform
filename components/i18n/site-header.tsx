"use client";

import Link from "next/link";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useLocale } from "@/components/i18n/locale-provider";

const NAV_LINKS = [
  { href: "/", labelKey: "home" as const, exact: true },
  { href: "/#features", labelKey: "features" as const },
  { href: "/#how-it-works", labelKey: "howItWorks" as const },
  { href: "/pricing", labelKey: "pricing" as const },
] as const;

export function SiteHeader() {
  const { dict } = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link
            href="/"
            className="shrink-0 text-lg font-bold tracking-tight text-slate-900"
          >
            {dict.common.brand}
          </Link>

          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label={dict.nav.site}
          >
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                {dict.nav[item.labelKey]}
              </Link>
            ))}
            <Link
              href="/auth/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {dict.common.login}
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden sm:block">
              <LanguageSwitcher compact />
            </div>
            <Link
              href="/request?plan=medium"
              className="hidden rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 sm:inline-flex"
              aria-label={dict.nav.requestService}
            >
              {dict.nav.requestService}
            </Link>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 lg:hidden"
              aria-expanded={mobileOpen}
              aria-controls="site-mobile-nav"
              aria-label={mobileOpen ? dict.common.dismiss : dict.nav.site}
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
            id="site-mobile-nav"
            className="border-t border-slate-100 py-3 lg:hidden"
            aria-label={dict.nav.site}
          >
            <div className="mb-3 sm:hidden">
              <LanguageSwitcher compact />
            </div>
            <ul className="space-y-1">
              {NAV_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    onClick={() => setMobileOpen(false)}
                  >
                    {dict.nav[item.labelKey]}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/auth/login"
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  onClick={() => setMobileOpen(false)}
                >
                  {dict.common.login}
                </Link>
              </li>
              <li className="pt-2">
                <Link
                  href="/request?plan=medium"
                  className="flex min-h-11 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  {dict.nav.requestService}
                </Link>
              </li>
            </ul>
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

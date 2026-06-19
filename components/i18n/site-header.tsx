"use client";

import Link from "next/link";
import { useState } from "react";
import { BelAfiaLogo } from "@/components/marketing/bel-afia-logo";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useLocale } from "@/components/i18n/locale-provider";

const NAV_LINKS = [
  { href: "/", labelKey: "home" as const, exact: true },
  { href: "/#features", labelKey: "features" as const },
  { href: "/#how-it-works", labelKey: "howItWorks" as const },
  { href: "/pricing", labelKey: "pricing" as const },
] as const;

const linkFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark focus-visible:ring-offset-2";

export function SiteHeader() {
  const { dict } = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 overflow-visible border-b border-brand-secondary/50 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-2 overflow-visible sm:gap-3 lg:gap-4">
          <Link
            href="/"
            className={`flex shrink-0 items-center overflow-visible ${linkFocus} rounded-lg`}
            aria-label="Bel Afia — QR Menu"
          >
            <BelAfiaLogo priority />
          </Link>

          <nav
            className="hidden items-center gap-0.5 lg:flex xl:gap-1"
            aria-label={dict.nav.site}
          >
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium text-brand-dark/80 transition hover:bg-brand-bg hover:text-brand-dark xl:px-3 ${linkFocus}`}
              >
                {dict.nav[item.labelKey]}
              </Link>
            ))}
            <Link
              href="/auth/login"
              className={`whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium text-brand-dark/80 transition hover:bg-brand-bg hover:text-brand-dark xl:px-3 ${linkFocus}`}
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
              className={`hidden rounded-xl bg-brand-dark px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark-hover sm:inline-flex ${linkFocus}`}
              aria-label={dict.nav.requestService}
            >
              {dict.nav.requestService}
            </Link>
            <button
              type="button"
              className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-secondary/60 text-brand-dark lg:hidden ${linkFocus}`}
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
            className="border-t border-brand-border-subtle py-3 lg:hidden"
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
                    className={`block rounded-lg px-3 py-2.5 text-sm font-medium text-brand-dark hover:bg-brand-bg ${linkFocus}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {dict.nav[item.labelKey]}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/auth/login"
                  className={`block rounded-lg px-3 py-2.5 text-sm font-medium text-brand-dark hover:bg-brand-bg ${linkFocus}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {dict.common.login}
                </Link>
              </li>
              <li className="pt-2">
                <Link
                  href="/request?plan=medium"
                  className={`flex min-h-11 items-center justify-center rounded-xl bg-brand-dark px-4 text-sm font-semibold text-white hover:bg-brand-dark-hover ${linkFocus}`}
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

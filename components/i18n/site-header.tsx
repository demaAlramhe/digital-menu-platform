"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useLocale } from "@/components/i18n/locale-provider";

export function SiteHeader() {
  const { dict } = useLocale();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-bold tracking-tight text-slate-900">
          {dict.common.brand}
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher compact />
          <Link
            href="/auth/login"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            {dict.common.login}
          </Link>
          <Link
            href="/auth/login"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            {dict.nav.manageMenu}
          </Link>
        </nav>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useLocale } from "@/components/i18n/locale-provider";
import { LogoutButton } from "@/components/dashboard/logout-button";

export function DashboardNav() {
  const { dict } = useLocale();

  return (
    <nav className="border-b border-slate-200 bg-white print:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 p-4 text-sm">
        <div className="flex flex-wrap items-center gap-4">
          <Link className="font-medium text-slate-900" href="/dashboard">
            {dict.nav.dashboard}
          </Link>
          <Link className="text-slate-700" href="/dashboard/menu-items">
            {dict.nav.menuItems}
          </Link>
          <Link className="text-slate-700" href="/dashboard/categories">
            {dict.nav.categories}
          </Link>
          <Link className="text-slate-700" href="/dashboard/settings">
            {dict.nav.settings}
          </Link>
          <Link className="text-slate-700" href="/dashboard/qr">
            {dict.nav.qr}
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher compact />
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
}

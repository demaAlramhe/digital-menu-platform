"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useLocale } from "@/components/i18n/locale-provider";
import { LogoutButton } from "@/components/dashboard/logout-button";

export function AdminNav() {
  const { dict } = useLocale();

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 p-4 text-sm">
        <div className="flex flex-wrap items-center gap-4">
          <Link className="font-medium text-slate-900" href="/admin">
            {dict.nav.admin}
          </Link>
          <Link className="text-slate-700" href="/admin/stores">
            {dict.nav.stores}
          </Link>
          <Link className="text-slate-700" href="/admin/users">
            {dict.nav.users}
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

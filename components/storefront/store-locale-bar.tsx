"use client";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useLocale } from "@/components/i18n/locale-provider";

export function StoreLocaleBar() {
  const { dict } = useLocale();

  return (
    <div
      className="border-b border-slate-200/80 bg-white px-4 py-2"
      aria-label={dict.lang.label}
    >
      <div className="mx-auto flex max-w-2xl justify-end">
        <LanguageSwitcher compact />
      </div>
    </div>
  );
}

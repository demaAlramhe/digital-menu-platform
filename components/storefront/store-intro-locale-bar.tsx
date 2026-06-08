"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/lib/i18n/types";
import { useLocale } from "@/components/i18n/locale-provider";
import {
  STOREFRONT_GOLD,
  STOREFRONT_GOLD_DARK,
} from "@/lib/storefront/premium-theme";

const LOCALE_ORDER: Locale[] = ["ar", "en", "he"];

/** Three-language switcher inside the welcome glass card. */
export function StoreIntroLocaleBar() {
  const router = useRouter();
  const { locale, dict } = useLocale();
  const [loading, setLoading] = useState(false);

  async function switchLocale(next: Locale) {
    if (next === locale || loading) return;
    setLoading(true);
    try {
      await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: next }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const labels: Record<Locale, string> = {
    ar: dict.lang.ar,
    en: dict.lang.en,
    he: dict.lang.he,
  };

  return (
    <div
      className="grid w-full grid-cols-3 gap-2"
      role="group"
      aria-label={dict.lang.label}
    >
      {LOCALE_ORDER.map((code) => {
        const isActive = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => switchLocale(code)}
            disabled={loading}
            suppressHydrationWarning
            className={`w-full rounded-full border px-2 py-2.5 text-center text-[11px] font-semibold leading-tight transition-all duration-200 disabled:opacity-50 sm:px-3 sm:text-xs ${
              isActive
                ? "border-[#d4b87a] text-[#1a1408] shadow-[0_4px_16px_rgba(201,169,98,0.35)]"
                : "border-[#d4b87a]/55 bg-transparent text-[#f5e6c8]/85 hover:border-[#d4b87a] hover:bg-[#d4b87a]/10 hover:text-[#f5e6c8]"
            }`}
            style={
              isActive
                ? {
                    background: `linear-gradient(180deg, ${STOREFRONT_GOLD} 0%, ${STOREFRONT_GOLD_DARK} 100%)`,
                  }
                : undefined
            }
            aria-pressed={isActive}
          >
            {labels[code]}
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/lib/i18n/types";
import { useLocale } from "@/components/i18n/locale-provider";

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
      className="mt-8 grid w-full grid-cols-3 gap-2 sm:mt-9"
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
            className={`w-full rounded-full border px-2 py-2 text-center text-[11px] font-medium leading-tight transition disabled:opacity-50 sm:px-3 sm:py-2.5 sm:text-xs ${
              isActive
                ? "border-[#d4b87a] bg-[#d4b87a]/20 text-[#f5e6c8] shadow-[0_0_20px_rgba(212,184,122,0.25)]"
                : "border-white/25 bg-transparent text-white/75 hover:border-[#d4b87a]/50 hover:bg-white/5 hover:text-white"
            }`}
            aria-pressed={isActive}
          >
            {labels[code]}
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/lib/i18n/types";
import { useLocale } from "@/components/i18n/locale-provider";

const LOCALE_ORDER: Locale[] = ["ar", "en", "he"];

/** Language switcher on the public menu page (updates cookie + refreshes content). */
export function StoreMenuLocaleBar() {
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
      className="pointer-events-auto absolute inset-x-0 top-0 z-20 flex justify-center px-4 pt-[max(0.75rem,env(safe-area-inset-top))]"
      role="group"
      aria-label={dict.lang.label}
    >
      <div className="flex gap-1 rounded-full border border-white/20 bg-black/35 p-1 shadow-lg backdrop-blur-md">
        {LOCALE_ORDER.map((code) => {
          const isActive = locale === code;
          return (
            <button
              key={code}
              type="button"
              onClick={() => switchLocale(code)}
              disabled={loading}
              suppressHydrationWarning
              className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition disabled:opacity-50 sm:px-3.5 sm:text-xs ${
                isActive
                  ? "bg-[#d4b87a]/25 text-[#f5e6c8] ring-1 ring-[#d4b87a]/60"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
              aria-pressed={isActive}
            >
              {labels[code]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

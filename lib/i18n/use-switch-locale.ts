"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n/types";
import { useLocale } from "@/components/i18n/locale-provider";

/** Set locale cookie via API, then hard-reload so server layout picks up the change. */
export function useSwitchLocale() {
  const { locale } = useLocale();
  const [loading, setLoading] = useState(false);

  async function switchLocale(next: Locale) {
    if (next === locale || loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: next }),
        credentials: "same-origin",
      });

      if (!res.ok) {
        setLoading(false);
        return;
      }

      window.location.reload();
    } catch {
      setLoading(false);
    }
  }

  return { switchLocale, loading, locale };
}

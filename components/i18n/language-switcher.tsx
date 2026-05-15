"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/lib/i18n/types";
import { useLocale } from "./locale-provider";

type LanguageSwitcherProps = {
  className?: string;
  compact?: boolean;
};

export function LanguageSwitcher({
  className = "",
  compact = false,
}: LanguageSwitcherProps) {
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

  return (
    <div
      className={`flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 text-sm ${className}`}
      role="group"
      aria-label={dict.lang.label}
    >
      {!compact && (
        <span className="hidden px-2 text-slate-500 sm:inline">
          {dict.lang.label}:
        </span>
      )}
      <LocaleButton
        active={locale === "he"}
        label={dict.lang.he}
        disabled={loading}
        onClick={() => switchLocale("he")}
      />
      <LocaleButton
        active={locale === "ar"}
        label={dict.lang.ar}
        disabled={loading}
        onClick={() => switchLocale("ar")}
      />
    </div>
  );
}

function LocaleButton({
  active,
  label,
  disabled,
  onClick,
}: {
  active: boolean;
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      suppressHydrationWarning
      className={`rounded-md px-2.5 py-1.5 font-medium transition disabled:opacity-50 ${
        active
          ? "bg-slate-900 text-white"
          : "text-slate-600 hover:bg-slate-50"
      }`}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

"use client";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useLocale } from "@/components/i18n/locale-provider";

type StoreLocaleBarProps = {
  variant?: "default" | "overlay";
};

export function StoreLocaleBar({ variant = "default" }: StoreLocaleBarProps) {
  const { dict } = useLocale();
  const isOverlay = variant === "overlay";

  return (
    <div
      className={
        isOverlay
          ? "absolute inset-x-0 top-0 z-20 px-4 py-3"
          : "border-b border-stone-200/60 bg-white/80 px-4 py-2.5 backdrop-blur-sm"
      }
      aria-label={dict.lang.label}
    >
      <div className="mx-auto flex max-w-2xl justify-end">
        <div
          className={
            isOverlay
              ? "rounded-full border border-white/25 bg-black/20 p-0.5 shadow-lg backdrop-blur-md"
              : ""
          }
        >
          <LanguageSwitcher compact />
        </div>
      </div>
    </div>
  );
}

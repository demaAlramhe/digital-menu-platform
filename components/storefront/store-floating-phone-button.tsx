"use client";

import { useLocale } from "@/components/i18n/locale-provider";
import { premiumGoldCtaStyle } from "@/lib/storefront/premium-theme";
import { normalizePhoneForTel } from "@/lib/utils/whatsapp";

type StoreFloatingPhoneButtonProps = {
  phone?: string | null;
};

/** Fixed call button on the physical right edge of the menu page. */
export function StoreFloatingPhoneButton({ phone }: StoreFloatingPhoneButtonProps) {
  const { dict } = useLocale();
  const trimmed = phone?.trim();
  if (!trimmed) return null;

  return (
    <a
      href={`tel:${normalizePhoneForTel(trimmed)}`}
      className="fixed right-3 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-1.5 rounded-2xl border border-[#d4b87a]/55 bg-[rgba(12,10,8,0.72)] px-2.5 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-md transition hover:border-[#d4b87a] hover:brightness-110 active:scale-[0.97] sm:right-4 sm:px-3"
      aria-label={`${dict.store.contactTitle}: ${trimmed}`}
    >
      <span
        className="flex h-11 w-11 items-center justify-center rounded-full sm:h-12 sm:w-12"
        style={premiumGoldCtaStyle}
      >
        <PhoneIcon className="h-5 w-5 shrink-0" />
      </span>
      <span className="text-center text-[10px] font-semibold leading-tight text-[#f5e6c8] sm:text-[11px]">
        {dict.store.contactTitle}
      </span>
    </a>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.954l-1.293 1.293a1.125 1.125 0 0 0-.26 1.223 11.042 11.042 0 0 0 5.516 5.516 1.125 1.125 0 0 0 1.223-.26l1.293-1.293a1.875 1.875 0 0 1 1.954-.694l4.423 1.105a1.125 1.125 0 0 1 1.42 1.819V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

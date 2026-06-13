"use client";

import { useLocale } from "@/components/i18n/locale-provider";
import { premiumGoldCtaStyle } from "@/lib/storefront/premium-theme";
import { normalizePhoneForTel } from "@/lib/utils/whatsapp";

type StoreMenuPhoneButtonProps = {
  phone?: string | null;
};

export function StoreMenuPhoneButton({ phone }: StoreMenuPhoneButtonProps) {
  const { dict } = useLocale();
  const trimmed = phone?.trim();
  if (!trimmed) return null;

  const telHref = `tel:${normalizePhoneForTel(trimmed)}`;

  return (
    <a
      href={telHref}
      className="flex flex-col items-center gap-1 rounded-xl border border-[#d4b87a]/50 bg-[rgba(12,10,8,0.78)] px-1.5 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.45)] backdrop-blur-md transition-[border-color,filter,transform] hover:border-[#d4b87a] hover:brightness-110 active:scale-[0.97]"
      aria-label={`${dict.store.contactTitle}: ${trimmed}`}
    >
      <span
        className="flex h-8 w-8 items-center justify-center rounded-full"
        style={premiumGoldCtaStyle}
      >
        <PhoneIcon className="h-3.5 w-3.5 shrink-0" />
      </span>
      <span className="pointer-events-none text-center text-[9px] font-medium leading-none text-[#f5e6c8]/95">
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

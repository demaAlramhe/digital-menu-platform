"use client";

import type { ReactNode } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import {
  buildWhatsAppUrl,
  normalizePhoneForTel,
} from "@/lib/utils/whatsapp";

type StoreContactProps = {
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  storeName: string;
  primaryColor: string;
  compact?: boolean;
};

export function StoreContact({
  phone,
  email,
  address,
  storeName,
  primaryColor,
  compact = false,
}: StoreContactProps) {
  const { dict } = useLocale();
  const hasPhone = Boolean(phone?.trim());
  const hasEmail = Boolean(email?.trim());
  const hasAddress = Boolean(address?.trim());
  const whatsAppUrl = hasPhone
    ? buildWhatsAppUrl(
        phone!,
        `Hi ${storeName}, I have a question about your menu.`
      )
    : null;

  if (!hasPhone && !hasEmail && !hasAddress) {
    return null;
  }

  const items = [
    hasPhone && {
      key: "phone",
      label: dict.common.phone,
      value: phone!,
      href: `tel:${normalizePhoneForTel(phone!)}`,
      icon: <PhoneIcon />,
    },
    hasEmail && {
      key: "email",
      label: dict.common.email,
      value: email!,
      href: `mailto:${email}`,
      icon: <EmailIcon />,
    },
    hasAddress && {
      key: "address",
      label: dict.common.address,
      value: address!,
      href: null as string | null,
      icon: <LocationIcon />,
    },
  ].filter(Boolean) as Array<{
    key: string;
    label: string;
    value: string;
    href: string | null;
    icon: ReactNode;
  }>;

  return (
    <section
      className={`overflow-hidden rounded-2xl bg-white shadow-[0_8px_32px_rgba(15,23,42,0.07)] ring-1 ring-stone-200/70 ${
        compact ? "p-4" : "p-5 sm:p-6"
      }`}
    >
      <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm"
          style={{ backgroundColor: primaryColor }}
          aria-hidden
        >
          <ContactIcon />
        </span>
        <h2 className="text-lg font-semibold tracking-tight text-stone-900 sm:text-xl">
          {dict.store.contactTitle}
        </h2>
      </div>

      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.key}>
            <ContactRow
              label={item.label}
              value={item.value}
              href={item.href}
              icon={item.icon}
              primaryColor={primaryColor}
            />
          </li>
        ))}
      </ul>

      {whatsAppUrl && (
        <a
          href={whatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#25D366] to-[#1ebe57] px-4 py-3.5 text-base font-semibold text-white shadow-[0_8px_20px_rgba(37,211,102,0.35)] transition active:scale-[0.98]"
        >
          <WhatsAppIcon />
          {dict.menu.messageOnWhatsApp}
        </a>
      )}
    </section>
  );
}

function ContactRow({
  label,
  value,
  href,
  icon,
  primaryColor,
}: {
  label: string;
  value: string;
  href: string | null;
  icon: ReactNode;
  primaryColor: string;
}) {
  const content = (
    <>
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${primaryColor}12`, color: primaryColor }}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
          {label}
        </span>
        <span className="mt-0.5 block text-[15px] font-medium leading-snug text-stone-900">
          {value}
        </span>
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="flex items-center gap-3 rounded-xl border border-stone-100 bg-stone-50/60 px-3.5 py-3 transition hover:border-stone-200 hover:bg-white active:scale-[0.99]"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-stone-100 bg-stone-50/60 px-3.5 py-3">
      {content}
    </div>
  );
}

function ContactIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path d="M3 4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4Zm2-.5A.5.5 0 0 0 4.5 4v.379l5.5 3.437 5.5-3.437V4a.5.5 0 0 0-.5-.5h-9Z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 0 1 3.5 2h1.148a1.5 1.5 0 0 1 1.465 1.175l.716 3.223a1.5 1.5 0 0 1-1.052 1.79l-.933.312a11.042 11.042 0 0 0 5.516 5.516l.312-.933a1.5 1.5 0 0 1 1.79-1.052l3.223.716A1.5 1.5 0 0 1 18 15.352V16.5a1.5 1.5 0 0 1-1.5 1.5H15c-6.627 0-12-5.373-12-12V4.5A1.5 1.5 0 0 1 3.5 3H2Z" clipRule="evenodd" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path d="M3 4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H3Zm0 2.236V6h14v.236l-7 4.472-7-4.472Z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path fillRule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.145c.24-.13.547-.311.916-.518a14.416 14.416 0 0 0 1.872-1.244c1.243-.96 2.49-2.27 3.323-4.024C17.577 9.364 18 7.594 18 6c0-3.314-2.686-6-6-6S6 2.686 6 6c0 1.594.423 3.364 1.272 5.096.833 1.754 2.08 3.064 3.323 4.024a14.417 14.417 0 0 0 1.872 1.244 11.86 11.86 0 0 0 .916.518 6.03 6.03 0 0 0 .299.153l.006.003ZM10 8.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" clipRule="evenodd" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5 shrink-0"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.884 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

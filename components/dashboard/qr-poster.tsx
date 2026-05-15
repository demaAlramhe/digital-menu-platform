"use client";

import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import { useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import { normalizePhoneForTel } from "@/lib/utils/whatsapp";

export type PosterStyle = "a4" | "compact";

type QrPosterProps = {
  storeName: string;
  menuUrl: string;
  logoUrl?: string | null;
  phone?: string | null;
  primaryColor?: string;
};

export function QrPoster({
  storeName,
  menuUrl,
  logoUrl,
  phone,
  primaryColor = "#111827",
}: QrPosterProps) {
  const { dict } = useLocale();
  const [style, setStyle] = useState<PosterStyle>("a4");

  const qrSize = style === "a4" ? 280 : 180;
  const hasPhone = Boolean(phone?.trim());
  const initial = storeName?.charAt(0)?.toUpperCase() || "M";

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <button
          type="button"
          onClick={handlePrint}
          className="rounded-lg bg-slate-900 px-5 py-2.5 font-medium text-white"
        >
          {dict.poster.print}
        </button>

        <Link
          href="/dashboard/qr"
          className="rounded-lg border px-5 py-2.5 font-medium"
        >
          {dict.poster.backToQr}
        </Link>

        <div className="ml-auto flex rounded-lg border bg-white p-1 text-sm">
          <StyleToggle
            active={style === "a4"}
            label={dict.poster.a4}
            onClick={() => setStyle("a4")}
          />
          <StyleToggle
            active={style === "compact"}
            label={dict.poster.compact}
            onClick={() => setStyle("compact")}
          />
        </div>
      </div>

      <p className="text-sm text-slate-600 print:hidden">{dict.poster.previewHint}</p>

      <div
        id="qr-poster-print"
        className={`mx-auto bg-white text-slate-900 ${
          style === "a4"
            ? "flex min-h-[calc(100vh-12rem)] max-w-[210mm] flex-col items-center justify-center border border-slate-200 px-8 py-12 shadow-sm print:min-h-0 print:max-w-none print:border-0 print:shadow-none print:py-0"
            : "max-w-md rounded-2xl border border-slate-200 px-6 py-8 shadow-sm print:max-w-none print:rounded-none print:border-0 print:shadow-none"
        }`}
      >
        <PosterContent
          storeName={storeName}
          menuUrl={menuUrl}
          logoUrl={logoUrl}
          phone={phone}
          primaryColor={primaryColor}
          initial={initial}
          qrSize={qrSize}
          style={style}
          hasPhone={hasPhone}
          scanInstruction={dict.poster.scanInstruction}
          phoneLabel={dict.common.phone}
          whatsappLabel={dict.poster.whatsappLabel}
        />
      </div>
    </div>
  );
}

function PosterContent({
  storeName,
  menuUrl,
  logoUrl,
  phone,
  primaryColor,
  initial,
  qrSize,
  style,
  hasPhone,
  scanInstruction,
  phoneLabel,
  whatsappLabel,
}: {
  storeName: string;
  menuUrl: string;
  logoUrl?: string | null;
  phone?: string | null;
  primaryColor: string;
  initial: string;
  qrSize: number;
  style: PosterStyle;
  hasPhone: boolean;
  scanInstruction: string;
  phoneLabel: string;
  whatsappLabel: string;
}) {
  const titleClass =
    style === "a4"
      ? "text-center text-4xl font-bold tracking-tight"
      : "text-center text-2xl font-bold tracking-tight";

  const instructionClass =
    style === "a4"
      ? "mt-3 text-center text-xl text-slate-600"
      : "mt-2 text-center text-base text-slate-600";

  return (
    <div
      className={`flex w-full flex-col items-center ${
        style === "a4" ? "gap-8" : "gap-5"
      }`}
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt=""
          className={
            style === "a4"
              ? "h-24 w-24 rounded-2xl object-cover"
              : "h-16 w-16 rounded-xl object-cover"
          }
        />
      ) : (
        <div
          className={`flex items-center justify-center rounded-2xl border-2 font-bold ${
            style === "a4" ? "h-24 w-24 text-4xl" : "h-16 w-16 text-2xl"
          }`}
          style={{ borderColor: primaryColor, color: primaryColor }}
        >
          {initial}
        </div>
      )}

      <div>
        <h1 className={titleClass} style={{ color: primaryColor }}>
          {storeName}
        </h1>
        <p className={instructionClass}>{scanInstruction}</p>
      </div>

      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 print:border-slate-300">
        <QRCodeCanvas
          value={menuUrl}
          size={qrSize}
          level="M"
          includeMargin
          bgColor="#ffffff"
          fgColor="#111827"
        />
      </div>

      <p
        className={`break-all text-center font-mono text-slate-500 ${
          style === "a4" ? "max-w-md text-sm" : "max-w-xs text-xs"
        }`}
      >
        {menuUrl}
      </p>

      {hasPhone && (
        <div
          className={`text-center text-slate-700 ${
            style === "a4" ? "text-lg" : "text-base"
          }`}
        >
          <p>
            <span className="font-medium">{phoneLabel}: </span>
            <span>{phone}</span>
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {whatsappLabel}: {normalizePhoneForTel(phone!)}
          </p>
        </div>
      )}
    </div>
  );
}

function StyleToggle({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 font-medium transition ${
        active
          ? "bg-slate-900 text-white"
          : "text-slate-600 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}

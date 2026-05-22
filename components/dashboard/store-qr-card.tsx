"use client";

import { QRCodeCanvas } from "qrcode.react";
import { useRef, useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import {
  PrimaryButton,
  SecondaryButton,
  SecondaryLink,
} from "@/components/dashboard/ui/buttons";
import { dash } from "@/components/dashboard/ui/styles";

type StoreQrCardProps = {
  storeName: string;
  storeSlug: string;
  menuUrl: string;
};

export function StoreQrCard({ storeName, storeSlug, menuUrl }: StoreQrCardProps) {
  const { dict } = useLocale();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copyMessage, setCopyMessage] = useState("");
  const [downloadMessage, setDownloadMessage] = useState("");

  async function handleCopyLink() {
    setCopyMessage("");
    try {
      await navigator.clipboard.writeText(menuUrl);
      setCopyMessage(dict.qr.copied);
    } catch {
      setCopyMessage(dict.qr.copyFailed);
    }
  }

  function handleDownload() {
    setDownloadMessage("");
    const canvas = canvasRef.current;
    if (!canvas) {
      setDownloadMessage(dict.qr.qrNotReady);
      return;
    }
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${storeSlug}-menu-qr.png`;
      link.click();
      setDownloadMessage(dict.qr.downloadReady);
    } catch {
      setDownloadMessage(dict.qr.downloadFailed);
    }
  }

  return (
    <div className={`${dash.card} w-full max-w-none overflow-hidden`}>
      <div className="border-b border-stone-100 bg-stone-50/80 px-6 py-5 sm:px-8 sm:py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
          {dict.qr.store}
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
          {storeName}
        </p>
        <p className="mt-2 font-mono text-sm text-stone-600 sm:text-base">{storeSlug}</p>
      </div>

      <div className="p-6 sm:p-8 lg:p-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-12 xl:gap-16">
          <div className="flex min-w-0 flex-col gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
                {dict.qr.publicUrl}
              </p>
              <a
                href={menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block break-all text-sm font-medium text-sky-700 underline-offset-2 hover:underline sm:text-base"
              >
                {menuUrl}
              </a>
            </div>

            <p className="text-sm leading-relaxed text-stone-600 sm:text-[15px]">
              {dict.qr.scanHint}
            </p>

            <div className="flex flex-wrap gap-3">
              <SecondaryButton type="button" onClick={handleCopyLink}>
                {dict.qr.copyLink}
              </SecondaryButton>
              <PrimaryButton type="button" onClick={handleDownload}>
                {dict.qr.downloadPng}
              </PrimaryButton>
              <SecondaryLink href="/dashboard/qr/poster">{dict.qr.printPoster}</SecondaryLink>
            </div>

            {copyMessage && <p className="text-sm text-emerald-700">{copyMessage}</p>}
            {downloadMessage && (
              <p className="text-sm text-stone-600">{downloadMessage}</p>
            )}
          </div>

          <div className="flex justify-center lg:justify-center">
            <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-inner sm:p-10">
              <QRCodeCanvas
                ref={canvasRef}
                value={menuUrl}
                size={280}
                level="M"
                includeMargin
                bgColor="#ffffff"
                fgColor="#111827"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

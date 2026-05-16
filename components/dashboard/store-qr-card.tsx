"use client";

import { QRCodeCanvas } from "qrcode.react";
import { useRef, useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import { PrimaryButton, SecondaryButton } from "@/components/dashboard/ui/buttons";
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
    <div className={`${dash.card} max-w-xl overflow-hidden`}>
      <div className="border-b border-stone-100 bg-stone-50/80 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
          {dict.qr.store}
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-stone-900">
          {storeName}
        </p>
        <p className="mt-2 font-mono text-sm text-stone-600">{storeSlug}</p>
      </div>

      <div className="space-y-6 p-6 sm:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
            {dict.qr.publicUrl}
          </p>
          <a
            href={menuUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block break-all text-sm font-medium text-sky-700 underline-offset-2 hover:underline"
          >
            {menuUrl}
          </a>
        </div>

        <div className="flex justify-center rounded-2xl border border-stone-200/80 bg-white p-8 shadow-inner">
          <QRCodeCanvas
            ref={canvasRef}
            value={menuUrl}
            size={240}
            level="M"
            includeMargin
            bgColor="#ffffff"
            fgColor="#111827"
          />
        </div>

        <p className="text-center text-sm text-stone-600">{dict.qr.scanHint}</p>

        <div className="flex flex-wrap gap-3">
          <SecondaryButton type="button" onClick={handleCopyLink}>
            {dict.qr.copyLink}
          </SecondaryButton>
          <PrimaryButton type="button" onClick={handleDownload}>
            {dict.qr.downloadPng}
          </PrimaryButton>
        </div>

        {copyMessage && <p className="text-sm text-emerald-700">{copyMessage}</p>}
        {downloadMessage && <p className="text-sm text-stone-600">{downloadMessage}</p>}
      </div>
    </div>
  );
}

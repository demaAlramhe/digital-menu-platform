"use client";

import { QRCodeCanvas } from "qrcode.react";
import { useRef, useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";

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
    <div className="max-w-xl space-y-6 rounded-2xl border bg-white p-8 shadow-sm">
      <div className="space-y-1">
        <p className="text-sm text-slate-500">{dict.qr.store}</p>
        <p className="text-2xl font-semibold text-slate-900">{storeName}</p>
      </div>

      <div className="space-y-1">
        <p className="text-sm text-slate-500">{dict.qr.storeSlug}</p>
        <p className="font-mono text-slate-800">{storeSlug}</p>
      </div>

      <div className="space-y-1">
        <p className="text-sm text-slate-500">{dict.qr.publicUrl}</p>
        <a
          href={menuUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all font-mono text-sm text-blue-700 underline"
        >
          {menuUrl}
        </a>
      </div>

      <div className="flex justify-center rounded-xl border bg-slate-50 p-6">
        <QRCodeCanvas
          ref={canvasRef}
          value={menuUrl}
          size={256}
          level="M"
          includeMargin
          bgColor="#ffffff"
          fgColor="#111827"
        />
      </div>

      <p className="text-center text-sm text-slate-600">{dict.qr.scanHint}</p>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleCopyLink}
          className="rounded-lg border px-4 py-2 font-medium"
        >
          {dict.qr.copyLink}
        </button>

        <button
          type="button"
          onClick={handleDownload}
          className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white"
        >
          {dict.qr.downloadPng}
        </button>
      </div>

      {copyMessage && <p className="text-sm text-slate-600">{copyMessage}</p>}
      {downloadMessage && (
        <p className="text-sm text-slate-600">{downloadMessage}</p>
      )}
    </div>
  );
}

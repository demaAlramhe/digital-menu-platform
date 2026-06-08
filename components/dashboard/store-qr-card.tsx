"use client";

import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { useRef, useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import {
  PrimaryButton,
  SecondaryButton,
  SecondaryLink,
} from "@/components/dashboard/ui/buttons";
import { dash } from "@/components/dashboard/ui/styles";

const QR_SIZE = 280;

type StoreQrCardProps = {
  storeName: string;
  storeSlug: string;
  menuUrl: string;
};

function triggerDownload(href: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = href;
  link.click();
}

function svgElementToCanvas(svg: SVGElement, size: number): Promise<HTMLCanvasElement> {
  const svgString = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas context unavailable"));
        return;
      }
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("SVG image load failed"));
    };
    img.src = url;
  });
}

export function StoreQrCard({ storeName, storeSlug, menuUrl }: StoreQrCardProps) {
  const { dict } = useLocale();
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const [copyMessage, setCopyMessage] = useState("");
  const [downloadMessage, setDownloadMessage] = useState("");

  const pngFilename = `menu-qr-${storeSlug}.png`;
  const svgFilename = `menu-qr-${storeSlug}.svg`;

  const qrProps = {
    value: menuUrl,
    size: QR_SIZE,
    level: "M" as const,
    includeMargin: true,
    bgColor: "#ffffff",
    fgColor: "#111827",
  };

  async function handleCopyLink() {
    setCopyMessage("");
    try {
      await navigator.clipboard.writeText(menuUrl);
      setCopyMessage(dict.qr.copied);
    } catch {
      setCopyMessage(dict.qr.copyFailed);
    }
  }

  async function handleDownloadPng() {
    setDownloadMessage("");
    const container = qrContainerRef.current;
    if (!container) {
      setDownloadMessage(dict.qr.qrNotReady);
      return;
    }

    const canvas = container.querySelector("canvas");
    const svg = container.querySelector("svg");

    try {
      if (canvas instanceof HTMLCanvasElement) {
        triggerDownload(canvas.toDataURL("image/png"), pngFilename);
        setDownloadMessage(dict.qr.downloadReady);
        return;
      }

      if (svg instanceof SVGElement) {
        const exportCanvas = await svgElementToCanvas(svg, QR_SIZE);
        triggerDownload(exportCanvas.toDataURL("image/png"), pngFilename);
        setDownloadMessage(dict.qr.downloadReady);
        return;
      }

      setDownloadMessage(dict.qr.qrNotReady);
    } catch {
      setDownloadMessage(dict.qr.downloadFailed);
    }
  }

  function handleDownloadSvg() {
    setDownloadMessage("");
    const container = qrContainerRef.current;
    const svg = container?.querySelector("svg");

    if (!(svg instanceof SVGElement)) {
      setDownloadMessage(dict.qr.qrNotReady);
      return;
    }

    try {
      const svgString = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      triggerDownload(url, svgFilename);
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setDownloadMessage(dict.qr.downloadReady);
    } catch {
      setDownloadMessage(dict.qr.downloadFailed);
    }
  }

  return (
    <div className={`${dash.card} w-full max-w-none overflow-hidden`}>
      <div className="border-b border-stone-100/80 bg-gradient-to-r from-stone-50/90 to-white px-6 py-5 sm:px-8 sm:py-6">
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
              <SecondaryLink href="/dashboard/qr/poster">{dict.qr.printPoster}</SecondaryLink>
            </div>

            {copyMessage && <p className="text-sm text-emerald-700">{copyMessage}</p>}
            {downloadMessage && (
              <p className="text-sm text-stone-600">{downloadMessage}</p>
            )}
          </div>

          <div className="flex flex-col items-center gap-4">
            <div
              ref={qrContainerRef}
              className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-[inset_0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-stone-900/[0.03] sm:p-10"
            >
              <QRCodeCanvas {...qrProps} />
              <div className="sr-only" aria-hidden>
                <QRCodeSVG {...qrProps} />
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <PrimaryButton
                type="button"
                onClick={handleDownloadPng}
                className="shrink-0 whitespace-nowrap"
              >
                {dict.qr.downloadPng ?? "PNG"}
              </PrimaryButton>
              <SecondaryButton
                type="button"
                onClick={handleDownloadSvg}
                className="shrink-0 whitespace-nowrap"
              >
                {dict.qr.downloadSvg ?? "SVG"}
              </SecondaryButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

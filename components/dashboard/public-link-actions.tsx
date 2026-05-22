"use client";

import { useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import { appendLangToAbsoluteUrl } from "@/lib/i18n/public-locale-url";
import { PrimaryButton, SecondaryButton } from "@/components/dashboard/ui/buttons";
import { dash } from "@/components/dashboard/ui/styles";

type PublicLinkActionsProps = {
  entryUrl: string;
  menuUrl: string;
  compact?: boolean;
};

export function PublicLinkActions({
  entryUrl,
  menuUrl,
  compact = false,
}: PublicLinkActionsProps) {
  const { dict, locale } = useLocale();
  const [copyMessage, setCopyMessage] = useState("");

  const welcomeUrl = appendLangToAbsoluteUrl(entryUrl, locale);
  const shareMenuUrl = appendLangToAbsoluteUrl(menuUrl, locale);

  async function handleCopy() {
    setCopyMessage("");
    try {
      await navigator.clipboard.writeText(welcomeUrl);
      setCopyMessage(dict.qr.copied);
    } catch {
      setCopyMessage(dict.qr.copyFailed);
    }
  }

  return (
    <div
      className={
        compact
          ? "flex flex-col gap-3"
          : `${dash.card} flex flex-col gap-4 p-5 sm:p-6`
      }
    >
      {!compact && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
            {dict.dashboard.publicLinkTitle}
          </p>
          <p className="mt-1 text-sm text-stone-600">{dict.dashboard.publicLinkDesc}</p>
        </div>
      )}

      <div className="min-w-0 rounded-lg border border-stone-200/80 bg-stone-50/80 px-3 py-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
          {dict.dashboard.entryLinkLabel}
        </p>
        <a
          href={welcomeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 block break-all text-sm font-medium text-sky-700 underline-offset-2 hover:underline"
        >
          {welcomeUrl}
        </a>
        <p className="mt-2 text-[11px] text-stone-500">
          <span className="font-medium">{dict.dashboard.menuLinkLabel}:</span>{" "}
          <a
            href={shareMenuUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-700 hover:underline"
          >
            {shareMenuUrl}
          </a>
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <PrimaryButton
          type="button"
          onClick={() => window.open(welcomeUrl, "_blank", "noopener,noreferrer")}
        >
          {dict.dashboard.previewPublic}
        </PrimaryButton>
        <SecondaryButton type="button" onClick={handleCopy}>
          {dict.dashboard.copyPublicLink}
        </SecondaryButton>
        <SecondaryButton
          type="button"
          onClick={() => window.open(shareMenuUrl, "_blank", "noopener,noreferrer")}
        >
          {dict.dashboard.previewMenu}
        </SecondaryButton>
      </div>

      {copyMessage && (
        <p className="text-sm text-stone-600" role="status">
          {copyMessage}
        </p>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import { dash } from "@/components/dashboard/ui/styles";
import { formatMessage } from "@/lib/i18n";
import type { OnboardingProgress } from "@/lib/dashboard/onboarding-steps";

type OnboardingBannerProps = {
  progress: OnboardingProgress;
  storeSlug: string;
};

export function OnboardingBanner({
  progress,
  storeSlug: _storeSlug,
}: OnboardingBannerProps) {
  const { dict } = useLocale();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || progress.allComplete) {
    return null;
  }

  const percent = Math.round(
    (progress.completedCount / progress.totalCount) * 100
  );

  return (
    <div
      className={`${dash.card} mb-6 flex items-center gap-3 px-4 py-3 sm:px-5`}
      role="status"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-stone-900">
          {dict.onboarding.bannerTitle}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <div
            className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-stone-100"
            aria-hidden
          >
            <div
              className="h-full rounded-full bg-emerald-500 transition-[width]"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="shrink-0 text-xs font-medium tabular-nums text-stone-500">
            {progress.completedCount}/{progress.totalCount}
          </span>
        </div>
        <p className="mt-1 text-xs text-stone-500">
          {formatMessage(dict.onboarding.bannerSubtitle, {
            done: progress.completedCount,
            total: progress.totalCount,
          })}
        </p>
      </div>

      <Link
        href="/dashboard/onboarding"
        className={`${dash.primaryBtn} shrink-0 !min-h-9 !px-3.5 !py-2 text-xs`}
      >
        {dict.onboarding.completeSetup}
      </Link>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        className={`${dash.ghostBtn} shrink-0 !min-h-8 !px-2 text-lg leading-none`}
        aria-label={dict.onboarding.dismiss}
      >
        ×
      </button>
    </div>
  );
}

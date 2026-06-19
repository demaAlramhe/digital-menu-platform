"use client";

import Link from "next/link";
import { useState } from "react";
import { dash } from "@/components/dashboard/ui/styles";
import type { OnboardingProgress } from "@/lib/dashboard/onboarding-steps";

type OnboardingBannerProps = {
  progress: OnboardingProgress;
  bannerTitle: string;
  bannerSubtitle: string;
  completeSetupLabel: string;
  dismissLabel: string;
};

export function OnboardingBanner({
  progress,
  bannerTitle,
  bannerSubtitle,
  completeSetupLabel,
  dismissLabel,
}: OnboardingBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  const percent = Math.round(
    (progress.completedCount / progress.totalCount) * 100
  );

  return (
    <div
      className="mb-6 rounded-2xl border border-brand-secondary/40 bg-white px-4 py-4 shadow-sm sm:px-5"
      role="status"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-brand-dark">{bannerTitle}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <div
              className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-brand-secondary/30"
              aria-hidden
            >
              <div
                className="h-full rounded-full bg-brand-dark transition-[width]"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="shrink-0 text-xs font-medium tabular-nums text-stone-600">
              {progress.completedCount}/{progress.totalCount}
            </span>
          </div>
          <p className="mt-1 text-xs text-stone-600">{bannerSubtitle}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
          <Link
            href="/dashboard/onboarding"
            className={`${dash.primaryBtn} !min-h-9 !px-3.5 !py-2 text-xs`}
          >
            {completeSetupLabel}
          </Link>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className={`${dash.ghostBtn} !min-h-8 !px-2 text-lg leading-none`}
            aria-label={dismissLabel}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

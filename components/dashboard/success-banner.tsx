"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "@/components/i18n/locale-provider";

type SuccessBannerProps = {
  message: string;
};

export function SuccessBanner({ message }: SuccessBannerProps) {
  const { dict } = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      router.replace(pathname, { scroll: false });
    }, 6000);

    return () => window.clearTimeout(timer);
  }, [pathname, router]);

  function dismiss() {
    router.replace(pathname, { scroll: false });
  }

  return (
    <div
      role="status"
      className="mb-6 flex items-start justify-between gap-3 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-900"
    >
      <p className="font-medium">{message}</p>
      <button
        type="button"
        onClick={dismiss}
        className="shrink-0 rounded px-1 text-green-800 transition hover:bg-green-100"
        aria-label={dict.common.dismiss}
      >
        ×
      </button>
    </div>
  );
}

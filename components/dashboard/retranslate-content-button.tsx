"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import { dash } from "@/components/dashboard/ui/styles";
import { appendTranslationNote } from "@/lib/dashboard/translation-feedback";
import { getTranslationStatusFromResponse } from "@/lib/dashboard/parse-save-response";
import { formatMessage } from "@/lib/i18n";

export function RetranslateContentButton() {
  const router = useRouter();
  const { dict } = useLocale();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleClick() {
    if (
      !window.confirm(dict.settings.retranslateConfirm)
    ) {
      return;
    }

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/store-content/retranslate", {
        method: "POST",
      });
      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || dict.settings.retranslateFailed);
        return;
      }

      const base =
        typeof result.message === "string"
          ? result.message
          : formatMessage(dict.settings.retranslateSuccess, {
              categories: String(result.categoriesUpdated ?? 0),
              items: String(result.itemsUpdated ?? 0),
            });

      setMessage(
        appendTranslationNote(
          dict,
          base,
          getTranslationStatusFromResponse(result)
        )
      );
      router.refresh();
    } catch {
      setMessage(dict.settings.retranslateFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-stone-200/90 bg-stone-50/80 p-4">
      <p className="text-sm font-medium text-stone-800">
        {dict.settings.retranslateTitle}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-stone-600">
        {dict.settings.retranslateDesc}
      </p>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`${dash.secondaryBtn} mt-3`}
      >
        {loading ? dict.settings.retranslateRunning : dict.settings.retranslateAction}
      </button>
      {message && (
        <p className="mt-2 text-sm text-stone-700" role="status">
          {message}
        </p>
      )}
    </div>
  );
}

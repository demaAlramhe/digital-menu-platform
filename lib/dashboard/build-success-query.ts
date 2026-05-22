import type { TranslationStatus } from "@/lib/i18n/translation-status";

export function buildSuccessQuery(
  success: string,
  translationStatus?: TranslationStatus
): string {
  const params = new URLSearchParams({ success });
  if (translationStatus && translationStatus !== "translated") {
    params.set("translation", translationStatus);
  }
  return params.toString();
}

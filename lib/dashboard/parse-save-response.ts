import type { TranslationStatus } from "@/lib/i18n/translation-status";

export type SaveApiResponse = {
  error?: string;
  translation?: { status?: TranslationStatus };
};

export function getTranslationStatusFromResponse(
  result: SaveApiResponse
): TranslationStatus | undefined {
  const status = result.translation?.status;
  return status;
}

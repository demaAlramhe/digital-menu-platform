import type { Dictionary } from "@/lib/i18n";
import type { TranslationStatus } from "@/lib/i18n/translation-status";

export function appendTranslationNote(
  dict: Dictionary,
  baseMessage: string,
  status?: TranslationStatus | null
): string {
  if (!status || status === "translated") {
    return baseMessage;
  }
  if (status === "partial") {
    return `${baseMessage} ${dict.common.translationPartial}`;
  }
  if (status === "source_only_no_key") {
    return `${baseMessage} ${dict.common.translationSourceOnly}`;
  }
  return `${baseMessage} ${dict.common.translationSourceOnlyError}`;
}

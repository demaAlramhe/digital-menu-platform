export type TranslationStatus =
  | "translated"
  | "source_only_no_key"
  | "source_only_error"
  | "partial";

export function isTranslationStatus(
  value: string | null | undefined
): value is TranslationStatus {
  return (
    value === "translated" ||
    value === "source_only_no_key" ||
    value === "source_only_error" ||
    value === "partial"
  );
}

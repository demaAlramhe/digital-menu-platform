import type { Locale } from "@/lib/i18n/types";

export type ContentLocale = Locale;

export type TrilingualText = {
  ar?: string | null;
  he?: string | null;
  en?: string | null;
};

export function parseContentLocale(
  value: string | null | undefined
): ContentLocale | null {
  if (value === "ar" || value === "he" || value === "en") {
    return value;
  }
  return null;
}

/** Pick text for the customer's locale; fall back to source language then legacy field. */
export function pickLocalizedText(
  viewerLocale: Locale,
  fields: TrilingualText,
  sourceLocale: ContentLocale,
  legacyFallback?: string | null
): string {
  const direct = fields[viewerLocale]?.trim();
  if (direct) return direct;

  const fromSource = fields[sourceLocale]?.trim();
  if (fromSource) return fromSource;

  const legacy = legacyFallback?.trim();
  if (legacy) return legacy;

  for (const locale of ["ar", "he", "en"] as const) {
    const value = fields[locale]?.trim();
    if (value) return value;
  }

  return "";
}

export function pickLocalizedOptional(
  viewerLocale: Locale,
  fields: TrilingualText,
  sourceLocale: ContentLocale,
  legacyFallback?: string | null
): string | null {
  const text = pickLocalizedText(
    viewerLocale,
    fields,
    sourceLocale,
    legacyFallback
  );
  return text || null;
}

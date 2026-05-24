import type { ContentLocale } from "@/lib/content/pick-localized";
import type { TrilingualResult } from "@/lib/ai/translate-content";

/** Fixed welcome CTA copy per locale (also saved to DB on settings update). */
export const DEFAULT_WELCOME_CTA: TrilingualResult = {
  ar: "ابدأ الآن",
  he: "התחל עכשיו",
  en: "Start Now",
};

export function defaultWelcomeCtaForSource(
  sourceLocale: ContentLocale
): string {
  return DEFAULT_WELCOME_CTA[sourceLocale];
}

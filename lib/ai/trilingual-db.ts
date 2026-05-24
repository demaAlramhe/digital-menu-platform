import type { TrilingualResult } from "@/lib/ai/translate-content";

/** Maps `{ ar, he, en }` to `{ prefix_ar, prefix_he, prefix_en }` for Supabase. */
export function trilingualColumns(
  prefix: string,
  translated: TrilingualResult | undefined
): Record<string, string | null> {
  if (!translated) {
    return {
      [`${prefix}_ar`]: null,
      [`${prefix}_he`]: null,
      [`${prefix}_en`]: null,
    };
  }

  return {
    [`${prefix}_ar`]: translated.ar || null,
    [`${prefix}_he`]: translated.he || null,
    [`${prefix}_en`]: translated.en || null,
  };
}

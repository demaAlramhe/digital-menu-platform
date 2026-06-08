type TranslationFields = {
  name_ar?: string | null;
  name_he?: string | null;
  name_en?: string | null;
  description_ar?: string | null;
  description_he?: string | null;
  description_en?: string | null;
};

type LocaleStatus = {
  ar: boolean;
  he: boolean;
  en: boolean;
};

export type TranslationStatus = {
  level: "full" | "partial" | "minimal";
  locales: LocaleStatus;
  filledCount: number;
};

export function getTranslationStatus(item: TranslationFields): TranslationStatus {
  const locales: LocaleStatus = {
    ar: !!(item.name_ar?.trim()),
    he: !!(item.name_he?.trim()),
    en: !!(item.name_en?.trim()),
  };
  const filledCount = Object.values(locales).filter(Boolean).length;
  const level =
    filledCount === 3 ? "full" : filledCount === 2 ? "partial" : "minimal";
  return { level, locales, filledCount };
}

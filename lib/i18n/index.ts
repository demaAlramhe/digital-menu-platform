import { ar } from "./dictionaries/ar";
import { he } from "./dictionaries/he";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  type Dictionary,
  type Locale,
  getDirection,
  isLocale,
} from "./types";

export {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  type Dictionary,
  type Locale,
  getDirection,
  isLocale,
};

const dictionaries: Record<Locale, Dictionary> = {
  he,
  ar,
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function formatMessage(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    String(values[key] ?? "")
  );
}

export { getRoleLabel, isDisplayRole } from "./roles";
export type { DisplayRole } from "./roles";

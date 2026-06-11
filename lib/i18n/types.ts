import type { he } from "./dictionaries/he";

export type Locale = "he" | "ar" | "en";

type DeepStringRecord<T> = {
  [K in keyof T]: T[K] extends readonly string[]
    ? readonly string[]
    : T[K] extends Record<string, unknown>
      ? DeepStringRecord<T[K]>
      : string;
};

export type Dictionary = DeepStringRecord<typeof he>;

export const LOCALES: Locale[] = ["he", "ar", "en"];

export const DEFAULT_LOCALE: Locale = "ar";

export const LOCALE_COOKIE = "menu-locale";

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "he" || value === "ar" || value === "en";
}

export function getDirection(locale: Locale): "rtl" | "ltr" {
  return locale === "en" ? "ltr" : "rtl";
}

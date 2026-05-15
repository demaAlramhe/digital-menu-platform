import type { he } from "./dictionaries/he";

export type Locale = "he" | "ar";

type DeepStringRecord<T> = {
  [K in keyof T]: T[K] extends Record<string, unknown>
    ? DeepStringRecord<T[K]>
    : string;
};

export type Dictionary = DeepStringRecord<typeof he>;

export const LOCALES: Locale[] = ["he", "ar"];

export const DEFAULT_LOCALE: Locale = "he";

export const LOCALE_COOKIE = "menu-locale";

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "he" || value === "ar";
}

export function getDirection(_locale: Locale): "rtl" {
  return "rtl";
}

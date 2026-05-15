import { cookies } from "next/headers";
import { getDictionary } from "./index";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  type Dictionary,
  type Locale,
  isLocale,
} from "./types";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getTranslations(): Promise<{
  locale: Locale;
  dict: Dictionary;
}> {
  const locale = await getLocale();
  return { locale, dict: getDictionary(locale) };
}

"use client";

import { createContext, useContext } from "react";
import type { Dictionary, Locale } from "@/lib/i18n/types";

type LocaleContextValue = {
  locale: Locale;
  dict: Dictionary;
  dir: "rtl";
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: React.ReactNode;
}) {
  return (
    <LocaleContext.Provider value={{ locale, dict, dir: "rtl" }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
}

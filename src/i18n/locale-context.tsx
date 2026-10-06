"use client";

import type { Locale } from "@/content/model";
import { createContext, useContext, type ReactNode } from "react";

const LocaleContext = createContext<Locale>("nl");
export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}
export function useLocale() {
  return useContext(LocaleContext);
}

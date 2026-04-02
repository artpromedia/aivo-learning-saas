"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { useLocale, useTranslations, type Messages } from "@/lib/i18n";

interface I18nContextValue {
  locale: string;
  messages: Messages | null;
  t: (section: string, key: string) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: "en",
  messages: null,
  t: (_section, key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const messages = useTranslations();

  function t(section: string, key: string): string {
    return messages?.[section]?.[key] ?? key;
  }

  return (
    <I18nContext.Provider value={{ locale, messages, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

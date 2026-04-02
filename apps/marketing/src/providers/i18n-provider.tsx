"use client";

import { createContext, useContext, useMemo } from "react";
import { useLocale, useTranslations, type Messages } from "@/lib/i18n";

interface I18nContextValue {
  locale: string;
  messages: Messages | null;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const messages = useTranslations();

  const t = useMemo(() => {
    return (key: string): string => {
      if (!messages) return key;
      const parts = key.split(".");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let current: any = messages;
      for (const part of parts) {
        if (current == null || typeof current !== "object") return key;
        current = current[part];
      }
      return typeof current === "string" ? current : key;
    };
  }, [messages]);

  return (
    <I18nContext.Provider value={{ locale, messages, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return ctx;
}

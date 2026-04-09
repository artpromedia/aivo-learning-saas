"use client";

import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl";
import type { ReactNode } from "react";

interface I18nProviderProps {
  locale: string;
  messages: AbstractIntlMessages;
  timeZone: string;
  children: ReactNode;
}

function handleI18nError(error: { code: string; message: string }) {
  // Suppress MISSING_MESSAGE (key not yet seeded) and FORMATTING_ERROR
  // (stale translation strings with unresolved placeholders like {level}).
  if (error.code === "MISSING_MESSAGE" || error.code === "FORMATTING_ERROR") {
    return;
  }
  console.error("[i18n]", error);
}

function getMessageFallback({
  namespace,
  key,
}: {
  namespace?: string;
  key: string;
  error: unknown;
}) {
  const shortKey =
    namespace && key.startsWith(`${namespace}.`)
      ? key.slice(namespace.length + 1)
      : key;
  return shortKey;
}

export function I18nProvider({ locale, messages, timeZone, children }: I18nProviderProps) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone={timeZone}
      onError={handleI18nError}
      getMessageFallback={getMessageFallback}
    >
      {children}
    </NextIntlClientProvider>
  );
}

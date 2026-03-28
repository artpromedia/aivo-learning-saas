"use client";

import { useEffect, useState, useTransition } from "react";
import { useLocale } from "next-intl";
import { getI18nServiceUrl, type Locale, defaultLocale } from "@/i18n/config";

interface LocaleOption {
  code: string;
  name: string;
  nativeName: string;
  direction: string;
}

export function LocaleSwitcher() {
  const currentLocale = useLocale();
  const [isPending, startTransition] = useTransition();
  const [availableLocales, setAvailableLocales] = useState<LocaleOption[]>([]);

  useEffect(() => {
    async function fetchLocales() {
      try {
        const res = await fetch(`${getI18nServiceUrl()}/i18n/locales`);
        if (res.ok) {
          const data = (await res.json()) as Array<{
            code: string;
            name: string;
            native_name: string;
            nativeName: string;
            direction: string;
          }>;
          setAvailableLocales(
            data.map((l) => ({
              code: l.code,
              name: l.name,
              nativeName: l.nativeName ?? l.native_name,
              direction: l.direction,
            })),
          );
        }
      } catch {
        setAvailableLocales([
          { code: "en", name: "English", nativeName: "English", direction: "LTR" },
        ]);
      }
    }
    fetchLocales();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newLocale = e.target.value;

    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=${60 * 60 * 24 * 365}`;
    localStorage.setItem("NEXT_LOCALE", newLocale);

    startTransition(() => {
      window.location.reload();
    });
  }

  if (availableLocales.length <= 1) return null;

  return (
    <select
      value={currentLocale}
      onChange={handleChange}
      disabled={isPending}
      className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm transition-colors hover:border-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
      aria-label="Select language"
    >
      {availableLocales.map((locale) => (
        <option key={locale.code} value={locale.code}>
          {locale.nativeName}
        </option>
      ))}
    </select>
  );
}

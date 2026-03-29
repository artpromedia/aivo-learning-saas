import { getRequestConfig } from "next-intl/server";
import type { AbstractIntlMessages } from "next-intl";
import { cookies, headers } from "next/headers";
import { defaultLocale, getI18nServiceUrl, locales, type Locale } from "./config";

function toNestedMessages(flatMessages: Record<string, string>): AbstractIntlMessages {
  const nested: Record<string, unknown> = {};

  for (const [flatKey, value] of Object.entries(flatMessages)) {
    const path = flatKey.split(".");
    let current: Record<string, unknown> = nested;

    for (let i = 0; i < path.length; i++) {
      const segment = path[i];
      const isLeaf = i === path.length - 1;

      if (isLeaf) {
        current[segment] = value;
      } else {
        const existing = current[segment];
        if (!existing || typeof existing !== "object" || Array.isArray(existing)) {
          current[segment] = {};
        }
        current = current[segment] as Record<string, unknown>;
      }
    }
  }

  return nested as AbstractIntlMessages;
}

async function fetchTranslations(locale: string): Promise<Record<string, string>> {
  const url = `${getI18nServiceUrl()}/i18n/translations/${locale}`;
  try {
    const res = await fetch(url, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return {};
    return (await res.json()) as Record<string, string>;
  } catch {
    return {};
  }
}

function detectLocale(cookieStore: Awaited<ReturnType<typeof cookies>>, headerList: Awaited<ReturnType<typeof headers>>): Locale {
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }

  const acceptLanguage = headerList.get("accept-language") ?? "";
  const preferred = acceptLanguage
    .split(",")
    .map((part) => part.split(";")[0].trim().split("-")[0])
    .find((lang) => locales.includes(lang as Locale));

  if (preferred) {
    return preferred as Locale;
  }

  return defaultLocale;
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headerList = await headers();
  const locale = detectLocale(cookieStore, headerList);

  const flatMessages = await fetchTranslations(locale);
  const messages = toNestedMessages(flatMessages);

  return {
    locale,
    messages,
    timeZone: "UTC",
  };
});

export const defaultLocale = "en";

export const locales = ["en", "es", "fr", "ar", "zh", "pt", "de", "ja", "ko", "hi"] as const;

export type Locale = (typeof locales)[number];

export const namespaces = [
  "common",
  "auth",
  "onboarding",
  "dashboard",
  "assessment",
  "brain",
  "tutor",
  "homework",
  "gamification",
  "settings",
  "errors",
  "email",
  "billing",
] as const;

export type Namespace = (typeof namespaces)[number];

export const rtlLocales = new Set(["ar", "he", "fa", "ur"]);

export function isRtl(locale: string): boolean {
  return rtlLocales.has(locale);
}

const I18N_SVC_URL = process.env.NEXT_PUBLIC_I18N_SVC_URL ?? "http://localhost:3011";

export function getI18nServiceUrl(): string {
  return I18N_SVC_URL;
}

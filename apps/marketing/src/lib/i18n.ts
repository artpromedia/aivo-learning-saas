import { useEffect, useState } from "react";

export interface Messages {
  nav: Record<string, string>;
  hero: Record<string, string>;
  features: Record<string, string>;
  howItWorks: Record<string, string>;
  aiTutors: Record<string, string>;
  pricing: Record<string, string>;
  cta: Record<string, string>;
  demo: Record<string, string>;
  contact: Record<string, string>;
  footer: Record<string, string>;
  common: Record<string, string>;
  [key: string]: Record<string, string>;
}

export function useLocale() {
  if (typeof document === "undefined") return "en";
  return (
    document.cookie
      .split("; ")
      .find((c) => c.startsWith("NEXT_LOCALE="))
      ?.split("=")[1] || "en"
  );
}

export function useTranslations() {
  const [messages, setMessages] = useState<Messages | null>(null);
  const locale = useLocale();

  useEffect(() => {
    import(`../../messages/${locale}.json`).then((mod) => setMessages(mod.default));
  }, [locale]);

  return messages;
}

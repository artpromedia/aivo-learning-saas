"use client";

import { useEffect } from "react";
import { useI18n } from "@/providers/i18n-provider";

export function HtmlLangSetter() {
  const { locale } = useI18n();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  return null;
}

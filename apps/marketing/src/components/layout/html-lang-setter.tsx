"use client";

import { useEffect } from "react";
import { useI18n } from "@/providers/i18n-provider";

const RTL_LOCALES = ["ar"];

export function HtmlLangSetter() {
  const { locale } = useI18n();

  useEffect(() => {
    const html = document.documentElement;
    html.lang = locale;
    const isRtl = RTL_LOCALES.includes(locale);
    html.dir = isRtl ? "rtl" : "ltr";
    if (isRtl) {
      html.classList.add("rtl");
    } else {
      html.classList.remove("rtl");
    }
  }, [locale]);

  return null;
}

"use client";

import { useEffect } from "react";
import { useI18n } from "@/providers/i18n-provider";

export function HtmlLangSetter() {
  const { locale } = useI18n();

  useEffect(() => {
    const isRtl = locale === "ar";
    document.documentElement.lang = locale;
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.classList.toggle("rtl", isRtl);
  }, [locale]);

  return null;
}

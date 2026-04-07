"use client";

import React from "react";
import { Globe } from "lucide-react";
import { locales } from "@/i18n/config";

const LOCALE_META: Record<
  string,
  { name: string; nativeName: string; flag: string }
> = {
  en: { name: "English", nativeName: "English", flag: "🇺🇸" },
  es: { name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  fr: { name: "French", nativeName: "Français", flag: "🇫🇷" },
  ar: { name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  zh: { name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
  pt: { name: "Portuguese", nativeName: "Português", flag: "🇧🇷" },
  de: { name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  ja: { name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  ko: { name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  hi: { name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  sw: { name: "Swahili", nativeName: "Kiswahili", flag: "🇰🇪" },
  ig: { name: "Igbo", nativeName: "Asụsụ Igbo", flag: "🇳🇬" },
  yo: { name: "Yoruba", nativeName: "Èdè Yorùbá", flag: "🇳🇬" },
  ha: { name: "Hausa", nativeName: "Hausa", flag: "🇳🇬" },
};

interface LanguageSelectProps {
  value?: string;
  onChange: (locale: string) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function LanguageSelect({
  value,
  onChange,
  label,
  disabled,
  className,
}: LanguageSelectProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <Globe
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none"
        >
          <option value="">Auto-detect</option>
          {locales.map((code) => {
            const meta = LOCALE_META[code];
            return (
              <option key={code} value={code}>
                {meta?.flag} {meta?.nativeName} ({meta?.name})
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
}

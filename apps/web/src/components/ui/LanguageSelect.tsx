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
        <label className="block text-sm font-bold text-[var(--aivo-text)] mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <Globe
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A89BB5]"
          size={18}
        />
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-[#E8DDF0] dark:border-[#3D2D5C] bg-[var(--aivo-bg)] text-[var(--aivo-text)] focus:ring-3 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] outline-none transition-all font-medium"
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

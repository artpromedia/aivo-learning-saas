"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Globe, Check } from "lucide-react";
import { locales } from "@/i18n/config";

const LOCALE_META: Record<string, { nativeName: string; flag: string }> = {
  en: { nativeName: "English", flag: "🇺🇸" },
  es: { nativeName: "Español", flag: "🇪🇸" },
  fr: { nativeName: "Français", flag: "🇫🇷" },
  ar: { nativeName: "العربية", flag: "🇸🇦" },
  zh: { nativeName: "中文", flag: "🇨🇳" },
  pt: { nativeName: "Português", flag: "🇧🇷" },
  de: { nativeName: "Deutsch", flag: "🇩🇪" },
  ja: { nativeName: "日本語", flag: "🇯🇵" },
  ko: { nativeName: "한국어", flag: "🇰🇷" },
  hi: { nativeName: "हिन्दी", flag: "🇮🇳" },
  sw: { nativeName: "Kiswahili", flag: "🇰🇪" },
  ig: { nativeName: "Igbo", flag: "🇳🇬" },
  yo: { nativeName: "Yorùbá", flag: "🇳🇬" },
  ha: { nativeName: "Hausa", flag: "🇳🇬" },
};

function getCurrentLocale(): string {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
  return match?.[1] ?? "en";
}

const LISTBOX_ID = "language-listbox";

export function LanguageToggle() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("en");
  const [focusIndex, setFocusIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    setCurrent(getCurrentLocale());
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      const idx = (locales as readonly string[]).indexOf(current);
      setFocusIndex(idx >= 0 ? idx : 0);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, current]);

  useEffect(() => {
    if (open && focusIndex >= 0) {
      optionRefs.current[focusIndex]?.focus();
    }
  }, [open, focusIndex]);

  const handleSelect = useCallback((locale: string) => {
    document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000`;
    setCurrent(locale);
    setOpen(false);
    triggerRef.current?.focus();
    window.location.reload();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) return;
      const count = locales.length;
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusIndex((prev) => (prev + 1) % count);
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusIndex((prev) => (prev - 1 + count) % count);
          break;
        case "Home":
          e.preventDefault();
          setFocusIndex(0);
          break;
        case "End":
          e.preventDefault();
          setFocusIndex(count - 1);
          break;
        case "Escape":
          e.preventDefault();
          setOpen(false);
          triggerRef.current?.focus();
          break;
        case "Tab":
          setOpen(false);
          break;
      }
    },
    [open]
  );

  const currentMeta = LOCALE_META[current];

  return (
    <div className="relative" ref={ref} onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-sm font-bold transition-all hover:scale-105"
        style={{ color: "var(--aivo-purple-600)", backgroundColor: "var(--aivo-purple-50, #F5F0FF)" }}
        aria-label="Select language"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? LISTBOX_ID : undefined}
      >
        <Globe size={16} />
        <span>{currentMeta?.flag ?? "🌐"}</span>
      </button>

      {open && (
        <div
          id={LISTBOX_ID}
          role="listbox"
          aria-label="Languages"
          aria-activedescendant={`lang-option-${locales[focusIndex]}`}
          className="absolute right-0 top-full mt-2 w-56 rounded-2xl shadow-xl border overflow-hidden z-50"
          style={{ backgroundColor: "var(--aivo-bg-card)", borderColor: "var(--aivo-border)" }}
        >
          <div className="max-h-80 overflow-y-auto py-1">
            {locales.map((code, i) => {
              const meta = LOCALE_META[code];
              if (!meta) return null;
              const isActive = code === current;
              return (
                <button
                  key={code}
                  id={`lang-option-${code}`}
                  ref={(el) => { optionRefs.current[i] = el; }}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => handleSelect(code)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors text-left outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]/40"
                  style={
                    isActive
                      ? { backgroundColor: "var(--aivo-purple-50, #F5F0FF)", color: "var(--aivo-purple-600)" }
                      : { color: "var(--aivo-text)" }
                  }
                >
                  <span className="text-base">{meta.flag}</span>
                  <span className="flex-1">{meta.nativeName}</span>
                  {isActive && <Check size={16} style={{ color: "var(--aivo-purple-500)" }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const locales = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "sw", label: "Kiswahili", flag: "🇰🇪" },
] as const;

interface LocaleSwitcherProps {
  variant?: "light" | "dark";
}

export function LocaleSwitcher({ variant = "light" }: LocaleSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isLight = variant === "light";

  const currentCode =
    (typeof document !== "undefined" &&
      document.cookie
        .split("; ")
        .find((c) => c.startsWith("NEXT_LOCALE="))
        ?.split("=")[1]) ||
    "en";

  const current = locales.find((l) => l.code === currentCode) ?? locales[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function switchLocale(code: string) {
    document.cookie = `NEXT_LOCALE=${code};path=/;max-age=31536000;SameSite=Lax`;
    setOpen(false);
    window.location.reload();
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors",
          isLight
            ? "text-white/90 hover:text-white"
            : "text-aivo-navy-600 hover:text-aivo-purple-600",
        )}
        aria-label="Change language"
        aria-expanded={open}
      >
        <Globe size={16} />
        <span className="hidden sm:inline">{current.flag} {current.code.toUpperCase()}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 rounded-lg bg-white shadow-lg border border-aivo-navy-100 py-1 z-50">
          {locales.map((locale) => (
            <button
              key={locale.code}
              onClick={() => switchLocale(locale.code)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors",
                locale.code === currentCode
                  ? "bg-aivo-purple-50 text-aivo-purple-600 font-medium"
                  : "text-aivo-navy-600 hover:bg-aivo-purple-50 hover:text-aivo-purple-600",
              )}
            >
              <span>{locale.flag}</span>
              <span>{locale.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

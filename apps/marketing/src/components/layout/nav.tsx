"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { navLinks } from "@/content/nav";
import { cn } from "@/lib/utils";
import { useI18n } from "@/providers/i18n-provider";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";

const HIDDEN_PREFIXES = ["/demo", "/get-started"];

export function Nav() {
  const pathname = usePathname();
  const { t, locale } = useI18n();
  const isRtl = locale === "ar";
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const hidden = HIDDEN_PREFIXES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (hidden) return null;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-[0_4px_6px_-1px_rgb(0_0_0/0.1)]"
          : "bg-transparent",
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={cn(
          "flex items-center justify-between h-16 lg:h-20",
          isRtl && "flex-row-reverse",
        )}>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/logos/aivo-logo-horizontal-white.svg"
              alt="AIVO Learning"
              width={120}
              height={48}
              className={cn(
                "h-10 w-auto transition-opacity",
                isScrolled ? "hidden" : "block",
              )}
            />
            <img
              src="/logos/aivo-logo-horizontal-purple.svg"
              alt="AIVO Learning"
              width={120}
              height={48}
              className={cn(
                "h-10 w-auto transition-opacity",
                isScrolled ? "block" : "hidden",
              )}
            />
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  isScrolled
                    ? "text-aivo-navy-600 hover:text-aivo-purple-600"
                    : "text-white/90 hover:text-white",
                )}
              >
                {t("nav", link.key)}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className={cn(
            "hidden lg:flex items-center gap-4",
            isRtl && "flex-row-reverse",
          )}>
            <LocaleSwitcher variant={isScrolled ? "dark" : "light"} />
            <Link
              href="/login"
              className={cn(
                "text-sm font-medium transition-colors",
                isScrolled
                  ? "text-aivo-navy-600 hover:text-aivo-purple-600"
                  : "text-white/90 hover:text-white",
              )}
            >
              {t("nav", "login")}
            </Link>
            <Link
              href="/get-started"
              className={cn(
                "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-200",
                isScrolled
                  ? "bg-aivo-purple-600 text-white hover:bg-aivo-purple-700"
                  : "bg-white text-aivo-purple-600 hover:bg-white/90",
              )}
            >
              {t("nav", "getStarted")}
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "lg:hidden p-2 rounded-lg transition-colors",
              isScrolled ? "text-aivo-navy-800" : "text-white",
            )}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-white z-40">
          <nav className="px-4 py-6 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block ps-4 pe-4 py-3 text-base font-medium text-aivo-navy-700 hover:bg-aivo-purple-50 hover:text-aivo-purple-600 rounded-lg transition-colors"
              >
                {t("nav", link.key)}
              </Link>
            ))}
            <hr className="my-4 border-aivo-navy-100" />
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="block ps-4 pe-4 py-3 text-base font-medium text-aivo-navy-700 hover:bg-aivo-purple-50 rounded-lg"
            >
              {t("nav", "login")}
            </Link>
            <div className="ps-4 pe-4 pt-2">
              <Link
                href="/get-started"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center rounded-lg bg-aivo-purple-600 px-5 py-3 text-sm font-semibold text-white hover:bg-aivo-purple-700 transition-colors"
              >
                {t("nav", "getStarted")}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

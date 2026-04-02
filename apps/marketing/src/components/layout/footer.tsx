"use client";

import Link from "next/link";
import { useI18n } from "@/providers/i18n-provider";

// TODO: Footer column headers and link labels need translation keys in a future sprint.
// For now, these remain in English.
const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "/pricing" },
    { label: "AI Tutors", href: "#ai-tutors" },
    { label: "For Parents", href: "/parents" },
    { label: "For Teachers", href: "/teachers" },
    { label: "For Districts", href: "/districts" },
  ],
  Resources: [
    { label: "Blog", href: "/blog" },
    { label: "Help Center", href: "/help" },
    { label: "Documentation", href: "/docs" },
    { label: "API", href: "/api" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
    { label: "Press", href: "/press" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "FERPA Compliance", href: "/ferpa" },
    { label: "COPPA Policy", href: "/coppa" },
  ],
};

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="bg-aivo-navy-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top section: Brand + Newsletter */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-12 pb-12 border-b border-aivo-navy-700">
          <div className="max-w-sm">
            <Link href="/" className="inline-block">
              <img
                src="/logos/aivo-logo-horizontal-white.svg"
                alt="AIVO Learning"
                width={120}
                height={48}
                className="h-10 w-auto"
              />
            </Link>
            <p className="mt-3 text-sm text-aivo-navy-300">
              AI-powered personalized learning that adapts to every student. No
              learner left behind.
            </p>
          </div>

          {/* Newsletter */}
          <form
            className="w-full max-w-md shrink-0"
            onSubmit={(e) => e.preventDefault()}
          >
            <label
              htmlFor="footer-email"
              className="text-sm font-medium text-aivo-navy-200"
            >
              {t("footer.newsletter")}
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="footer-email"
                type="email"
                placeholder="your@email.com"
                className="flex-1 min-w-0 rounded-lg bg-aivo-navy-700 border border-aivo-navy-600 px-3 py-2 text-sm text-white placeholder:text-aivo-navy-400 focus:outline-none focus:ring-2 focus:ring-aivo-purple-500"
              />
              <button
                type="submit"
                className="rounded-lg bg-aivo-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-aivo-purple-700 transition-colors whitespace-nowrap"
              >
                {t("footer.subscribe")}
              </button>
            </div>
          </form>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-white mb-4">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-aivo-navy-300 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-aivo-navy-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-aivo-navy-400">
            {t("footer.copyright")}
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-sm text-aivo-navy-400 hover:text-white transition-colors"
            >
              {t("footer.privacy")}
            </Link>
            <Link
              href="/terms"
              className="text-sm text-aivo-navy-400 hover:text-white transition-colors"
            >
              {t("footer.terms")}
            </Link>
            <Link
              href="/cookies"
              className="text-sm text-aivo-navy-400 hover:text-white transition-colors"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

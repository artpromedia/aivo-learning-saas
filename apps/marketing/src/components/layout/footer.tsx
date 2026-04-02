"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { AppStoreButtons } from "@/components/shared/app-store-buttons";
import { useI18n } from "@/providers/i18n-provider";

const HIDDEN_PREFIXES = ["/demo", "/get-started"];

const footerColumns = [
  {
    key: "columnProduct",
    links: [
      { key: "linkFeatures", href: "#features" },
      { key: "linkPricing", href: "/pricing" },
      { key: "linkAiTutors", href: "#ai-tutors" },
      { key: "linkForParents", href: "/parents" },
      { key: "linkForTeachers", href: "/teachers" },
      { key: "linkForDistricts", href: "/districts" },
    ],
  },
  {
    key: "columnResources",
    links: [
      { key: "linkBlog", href: "/blog" },
      { key: "linkHelpCenter", href: "/help" },
      { key: "linkDocumentation", href: "/docs" },
      { key: "linkApi", href: "/api" },
    ],
  },
  {
    key: "columnCompany",
    links: [
      { key: "linkAbout", href: "/about" },
      { key: "linkCareers", href: "/careers" },
      { key: "linkContact", href: "/contact" },
      { key: "linkPress", href: "/press" },
    ],
  },
  {
    key: "columnLegal",
    links: [
      { key: "linkPrivacyPolicy", href: "/privacy" },
      { key: "linkTermsOfService", href: "/terms" },
      { key: "linkFerpa", href: "/ferpa" },
      { key: "linkCoppa", href: "/coppa" },
    ],
  },
];

export function Footer() {
  const pathname = usePathname();
  const { t, locale } = useI18n();
  const isRtl = locale === "ar";

  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  return (
    <footer className="bg-aivo-navy-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top section: Brand + Newsletter */}
        <div className={cn(
          "flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-12 pb-12 border-b border-aivo-navy-700",
          isRtl && "lg:flex-row-reverse",
        )}>
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
              {t("footer", "tagline")}
            </p>
            <AppStoreButtons className="mt-4" variant="dark" />
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
              {t("footer", "newsletter")}
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
                {t("footer", "subscribe")}
              </button>
            </div>
          </form>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {footerColumns.map((col) => (
            <div key={col.key}>
              <h3 className="text-sm font-semibold text-white mb-4 text-start">
                {t("footer", col.key)}
              </h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-aivo-navy-300 hover:text-white transition-colors"
                    >
                      {t("footer", link.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className={cn(
          "mt-12 pt-8 border-t border-aivo-navy-700 flex flex-col sm:flex-row items-center justify-between gap-4",
          isRtl && "sm:flex-row-reverse",
        )}>
          <p className="text-sm text-aivo-navy-400">
            {t("footer", "copyright")}
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-sm text-aivo-navy-400 hover:text-white transition-colors"
            >
              {t("footer", "privacy")}
            </Link>
            <Link
              href="/terms"
              className="text-sm text-aivo-navy-400 hover:text-white transition-colors"
            >
              {t("footer", "terms")}
            </Link>
            <Link
              href="/cookies"
              className="text-sm text-aivo-navy-400 hover:text-white transition-colors"
            >
              {t("footer", "cookies")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

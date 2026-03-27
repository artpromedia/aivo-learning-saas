import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Shield, Accessibility, Cookie } from "lucide-react";

export const metadata: Metadata = {
  title: "Legal | AIVO",
  description:
    "Legal information for the AIVO Learning platform including Terms of Service, Privacy Policy, and more.",
  openGraph: {
    title: "Legal | AIVO",
    description:
      "Legal information for the AIVO Learning platform including Terms of Service, Privacy Policy, and more.",
  },
};

const legalPages = [
  {
    icon: FileText,
    title: "Terms of Service",
    description: "Rules governing use of the AIVO platform",
    href: "/legal/terms",
  },
  {
    icon: Shield,
    title: "Privacy Policy",
    description: "How we collect, use, and protect your data",
    href: "/legal/privacy",
  },
];

const additionalLinks = [
  {
    icon: Accessibility,
    title: "Accessibility Statement",
    href: "/accessibility",
  },
  {
    icon: Cookie,
    title: "Cookie Policy",
    href: "/cookies",
  },
];

export default function LegalPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl lg:text-6xl">
            Legal
          </h1>
          <p className="mt-6 text-lg text-aivo-navy-500 max-w-3xl mx-auto leading-relaxed">
            Transparency and trust are at the core of everything we do. Review
            our legal documents to understand your rights and our
            responsibilities.
          </p>
        </div>
      </section>

      {/* Main Legal Pages */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid gap-8 sm:grid-cols-2">
            {legalPages.map((page) => {
              const Icon = page.icon;
              return (
                <Link
                  key={page.title}
                  href={page.href}
                  className="group rounded-2xl border border-aivo-navy-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-aivo-purple-50">
                    <Icon className="h-6 w-6 text-aivo-purple-600" />
                  </div>
                  <h2 className="text-xl font-bold text-aivo-navy-800 group-hover:text-aivo-purple-600 transition-colors">
                    {page.title}
                  </h2>
                  <p className="mt-2 text-aivo-navy-500 leading-relaxed">
                    {page.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-aivo-purple-600">
                    Read document
                    <span aria-hidden="true">&rarr;</span>
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Additional Links */}
          <div className="mt-12 rounded-2xl border border-aivo-navy-100 bg-aivo-navy-50 p-8">
            <h2 className="text-lg font-semibold text-aivo-navy-800 mb-4">
              Additional Resources
            </h2>
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
              {additionalLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.title}
                    href={link.href}
                    className="inline-flex items-center gap-2 text-aivo-navy-600 hover:text-aivo-purple-600 transition-colors"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{link.title}</span>
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

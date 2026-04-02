import type { Metadata } from "next";
import Link from "next/link";
import {
  Rocket,
  CreditCard,
  Users,
  FileText,
  Settings,
  Shield,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Help Center | AIVO",
  description:
    "Find answers to common questions about AIVO Learning. Browse help articles by category or contact our support team.",
  openGraph: {
    title: "Help Center | AIVO",
    description:
      "Find answers to common questions about AIVO Learning.",
  },
};

const categories = [
  {
    icon: Rocket,
    title: "Getting Started",
    description: "Everything you need to begin your AIVO journey.",
    articles: [
      { title: "Creating your account", href: "/help/getting-started/creating-your-account" },
      { title: "Setting up your first student", href: "/help/getting-started/setting-up-your-first-student" },
      { title: "Taking the learning assessment", href: "/help/getting-started/taking-the-learning-assessment" },
      { title: "Understanding your dashboard", href: "/help/getting-started/understanding-your-dashboard" },
    ],
  },
  {
    icon: CreditCard,
    title: "Account & Billing",
    description: "Manage your subscription, payments, and plan details.",
    articles: [
      { title: "Managing your subscription", href: "/help/account-billing/managing-your-subscription" },
      { title: "Updating payment info", href: "/help/account-billing/updating-payment-info" },
      { title: "Canceling your plan", href: "/help/account-billing/canceling-your-plan" },
      { title: "Requesting a refund", href: "/help/account-billing/requesting-a-refund" },
    ],
  },
  {
    icon: Users,
    title: "AI Tutors",
    description: "Learn how to get the most from your AI tutoring sessions.",
    articles: [
      { title: "Meeting your AI tutors", href: "/help/ai-tutors/meeting-your-ai-tutors" },
      { title: "Switching between tutors", href: "/help/ai-tutors/switching-between-tutors" },
      { title: "Tutor session settings", href: "/help/ai-tutors/tutor-session-settings" },
      { title: "Reporting tutor issues", href: "/help/ai-tutors/reporting-tutor-issues" },
    ],
  },
  {
    icon: FileText,
    title: "IEP Support",
    description: "Tools for managing and tracking IEP goals and progress.",
    articles: [
      { title: "Uploading IEP documents", href: "/help/iep-support/uploading-iep-documents" },
      { title: "Tracking IEP goals", href: "/help/iep-support/tracking-iep-goals" },
      { title: "Generating progress reports", href: "/help/iep-support/generating-progress-reports" },
      { title: "Sharing with your IEP team", href: "/help/iep-support/sharing-with-your-iep-team" },
    ],
  },
  {
    icon: Settings,
    title: "Technical",
    description: "System requirements, troubleshooting, and compatibility.",
    articles: [
      { title: "System requirements", href: "/help/technical/system-requirements" },
      { title: "Troubleshooting login", href: "/help/technical/troubleshooting-login" },
      { title: "Offline mode setup", href: "/help/technical/offline-mode-setup" },
      { title: "Browser compatibility", href: "/help/technical/browser-compatibility" },
    ],
  },
  {
    icon: Shield,
    title: "Privacy & Security",
    description: "How we protect your data and comply with regulations.",
    articles: [
      { title: "Data privacy overview", href: "/help/privacy-security/data-privacy-overview" },
      { title: "Exporting your data", href: "/help/privacy-security/exporting-your-data" },
      { title: "Deleting your account", href: "/help/privacy-security/deleting-your-account" },
      { title: "FERPA compliance details", href: "/help/privacy-security/ferpa-compliance-details" },
    ],
  },
];

export default function HelpPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl">
            Help Center
          </h1>
          <p className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto">
            Find answers to common questions and learn how to get the most out
            of AIVO Learning.
          </p>
          <p className="mt-6">
            <Link
              href="/faq"
              className="inline-flex items-center gap-1 text-aivo-purple-600 font-semibold hover:text-aivo-purple-700 transition-colors"
            >
              Looking for something specific? Try our FAQ{" "}
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </p>
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <div
                  key={category.title}
                  className="rounded-2xl border border-aivo-navy-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-aivo-purple-50">
                    <Icon className="h-6 w-6 text-aivo-purple-600" />
                  </div>
                  <h2 className="text-xl font-bold text-aivo-navy-800">
                    {category.title}
                  </h2>
                  <p className="mt-2 text-sm text-aivo-navy-500 leading-relaxed">
                    {category.description}
                  </p>
                  <ul className="mt-5 space-y-2.5">
                    {category.articles.map((article) => (
                      <li key={article.title}>
                        <Link
                          href={article.href}
                          className="inline-flex items-center gap-1.5 text-sm text-aivo-navy-600 hover:text-aivo-purple-600 transition-colors"
                        >
                          <span
                            aria-hidden="true"
                            className="text-aivo-navy-300"
                          >
                            &rsaquo;
                          </span>
                          {article.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-aivo-navy-50 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-2xl font-bold text-aivo-navy-800">
            Can&apos;t find what you need?
          </h2>
          <p className="mt-3 text-aivo-navy-500">
            Our support team is here to help you with any questions.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-aivo-purple-600 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-aivo-purple-700"
          >
            Contact Support{" "}
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </section>
    </>
  );
}

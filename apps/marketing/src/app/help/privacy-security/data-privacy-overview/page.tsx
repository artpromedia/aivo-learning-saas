import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Data Privacy Overview | Help | AIVO",
  description:
    "Learn how AIVO Learning protects your family's data with privacy-by-design principles, FERPA and COPPA compliance, cookieless analytics, and a parent-as-data-controller model.",
  openGraph: {
    title: "Data Privacy Overview | AIVO Help",
    description:
      "AIVO's privacy philosophy, what data we collect (and don't), and how we differ from other EdTech platforms.",
  },
};

export default function DataPrivacyOverviewPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-medium text-aivo-purple-600 uppercase tracking-wider">
            Privacy &amp; Security
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl">
            Data Privacy Overview
          </h1>
          <p className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto">
            Your family&rsquo;s data belongs to you. Here&rsquo;s how AIVO
            Learning protects it at every level.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6">
          {/* On this page */}
          <nav className="mb-12 rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-aivo-navy-400">
              On this page
            </h2>
            <ul className="mt-3 space-y-2">
              <li>
                <a
                  href="#philosophy"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Our Privacy Philosophy
                </a>
              </li>
              <li>
                <a
                  href="#what-we-collect"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  What Data We Collect and Why
                </a>
              </li>
              <li>
                <a
                  href="#what-we-dont-collect"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  What We Do NOT Collect
                </a>
              </li>
              <li>
                <a
                  href="#compliance"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Compliance Certifications
                </a>
              </li>
              <li>
                <a
                  href="#how-we-differ"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  How AIVO Differs from Other EdTech Platforms
                </a>
              </li>
              <li>
                <a
                  href="#learn-more"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Learn More
                </a>
              </li>
            </ul>
          </nav>

          <div className="prose prose-aivo max-w-none">
            {/* Philosophy */}
            <h2
              id="philosophy"
              className="text-2xl font-bold text-aivo-navy-800 mt-0 scroll-mt-24"
            >
              Our Privacy Philosophy
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO Learning was built from the ground up with three core privacy
              principles:
            </p>
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-aivo-navy-800">
                  Privacy by Design
                </h3>
                <p className="mt-2 text-sm text-aivo-navy-600">
                  Privacy is not an afterthought or an add-on. It is embedded
                  into the architecture of every feature we build. Before any
                  new capability is developed, we evaluate its privacy impact
                  first.
                </p>
              </div>
              <div className="rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-aivo-navy-800">
                  Data Minimization
                </h3>
                <p className="mt-2 text-sm text-aivo-navy-600">
                  We only collect the data we need to deliver a personalized
                  learning experience. Nothing more. We never collect data
                  &ldquo;just in case&rdquo; or for future monetization.
                </p>
              </div>
              <div className="rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-aivo-navy-800">
                  Parent Ownership
                </h3>
                <p className="mt-2 text-sm text-aivo-navy-600">
                  Parents are the data controllers. You own your child&rsquo;s
                  educational data, you control who sees it, and you can export
                  or delete it at any time. AIVO is a steward, not an owner, of
                  your family&rsquo;s information.
                </p>
              </div>
            </div>

            {/* What We Collect */}
            <h2
              id="what-we-collect"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              What Data We Collect and Why
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Every piece of data AIVO collects serves a specific purpose in
              delivering your child&rsquo;s learning experience:
            </p>
            <div className="mt-6 overflow-hidden rounded-xl border border-aivo-navy-100">
              <table className="w-full text-sm text-left text-aivo-navy-600">
                <thead>
                  <tr className="bg-aivo-navy-50">
                    <th className="px-4 py-3 font-semibold text-aivo-navy-800">
                      Data Category
                    </th>
                    <th className="px-4 py-3 font-semibold text-aivo-navy-800">
                      Examples
                    </th>
                    <th className="px-4 py-3 font-semibold text-aivo-navy-800">
                      Purpose
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-aivo-navy-100">
                  <tr>
                    <td className="px-4 py-3 font-medium">Learning data</td>
                    <td className="px-4 py-3">
                      Assessment results, activity scores, mastery levels,
                      tutor session transcripts
                    </td>
                    <td className="px-4 py-3">
                      Personalize the learning path via the Brain Clone AI
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Account data</td>
                    <td className="px-4 py-3">
                      Parent email, name, student first name, grade level
                    </td>
                    <td className="px-4 py-3">
                      Authentication, account management, age-appropriate
                      content
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Usage analytics</td>
                    <td className="px-4 py-3">
                      Page views, session duration, feature usage (aggregated)
                    </td>
                    <td className="px-4 py-3">
                      Product improvement via Plausible (cookieless, no
                      personal data)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-6 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600">
                <strong>About our analytics:</strong> AIVO uses Plausible, a
                privacy-first analytics tool that is cookieless and does not
                collect any personal data. No tracking cookies are ever placed
                on your browser. Analytics data is aggregated and cannot be
                linked to any individual user.
              </p>
            </div>

            {/* What We Don't Collect */}
            <h2
              id="what-we-dont-collect"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              What We Do NOT Collect
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO will never collect the following categories of data:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                <span>
                  <strong>Social media data</strong> &mdash; no social login
                  data scraping, no friend lists, no social graph information
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                <span>
                  <strong>Advertising identifiers</strong> &mdash; no IDFA,
                  GAID, or any ad-tracking IDs
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                <span>
                  <strong>Biometric data</strong> &mdash; no facial
                  recognition, fingerprints, or voice prints
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                <span>
                  <strong>Precise location</strong> &mdash; no GPS tracking,
                  no geofencing. We only use country-level data derived from IP
                  address (and we don&rsquo;t store IP addresses)
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                <span>
                  <strong>Third-party tracking cookies</strong> &mdash; zero
                  cookies of any kind for analytics or advertising
                </span>
              </li>
            </ul>

            {/* Compliance */}
            <h2
              id="compliance"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Compliance Certifications
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO Learning maintains the following compliance certifications
              and commitments:
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-aivo-navy-800">
                  FERPA
                </h3>
                <p className="mt-2 text-sm text-aivo-navy-600">
                  Family Educational Rights and Privacy Act. Protects the
                  privacy of student educational records. AIVO acts as a
                  &ldquo;school official&rdquo; with a &ldquo;legitimate
                  educational interest&rdquo; under 34 CFR &sect; 99.31.
                </p>
                <Link
                  href="/legal/ferpa"
                  className="mt-3 inline-block text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Read full FERPA page &rarr;
                </Link>
              </div>
              <div className="rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-aivo-navy-800">
                  COPPA
                </h3>
                <p className="mt-2 text-sm text-aivo-navy-600">
                  Children&rsquo;s Online Privacy Protection Act. Governs
                  collection and use of data from children under 13. AIVO
                  requires verifiable parental consent and never collects more
                  than necessary.
                </p>
                <Link
                  href="/legal/coppa"
                  className="mt-3 inline-block text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Read full COPPA page &rarr;
                </Link>
              </div>
              <div className="rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-aivo-navy-800">
                  GDPR
                </h3>
                <p className="mt-2 text-sm text-aivo-navy-600">
                  General Data Protection Regulation (EU). AIVO supports all
                  GDPR data subject rights including access, rectification,
                  erasure, portability, and restriction of processing.
                </p>
              </div>
              <div className="rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-aivo-navy-800">
                  SOC 2 Type II
                </h3>
                <p className="mt-2 text-sm text-aivo-navy-600">
                  Third-party audited certification covering security,
                  availability, processing integrity, confidentiality, and
                  privacy. Our SOC 2 report is available under NDA upon
                  request.
                </p>
              </div>
            </div>

            {/* How We Differ */}
            <h2
              id="how-we-differ"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              How AIVO Differs from Other EdTech Platforms
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Many EdTech platforms monetize student data through advertising or
              third-party data sharing. AIVO takes a fundamentally different
              approach:
            </p>
            <div className="mt-6 overflow-hidden rounded-xl border border-aivo-navy-100">
              <table className="w-full text-sm text-left text-aivo-navy-600">
                <thead>
                  <tr className="bg-aivo-navy-50">
                    <th className="px-4 py-3 font-semibold text-aivo-navy-800">
                      Practice
                    </th>
                    <th className="px-4 py-3 font-semibold text-aivo-navy-800">
                      Many EdTech Platforms
                    </th>
                    <th className="px-4 py-3 font-semibold text-aivo-navy-800">
                      AIVO Learning
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-aivo-navy-100">
                  <tr>
                    <td className="px-4 py-3 font-medium">Advertising</td>
                    <td className="px-4 py-3">Ads shown to children</td>
                    <td className="px-4 py-3 text-green-600 font-medium">
                      Zero ads, ever
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Data selling</td>
                    <td className="px-4 py-3">
                      Student data sold to brokers
                    </td>
                    <td className="px-4 py-3 text-green-600 font-medium">
                      Never sold, never shared
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Analytics</td>
                    <td className="px-4 py-3">
                      Google Analytics with cookies
                    </td>
                    <td className="px-4 py-3 text-green-600 font-medium">
                      Plausible (cookieless, no PII)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Data control</td>
                    <td className="px-4 py-3">
                      Complex opt-out processes
                    </td>
                    <td className="px-4 py-3 text-green-600 font-medium">
                      Parent dashboard: export or delete anytime
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Encryption</td>
                    <td className="px-4 py-3">Varies widely</td>
                    <td className="px-4 py-3 text-green-600 font-medium">
                      AES-256 at rest, TLS 1.3 in transit
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Learn More */}
            <h2
              id="learn-more"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Learn More
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              For full legal details, review our compliance pages:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <Link
                  href="/privacy"
                  className="text-aivo-purple-600 underline"
                >
                  Privacy Policy
                </Link>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <Link
                  href="/legal/ferpa"
                  className="text-aivo-purple-600 underline"
                >
                  FERPA Compliance
                </Link>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <Link
                  href="/legal/coppa"
                  className="text-aivo-purple-600 underline"
                >
                  COPPA Compliance
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Was this helpful? */}
      <section className="border-t border-aivo-navy-100 py-12">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-xl font-bold text-aivo-navy-800">
            Was this article helpful?
          </h2>
          <p className="mt-2 text-aivo-navy-500">
            If you have privacy questions, our team is here to help.
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-flex items-center rounded-lg bg-aivo-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-aivo-purple-700 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </section>

      {/* Related Articles */}
      <section className="bg-aivo-navy-50 py-12">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-aivo-navy-400 text-center">
            Related Articles
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Link
              href="/help/privacy-security/exporting-your-data"
              className="rounded-xl border border-aivo-navy-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-aivo-navy-800">
                Exporting Your Data
              </h3>
              <p className="mt-1 text-sm text-aivo-navy-500">
                Download a full copy of your family&rsquo;s data at any time.
              </p>
            </Link>
            <Link
              href="/help/privacy-security/deleting-your-account"
              className="rounded-xl border border-aivo-navy-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-aivo-navy-800">
                Deleting Your Account
              </h3>
              <p className="mt-1 text-sm text-aivo-navy-500">
                Permanently erase all data with our full deletion pipeline.
              </p>
            </Link>
            <Link
              href="/help/privacy-security/ferpa-compliance-details"
              className="rounded-xl border border-aivo-navy-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-aivo-navy-800">
                FERPA Compliance Details
              </h3>
              <p className="mt-1 text-sm text-aivo-navy-500">
                Your rights under FERPA and how AIVO protects educational
                records.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

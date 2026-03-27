import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy | AIVO",
  description:
    "Learn how AIVO Learning uses cookies and similar technologies. We prioritize privacy with cookieless analytics by default.",
  openGraph: {
    title: "Cookie Policy | AIVO",
    description:
      "Learn how AIVO Learning uses cookies and similar technologies.",
  },
};

export default function CookiesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl">
            Cookie Policy
          </h1>
          <p className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto">
            How AIVO Learning uses cookies and similar technologies.
          </p>
          <p className="mt-3 text-sm text-aivo-navy-400">
            Last updated: January 2025
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="prose prose-aivo max-w-none">
            {/* What Are Cookies */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-0">
              1. What Are Cookies
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Cookies are small text files that are stored on your device
              (computer, tablet, or mobile phone) when you visit a website. They
              are widely used to make websites work more efficiently, provide a
              better user experience, and supply information to the owners of the
              site. Cookies can be &ldquo;persistent&rdquo; (remaining on your
              device until they expire or you delete them) or
              &ldquo;session&rdquo; (deleted when you close your browser).
            </p>

            {/* How We Use Cookies */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              2. How We Use Cookies
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO Learning is designed with privacy as a priority. We use
              Plausible Analytics, which is cookieless by default. This means we
              can understand how visitors use our site without placing tracking
              cookies on your device or collecting any personal data. Our use of
              cookies is minimal and focused on essential functionality.
            </p>

            {/* Cookie Categories */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              3. Cookie Categories
            </h2>

            {/* Necessary */}
            <div className="mt-6 rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-aivo-navy-800">
                  Necessary Cookies
                </h3>
                <span className="rounded-full bg-aivo-teal-50 px-3 py-1 text-xs font-medium text-aivo-teal-700">
                  Always Active
                </span>
              </div>
              <p className="mt-3 text-sm text-aivo-navy-600 leading-relaxed">
                These cookies are essential for the website to function properly.
                They enable core functionality such as session management,
                security features, and remembering your preferences (e.g.,
                cookie consent choice). These cookies do not store any personally
                identifiable information and cannot be disabled.
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-aivo-navy-100">
                      <th className="py-2 pr-4 text-left font-medium text-aivo-navy-700">
                        Cookie
                      </th>
                      <th className="py-2 pr-4 text-left font-medium text-aivo-navy-700">
                        Purpose
                      </th>
                      <th className="py-2 text-left font-medium text-aivo-navy-700">
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-aivo-navy-600">
                    <tr className="border-b border-aivo-navy-50">
                      <td className="py-2 pr-4 font-mono text-xs">
                        session_id
                      </td>
                      <td className="py-2 pr-4">Session management</td>
                      <td className="py-2">Session</td>
                    </tr>
                    <tr className="border-b border-aivo-navy-50">
                      <td className="py-2 pr-4 font-mono text-xs">
                        csrf_token
                      </td>
                      <td className="py-2 pr-4">Security</td>
                      <td className="py-2">Session</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-mono text-xs">
                        cookie_consent
                      </td>
                      <td className="py-2 pr-4">Stores your cookie preferences</td>
                      <td className="py-2">1 year</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Analytics */}
            <div className="mt-6 rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-aivo-navy-800">
                  Analytics
                </h3>
                <span className="rounded-full bg-aivo-purple-50 px-3 py-1 text-xs font-medium text-aivo-purple-700">
                  Cookieless
                </span>
              </div>
              <p className="mt-3 text-sm text-aivo-navy-600 leading-relaxed">
                We use Plausible Analytics to understand how visitors interact
                with our website. Plausible is a privacy-friendly analytics tool
                that does not use cookies, does not collect personal data, and is
                fully compliant with GDPR, CCPA, and PECR. All data is
                aggregated and no individual visitor can be identified.
              </p>
            </div>

            {/* Marketing */}
            <div className="mt-6 rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-aivo-navy-800">
                  Marketing
                </h3>
                <span className="rounded-full bg-aivo-navy-100 px-3 py-1 text-xs font-medium text-aivo-navy-500">
                  None
                </span>
              </div>
              <p className="mt-3 text-sm text-aivo-navy-600 leading-relaxed">
                AIVO Learning does not currently use any marketing or
                advertising cookies. We do not track you across other websites,
                and we do not sell your data to third parties. If this changes
                in the future, we will update this policy and request your
                consent.
              </p>
            </div>

            {/* Managing Cookies */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              4. Managing Cookies
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Most web browsers allow you to manage cookies through their
              settings. You can typically find these options in your
              browser&apos;s &ldquo;Settings,&rdquo; &ldquo;Preferences,&rdquo;
              or &ldquo;Privacy&rdquo; menu. Here are links to cookie management
              instructions for common browsers:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <strong>Chrome:</strong>&nbsp;Settings &gt; Privacy and Security
                &gt; Cookies
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <strong>Firefox:</strong>&nbsp;Settings &gt; Privacy &amp;
                Security &gt; Cookies and Site Data
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <strong>Safari:</strong>&nbsp;Preferences &gt; Privacy &gt;
                Manage Website Data
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <strong>Edge:</strong>&nbsp;Settings &gt; Cookies and Site
                Permissions &gt; Manage and Delete Cookies
              </li>
            </ul>
            <p className="mt-4 text-aivo-navy-600 leading-relaxed">
              Please note that disabling necessary cookies may affect the
              functionality of the AIVO Learning platform.
            </p>

            {/* Changes to This Policy */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              5. Changes to This Policy
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              We may update this Cookie Policy from time to time to reflect
              changes in our practices or for other operational, legal, or
              regulatory reasons. When we make material changes, we will update
              the &ldquo;Last updated&rdquo; date at the top of this page and,
              where appropriate, notify you via a banner on our website. We
              encourage you to review this policy periodically.
            </p>

            {/* Contact */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              6. Contact
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              If you have questions about our use of cookies or this Cookie
              Policy, please contact our privacy team:
            </p>
            <div className="mt-4 rounded-xl bg-aivo-navy-50 p-6">
              <a
                href="mailto:privacy@aivolearning.com"
                className="text-aivo-purple-600 font-semibold hover:text-aivo-purple-700 transition-colors"
              >
                privacy@aivolearning.com
              </a>
              <p className="mt-2 text-sm text-aivo-navy-500">
                AIVO Learning, 123 Education Lane, San Francisco, CA 94105
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Links */}
      <section className="bg-aivo-navy-50 py-12">
        <div className="mx-auto max-w-3xl px-6 flex flex-wrap items-center justify-center gap-6 text-sm">
          <Link
            href="/legal/privacy"
            className="font-medium text-aivo-navy-600 hover:text-aivo-purple-600 transition-colors"
          >
            Privacy Policy
          </Link>
          <span className="text-aivo-navy-300">|</span>
          <Link
            href="/legal/terms"
            className="font-medium text-aivo-navy-600 hover:text-aivo-purple-600 transition-colors"
          >
            Terms of Service
          </Link>
          <span className="text-aivo-navy-300">|</span>
          <Link
            href="/accessibility"
            className="font-medium text-aivo-navy-600 hover:text-aivo-purple-600 transition-colors"
          >
            Accessibility
          </Link>
        </div>
      </section>
    </>
  );
}

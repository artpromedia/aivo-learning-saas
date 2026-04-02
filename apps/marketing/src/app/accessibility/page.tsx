import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Accessibility | AIVO",
  description:
    "AIVO Learning is committed to ensuring digital accessibility for people with disabilities. Read our accessibility statement and conformance details.",
  openGraph: {
    title: "Accessibility | AIVO",
    description:
      "AIVO Learning is committed to ensuring digital accessibility for people with disabilities.",
  },
};

export default function AccessibilityPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl">
            Accessibility Statement
          </h1>
          <p className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto">
            Our commitment to an inclusive digital experience for all users.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="prose prose-aivo max-w-none">
            {/* Our Commitment */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-0">
              Our Commitment
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO Learning is committed to ensuring digital accessibility for
              people with disabilities. We continually improve the user
              experience for everyone and apply the relevant accessibility
              standards. As a platform built specifically for learners of all
              abilities, accessibility is not just a compliance goal, it is core
              to our mission.
            </p>

            {/* Conformance Status */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              Conformance Status
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO Learning is partially conformant with{" "}
              <strong>WCAG 2.1 Level AA</strong>. &ldquo;Partially
              conformant&rdquo; means that some parts of the content do not fully
              conform to the accessibility standard. We are actively working
              toward full conformance across the entire platform.
            </p>

            {/* Measures Taken */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              Measures Taken
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO Learning takes the following measures to ensure accessibility:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                Include accessibility as part of our mission statement
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                Integrate accessibility into our procurement practices
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                Appoint a dedicated accessibility officer
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                Provide continual accessibility training for all staff
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                Include people with disabilities in design personas
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                Include people with disabilities in user testing
              </li>
            </ul>

            {/* Technical Specifications */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              Technical Specifications
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO Learning relies on the following technologies to work with the
              particular combination of web browser and any assistive
              technologies or plugins installed on your computer:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                HTML
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                CSS
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                JavaScript
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                WAI-ARIA
              </li>
            </ul>
            <p className="mt-4 text-aivo-navy-600 leading-relaxed">
              AIVO Learning is compatible with the following assistive
              technologies:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                Screen readers (NVDA, JAWS, VoiceOver)
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                Keyboard navigation
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                Voice control software
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                Switch access devices
              </li>
            </ul>

            {/* Known Limitations */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              Known Limitations
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Despite our best efforts, some areas of the platform are still
              being improved:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>AI tutor chat interface:</strong> Some dynamic content
                  updates may not be immediately announced by all screen readers.
                  We are implementing improved ARIA live regions.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Interactive learning activities:</strong> Some
                  drag-and-drop exercises are being rebuilt with keyboard-
                  accessible alternatives.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>PDF progress reports:</strong> Exported PDF reports are
                  being updated with proper tagging for assistive technology
                  compatibility.
                </span>
              </li>
            </ul>

            {/* Feedback */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              Feedback
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              We welcome your feedback on the accessibility of AIVO Learning. If
              you encounter accessibility barriers or have suggestions for
              improvement, please contact us:
            </p>
            <div className="mt-4 rounded-xl bg-aivo-navy-50 p-6">
              <a
                href="mailto:accessibility@aivolearning.com"
                className="text-aivo-purple-600 font-semibold hover:text-aivo-purple-700 transition-colors"
              >
                accessibility@aivolearning.com
              </a>
              <p className="mt-2 text-sm text-aivo-navy-500">
                We aim to respond to accessibility feedback within 2 business
                days.
              </p>
            </div>

            {/* Assessment Approach */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              Assessment Approach
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO Learning assesses the accessibility of our platform through
              the following methods:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Self-assessment:</strong> Regular internal audits
                  conducted by our development and design teams using automated
                  tools and manual testing.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Third-party audit:</strong> A comprehensive external
                  accessibility audit is planned and will be conducted by an
                  independent accessibility consultancy.
                </span>
              </li>
            </ul>
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
            href="/cookies"
            className="font-medium text-aivo-navy-600 hover:text-aivo-purple-600 transition-colors"
          >
            Cookie Policy
          </Link>
        </div>
      </section>
    </>
  );
}

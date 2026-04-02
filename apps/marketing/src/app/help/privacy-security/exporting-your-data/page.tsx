import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Exporting Your Data | Help | AIVO",
  description:
    "Download a complete copy of your family's AIVO Learning data including student profiles, Brain Clone data, assessment results, tutor sessions, and IEP progress — in JSON and Markdown format.",
  openGraph: {
    title: "Exporting Your Data | AIVO Help",
    description:
      "How to export all your family's data from AIVO Learning in a portable ZIP format.",
  },
};

export default function ExportingYourDataPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-medium text-aivo-purple-600 uppercase tracking-wider">
            Privacy &amp; Security
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl">
            Exporting Your Data
          </h1>
          <p className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto">
            Download a complete, portable copy of your family&rsquo;s data
            from AIVO Learning at any time.
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
                  href="#how-to-export"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  How to Export Your Data
                </a>
              </li>
              <li>
                <a
                  href="#whats-included"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  What&rsquo;s Included in the Export
                </a>
              </li>
              <li>
                <a
                  href="#export-format"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Export Format
                </a>
              </li>
              <li>
                <a
                  href="#processing-time"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Processing Time and Download
                </a>
              </li>
              <li>
                <a
                  href="#export-options"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Per-Student vs. Full-Account Export
                </a>
              </li>
              <li>
                <a
                  href="#gdpr-portability"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  GDPR Data Portability
                </a>
              </li>
            </ul>
          </nav>

          <div className="prose prose-aivo max-w-none">
            {/* How to Export */}
            <h2
              id="how-to-export"
              className="text-2xl font-bold text-aivo-navy-800 mt-0 scroll-mt-24"
            >
              How to Export Your Data
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              You can request a full data export from the AIVO parent dashboard
              at any time:
            </p>
            <ol className="mt-4 space-y-4">
              <li className="flex items-start gap-4 text-aivo-navy-600">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-sm font-bold text-aivo-purple-700">
                  1
                </span>
                <span>
                  Log in to your AIVO account and navigate to{" "}
                  <strong>Account Settings</strong>.
                </span>
              </li>
              <li className="flex items-start gap-4 text-aivo-navy-600">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-sm font-bold text-aivo-purple-700">
                  2
                </span>
                <span>
                  Select <strong>Privacy</strong> from the settings menu.
                </span>
              </li>
              <li className="flex items-start gap-4 text-aivo-navy-600">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-sm font-bold text-aivo-purple-700">
                  3
                </span>
                <span>
                  Click <strong>Export Data</strong>. Choose whether to export
                  data for all students or a specific student profile.
                </span>
              </li>
              <li className="flex items-start gap-4 text-aivo-navy-600">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-sm font-bold text-aivo-purple-700">
                  4
                </span>
                <span>
                  Confirm your request. AIVO will begin generating your export
                  in the background.
                </span>
              </li>
            </ol>

            {/* What's Included */}
            <h2
              id="whats-included"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              What&rsquo;s Included in the Export
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Your data export includes everything AIVO stores about your
              family:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>All student profiles</strong> &mdash; names, grade
                  levels, learning preferences, accommodation settings
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Brain Clone data</strong> &mdash; the AI learning
                  model built for each student, including strengths, growth
                  areas, and learning style indicators
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Assessment results</strong> &mdash; initial placement
                  assessments and all subsequent diagnostic test scores
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Tutor session summaries</strong> &mdash; transcripts
                  and learning outcomes from all AI Tutor sessions
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>IEP goal progress</strong> &mdash; uploaded IEP
                  goals, extracted accommodations, mastery tracking data, and
                  progress report history
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Gamification history</strong> &mdash; XP, streaks,
                  badges earned, milestones unlocked
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Account settings</strong> &mdash; notification
                  preferences, session limits, content filters, and privacy
                  settings
                </span>
              </li>
            </ul>

            {/* Export Format */}
            <h2
              id="export-format"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Export Format
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Your export is delivered as a single <strong>ZIP file</strong>{" "}
              containing two types of files:
            </p>
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-aivo-navy-800">
                  JSON Data Files
                </h3>
                <p className="mt-2 text-sm text-aivo-navy-600">
                  Machine-readable, structured data files. These are useful if
                  you want to import your data into another platform or analyze
                  it programmatically. Each data category is organized into its
                  own JSON file.
                </p>
              </div>
              <div className="rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-aivo-navy-800">
                  Markdown Summaries
                </h3>
                <p className="mt-2 text-sm text-aivo-navy-600">
                  Human-readable summary files formatted in Markdown. Open
                  these in any text editor, Markdown viewer, or word processor
                  to review your data without any technical knowledge. Summaries
                  include student progress narratives, session highlights, and
                  goal tracking reports.
                </p>
              </div>
            </div>
            <div className="mt-6 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600">
                <strong>Example file structure:</strong>
              </p>
              <pre className="mt-3 rounded-lg bg-white p-4 text-xs text-aivo-navy-700 overflow-x-auto border border-aivo-navy-100">
{`aivo-export-2026-04-02/
├── account-settings.json
├── account-summary.md
├── students/
│   ├── student-1/
│   │   ├── profile.json
│   │   ├── brain-clone.json
│   │   ├── assessments.json
│   │   ├── tutor-sessions.json
│   │   ├── iep-goals.json
│   │   ├── gamification.json
│   │   └── summary.md
│   └── student-2/
│       └── ...`}
              </pre>
            </div>

            {/* Processing Time */}
            <h2
              id="processing-time"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Processing Time and Download
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              After you request an export:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Generation time:</strong> Typically 5&ndash;15
                  minutes, depending on the amount of data. Accounts with many
                  students or long histories may take closer to 15 minutes.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Email notification:</strong> You&rsquo;ll receive
                  an email when your export is ready, with a secure download
                  link.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Dashboard download:</strong> You can also download
                  the export directly from{" "}
                  <strong>Account Settings &rarr; Privacy &rarr; Export Data</strong>{" "}
                  once it&rsquo;s ready.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Link expiration:</strong> The download link expires
                  after <strong>72 hours</strong> for security. If it expires,
                  simply request a new export.
                </span>
              </li>
            </ul>

            {/* Export Options */}
            <h2
              id="export-options"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Per-Student vs. Full-Account Export
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO offers two export scopes:
            </p>
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-aivo-navy-800">
                  Per-Student Export
                </h3>
                <p className="mt-2 text-sm text-aivo-navy-600">
                  Export data for a single student profile. Useful if you want
                  to share one child&rsquo;s learning records with a teacher or
                  transfer to another platform without including data for other
                  children.
                </p>
              </div>
              <div className="rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-aivo-navy-800">
                  Full-Account Export
                </h3>
                <p className="mt-2 text-sm text-aivo-navy-600">
                  Export all data across your entire account &mdash; every
                  student profile, all account settings, and complete history.
                  This is the recommended option if you&rsquo;re{" "}
                  <Link
                    href="/help/privacy-security/deleting-your-account"
                    className="text-aivo-purple-600 underline"
                  >
                    planning to delete your account
                  </Link>{" "}
                  and want a backup first.
                </p>
              </div>
            </div>

            {/* GDPR */}
            <h2
              id="gdpr-portability"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              GDPR Data Portability
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO&rsquo;s data export feature fulfills the requirements of{" "}
              <strong>GDPR Article 20</strong> (Right to Data Portability). Your
              data is provided in a structured, commonly used, and
              machine-readable format (JSON) alongside human-readable summaries
              (Markdown).
            </p>
            <p className="text-aivo-navy-600 leading-relaxed mt-3">
              If you are located in the EU/EEA and have additional portability
              requests, contact us at{" "}
              <strong>privacy@aivolearning.com</strong>.
            </p>
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
            If you have questions about your data export, our team is here to
            help.
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
              href="/help/privacy-security/data-privacy-overview"
              className="rounded-xl border border-aivo-navy-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-aivo-navy-800">
                Data Privacy Overview
              </h3>
              <p className="mt-1 text-sm text-aivo-navy-500">
                How AIVO protects your family&rsquo;s data at every level.
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

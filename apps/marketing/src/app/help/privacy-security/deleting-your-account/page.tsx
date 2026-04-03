import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Deleting Your Account | Help | AIVO",
  description:
    "Learn how to permanently delete your AIVO Learning account and all associated data, including the 7-day cooling-off period, deletion timeline, and how to export your data first.",
  openGraph: {
    title: "Deleting Your Account | AIVO Help",
    description:
      "How to delete your AIVO account — cooling-off period, what's erased, and the full deletion timeline.",
  },
};

export default function DeletingYourAccountPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-medium text-aivo-purple-600 uppercase tracking-wider">
            Privacy &amp; Security
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl">
            Deleting Your Account
          </h1>
          <p className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto">
            Understand the difference between canceling your subscription and
            permanently deleting your account and all associated data.
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
                  href="#cancel-vs-delete"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Canceling vs. Deleting
                </a>
              </li>
              <li>
                <a
                  href="#how-to-delete"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  How to Request Account Deletion
                </a>
              </li>
              <li>
                <a
                  href="#confirmation"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Confirmation and Cooling-Off Period
                </a>
              </li>
              <li>
                <a
                  href="#what-is-deleted"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  What Is Deleted
                </a>
              </li>
              <li>
                <a
                  href="#deletion-timeline"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Deletion Timeline
                </a>
              </li>
              <li>
                <a
                  href="#what-is-retained"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  What Is Retained After Deletion
                </a>
              </li>
              <li>
                <a
                  href="#export-first"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Download Your Data Before Deleting
                </a>
              </li>
            </ul>
          </nav>

          <div className="prose prose-aivo max-w-none">
            {/* Cancel vs Delete */}
            <h2
              id="cancel-vs-delete"
              className="text-2xl font-bold text-aivo-navy-800 mt-0 scroll-mt-24"
            >
              Canceling vs. Deleting
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              These are two different actions with very different outcomes:
            </p>
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-aivo-navy-800">
                  Canceling Your Subscription
                </h3>
                <p className="mt-2 text-sm text-aivo-navy-600">
                  Stops future billing. Your account and all data are preserved.
                  You can continue using AIVO on the Free plan, and reactivate
                  your Pro or Premium subscription at any time without losing
                  any data.
                </p>
                <Link
                  href="/help/account-billing/canceling-your-plan"
                  className="mt-3 inline-block text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Learn about canceling &rarr;
                </Link>
              </div>
              <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                <h3 className="text-base font-bold text-red-800">
                  Deleting Your Account
                </h3>
                <p className="mt-2 text-sm text-red-700">
                  Permanently and irreversibly erases all of your data,
                  including every student profile, Brain Clone model, IEP
                  documents, tutor transcripts, and gamification history. This
                  action cannot be undone after the cooling-off period.
                </p>
              </div>
            </div>

            {/* How to Delete */}
            <h2
              id="how-to-delete"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              How to Request Account Deletion
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              You can request account deletion through either of these methods:
            </p>
            <h3 className="text-lg font-bold text-aivo-navy-800 mt-6">
              Option A: From the Dashboard
            </h3>
            <ol className="mt-4 space-y-4">
              <li className="flex items-start gap-4 text-aivo-navy-600">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-sm font-bold text-aivo-purple-700">
                  1
                </span>
                <span>
                  Log in and go to <strong>Account Settings</strong>.
                </span>
              </li>
              <li className="flex items-start gap-4 text-aivo-navy-600">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-sm font-bold text-aivo-purple-700">
                  2
                </span>
                <span>
                  Select <strong>Privacy</strong>.
                </span>
              </li>
              <li className="flex items-start gap-4 text-aivo-navy-600">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-sm font-bold text-aivo-purple-700">
                  3
                </span>
                <span>
                  Click <strong>Delete Account</strong>. You&rsquo;ll be asked
                  to confirm by typing &ldquo;DELETE&rdquo; and verifying via
                  email.
                </span>
              </li>
            </ol>
            <h3 className="text-lg font-bold text-aivo-navy-800 mt-6">
              Option B: Via Email
            </h3>
            <p className="text-aivo-navy-600 leading-relaxed">
              Send a deletion request to{" "}
              <strong>privacy@aivolearning.com</strong> from the email address
              associated with your account. Include &ldquo;Account
              Deletion&rdquo; in the subject line. Our privacy team will
              respond within 2 business days.
            </p>

            {/* Confirmation */}
            <h2
              id="confirmation"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Confirmation and Cooling-Off Period
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              After you submit a deletion request:
            </p>
            <ol className="mt-4 space-y-4">
              <li className="flex items-start gap-4 text-aivo-navy-600">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-sm font-bold text-aivo-purple-700">
                  1
                </span>
                <span>
                  <strong>Email verification:</strong> You&rsquo;ll receive a
                  confirmation email. Click the verification link to confirm
                  you are the account owner and that the request is intentional.
                </span>
              </li>
              <li className="flex items-start gap-4 text-aivo-navy-600">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-sm font-bold text-aivo-purple-700">
                  2
                </span>
                <span>
                  <strong>7-day cooling-off period:</strong> Once confirmed, a
                  7-day cooling-off window begins. During this period, your
                  account is marked for deletion but your data is still intact.
                </span>
              </li>
              <li className="flex items-start gap-4 text-aivo-navy-600">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-sm font-bold text-aivo-purple-700">
                  3
                </span>
                <span>
                  <strong>Changed your mind?</strong> During the 7-day period,
                  you can cancel the deletion by logging in and clicking{" "}
                  <strong>Cancel Deletion Request</strong> on the banner that
                  appears. Your account will be fully restored.
                </span>
              </li>
            </ol>
            <div className="mt-6 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600">
                <strong>Important:</strong> After the 7-day cooling-off period
                ends, the deletion process begins automatically and cannot be
                reversed. We strongly recommend{" "}
                <a href="#export-first" className="text-aivo-purple-600 underline">
                  exporting your data
                </a>{" "}
                before confirming deletion.
              </p>
            </div>

            {/* What Is Deleted */}
            <h2
              id="what-is-deleted"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              What Is Deleted
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              When account deletion is finalized, the following data is
              permanently erased:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                <span>
                  <strong>All student profiles</strong> &mdash; names, grade
                  levels, learning preferences, assessment data
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                <span>
                  <strong>Brain Clone data</strong> &mdash; the entire AI
                  learning model for each student
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                <span>
                  <strong>IEP documents</strong> &mdash; all uploaded IEP PDFs,
                  extracted goals, accommodation settings
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                <span>
                  <strong>Tutor transcripts</strong> &mdash; full session
                  history with all seven AI Tutors
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                <span>
                  <strong>Gamification data</strong> &mdash; XP, streaks,
                  badges, milestones
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                <span>
                  <strong>Payment records</strong> &mdash; anonymized (personal
                  identifiers removed; aggregate transaction data retained
                  only as required by financial regulations)
                </span>
              </li>
            </ul>

            {/* Deletion Timeline */}
            <h2
              id="deletion-timeline"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Deletion Timeline
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Data deletion happens in two stages:
            </p>
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-sm font-bold text-aivo-purple-700">
                    30d
                  </span>
                  <h3 className="text-base font-bold text-aivo-navy-800">
                    Live Database
                  </h3>
                </div>
                <p className="mt-3 text-sm text-aivo-navy-600">
                  All personal data is permanently deleted from the live
                  PostgreSQL database within <strong>30 days</strong> of the
                  cooling-off period ending. Row-Level Security ensures data
                  is inaccessible immediately; physical deletion follows within
                  the 30-day window.
                </p>
              </div>
              <div className="rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-sm font-bold text-aivo-purple-700">
                    90d
                  </span>
                  <h3 className="text-base font-bold text-aivo-navy-800">
                    Encrypted Backups
                  </h3>
                </div>
                <p className="mt-3 text-sm text-aivo-navy-600">
                  Encrypted backup copies cycle out within{" "}
                  <strong>90 days</strong>. Backup data is AES-256 encrypted
                  and cannot be accessed individually. As backups rotate on
                  their normal schedule, your data is permanently purged.
                </p>
              </div>
            </div>

            {/* What Is Retained */}
            <h2
              id="what-is-retained"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              What Is Retained After Deletion
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              After the full deletion pipeline completes, the only data that
              remains is:
            </p>
            <div className="mt-6 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600">
                <strong>Anonymized aggregate analytics only.</strong> This
                includes non-identifiable statistics like &ldquo;X users
                completed Y activities in March 2026.&rdquo; This data cannot
                be linked to any individual account, student, or family. It is
                used solely for product improvement.
              </p>
            </div>
            <p className="text-aivo-navy-600 leading-relaxed mt-4">
              No personal information, educational records, or identifiable data
              of any kind survives the deletion process.
            </p>

            {/* Export First */}
            <h2
              id="export-first"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Download Your Data Before Deleting
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Before you delete your account, we strongly recommend downloading
              a complete copy of your data. Once the deletion is finalized, your
              data cannot be recovered.
            </p>
            <ol className="mt-4 space-y-4">
              <li className="flex items-start gap-4 text-aivo-navy-600">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-sm font-bold text-aivo-purple-700">
                  1
                </span>
                <span>
                  Go to{" "}
                  <strong>
                    Account Settings &rarr; Privacy &rarr; Export Data
                  </strong>{" "}
                  and request a full-account export.
                </span>
              </li>
              <li className="flex items-start gap-4 text-aivo-navy-600">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-sm font-bold text-aivo-purple-700">
                  2
                </span>
                <span>
                  Wait for the email notification (typically 5&ndash;15
                  minutes) and download the ZIP file.
                </span>
              </li>
              <li className="flex items-start gap-4 text-aivo-navy-600">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-sm font-bold text-aivo-purple-700">
                  3
                </span>
                <span>
                  Once you&rsquo;ve verified your download, proceed with the{" "}
                  <a href="#how-to-delete" className="text-aivo-purple-600 underline">
                    deletion request
                  </a>.
                </span>
              </li>
            </ol>
            <p className="text-aivo-navy-600 leading-relaxed mt-4">
              For detailed instructions, see{" "}
              <Link
                href="/help/privacy-security/exporting-your-data"
                className="text-aivo-purple-600 underline"
              >
                Exporting Your Data
              </Link>.
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
            If you have questions about account deletion, our privacy team is
            here to help.
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
              href="/help/privacy-security/exporting-your-data"
              className="rounded-xl border border-aivo-navy-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-aivo-navy-800">
                Exporting Your Data
              </h3>
              <p className="mt-1 text-sm text-aivo-navy-500">
                Download a full copy of your family&rsquo;s data before
                deleting.
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

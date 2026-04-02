import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sharing With Your IEP Team | Help | AIVO",
  description:
    "Learn how to securely share AIVO Learning progress reports with teachers, special education coordinators, and advocates using time-limited secure links.",
  openGraph: {
    title: "Sharing With Your IEP Team | AIVO Help",
    description:
      "Generate secure share links, set permissions and expiration, and prepare for IEP meetings with AIVO reports.",
  },
};

export default function SharingWithYourIepTeamPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-medium text-aivo-purple-600 uppercase tracking-wider">
            IEP Support
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl">
            Sharing With Your IEP Team
          </h1>
          <p className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto">
            Securely share your student&rsquo;s progress reports with teachers,
            coordinators, and other IEP team members — always under your
            control.
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
                  href="#generating-link"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Generating a Secure Share Link
                </a>
              </li>
              <li>
                <a
                  href="#link-permissions"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Setting Link Permissions
                </a>
              </li>
              <li>
                <a
                  href="#link-expiration"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Link Expiration Settings
                </a>
              </li>
              <li>
                <a
                  href="#who-can-receive"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Who Can Receive Shared Reports
                </a>
              </li>
              <li>
                <a
                  href="#revoking"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Revoking a Shared Link
                </a>
              </li>
              <li>
                <a
                  href="#parent-gatekeeper"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  The Parent-as-Gatekeeper Model
                </a>
              </li>
              <li>
                <a
                  href="#meeting-prep"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Best Practices for IEP Meeting Preparation
                </a>
              </li>
            </ul>
          </nav>

          <div className="prose prose-aivo max-w-none">
            {/* Generating a Secure Share Link */}
            <h2
              id="generating-link"
              className="text-2xl font-bold text-aivo-navy-800 mt-0 scroll-mt-24"
            >
              Generating a Secure Share Link
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              You can share any progress report with members of your IEP team
              by generating a secure, time-limited link. No AIVO account is
              required for the recipient — they simply open the link in a
              browser.
            </p>
            <ol className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  1
                </span>
                <span>
                  Navigate to{" "}
                  <strong>Student Profile &rarr; IEP &rarr; Reports</strong>{" "}
                  and open the report you want to share.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  2
                </span>
                <span>
                  Click the <strong>Share</strong> button in the top-right
                  corner of the report view.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  3
                </span>
                <span>
                  Configure the link settings: choose permissions and
                  expiration (see sections below).
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  4
                </span>
                <span>
                  Click <strong>Generate Link</strong>. The secure URL is
                  copied to your clipboard automatically.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  5
                </span>
                <span>
                  Send the link to your IEP team members via email,
                  your district&rsquo;s messaging platform, or any
                  communication channel you prefer.
                </span>
              </li>
            </ol>

            {/* Link Permissions */}
            <h2
              id="link-permissions"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Setting Link Permissions
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              When generating a share link, you choose what the recipient can
              do with the report:
            </p>
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-aivo-navy-800">
                  View Only
                </h3>
                <p className="mt-2 text-sm text-aivo-navy-600 leading-relaxed">
                  The recipient can view the report in their browser but cannot
                  download or print it. The report is rendered as a read-only
                  web page with no export buttons. This is the most restrictive
                  option and is recommended when you want to share data for
                  reference without providing a permanent copy.
                </p>
              </div>
              <div className="rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-aivo-navy-800">
                  Download Allowed
                </h3>
                <p className="mt-2 text-sm text-aivo-navy-600 leading-relaxed">
                  The recipient can view the report and download it as a PDF.
                  This is recommended when sharing with IEP team members who
                  need to include the report in the student&rsquo;s official
                  IEP file or bring a printed copy to a meeting.
                </p>
              </div>
            </div>

            {/* Link Expiration */}
            <h2
              id="link-expiration"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Link Expiration Settings
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Every share link has a built-in expiration to protect your
              student&rsquo;s data. You can choose from three expiration
              periods:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>7 days:</strong> Ideal for quick sharing before an
                  upcoming meeting. The link provides enough time for the team
                  to review but expires shortly after.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>14 days:</strong> Good for ongoing collaboration
                  when the team needs time to review and discuss the report
                  across multiple meetings.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>30 days:</strong> Maximum duration. Use this when
                  sharing with team members who may need extended access, such
                  as related service providers who meet with the student
                  infrequently.
                </span>
              </li>
            </ul>
            <p className="text-aivo-navy-600 leading-relaxed mt-4">
              After the link expires, anyone trying to access it will see a
              message indicating the link is no longer active. They will not
              see any student data. You can always generate a new link if
              continued access is needed.
            </p>

            {/* Who Can Receive */}
            <h2
              id="who-can-receive"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Who Can Receive Shared Reports
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              You can share reports with anyone on your student&rsquo;s IEP
              team. Common recipients include:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>General education teachers</strong> — To show how the
                  student is performing on IEP goals in supplemental AI Tutor
                  sessions at home.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Special education coordinators</strong> — To provide
                  data-driven evidence of progress (or lack thereof) for IEP
                  review discussions.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Related service providers</strong> — Speech-language
                  pathologists, occupational therapists, school psychologists,
                  and other specialists working with the student.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Parent advocates</strong> — If you have an educational
                  advocate or attorney supporting you through the IEP process,
                  you can share reports with them for review.
                </span>
              </li>
            </ul>
            <div className="mt-6 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600">
                <strong>Important:</strong> Share links do not require an AIVO
                account to access. Anyone with the link can view (and
                optionally download) the report, so share it only with trusted
                individuals. You can revoke a link at any time (see below).
              </p>
            </div>

            {/* Revoking */}
            <h2
              id="revoking"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Revoking a Shared Link
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              If you need to remove access before the link&rsquo;s scheduled
              expiration, you can revoke it instantly:
            </p>
            <ol className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  1
                </span>
                <span>
                  Navigate to{" "}
                  <strong>Student Profile &rarr; IEP &rarr; Reports</strong>.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  2
                </span>
                <span>
                  Click the <strong>Shared Links</strong> tab. You&rsquo;ll see
                  a list of all active share links with their creation date,
                  expiration date, permissions, and view count.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  3
                </span>
                <span>
                  Click <strong>Revoke</strong> next to the link you want to
                  deactivate, then confirm. The link is immediately
                  invalidated — anyone who attempts to access it will see an
                  expired-link message.
                </span>
              </li>
            </ol>

            {/* Parent-as-Gatekeeper */}
            <h2
              id="parent-gatekeeper"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              The Parent-as-Gatekeeper Model
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO follows a strict <strong>parent-as-gatekeeper</strong>{" "}
              model for all IEP data sharing. This means:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  No educator, school administrator, or district employee can
                  access your student&rsquo;s IEP data, session history, or
                  progress reports on AIVO unless <em>you</em> initiate the
                  sharing by generating a link.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  Even on Premium (school/district) plans, parent-uploaded IEP
                  documents remain under the parent account&rsquo;s exclusive
                  control.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  AIVO will never share student data with third parties without
                  explicit parent consent. This is enforced both technically (no
                  API access without parent-generated tokens) and contractually.
                </span>
              </li>
            </ul>
            <div className="mt-6 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600">
                <strong>FERPA compliance:</strong> This model is aligned with
                FERPA requirements, which give parents the right to control
                disclosure of their child&rsquo;s education records. For
                full details, see our{" "}
                <Link
                  href="/legal/ferpa"
                  className="text-aivo-purple-600 underline"
                >
                  FERPA compliance page
                </Link>
                .
              </p>
            </div>

            {/* Meeting Preparation */}
            <h2
              id="meeting-prep"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Best Practices for IEP Meeting Preparation
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO&rsquo;s reports are designed to give you a strong,
              data-backed position in IEP team meetings. Here are our
              recommendations:
            </p>
            <ol className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  1
                </span>
                <span>
                  <strong>Generate an IEP Meeting Report</strong> covering the
                  period since the last IEP review. Use a custom date range if
                  needed to align with the school&rsquo;s reporting period.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  2
                </span>
                <span>
                  <strong>Review the Goal Status Summary</strong> and identify
                  goals that are green (celebrate progress), yellow
                  (discuss strategies), or red (request additional supports
                  or goal modifications).
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  3
                </span>
                <span>
                  <strong>Note accommodation usage patterns.</strong> If
                  text-to-speech is being used in 90% of sessions, that&rsquo;s
                  strong evidence the accommodation is needed. If an
                  accommodation is rarely used, discuss with the team whether
                  it&rsquo;s still appropriate.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  4
                </span>
                <span>
                  <strong>Share the report with the team 3&ndash;5 days
                  before the meeting</strong> using a 14-day secure link with
                  download enabled. This gives everyone time to review the data
                  before the discussion.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  5
                </span>
                <span>
                  <strong>Bring a printed copy</strong> to the meeting. Export
                  the report as PDF and print one copy for yourself and one for
                  the case manager to attach to the IEP file.
                </span>
              </li>
            </ol>
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
            If you still have questions, our support team is here to help.
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
              href="/help/iep-support/uploading-iep-documents"
              className="rounded-xl border border-aivo-navy-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-aivo-navy-800">
                Uploading IEP Documents
              </h3>
              <p className="mt-1 text-sm text-aivo-navy-500">
                Upload and verify your student&rsquo;s IEP for goal-aligned
                learning.
              </p>
            </Link>
            <Link
              href="/help/iep-support/tracking-iep-goals"
              className="rounded-xl border border-aivo-navy-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-aivo-navy-800">
                Tracking IEP Goals
              </h3>
              <p className="mt-1 text-sm text-aivo-navy-500">
                Monitor progress toward each goal with visual dashboards.
              </p>
            </Link>
            <Link
              href="/help/iep-support/generating-progress-reports"
              className="rounded-xl border border-aivo-navy-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-aivo-navy-800">
                Generating Progress Reports
              </h3>
              <p className="mt-1 text-sm text-aivo-navy-500">
                Create detailed reports mapped to IEP goals for team meetings.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

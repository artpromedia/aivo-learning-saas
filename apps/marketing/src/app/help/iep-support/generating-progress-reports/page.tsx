import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Generating Progress Reports | Help | AIVO",
  description:
    "Learn how to generate, customize, export, and share IEP progress reports from AIVO Learning — including weekly summaries, monthly reports, and IEP meeting reports.",
  openGraph: {
    title: "Generating Progress Reports | AIVO Help",
    description:
      "Create detailed IEP progress reports for team meetings, export as PDF, and share via secure link.",
  },
};

export default function GeneratingProgressReportsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-medium text-aivo-purple-600 uppercase tracking-wider">
            IEP Support
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl">
            Generating Progress Reports
          </h1>
          <p className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto">
            Create detailed reports that map directly to your student&rsquo;s
            IEP goals — ready for team meetings, progress reviews, or your own
            records.
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
                  href="#navigating-reports"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Navigating to Reports
                </a>
              </li>
              <li>
                <a
                  href="#report-types"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Report Types
                </a>
              </li>
              <li>
                <a
                  href="#report-contents"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  What Each Report Contains
                </a>
              </li>
              <li>
                <a
                  href="#custom-date-range"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Customizing Date Ranges
                </a>
              </li>
              <li>
                <a
                  href="#exporting"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Exporting and Printing
                </a>
              </li>
              <li>
                <a
                  href="#iep-mapping"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  How Reports Map to IEP Requirements
                </a>
              </li>
              <li>
                <a
                  href="#sharing"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Sharing Reports via Secure Link
                </a>
              </li>
            </ul>
          </nav>

          <div className="prose prose-aivo max-w-none">
            {/* Navigating to Reports */}
            <h2
              id="navigating-reports"
              className="text-2xl font-bold text-aivo-navy-800 mt-0 scroll-mt-24"
            >
              Navigating to Reports
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              To access IEP progress reports:
            </p>
            <ol className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  1
                </span>
                <span>
                  From the parent dashboard, click the student&rsquo;s name to
                  open their <strong>Student Profile</strong>.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  2
                </span>
                <span>
                  Navigate to the <strong>IEP</strong> tab, then click{" "}
                  <strong>Reports</strong>.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  3
                </span>
                <span>
                  You&rsquo;ll see a list of previously generated reports and
                  the option to generate a new one.
                </span>
              </li>
            </ol>

            {/* Report Types */}
            <h2
              id="report-types"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Report Types
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO offers three report types, each designed for a different
              purpose:
            </p>

            <div className="mt-6 rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-aivo-navy-800">
                Weekly Summary
              </h3>
              <p className="mt-2 text-sm text-aivo-navy-600 leading-relaxed">
                A compact, one-page overview of the past 7 days. Ideal for
                staying informed week-to-week. Includes session counts, XP
                earned, goal progress changes, and a brief highlight of the
                student&rsquo;s strongest and weakest areas.
              </p>
            </div>

            <div className="mt-4 rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-aivo-navy-800">
                Monthly Detailed
              </h3>
              <p className="mt-2 text-sm text-aivo-navy-600 leading-relaxed">
                A comprehensive multi-page report covering the past 30 days.
                Includes detailed goal-by-goal progress analysis, session
                transcripts summary, mastery trend charts, accommodation usage
                data, and tutor recommendations.
              </p>
            </div>

            <div className="mt-4 rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-aivo-navy-800">
                IEP Meeting Report
              </h3>
              <p className="mt-2 text-sm text-aivo-navy-600 leading-relaxed">
                A formal report designed specifically for IEP team meetings.
                Covers the full period since the last IEP or last meeting
                report. Includes structured sections that align with standard
                IEP progress reporting requirements, making it easy to present
                data-driven evidence to the team.
              </p>
            </div>

            {/* Report Contents */}
            <h2
              id="report-contents"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              What Each Report Contains
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Regardless of type, every report includes the following data
              points (with varying levels of detail):
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Goal progress:</strong> Current mastery percentage
                  for each IEP goal, change over the reporting period, and
                  color-coded status (on track / needs attention / behind pace).
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Session counts:</strong> Total sessions, sessions per
                  tutor, total time spent, and average session duration.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Mastery data:</strong> Detailed accuracy breakdowns
                  per goal, trend charts showing mastery over time, and lists
                  of specific skills demonstrated or still developing.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Accommodation usage:</strong> Which accommodations
                  were active during the period (e.g., text-to-speech used in
                  85% of sessions, extended time enabled), and how usage
                  correlates with performance.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Tutor notes:</strong> AI-generated observational
                  notes from each tutor about the student&rsquo;s engagement
                  patterns, common error types, and areas of strength.
                </span>
              </li>
            </ul>

            {/* Custom Date Range */}
            <h2
              id="custom-date-range"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Customizing Date Ranges
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              While the preset report types cover standard time periods, you
              can customize the date range for any report:
            </p>
            <ol className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  1
                </span>
                <span>
                  On the Reports page, click{" "}
                  <strong>Generate New Report</strong>.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  2
                </span>
                <span>
                  Select the report type (Weekly, Monthly, or IEP Meeting).
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  3
                </span>
                <span>
                  Click <strong>Custom Date Range</strong> and use the date
                  picker to set the start and end dates. You can select any
                  range up to 12 months.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  4
                </span>
                <span>
                  Click <strong>Generate</strong>. The report will be built
                  using data from the selected period and will appear in your
                  report list within a few seconds.
                </span>
              </li>
            </ol>

            {/* Exporting */}
            <h2
              id="exporting"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Exporting and Printing
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Every report can be exported or printed for use outside of AIVO:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Export as PDF:</strong> Click the{" "}
                  <strong>Download PDF</strong> button on any report. The PDF
                  is professionally formatted with AIVO branding, charts, and
                  tables — ready to hand to your IEP team.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Print:</strong> Click the <strong>Print</strong>{" "}
                  button to open the browser&rsquo;s print dialog with a
                  print-optimized layout (no navigation chrome, high-contrast
                  charts).
                </span>
              </li>
            </ul>
            <div className="mt-6 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600">
                <strong>Tip:</strong> For IEP team meetings, we recommend
                generating an IEP Meeting Report, exporting it as PDF, and
                bringing printed copies for each team member. You can also
                share a digital copy via secure link (see below).
              </p>
            </div>

            {/* IEP Mapping */}
            <h2
              id="iep-mapping"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              How Reports Map to IEP Requirements
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Under IDEA (Individuals with Disabilities Education Act), schools
              must report progress on IEP goals to parents at least as often as
              report cards are issued. AIVO&rsquo;s reports are structured to
              complement this requirement:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  Each report organizes data <strong>by IEP goal</strong>,
                  matching the structure of standard IEP progress notes.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  Progress is reported using <strong>measurable data</strong>{" "}
                  (percentages, session counts, accuracy rates) — not
                  subjective assessments.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  The IEP Meeting Report includes a{" "}
                  <strong>Goal Status Summary</strong> table that can be
                  directly compared to the school&rsquo;s progress report.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  Accommodation usage data provides evidence for discussions
                  about whether current accommodations are effective or need
                  adjustment.
                </span>
              </li>
            </ul>

            {/* Sharing */}
            <h2
              id="sharing"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Sharing Reports via Secure Link
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              You can share any report with your IEP team by generating a
              secure, time-limited link:
            </p>
            <ol className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  1
                </span>
                <span>
                  Open the report you want to share and click{" "}
                  <strong>Share</strong>.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  2
                </span>
                <span>
                  Choose the link expiration (7, 14, or 30 days) and
                  permissions (view-only or download allowed).
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  3
                </span>
                <span>
                  Click <strong>Generate Link</strong>. Copy the link and share
                  it with your IEP team members via email or your preferred
                  communication channel.
                </span>
              </li>
            </ol>
            <p className="text-aivo-navy-600 leading-relaxed mt-4">
              The shared link expires automatically after the selected
              duration. For more details on sharing and privacy, see{" "}
              <Link
                href="/help/iep-support/sharing-with-your-iep-team"
                className="text-aivo-purple-600 underline"
              >
                Sharing With Your IEP Team
              </Link>
              .
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
              href="/help/iep-support/sharing-with-your-iep-team"
              className="rounded-xl border border-aivo-navy-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-aivo-navy-800">
                Sharing With Your IEP Team
              </h3>
              <p className="mt-1 text-sm text-aivo-navy-500">
                Securely share progress data with teachers and coordinators.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Reporting Tutor Issues | Help | AIVO",
  description:
    "Learn how to flag content issues, inappropriate responses, confusing explanations, or technical glitches during or after an AI Tutor session on AIVO Learning.",
  openGraph: {
    title: "Reporting Tutor Issues | AIVO Help",
    description:
      "Report content problems, inappropriate responses, or technical glitches to the AIVO moderation team.",
  },
};

export default function ReportingTutorIssuesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-medium text-aivo-purple-600 uppercase tracking-wider">
            AI Tutors
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl">
            Reporting Tutor Issues
          </h1>
          <p className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto">
            If an AI Tutor says something incorrect, confusing, or
            inappropriate, you can flag it instantly. Here&rsquo;s how the
            reporting and resolution process works.
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
                  href="#when-to-report"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  When to Report an Issue
                </a>
              </li>
              <li>
                <a
                  href="#report-during-session"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Reporting From Within a Session
                </a>
              </li>
              <li>
                <a
                  href="#report-after-session"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Reporting After a Session
                </a>
              </li>
              <li>
                <a
                  href="#report-contents"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  What Information Is Included in a Report
                </a>
              </li>
              <li>
                <a
                  href="#review-process"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  How AIVO Reviews Reports
                </a>
              </li>
              <li>
                <a
                  href="#follow-up"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Follow-Up and Resolution
                </a>
              </li>
            </ul>
          </nav>

          <div className="prose prose-aivo max-w-none">
            {/* When to Report */}
            <h2
              id="when-to-report"
              className="text-2xl font-bold text-aivo-navy-800 mt-0 scroll-mt-24"
            >
              When to Report an Issue
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO&rsquo;s AI Tutors are designed to provide safe, accurate, and
              age-appropriate learning experiences. However, AI-generated
              content can occasionally include errors or responses that
              don&rsquo;t meet our quality standards. You should report an issue
              whenever you notice any of the following:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Factually incorrect content:</strong> The tutor
                  provides an answer, explanation, or example that is wrong —
                  such as an incorrect math solution, a misattributed historical
                  fact, or a flawed scientific explanation.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Inappropriate response:</strong> The tutor generates
                  content that is not age-appropriate, includes inappropriate
                  language, or covers topics outside the scope of the assigned
                  subject.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Confusing explanation:</strong> The tutor&rsquo;s
                  explanation is unclear, circular, or overly complex for the
                  student&rsquo;s grade level — even after follow-up attempts.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Technical glitch:</strong> The tutor stops responding,
                  repeats the same message in a loop, sends garbled or broken
                  output, or the interface freezes during a session.
                </span>
              </li>
            </ul>

            {/* Report During Session */}
            <h2
              id="report-during-session"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Reporting From Within a Session
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              The fastest way to report an issue is directly from the active
              session. Every tutor message includes a small flag icon for
              instant reporting.
            </p>
            <ol className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  1
                </span>
                <span>
                  Hover over (or long-press on mobile) the specific tutor
                  message that contains the issue. A small{" "}
                  <strong>flag icon</strong> appears in the top-right corner of
                  the message bubble.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  2
                </span>
                <span>
                  Click the flag icon. A dropdown appears with report
                  categories:
                </span>
              </li>
            </ol>
            <ul className="mt-3 ml-9 space-y-2">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>Factually incorrect</span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>Inappropriate content</span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>Confusing explanation</span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>Technical problem</span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>Other</span>
              </li>
            </ul>
            <ol className="mt-4 space-y-3" start={3}>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  3
                </span>
                <span>
                  Select the category that best describes the issue. You can
                  optionally add a short text note with additional context.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  4
                </span>
                <span>
                  Click <strong>Submit Report</strong>. The flagged message is
                  highlighted with a subtle indicator and the session continues
                  uninterrupted.
                </span>
              </li>
            </ol>
            <div className="mt-6 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600">
                <strong>Tip:</strong> Reporting during a session is especially
                helpful because it captures the exact conversation context — the
                messages immediately before and after the flagged content are
                automatically included in the report.
              </p>
            </div>

            {/* Report After Session */}
            <h2
              id="report-after-session"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Reporting After a Session
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              If you notice an issue after a session has ended — for example,
              while reviewing the transcript with your child — you can still
              file a report.
            </p>
            <ol className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  1
                </span>
                <span>
                  From the parent dashboard, navigate to the student&rsquo;s{" "}
                  <strong>Session History</strong>.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  2
                </span>
                <span>
                  Click the session you want to review and open the{" "}
                  <strong>View Transcript</strong> view.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  3
                </span>
                <span>
                  Hover over (or long-press) the specific tutor message and
                  click the <strong>flag icon</strong>. The same reporting
                  dropdown appears as in a live session.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  4
                </span>
                <span>
                  Select the issue category, add an optional note, and click{" "}
                  <strong>Submit Report</strong>.
                </span>
              </li>
            </ol>
            <p className="text-aivo-navy-600 leading-relaxed mt-4">
              Reports can be submitted for any session in the last 90 days.
              After 90 days, session transcripts are archived and the flag
              button is no longer available.
            </p>

            {/* Report Contents */}
            <h2
              id="report-contents"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              What Information Is Included in a Report
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              When you submit a report, the following information is
              automatically captured and sent to the AIVO moderation team:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Session ID:</strong> A unique identifier for the
                  session so the team can locate the exact conversation.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Flagged message content:</strong> The full text of the
                  tutor message that was reported, including any embedded code
                  blocks, formulas, or diagrams.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Surrounding context:</strong> The 5 messages
                  immediately before and after the flagged message, providing
                  conversation context.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Student context:</strong> The student&rsquo;s grade
                  level, subject, current difficulty setting, and any active
                  focus areas — but <em>not</em> the student&rsquo;s name or
                  personal information.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Report category:</strong> The issue type you selected
                  (e.g., factually incorrect, inappropriate content).
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Your note (optional):</strong> Any additional context
                  you provided when filing the report.
                </span>
              </li>
            </ul>
            <div className="mt-6 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600">
                <strong>Privacy note:</strong> Reports are reviewed by
                AIVO&rsquo;s internal moderation team only. Student names and
                personally identifiable information are redacted from the
                report. For details on how data is handled, see our{" "}
                <Link
                  href="/legal/ferpa"
                  className="text-aivo-purple-600 underline"
                >
                  FERPA
                </Link>{" "}
                and{" "}
                <Link
                  href="/legal/coppa"
                  className="text-aivo-purple-600 underline"
                >
                  COPPA
                </Link>{" "}
                compliance pages.
              </p>
            </div>

            {/* Review Process */}
            <h2
              id="review-process"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              How AIVO Reviews Reports
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Every report is reviewed by a member of AIVO&rsquo;s content
              moderation team. Here is the review process:
            </p>
            <ol className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  1
                </span>
                <span>
                  <strong>Triage (within 1 hour):</strong> Reports flagged as
                  &ldquo;Inappropriate content&rdquo; are prioritized and
                  reviewed first. All other categories are triaged within 4
                  hours during business hours.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  2
                </span>
                <span>
                  <strong>Investigation (within 24 hours):</strong> A moderator
                  reviews the flagged content and surrounding context, verifies
                  the facts or evaluates the quality of the explanation, and
                  classifies the issue.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  3
                </span>
                <span>
                  <strong>Action:</strong> Depending on the findings, the team
                  may update the tutor&rsquo;s knowledge base, adjust the
                  content safety guardrails, file an engineering ticket for
                  technical issues, or mark the report as a non-issue with an
                  explanation.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  4
                </span>
                <span>
                  <strong>Resolution:</strong> The report is closed with a
                  resolution status: <strong>Fixed</strong>,{" "}
                  <strong>Acknowledged</strong> (known issue being worked on),
                  or <strong>Non-Issue</strong> (content was accurate or
                  appropriate).
                </span>
              </li>
            </ol>

            {/* Follow-Up */}
            <h2
              id="follow-up"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Follow-Up and Resolution
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              You&rsquo;ll be kept in the loop throughout the process:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Email confirmation:</strong> Within minutes of
                  submitting a report, you receive an email confirming receipt
                  with a report reference number.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Resolution notification:</strong> Once the moderation
                  team has reviewed and resolved the report, you receive a
                  follow-up email explaining the findings and any actions taken.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Report history:</strong> You can view all submitted
                  reports and their statuses under{" "}
                  <strong>Account Settings &rarr; My Reports</strong>. Each
                  report shows its category, date, status (Open, In Review,
                  Resolved), and the resolution summary.
                </span>
              </li>
            </ul>
            <div className="mt-6 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600">
                <strong>SLA commitment:</strong> AIVO commits to a 24-hour
                review SLA for all reports. Inappropriate-content reports are
                triaged within 1 hour and investigated with the highest
                priority. If a report requires a fix to the tutor model or
                safety guardrails, the change is typically deployed within 48
                hours.
              </p>
            </div>
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
              href="/help/ai-tutors/meeting-your-ai-tutors"
              className="rounded-xl border border-aivo-navy-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-aivo-navy-800">
                Meeting Your AI Tutors
              </h3>
              <p className="mt-1 text-sm text-aivo-navy-500">
                Get to know all 5 tutors and how they personalize sessions.
              </p>
            </Link>
            <Link
              href="/help/ai-tutors/switching-between-tutors"
              className="rounded-xl border border-aivo-navy-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-aivo-navy-800">
                Switching Between Tutors
              </h3>
              <p className="mt-1 text-sm text-aivo-navy-500">
                Move between subjects seamlessly while preserving progress.
              </p>
            </Link>
            <Link
              href="/help/ai-tutors/tutor-session-settings"
              className="rounded-xl border border-aivo-navy-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-aivo-navy-800">
                Tutor Session Settings
              </h3>
              <p className="mt-1 text-sm text-aivo-navy-500">
                Configure session length, difficulty, hints, and parental
                controls.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

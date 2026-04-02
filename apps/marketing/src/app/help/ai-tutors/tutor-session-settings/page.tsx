import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tutor Session Settings | Help | AIVO",
  description:
    "Learn how to adjust AI Tutor session length, difficulty mode, hints, focus areas, parental notifications, session transcripts, and time limits on AIVO Learning.",
  openGraph: {
    title: "Tutor Session Settings | AIVO Help",
    description:
      "Configure difficulty, session length, hints, focus areas, and parental controls.",
  },
};

export default function TutorSessionSettingsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-medium text-aivo-purple-600 uppercase tracking-wider">
            AI Tutors
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl">
            Tutor Session Settings
          </h1>
          <p className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto">
            Customize how your student&rsquo;s AI Tutor sessions work —
            from difficulty and session length to parental controls and
            transcripts.
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
                  href="#session-length"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Adjusting Session Length
                </a>
              </li>
              <li>
                <a
                  href="#difficulty-mode"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Difficulty Mode: Auto-Adaptive vs. Fixed
                </a>
              </li>
              <li>
                <a
                  href="#hints"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Enabling or Disabling Hints
                </a>
              </li>
              <li>
                <a
                  href="#focus-areas"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Setting Focus Areas
                </a>
              </li>
              <li>
                <a
                  href="#parent-notifications"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Session Notifications for Parents
                </a>
              </li>
              <li>
                <a
                  href="#transcripts"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Accessing Session Transcripts and Summaries
                </a>
              </li>
              <li>
                <a
                  href="#time-limits"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Parental Controls for Session Time Limits
                </a>
              </li>
            </ul>
          </nav>

          <div className="prose prose-aivo max-w-none">
            {/* Session Length */}
            <h2
              id="session-length"
              className="text-2xl font-bold text-aivo-navy-800 mt-0 scroll-mt-24"
            >
              Adjusting Session Length
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              By default, AI Tutor sessions do not have a fixed end time — they
              run until the student or parent ends them, or until a parental
              time limit is reached. However, you can set a preferred session
              length so the tutor naturally wraps up the lesson at the right
              time.
            </p>
            <ol className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  1
                </span>
                <span>
                  From the parent dashboard, navigate to{" "}
                  <strong>Student Profile</strong> &rarr;{" "}
                  <strong>Tutor Settings</strong>.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  2
                </span>
                <span>
                  Under <strong>Session Length Preference</strong>, choose from
                  the available options:
                </span>
              </li>
            </ol>
            <ul className="mt-3 ml-9 space-y-2">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span><strong>15 minutes</strong> — Quick focused practice</span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span><strong>30 minutes</strong> — Standard session (recommended)</span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span><strong>45 minutes</strong> — Extended deep-dive</span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span><strong>No limit</strong> — The session continues until manually ended</span>
              </li>
            </ul>
            <p className="text-aivo-navy-600 leading-relaxed mt-4">
              When a session length is set, the tutor will begin its wrap-up
              phase (summary, XP review, next-session preview) about 3 minutes
              before the time limit. The student can choose to extend the
              session or end it.
            </p>

            {/* Difficulty Mode */}
            <h2
              id="difficulty-mode"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Difficulty Mode: Auto-Adaptive vs. Fixed
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Every tutor supports two difficulty modes. You can configure this
              per student, per tutor, or as a global default:
            </p>

            <div className="mt-6 rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-aivo-navy-800">
                Auto-Adaptive (Default)
              </h3>
              <p className="mt-2 text-sm text-aivo-navy-600 leading-relaxed">
                The tutor dynamically adjusts the difficulty of questions and
                explanations based on the student&rsquo;s responses in
                real time. If the student is excelling, difficulty increases. If
                they struggle, the tutor steps back and re-explains. This mode
                is ideal for general learning and follows the Brain Clone
                profile&rsquo;s mastery data.
              </p>
            </div>

            <div className="mt-4 rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-aivo-navy-800">
                Fixed Difficulty
              </h3>
              <p className="mt-2 text-sm text-aivo-navy-600 leading-relaxed">
                The tutor maintains content at a specific grade level regardless
                of student performance. You select the grade level (K through 8)
                when enabling this mode. This is useful for targeted practice —
                for example, drilling 3rd-grade multiplication facts even if the
                student&rsquo;s overall math level is higher.
              </p>
            </div>

            <p className="text-aivo-navy-600 leading-relaxed mt-6">
              To change the difficulty mode:
            </p>
            <ol className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  1
                </span>
                <span>
                  Navigate to <strong>Student Profile</strong> &rarr;{" "}
                  <strong>Tutor Settings</strong>.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  2
                </span>
                <span>
                  Under <strong>Difficulty Mode</strong>, toggle between{" "}
                  <strong>Auto-Adaptive</strong> and{" "}
                  <strong>Fixed</strong>. If you choose Fixed, select the target
                  grade level from the dropdown.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  3
                </span>
                <span>
                  Click <strong>Save</strong>. The change takes effect in the
                  next session. You can set this globally for all tutors or
                  override it per individual tutor using the tutor-specific
                  settings tabs.
                </span>
              </li>
            </ol>

            {/* Hints */}
            <h2
              id="hints"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Enabling or Disabling Hints
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              By default, tutors offer hints when a student gives an incorrect
              answer or pauses for an extended time. Hints appear as a subtle
              &ldquo;Need a hint?&rdquo; button below the tutor&rsquo;s message.
              You can control this behavior:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Hints enabled (default):</strong> The tutor offers
                  progressive hints — first a general nudge, then a more
                  specific clue, and finally a worked first step if the student
                  is still stuck.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Hints disabled:</strong> The tutor acknowledges
                  incorrect answers and re-explains the concept, but does not
                  proactively offer step-by-step hints. This is useful for
                  assessments or when you want students to work through problems
                  more independently.
                </span>
              </li>
            </ul>
            <p className="text-aivo-navy-600 leading-relaxed mt-4">
              To toggle hints, navigate to{" "}
              <strong>Student Profile &rarr; Tutor Settings &rarr;
              Hints</strong> and switch between <strong>On</strong> and{" "}
              <strong>Off</strong>.
            </p>

            {/* Focus Areas */}
            <h2
              id="focus-areas"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Setting Focus Areas
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Focus Areas let you direct a tutor to prioritize specific topics
              or skills during sessions. This is especially powerful when
              combined with IEP goals.
            </p>
            <ol className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  1
                </span>
                <span>
                  Navigate to <strong>Student Profile</strong> &rarr;{" "}
                  <strong>Tutor Settings</strong> &rarr;{" "}
                  <strong>Focus Areas</strong>.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  2
                </span>
                <span>
                  Select the tutor you want to configure (or apply to all
                  tutors). A list of available topics appears, organized by
                  subject and grade level.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  3
                </span>
                <span>
                  Check the topics you want the tutor to prioritize. You can
                  select up to 5 focus areas per tutor. The tutor will weight
                  these topics more heavily when choosing what to cover in a
                  session.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  4
                </span>
                <span>
                  Click <strong>Save Focus Areas</strong>. The tutor will begin
                  incorporating these topics in the very next session.
                </span>
              </li>
            </ol>
            <div className="mt-6 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600">
                <strong>IEP integration:</strong> If you have uploaded an IEP
                document (Pro and Premium plans), the Focus Areas page will
                display your student&rsquo;s IEP goals alongside the standard
                topic list. Check an IEP goal to make it a focus area, and the
                tutor will proactively work toward that goal during sessions.
                Progress against IEP goals is tracked separately in the{" "}
                <strong>IEP Progress</strong> section of the parent dashboard.
              </p>
            </div>

            {/* Parent Notifications */}
            <h2
              id="parent-notifications"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Session Notifications for Parents
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Parents can receive notifications about tutor sessions through
              email and push notifications (if using the AIVO Learning mobile
              app). Here are the notification types you can configure:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Session started:</strong> Receive a notification when
                  your student begins a tutor session, including which tutor
                  they are working with.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Session completed:</strong> Receive a summary
                  notification when a session ends, including the topics
                  covered, XP earned, time spent, and key achievements.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Daily digest:</strong> A single end-of-day email
                  summarizing all sessions your student completed that day,
                  across all tutors.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Weekly progress report:</strong> A detailed weekly
                  email with mastery changes, session counts, XP trends, streak
                  status, and tutor recommendations.
                </span>
              </li>
            </ul>
            <p className="text-aivo-navy-600 leading-relaxed mt-4">
              To configure notifications, navigate to{" "}
              <strong>Account Settings &rarr; Notifications</strong> and toggle
              each notification type on or off. You can set different
              preferences for each student if you have multiple student
              profiles.
            </p>

            {/* Transcripts */}
            <h2
              id="transcripts"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Accessing Session Transcripts and Summaries
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              After every session, AIVO generates two artifacts that are saved
              to your student&rsquo;s profile:
            </p>

            <div className="mt-6 rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-aivo-navy-800">
                Session Summary
              </h3>
              <p className="mt-2 text-sm text-aivo-navy-600 leading-relaxed">
                A concise overview of the session: topics covered, key
                takeaways, practice results (correct/incorrect counts), XP
                earned, badges unlocked, and recommended next steps. The summary
                is displayed as a card at the top of the session history page.
              </p>
            </div>

            <div className="mt-4 rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-aivo-navy-800">
                Full Transcript
              </h3>
              <p className="mt-2 text-sm text-aivo-navy-600 leading-relaxed">
                A complete, scrollable log of the entire conversation between
                the tutor and your student, including all questions, answers,
                hints, explanations, diagrams, and code blocks. Transcripts are
                read-only and cannot be edited.
              </p>
            </div>

            <p className="text-aivo-navy-600 leading-relaxed mt-6">
              To view session history and transcripts:
            </p>
            <ol className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  1
                </span>
                <span>
                  From the parent dashboard, click the student&rsquo;s name to
                  open their profile.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  2
                </span>
                <span>
                  Click the <strong>Session History</strong> tab. Sessions are
                  listed chronologically with the tutor name, subject, date,
                  duration, and a summary snippet.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  3
                </span>
                <span>
                  Click any session to expand the full summary. Click{" "}
                  <strong>View Transcript</strong> to open the complete
                  conversation log.
                </span>
              </li>
            </ol>
            <p className="text-aivo-navy-600 leading-relaxed mt-4">
              You can filter sessions by tutor, date range, or subject using
              the filter bar at the top of the Session History page.
            </p>

            {/* Time Limits */}
            <h2
              id="time-limits"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Parental Controls for Session Time Limits
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Parents can set hard time limits to control how long a student can
              use AI Tutors each day. This is separate from the session length
              preference — session length is a guideline for the tutor, while
              time limits are enforced controls.
            </p>
            <ol className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  1
                </span>
                <span>
                  Navigate to <strong>Student Profile</strong> &rarr;{" "}
                  <strong>Parental Controls</strong>.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  2
                </span>
                <span>
                  Under <strong>Daily Time Limit</strong>, toggle the setting
                  on and select the maximum number of minutes per day. Available
                  options: 30, 60, 90, 120 minutes, or custom.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  3
                </span>
                <span>
                  Optionally, set <strong>Allowed Hours</strong> to restrict
                  when sessions can be started (e.g., 3:00 PM to 8:00 PM on
                  school days). Outside these hours, the student will see a
                  friendly message explaining that tutor sessions are not
                  available right now.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  4
                </span>
                <span>
                  Click <strong>Save</strong>. When the daily time limit is
                  reached during an active session, the tutor will initiate a
                  wrap-up and end the session with a summary. The student will
                  not be able to start new sessions until the next day.
                </span>
              </li>
            </ol>
            <div className="mt-6 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600">
                <strong>Note:</strong> Time limits apply across all tutors
                combined. If a student spends 45 minutes with Nova and the
                daily limit is 60 minutes, they have 15 minutes remaining with
                any tutor. A countdown timer appears in the student dashboard
                when less than 15 minutes remain.
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
              href="/help/ai-tutors/reporting-tutor-issues"
              className="rounded-xl border border-aivo-navy-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-aivo-navy-800">
                Reporting Tutor Issues
              </h3>
              <p className="mt-1 text-sm text-aivo-navy-500">
                Flag content issues or technical glitches and track resolution.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

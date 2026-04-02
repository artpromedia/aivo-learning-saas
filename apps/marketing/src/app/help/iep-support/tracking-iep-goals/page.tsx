import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tracking IEP Goals | Help | AIVO",
  description:
    "Learn how to use AIVO Learning's IEP Goals dashboard to monitor progress, set milestones, receive alerts, and understand the color-coded status system.",
  openGraph: {
    title: "Tracking IEP Goals | AIVO Help",
    description:
      "Monitor your student's IEP goal progress with visual dashboards, alerts, and automatic tutor prioritization.",
  },
};

export default function TrackingIepGoalsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-medium text-aivo-purple-600 uppercase tracking-wider">
            IEP Support
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl">
            Tracking IEP Goals
          </h1>
          <p className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto">
            Monitor your student&rsquo;s progress toward every IEP goal with
            visual dashboards, milestone alerts, and automatic tutor
            prioritization for goals that need extra attention.
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
                  href="#goals-dashboard"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  The IEP Goals Dashboard
                </a>
              </li>
              <li>
                <a
                  href="#how-progress-measured"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  How Progress Is Measured
                </a>
              </li>
              <li>
                <a
                  href="#target-dates"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Setting Target Dates and Milestones
                </a>
              </li>
              <li>
                <a
                  href="#progress-alerts"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Progress Alerts
                </a>
              </li>
              <li>
                <a
                  href="#color-coded-status"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Understanding the Color-Coded Status System
                </a>
              </li>
              <li>
                <a
                  href="#auto-prioritization"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Automatic Tutor Prioritization
                </a>
              </li>
            </ul>
          </nav>

          <div className="prose prose-aivo max-w-none">
            {/* Goals Dashboard */}
            <h2
              id="goals-dashboard"
              className="text-2xl font-bold text-aivo-navy-800 mt-0 scroll-mt-24"
            >
              The IEP Goals Dashboard
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              The IEP Goals dashboard is the central hub for tracking your
              student&rsquo;s progress toward their Individualized Education
              Program goals. You can access it from{" "}
              <strong>Student Profile &rarr; IEP &rarr; Goals</strong>.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              Each goal is displayed as a card that includes:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Goal text:</strong> The full goal as extracted from
                  the IEP document (or manually entered).
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Subject area:</strong> The academic domain (Math, ELA,
                  Science, etc.) associated with the goal.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Visual progress bar:</strong> A horizontal bar
                  showing the current mastery percentage, color-coded by
                  status.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Target date:</strong> The date by which the goal
                  should be met, typically aligned with the IEP annual review.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Status badge:</strong> A color-coded indicator
                  showing whether the goal is on track, needs attention, or is
                  behind pace.
                </span>
              </li>
            </ul>

            {/* How Progress Is Measured */}
            <h2
              id="how-progress-measured"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              How Progress Is Measured
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Progress toward each IEP goal is measured as a{" "}
              <strong>mastery percentage</strong>, calculated from your
              student&rsquo;s performance on goal-aligned activities during AI
              Tutor sessions.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed mt-4">
              Here&rsquo;s how it works:
            </p>
            <ol className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  1
                </span>
                <span>
                  When a student works with an AI Tutor, AIVO maps each
                  question, exercise, and discussion topic to the relevant IEP
                  goal(s).
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  2
                </span>
                <span>
                  The student&rsquo;s accuracy, consistency, and independence
                  on those activities are tracked over time.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  3
                </span>
                <span>
                  The mastery percentage is calculated using a rolling average
                  that weighs recent performance more heavily, so it reflects
                  the student&rsquo;s current skill level rather than
                  historical data alone.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  4
                </span>
                <span>
                  A goal is considered <strong>mastered</strong> when the
                  student consistently achieves 80% or higher accuracy over at
                  least 10 goal-aligned activities across 3 or more sessions.
                </span>
              </li>
            </ol>
            <div className="mt-6 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600">
                <strong>Note:</strong> The 80% mastery threshold is the default
                and aligns with common IEP mastery criteria. If your
                student&rsquo;s IEP specifies a different mastery threshold
                (e.g., 90% accuracy over 3 consecutive sessions), you can
                customize this in the goal settings.
              </p>
            </div>

            {/* Target Dates and Milestones */}
            <h2
              id="target-dates"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Setting Target Dates and Milestones
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Each IEP goal has a target date — typically the date of the next
              annual IEP review. AIVO uses this date to calculate whether the
              student is on pace to meet the goal.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed mt-4">
              You can also set <strong>milestones</strong> — intermediate
              checkpoints along the way:
            </p>
            <ol className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  1
                </span>
                <span>
                  Navigate to <strong>Student Profile &rarr; IEP &rarr;
                  Goals</strong> and click a goal card to expand it.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  2
                </span>
                <span>
                  Click <strong>Edit Target Date</strong> to set or change the
                  goal&rsquo;s target completion date.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  3
                </span>
                <span>
                  Click <strong>+ Add Milestone</strong> to create intermediate
                  checkpoints. For example, if the annual goal is
                  &ldquo;multiply two-digit numbers with 80% accuracy,&rdquo;
                  you might set milestones at 40%, 60%, and 80%.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  4
                </span>
                <span>
                  Assign a target date to each milestone. AIVO will send you
                  an alert when the student reaches — or falls behind — each
                  milestone.
                </span>
              </li>
            </ol>

            {/* Progress Alerts */}
            <h2
              id="progress-alerts"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Progress Alerts
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO sends proactive alerts so you never miss an important change
              in your student&rsquo;s IEP progress. Alerts are delivered via
              email and push notification (if enabled in the AIVO mobile app).
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Milestone reached:</strong> Your student hit a
                  milestone you set — for example, reaching 60% mastery on a
                  math goal.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Goal mastered:</strong> Your student has met the
                  mastery criteria for a goal. The goal is marked complete on
                  the dashboard.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Falling behind pace:</strong> Based on the target date
                  and current progress trajectory, AIVO projects the student
                  may not meet the goal on time.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>No recent activity:</strong> The student hasn&rsquo;t
                  worked on goal-aligned content in 7 or more days.
                </span>
              </li>
            </ul>
            <p className="text-aivo-navy-600 leading-relaxed mt-4">
              To configure which alerts you receive, navigate to{" "}
              <strong>Account Settings &rarr; Notifications &rarr; IEP
              Alerts</strong>.
            </p>

            {/* Color-Coded Status */}
            <h2
              id="color-coded-status"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Understanding the Color-Coded Status System
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Each IEP goal on the dashboard displays a color-coded status
              badge and progress bar so you can see at a glance how your
              student is performing:
            </p>
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500 text-white text-sm font-bold">
                    ✓
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-green-800">
                      Green — On Track
                    </h3>
                    <p className="mt-1 text-sm text-green-700">
                      The student&rsquo;s progress is on pace or ahead of
                      schedule to meet the goal by the target date. No action
                      needed.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-500 text-white text-sm font-bold">
                    !
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-yellow-800">
                      Yellow — Needs Attention
                    </h3>
                    <p className="mt-1 text-sm text-yellow-700">
                      Progress has slowed or the student is slightly behind the
                      expected pace. This is often a temporary plateau — the AI
                      Tutor will automatically increase focus on this goal area.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500 text-white text-sm font-bold">
                    ✕
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-red-800">
                      Red — Behind Pace
                    </h3>
                    <p className="mt-1 text-sm text-red-700">
                      The student is significantly behind the projected timeline
                      for this goal. AIVO recommends increasing session
                      frequency or adjusting the goal&rsquo;s target date. The
                      AI Tutor will strongly prioritize this goal area.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Auto Prioritization */}
            <h2
              id="auto-prioritization"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Automatic Tutor Prioritization
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              When an IEP goal falls behind pace, AIVO&rsquo;s AI Tutors
              automatically adjust their session plans to prioritize that
              goal&rsquo;s content. Here&rsquo;s how it works:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Yellow goals:</strong> The relevant tutor allocates
                  approximately 40% of session time to content aligned with the
                  struggling goal, up from the default balanced distribution.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Red goals:</strong> The tutor allocates approximately
                  60% of session time to the behind-pace goal and may suggest
                  additional sessions focused exclusively on that topic.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Cross-tutor coordination:</strong> If a goal spans
                  multiple subjects (e.g., a reading comprehension goal that
                  touches ELA and Science), both Sage and Spark will
                  incorporate the goal into their sessions.
                </span>
              </li>
            </ul>
            <div className="mt-6 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600">
                <strong>Override:</strong> If you prefer manual control over
                tutor focus, you can disable automatic prioritization from{" "}
                <strong>Student Profile &rarr; Tutor Settings &rarr; IEP Auto-
                Prioritization</strong> and set focus areas manually instead.
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

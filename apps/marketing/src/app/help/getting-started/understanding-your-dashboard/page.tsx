import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Understanding Your Dashboard | Help | AIVO",
  description:
    "Navigate the AIVO Learning parent and student dashboards. Learn about student cards, progress metrics, activity feeds, XP, streaks, and more.",
  openGraph: {
    title: "Understanding Your Dashboard | AIVO Help",
    description:
      "A complete guide to the parent and student dashboards in AIVO Learning.",
  },
};

export default function UnderstandingYourDashboardPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-medium text-aivo-purple-600 uppercase tracking-wider">
            Getting Started
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl">
            Understanding Your Dashboard
          </h1>
          <p className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto">
            Your dashboard is command central for tracking progress,
            launching learning sessions, and managing student profiles.
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
                  href="#parent-dashboard"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  The Parent Dashboard
                </a>
              </li>
              <li>
                <a
                  href="#student-cards"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Student Profile Cards
                </a>
              </li>
              <li>
                <a
                  href="#student-dashboard"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  The Student Dashboard
                </a>
              </li>
              <li>
                <a
                  href="#ai-tutors"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  AI Tutors &amp; Lessons
                </a>
              </li>
              <li>
                <a
                  href="#gamification"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  XP, Streaks, Badges &amp; Leaderboards
                </a>
              </li>
              <li>
                <a
                  href="#key-metrics"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Key Metrics to Watch
                </a>
              </li>
              <li>
                <a
                  href="#switching-students"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Switching Between Students
                </a>
              </li>
            </ul>
          </nav>

          <div className="prose prose-aivo max-w-none">
            {/* Parent Dashboard */}
            <h2
              id="parent-dashboard"
              className="text-2xl font-bold text-aivo-navy-800 mt-0 scroll-mt-24"
            >
              The Parent Dashboard
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              When you log in to <strong>app.aivolearning.com</strong>, you
              land on the Parent Dashboard. This is your high-level overview of
              every student profile linked to your account. The dashboard is
              organized into several key areas:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Student card row</strong> &mdash; a horizontally
                  scrollable row showing a card for each student profile. If
                  your plan supports additional students, an{" "}
                  <strong>+ Add Student</strong> card appears at the end.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Activity feed</strong> &mdash; a chronological list of
                  recent learning activity across all students, including
                  completed lessons, badges earned, and streaks maintained.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Sidebar navigation</strong> &mdash; quick links to
                  Account Settings, Subscription &amp; Billing, Help Center,
                  and the Homework Helper (Pro and Premium only).
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Quick Start checklist</strong> (new accounts only)
                  &mdash; a step-by-step guide that tracks your onboarding
                  progress. It disappears once all steps are complete.
                </span>
              </li>
            </ul>

            {/* Student Cards */}
            <h2
              id="student-cards"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Student Profile Cards
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Each student profile card displays a snapshot of that student&apos;s
              learning journey:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Student name and avatar</strong> &mdash; the name or
                  alias you chose during setup and the student&apos;s
                  customizable avatar
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Grade level</strong> displayed as a subtitle
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Subject pills</strong> &mdash; colored tags for each
                  active subject (Math, ELA, Science, History, Coding)
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Overall mastery percentage</strong> &mdash; a combined
                  score across all active subjects
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Current streak</strong> &mdash; the number of
                  consecutive days the student has completed at least one
                  session
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Start Session / Resume</strong> button to launch or
                  continue the student&apos;s learning session
                </span>
              </li>
            </ul>
            <p className="text-aivo-navy-600 leading-relaxed mt-4">
              Clicking a student card opens the detailed student view where you
              can browse per-subject progress, review the Brain Clone profile,
              manage IEP goals, and access historical session logs.
            </p>

            {/* Student Dashboard */}
            <h2
              id="student-dashboard"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              The Student Dashboard
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              When a student logs in (or when you launch a session from the
              parent dashboard), they see the Student Dashboard. This is a
              child-friendly interface designed to make learning engaging and
              easy to navigate:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Welcome greeting</strong> with the student&apos;s
                  name and avatar
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Subject tiles</strong> showing each active subject
                  with its AI Tutor character (Nova, Sage, Spark, Chrono, or
                  Pixel) and a progress ring
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Today&apos;s lessons</strong> &mdash; personalized
                  recommendations generated by the Brain Clone AI engine
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Homework Helper</strong> (Pro and Premium) &mdash; a
                  camera button that lets students snap a photo of a homework
                  problem for step-by-step guided explanations
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Gamification bar</strong> at the top showing current
                  XP, streak flame, and recently earned badges
                </span>
              </li>
            </ul>

            {/* AI Tutors */}
            <h2
              id="ai-tutors"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              AI Tutors &amp; Lessons
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Clicking a subject tile on the student dashboard launches a
              one-on-one session with that subject&apos;s AI Tutor. Each
              tutor is a distinct character with its own personality and
              teaching style:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Nova</strong> (Math) &mdash; patient and methodical,
                  uses diagrams and step-by-step breakdowns
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Sage</strong> (ELA) &mdash; encouraging and creative,
                  uses storytelling and contextual examples
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Spark</strong> (Science) &mdash; curious and
                  energetic, uses experiments and real-world connections
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Chrono</strong> (History) &mdash; wise and narrative,
                  brings historical events to life through vivid scenarios
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Pixel</strong> (Coding) &mdash; playful and logical,
                  uses block programming for younger students and
                  Python/JavaScript for older students
                </span>
              </li>
            </ul>
            <p className="text-aivo-navy-600 leading-relaxed mt-4">
              Each session includes lessons, practice problems, and real-time
              feedback. The Brain Clone AI engine selects the right content
              based on the student&apos;s current mastery levels and learning
              pace.
            </p>

            {/* Gamification */}
            <h2
              id="gamification"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              XP, Streaks, Badges &amp; Leaderboards
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO Learning uses gamification to keep students motivated:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>XP (Experience Points)</strong> &mdash; earned for
                  completing lessons, answering questions correctly, and
                  finishing practice sets. XP accumulates toward level-ups
                  that unlock new avatar items and celebratory animations.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Streaks</strong> &mdash; a daily counter that tracks
                  consecutive days with at least one completed learning session.
                  Maintaining a streak provides bonus XP multipliers.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Badges</strong> &mdash; achievement medals awarded for
                  milestones like completing a subject unit, reaching a mastery
                  percentage, or maintaining a week-long streak. Badges appear
                  on the student&apos;s profile and can be shared with parents.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Leaderboards</strong> &mdash; optional, anonymized
                  rankings that let students see how they compare with peers at
                  the same grade level. Parents can disable leaderboards from
                  the student privacy settings.
                </span>
              </li>
            </ul>

            {/* Key Metrics */}
            <h2
              id="key-metrics"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Key Metrics to Watch
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              The parent dashboard surfaces the most important data points
              about your child&apos;s learning progress:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Mastery percentage</strong> &mdash; the proportion of
                  assessed skills where your child demonstrates proficiency.
                  This is shown per-subject and as an overall average.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Total sessions</strong> &mdash; the number of learning
                  sessions your child has completed this week and all time.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Current streak length</strong> &mdash; shown as a
                  flame icon with the number of consecutive active days.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>IEP goal progress</strong> (Pro and Premium only)
                  &mdash; progress bars for each uploaded IEP goal, showing how
                  close your child is to meeting each target.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Weekly summary email</strong> &mdash; AIVO sends a
                  digest email every Sunday with highlights from the past week,
                  including time spent, skills improved, and badges earned.
                </span>
              </li>
            </ul>

            {/* Switching Students */}
            <h2
              id="switching-students"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Switching Between Students
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              If you have multiple student profiles (available on the Pro plan
              with up to four students), you can switch between them from the
              parent dashboard by clicking a different student card. Each
              student&apos;s data, Brain Clone profile, and progress history
              are completely independent.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              On mobile devices, swipe horizontally through the student card
              row to find the student you want. On desktop, all cards are
              visible in a single row.
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
              href="/help/getting-started/creating-your-account"
              className="rounded-xl border border-aivo-navy-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-aivo-navy-800">
                Creating Your Account
              </h3>
              <p className="mt-1 text-sm text-aivo-navy-500">
                Set up your parent account and verify your email.
              </p>
            </Link>
            <Link
              href="/help/getting-started/setting-up-your-first-student"
              className="rounded-xl border border-aivo-navy-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-aivo-navy-800">
                Setting Up Your First Student
              </h3>
              <p className="mt-1 text-sm text-aivo-navy-500">
                Add a student profile and choose subjects.
              </p>
            </Link>
            <Link
              href="/help/getting-started/taking-the-learning-assessment"
              className="rounded-xl border border-aivo-navy-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-aivo-navy-800">
                Taking the Learning Assessment
              </h3>
              <p className="mt-1 text-sm text-aivo-navy-500">
                Discover how the Brain Clone AI assessment works.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Switching Between Tutors | Help | AIVO",
  description:
    "Learn how to switch between AIVO Learning's 5 AI Tutors, understand how progress carries over, and discover recommended multi-tutor workflows.",
  openGraph: {
    title: "Switching Between Tutors | AIVO Help",
    description:
      "Switch tutors seamlessly while preserving all progress via the Brain Clone.",
  },
};

export default function SwitchingBetweenTutorsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-medium text-aivo-purple-600 uppercase tracking-wider">
            AI Tutors
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl">
            Switching Between Tutors
          </h1>
          <p className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto">
            Move between subjects and tutors seamlessly. Your student&rsquo;s
            Brain Clone ensures nothing is lost when they switch.
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
                  href="#mid-session-vs-new"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Mid-Session Switch vs. New Session
                </a>
              </li>
              <li>
                <a
                  href="#tutor-selector"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  The Tutor Selector Interface
                </a>
              </li>
              <li>
                <a
                  href="#progress-carries-over"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Does Progress Carry Over?
                </a>
              </li>
              <li>
                <a
                  href="#recommended-workflows"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Recommended Multi-Tutor Workflows
                </a>
              </li>
              <li>
                <a
                  href="#session-limits"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Session Limits with Multiple Tutors
                </a>
              </li>
            </ul>
          </nav>

          <div className="prose prose-aivo max-w-none">
            {/* Mid-Session vs New */}
            <h2
              id="mid-session-vs-new"
              className="text-2xl font-bold text-aivo-navy-800 mt-0 scroll-mt-24"
            >
              Mid-Session Switch vs. New Session
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              There are two ways to change tutors, and each works a little
              differently:
            </p>

            <h3 className="text-lg font-bold text-aivo-navy-800 mt-8">
              Switching Mid-Session
            </h3>
            <p className="text-aivo-navy-600 leading-relaxed">
              While in an active session with any tutor, your student can switch
              to a different tutor without leaving the session screen. The
              current session is paused (not ended), and a new session begins
              with the selected tutor. Here is how it works:
            </p>
            <ol className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  1
                </span>
                <span>
                  During an active session, tap the <strong>tutor
                  avatar</strong> in the top-left corner of the chat screen.
                  This opens the Tutor Selector panel.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  2
                </span>
                <span>
                  Select the tutor you want to switch to. A confirmation dialog
                  appears: &ldquo;Switch to [Tutor Name]? Your current session
                  with [Current Tutor] will be saved.&rdquo;
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  3
                </span>
                <span>
                  Tap <strong>Switch</strong>. The paused session is saved to
                  the session history (with a transcript and summary), and the
                  new tutor greets your student immediately.
                </span>
              </li>
            </ol>
            <div className="mt-6 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600">
                <strong>Note:</strong> A mid-session switch counts as ending
                one session and starting another. On the Free plan, this uses
                two of your daily session allowance. See the{" "}
                <a href="#session-limits" className="font-semibold text-aivo-purple-600 hover:text-aivo-purple-700">
                  Session Limits
                </a>{" "}
                section below for details.
              </p>
            </div>

            <h3 className="text-lg font-bold text-aivo-navy-800 mt-8">
              Starting a New Session with a Different Tutor
            </h3>
            <p className="text-aivo-navy-600 leading-relaxed">
              If your student is not currently in a session, they can choose any
              tutor from the student dashboard:
            </p>
            <ol className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  1
                </span>
                <span>
                  From the student dashboard, locate the{" "}
                  <strong>Start a Session</strong> section. All five tutors are
                  displayed as cards with their avatar, name, and subject.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  2
                </span>
                <span>
                  Tap the tutor card to begin a new session. The tutor
                  greets the student, references their Brain Clone profile, and
                  the session begins.
                </span>
              </li>
            </ol>

            {/* Tutor Selector */}
            <h2
              id="tutor-selector"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              The Tutor Selector Interface
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              The Tutor Selector is a slide-out panel that displays all five
              tutors. You can access it in two places:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Student dashboard:</strong> The &ldquo;Start a
                  Session&rdquo; section shows all five tutor cards in a
                  horizontal row.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>In-session:</strong> Tap the current tutor&rsquo;s
                  avatar in the top-left corner to open the Tutor Selector
                  panel.
                </span>
              </li>
            </ul>
            <p className="text-aivo-navy-600 leading-relaxed mt-4">
              Each tutor in the selector shows:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Avatar icon</strong> — a unique character illustration
                  that represents the tutor&rsquo;s personality.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Name and subject label</strong> — e.g., &ldquo;Nova
                  &middot; Math&rdquo; or &ldquo;Sage &middot; ELA&rdquo;.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Session count badge</strong> — shows how many sessions
                  the student has completed with that tutor (e.g., &ldquo;12
                  sessions&rdquo;).
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Last topic</strong> — the most recent topic covered
                  with that tutor (e.g., &ldquo;Last: Equivalent
                  Fractions&rdquo;).
                </span>
              </li>
            </ul>

            {/* Progress Carries Over */}
            <h2
              id="progress-carries-over"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Does Progress Carry Over?
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              <strong>Yes — completely.</strong> All five AI Tutors share the
              same Brain Clone profile. When your student works with one tutor,
              the Brain Clone is updated with everything that happened in the
              session. When they switch to a different tutor, that tutor reads
              the same updated profile.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              This means:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  A student never has to repeat content they have already
                  mastered, even with a different tutor.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  If Spark (Science) teaches about measurement and unit
                  conversion, Nova (Math) will know the student has already been
                  introduced to those concepts and can build on them.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  Gamification progress (XP, streaks, badges) is tracked at the
                  student level, not per tutor. XP earned with any tutor
                  contributes to the same total.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  Session transcripts from every tutor are available in a single
                  unified view in the parent dashboard under{" "}
                  <strong>Session History</strong>.
                </span>
              </li>
            </ul>

            {/* Recommended Workflows */}
            <h2
              id="recommended-workflows"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Recommended Multi-Tutor Workflows
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Using multiple tutors in combination can reinforce learning across
              subjects. Here are some workflows families have found effective:
            </p>

            <div className="mt-6 rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-aivo-navy-800">
                Math + Coding
              </h3>
              <p className="mt-2 text-sm text-aivo-navy-600 leading-relaxed">
                Work through a math concept with <strong>Nova</strong> (e.g.,
                coordinate pairs), then switch to <strong>Pixel</strong> to
                build a mini-project that applies it (e.g., plotting points on a
                canvas). This bridges abstract math into tangible creation.
              </p>
            </div>

            <div className="mt-4 rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-aivo-navy-800">
                Science + ELA
              </h3>
              <p className="mt-2 text-sm text-aivo-navy-600 leading-relaxed">
                Run a science investigation with <strong>Spark</strong> (e.g.,
                the water cycle), then switch to <strong>Sage</strong> to write
                a short explanatory paragraph about the findings. This builds
                cross-curricular writing skills grounded in scientific content.
              </p>
            </div>

            <div className="mt-4 rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-aivo-navy-800">
                History + ELA
              </h3>
              <p className="mt-2 text-sm text-aivo-navy-600 leading-relaxed">
                Explore a historical event with <strong>Chrono</strong> using
                primary source documents, then switch to <strong>Sage</strong>{" "}
                to practice persuasive writing by arguing a historical
                perspective. This combines research skills with structured
                argumentation.
              </p>
            </div>

            <div className="mt-4 rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-aivo-navy-800">
                Science + Coding
              </h3>
              <p className="mt-2 text-sm text-aivo-navy-600 leading-relaxed">
                Learn about data collection and variables with{" "}
                <strong>Spark</strong>, then switch to <strong>Pixel</strong> to
                build a simple data tracker or visualization program. This
                introduces data science concepts in an accessible, project-based
                way.
              </p>
            </div>

            {/* Session Limits */}
            <h2
              id="session-limits"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Session Limits with Multiple Tutors
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Session limits are counted per student, not per tutor. Here is how
              it breaks down by plan:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Free plan:</strong> 2 sessions per day, total, across
                  all tutors. For example, a student could do 1 session with
                  Nova and 1 with Sage, or 2 sessions with the same tutor.
                  Mid-session switches count as ending + starting a session.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Pro plan:</strong> Unlimited sessions per day with all
                  five tutors. Switch as often as you want.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Premium plan:</strong> Unlimited sessions per day with
                  all five tutors, plus priority processing for faster
                  responses.
                </span>
              </li>
            </ul>
            <p className="text-aivo-navy-600 leading-relaxed mt-4">
              Session limits reset at midnight in your account&rsquo;s
              configured time zone. Your student can see their remaining
              sessions for the day in the top bar of the student dashboard.
            </p>
            <div className="mt-6 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600">
                <strong>Tip:</strong> If your student frequently uses 3 or
                more tutors per day, the Pro plan ($39.99/month or $24.99/month
                billed annually) provides the best experience with unlimited
                sessions and no daily cap. See{" "}
                <Link
                  href="/help/account-billing/managing-your-subscription"
                  className="font-semibold text-aivo-purple-600 hover:text-aivo-purple-700"
                >
                  Managing Your Subscription
                </Link>{" "}
                for details.
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
              href="/help/ai-tutors/tutor-session-settings"
              className="rounded-xl border border-aivo-navy-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-aivo-navy-800">
                Tutor Session Settings
              </h3>
              <p className="mt-1 text-sm text-aivo-navy-500">
                Adjust difficulty, session length, hints, and parental controls.
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

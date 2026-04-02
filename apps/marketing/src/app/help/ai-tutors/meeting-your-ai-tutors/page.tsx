import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Meeting Your AI Tutors | Help | AIVO",
  description:
    "Get to know AIVO Learning's 5 AI Tutors — Nova, Sage, Spark, Chrono, and Pixel. Learn how each tutor personalizes sessions using your student's Brain Clone AI profile.",
  openGraph: {
    title: "Meeting Your AI Tutors | AIVO Help",
    description:
      "Discover the 5 AI Tutors, their teaching styles, and how they personalize every session.",
  },
};

export default function MeetingYourAiTutorsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-medium text-aivo-purple-600 uppercase tracking-wider">
            AI Tutors
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl">
            Meeting Your AI Tutors
          </h1>
          <p className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto">
            AIVO Learning has five AI Tutors, each with a unique personality and
            teaching specialty. Every session is personalized by your
            student&rsquo;s Brain Clone AI profile.
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
                  href="#the-five-tutors"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  The Five Tutors
                </a>
              </li>
              <li>
                <a
                  href="#how-tutors-personalize"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  How Tutors Use the Brain Clone Profile
                </a>
              </li>
              <li>
                <a
                  href="#typical-session"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  What a Typical Session Looks Like
                </a>
              </li>
              <li>
                <a
                  href="#real-time-difficulty"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  How Tutors Adjust Difficulty in Real Time
                </a>
              </li>
              <li>
                <a
                  href="#progress-across-sessions"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Remembering Progress Across Sessions
                </a>
              </li>
            </ul>
          </nav>

          <div className="prose prose-aivo max-w-none">
            {/* The Five Tutors */}
            <h2
              id="the-five-tutors"
              className="text-2xl font-bold text-aivo-navy-800 mt-0 scroll-mt-24"
            >
              The Five Tutors
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Each AI Tutor is designed around a specific subject area and has a
              distinct personality, visual design, and teaching approach. Here is
              who your student will be learning with:
            </p>

            {/* Nova */}
            <div className="mt-8 rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-aivo-navy-800">
                Nova &mdash; Math Tutor
              </h3>
              <p className="mt-2 text-sm text-aivo-navy-600 leading-relaxed">
                Nova is analytical, encouraging, and loves puzzles. She breaks
                every problem into clear, manageable steps so students build
                confidence as they solve. Nova uses step-by-step problem
                decomposition, visual number lines, interactive graphs, and
                worked examples. Whether your student is working on basic
                addition or pre-algebra, Nova meets them exactly where they are
                and guides them forward one concept at a time.
              </p>
              <ul className="mt-3 space-y-1.5">
                <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                  <span><strong>Subject:</strong> Mathematics (arithmetic, fractions, geometry, pre-algebra, word problems)</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                  <span><strong>Personality:</strong> Analytical, patient, encouraging</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                  <span><strong>Teaching style:</strong> Step-by-step decomposition with visual aids</span>
                </li>
              </ul>
            </div>

            {/* Sage */}
            <div className="mt-6 rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-aivo-navy-800">
                Sage &mdash; English Language Arts Tutor
              </h3>
              <p className="mt-2 text-sm text-aivo-navy-600 leading-relaxed">
                Sage is warm, storytelling-oriented, and deeply enthusiastic
                about the written word. She teaches reading comprehension,
                writing, grammar, and vocabulary through narrative. Sage
                introduces new concepts by weaving them into stories, then
                guides students through close-reading exercises, creative
                writing prompts, and grammar drills that feel like games rather
                than chores.
              </p>
              <ul className="mt-3 space-y-1.5">
                <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                  <span><strong>Subject:</strong> Reading comprehension, writing, grammar, vocabulary</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                  <span><strong>Personality:</strong> Warm, imaginative, encouraging</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                  <span><strong>Teaching style:</strong> Narrative-driven lessons with creative exercises</span>
                </li>
              </ul>
            </div>

            {/* Spark */}
            <div className="mt-6 rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-aivo-navy-800">
                Spark &mdash; Science Tutor
              </h3>
              <p className="mt-2 text-sm text-aivo-navy-600 leading-relaxed">
                Spark is endlessly curious and experiment-driven. He teaches
                through hypothesis-question loops and visual models, encouraging
                students to ask &ldquo;what if?&rdquo; at every turn. Spark
                presents scientific concepts as mini-investigations: students
                form predictions, explore evidence through interactive diagrams
                and simulations, and draw conclusions. From life science to
                earth science to basic physics, Spark makes the scientific
                method feel like an adventure.
              </p>
              <ul className="mt-3 space-y-1.5">
                <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                  <span><strong>Subject:</strong> Life science, earth science, physical science, scientific method</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                  <span><strong>Personality:</strong> Curious, enthusiastic, experiment-driven</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                  <span><strong>Teaching style:</strong> Hypothesis-question loops with visual models</span>
                </li>
              </ul>
            </div>

            {/* Chrono */}
            <div className="mt-6 rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-aivo-navy-800">
                Chrono &mdash; History Tutor
              </h3>
              <p className="mt-2 text-sm text-aivo-navy-600 leading-relaxed">
                Chrono is an engaging storyteller who brings the past to life.
                He uses interactive timelines, primary source analysis, and
                cause-and-effect mapping to help students understand historical
                events in context. Chrono is especially skilled at drawing
                connections between past events and the present day, making
                history feel relevant and alive. Students explore eras through
                guided discussions, document analysis, and &ldquo;what would you
                have done?&rdquo; thought experiments.
              </p>
              <ul className="mt-3 space-y-1.5">
                <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                  <span><strong>Subject:</strong> World history, U.S. history, civics, geography</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                  <span><strong>Personality:</strong> Engaging, narrative-focused, thought-provoking</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                  <span><strong>Teaching style:</strong> Timelines, primary sources, and past-to-present connections</span>
                </li>
              </ul>
            </div>

            {/* Pixel */}
            <div className="mt-6 rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-aivo-navy-800">
                Pixel &mdash; Coding Tutor
              </h3>
              <p className="mt-2 text-sm text-aivo-navy-600 leading-relaxed">
                Pixel is creative and project-based. She teaches computational
                thinking by guiding students through building real mini-projects
                — from simple animations to interactive stories to basic games.
                Pixel introduces concepts like variables, loops, conditionals,
                and functions through hands-on building rather than abstract
                definitions. Code blocks are presented inline in the chat, and
                students can edit and run code directly within the session.
              </p>
              <ul className="mt-3 space-y-1.5">
                <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                  <span><strong>Subject:</strong> Block coding, Python basics, web basics, computational thinking</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                  <span><strong>Personality:</strong> Creative, playful, project-oriented</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                  <span><strong>Teaching style:</strong> Project-based learning with inline code and real builds</span>
                </li>
              </ul>
            </div>

            {/* How Tutors Personalize */}
            <h2
              id="how-tutors-personalize"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              How Tutors Use the Brain Clone Profile
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Every AI Tutor reads your student&rsquo;s Brain Clone AI profile
              at the start of each session. The Brain Clone is a living model of
              your student&rsquo;s learning — it captures strengths, areas for
              growth, preferred learning pace, topic mastery levels, and any IEP
              goals you have configured.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              This means each tutor session is personalized from the very first
              message. Here is what the Brain Clone tells each tutor:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Current mastery level</strong> for each topic within
                  the tutor&rsquo;s subject area, so the tutor knows exactly
                  where to start.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Recent session history</strong> — what was covered
                  last time, where the student left off, and any topics that
                  need reinforcement.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Learning pace preferences</strong> — whether the
                  student responds better to quick challenges or slower, more
                  detailed explanations.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>IEP goals</strong> (if configured) — specific
                  objectives from your student&rsquo;s Individualized Education
                  Program that the tutor will prioritize during sessions.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Gamification context</strong> — current XP, active
                  streaks, and badges the student is close to earning, so tutors
                  can incorporate motivational cues naturally.
                </span>
              </li>
            </ul>

            {/* Typical Session */}
            <h2
              id="typical-session"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              What a Typical Session Looks Like
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Every tutor session follows a consistent five-phase structure,
              though the content and style vary by tutor personality:
            </p>
            <ol className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  1
                </span>
                <span>
                  <strong>Greeting.</strong> The tutor welcomes your student by
                  name, acknowledges their recent progress (e.g., &ldquo;Great
                  job finishing that fractions unit yesterday!&rdquo;), and sets
                  a positive tone for the session.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  2
                </span>
                <span>
                  <strong>Topic selection.</strong> The tutor suggests a topic
                  based on the Brain Clone profile (e.g., the next concept in a
                  learning path, an area that needs review, or an IEP goal).
                  The student can also request a specific topic by typing or
                  selecting from suggested options.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  3
                </span>
                <span>
                  <strong>Guided learning.</strong> The tutor presents the
                  concept using its specialized teaching style — Nova walks
                  through steps, Sage tells a story, Spark runs an experiment,
                  Chrono builds a timeline, Pixel starts a project. Rich media
                  like diagrams, interactive exercises, and code blocks appear
                  inline in the chat.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  4
                </span>
                <span>
                  <strong>Practice.</strong> The tutor presents practice
                  problems or exercises tailored to the difficulty level. If the
                  student struggles, the tutor offers hints and alternate
                  explanations. If the student excels, the tutor increases
                  complexity.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  5
                </span>
                <span>
                  <strong>Wrap-up summary.</strong> The tutor reviews what was
                  covered, celebrates achievements (XP earned, badges unlocked),
                  and previews what the next session could focus on. A session
                  summary is saved to the Brain Clone profile and a transcript
                  is available in the parent dashboard.
                </span>
              </li>
            </ol>

            {/* Real-Time Difficulty */}
            <h2
              id="real-time-difficulty"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              How Tutors Adjust Difficulty in Real Time
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              By default, all tutors run in <strong>auto-adaptive
              mode</strong>. This means the tutor continuously adjusts the
              difficulty of questions and explanations based on how the student
              is responding in the current session:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  If the student answers several questions correctly in a row,
                  the tutor increases the complexity of the next question or
                  introduces a more advanced concept.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  If the student struggles or gives an incorrect answer, the
                  tutor steps back, re-explains the concept in a different way,
                  offers a hint, or breaks the problem into smaller parts.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  The tutor watches for frustration signals (repeated incorrect
                  answers, short responses) and adjusts its tone to be more
                  supportive and less challenging.
                </span>
              </li>
            </ul>
            <div className="mt-6 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600">
                <strong>Tip:</strong> Parents can switch tutors to a fixed
                difficulty level instead of auto-adaptive mode. This is useful
                for targeted practice at a specific grade level. See our{" "}
                <Link
                  href="/help/ai-tutors/tutor-session-settings"
                  className="font-semibold text-aivo-purple-600 hover:text-aivo-purple-700"
                >
                  Tutor Session Settings
                </Link>{" "}
                article for instructions.
              </p>
            </div>

            {/* Progress Across Sessions */}
            <h2
              id="progress-across-sessions"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Remembering Progress Across Sessions
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              The Brain Clone profile is continuously updated at the end of
              every session. This means your student never has to start over.
              When they begin a new session — whether with the same tutor or a
              different one — the tutor already knows:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  Every topic the student has studied, across all subjects and
                  all tutors.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  The mastery level for each topic (from &ldquo;just
                  introduced&rdquo; to &ldquo;mastered&rdquo;).
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  Topics that were difficult and may need spaced repetition or a
                  different teaching approach.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  The student&rsquo;s overall learning trajectory, helping the
                  tutor choose the optimal next step.
                </span>
              </li>
            </ul>
            <p className="text-aivo-navy-600 leading-relaxed mt-4">
              Because the Brain Clone is shared across all five tutors,
              cross-subject connections happen automatically. For example, if
              your student learns about ratios with Nova, Spark might reference
              that knowledge when discussing proportions in a chemistry
              experiment.
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

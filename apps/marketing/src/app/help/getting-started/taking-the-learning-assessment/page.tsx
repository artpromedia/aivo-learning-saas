import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Taking the Learning Assessment | Help | AIVO",
  description:
    "Learn how the Brain Clone AI learning assessment works, what subjects are assessed, how long it takes, and how to retake or update results.",
  openGraph: {
    title: "Taking the Learning Assessment | AIVO Help",
    description:
      "Understand the adaptive learning assessment that builds your child's Brain Clone profile.",
  },
};

export default function TakingTheLearningAssessmentPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-medium text-aivo-purple-600 uppercase tracking-wider">
            Getting Started
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl">
            Taking the Learning Assessment
          </h1>
          <p className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto">
            The Brain Clone AI assessment maps your child&apos;s strengths
            and learning gaps so every session is personalized from day one.
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
                  href="#what-is-the-assessment"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  What Is the Brain Clone AI Assessment?
                </a>
              </li>
              <li>
                <a
                  href="#how-long"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  How Long Does It Take?
                </a>
              </li>
              <li>
                <a
                  href="#subjects-assessed"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Subjects Assessed
                </a>
              </li>
              <li>
                <a
                  href="#how-adaptive-questioning-works"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  How Adaptive Questioning Works
                </a>
              </li>
              <li>
                <a
                  href="#brain-clone-profile"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Your Child&apos;s Brain Clone Profile
                </a>
              </li>
              <li>
                <a
                  href="#tips-for-success"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Tips for a Successful Assessment
                </a>
              </li>
              <li>
                <a
                  href="#retaking-the-assessment"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Retaking or Updating the Assessment
                </a>
              </li>
            </ul>
          </nav>

          <div className="prose prose-aivo max-w-none">
            {/* What Is the Assessment */}
            <h2
              id="what-is-the-assessment"
              className="text-2xl font-bold text-aivo-navy-800 mt-0 scroll-mt-24"
            >
              What Is the Brain Clone AI Assessment?
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              The Brain Clone AI assessment is a one-time, adaptive diagnostic
              that your child completes when they first start using AIVO
              Learning. Its purpose is to build a comprehensive picture of your
              child&apos;s current abilities, learning preferences, and
              knowledge gaps across their selected subjects. The results are
              used to generate a <strong>Brain Clone profile</strong> &mdash;
              an AI-powered learning model unique to your child &mdash; which
              guides every future tutoring session, lesson sequence, and
              practice problem.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              Think of it as a conversation, not a test. There are no grades,
              no scores sent home, and no pass-or-fail thresholds. The
              assessment simply helps our AI Tutors understand where your child
              is today so they can meet them exactly where they are.
            </p>

            {/* How Long */}
            <h2
              id="how-long"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              How Long Does It Take?
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              The assessment typically takes <strong>15 to 20 minutes</strong>{" "}
              per subject. The exact duration depends on your child&apos;s
              grade level and how the adaptive engine adjusts to their
              responses. If your child has selected multiple subjects, they can
              complete them all in one sitting or spread them out across
              multiple sessions &mdash; the assessment saves progress
              automatically, so your child can resume right where they left off.
            </p>
            <div className="mt-4 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600 leading-relaxed">
                <strong>Tip:</strong> There is no time limit on any individual
                question. Encourage your child to take their time and answer
                thoughtfully rather than rushing through.
              </p>
            </div>

            {/* Subjects Assessed */}
            <h2
              id="subjects-assessed"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Subjects Assessed
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              The assessment covers each subject the student selected during
              profile setup. Each subject is assessed independently:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Math</strong> &mdash; number sense, operations,
                  fractions, algebra readiness, geometry, and grade-appropriate
                  problem solving
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>ELA</strong> &mdash; reading comprehension, vocabulary,
                  grammar, writing conventions, and passage analysis
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Science</strong> &mdash; life science, physical
                  science, earth science, and scientific reasoning
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>History</strong> &mdash; historical knowledge, civics
                  concepts, geography, and primary-source interpretation
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Coding</strong> &mdash; logical thinking, sequencing,
                  pattern recognition, and introductory programming concepts
                </span>
              </li>
            </ul>

            {/* Adaptive Questioning */}
            <h2
              id="how-adaptive-questioning-works"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              How Adaptive Questioning Works
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              The assessment uses an adaptive algorithm to determine the right
              questions to ask. Here is how it works:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  Questions begin at the expected level for your child&apos;s
                  selected grade
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  If your child answers correctly, the next question increases
                  in difficulty
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  If your child answers incorrectly, the next question
                  decreases in difficulty
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  The algorithm narrows in on your child&apos;s mastery level
                  for each skill within the subject
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  The assessment ends when the engine has a confident model of
                  your child&apos;s skill levels across all assessed areas
                </span>
              </li>
            </ul>
            <p className="text-aivo-navy-600 leading-relaxed mt-4">
              This means every child&apos;s assessment is different. A student
              who excels in math but struggles with fractions will see more
              advanced algebra questions but more foundational fraction
              questions.
            </p>

            {/* Brain Clone Profile */}
            <h2
              id="brain-clone-profile"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Your Child&apos;s Brain Clone Profile
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Once the assessment is complete, AIVO Learning generates a
              unique <strong>Brain Clone profile</strong> for your child. This
              profile is the foundation of the personalized learning experience
              and includes:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Skill-level mapping</strong> &mdash; mastery
                  percentage for each sub-skill within every subject
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Learning-style indicators</strong> &mdash; whether
                  your child benefits more from visual, textual, or interactive
                  explanations
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Recommended starting lessons</strong> &mdash; the
                  lessons and practice sets each AI Tutor will begin with
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>IEP alignment</strong> (Pro and Premium only) &mdash;
                  if you have uploaded IEP goals, the Brain Clone profile will
                  map skills to those goals and track progress toward each one
                </span>
              </li>
            </ul>
            <p className="text-aivo-navy-600 leading-relaxed mt-4">
              You can view the Brain Clone profile summary from the student
              profile card on your parent dashboard. Over time, this profile
              updates continuously as your child interacts with AI Tutors,
              completes lessons, and earns XP.
            </p>

            {/* Tips for Success */}
            <h2
              id="tips-for-success"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Tips for a Successful Assessment
            </h2>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Choose a quiet environment</strong> &mdash; minimize
                  distractions so your child can focus on each question
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Avoid helping with answers</strong> &mdash; the
                  assessment needs to reflect your child&apos;s actual
                  abilities in order to personalize effectively
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Reassure your child</strong> &mdash; remind them this is
                  not a test and there are no wrong answers; it&apos;s just
                  helping the AI learn about them
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Take breaks if needed</strong> &mdash; progress saves
                  automatically, so your child can stop and resume at any time
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Use a stable internet connection</strong> &mdash;
                  while answers are saved in real time, a dropped connection
                  may cause a brief delay in loading the next question
                </span>
              </li>
            </ul>

            {/* Retaking the Assessment */}
            <h2
              id="retaking-the-assessment"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Retaking or Updating the Assessment
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              The Brain Clone profile is designed to evolve automatically as
              your child uses AIVO Learning, so retaking the assessment is
              usually not necessary. However, you may want to request a
              reassessment in certain situations:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  Your child has changed grade levels or schools
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  The initial assessment was not taken under ideal conditions
                  (e.g., your child was distracted or received help with
                  answers)
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  You have added a new subject and want a full baseline for it
                </span>
              </li>
            </ul>
            <p className="text-aivo-navy-600 leading-relaxed mt-4">
              To retake the assessment, open the student&apos;s profile card
              on your dashboard, click the <strong>Brain Clone</strong> tab, and
              select <strong>Retake Assessment</strong>. You can retake
              individual subjects or the full assessment. The new results will
              update the Brain Clone profile while preserving all historical
              progress data and earned XP.
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
              href="/help/getting-started/understanding-your-dashboard"
              className="rounded-xl border border-aivo-navy-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-aivo-navy-800">
                Understanding Your Dashboard
              </h3>
              <p className="mt-1 text-sm text-aivo-navy-500">
                Navigate the parent and student dashboards.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

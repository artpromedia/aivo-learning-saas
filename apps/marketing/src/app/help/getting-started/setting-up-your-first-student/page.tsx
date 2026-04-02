import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Setting Up Your First Student | Help | AIVO",
  description:
    "Step-by-step guide to adding a student profile in AIVO Learning, including entering student details, selecting subjects, and completing COPPA consent.",
  openGraph: {
    title: "Setting Up Your First Student | AIVO Help",
    description:
      "Learn how to add your first student profile to AIVO Learning.",
  },
};

export default function SettingUpFirstStudentPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-medium text-aivo-purple-600 uppercase tracking-wider">
            Getting Started
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl">
            Setting Up Your First Student
          </h1>
          <p className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto">
            Add a student profile, choose subjects, and complete the COPPA
            consent step so your child can start learning with AIVO.
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
                  href="#prerequisites"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Prerequisites
                </a>
              </li>
              <li>
                <a
                  href="#click-add-student"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Step 1: Click &ldquo;Add Student&rdquo;
                </a>
              </li>
              <li>
                <a
                  href="#enter-student-name"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Step 2: Enter Student Name
                </a>
              </li>
              <li>
                <a
                  href="#select-grade-level"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Step 3: Select Grade Level
                </a>
              </li>
              <li>
                <a
                  href="#choose-subjects"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Step 4: Choose Subjects
                </a>
              </li>
              <li>
                <a
                  href="#coppa-consent"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Step 5: COPPA Consent Confirmation
                </a>
              </li>
              <li>
                <a
                  href="#student-profile-card"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  What Appears on the Student Profile Card
                </a>
              </li>
            </ul>
          </nav>

          <div className="prose prose-aivo max-w-none">
            {/* Prerequisites */}
            <h2
              id="prerequisites"
              className="text-2xl font-bold text-aivo-navy-800 mt-0 scroll-mt-24"
            >
              Prerequisites
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Before you can add a student profile, you must have a verified
              parent account on AIVO Learning. If you have not yet created your
              account, follow our{" "}
              <Link
                href="/help/getting-started/creating-your-account"
                className="text-aivo-purple-600 font-semibold hover:text-aivo-purple-700 transition-colors"
              >
                Creating Your Account
              </Link>{" "}
              guide first.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              The number of student profiles you can create depends on your
              plan. Free accounts support one student profile. Pro accounts
              ($39.99/month or $24.99/month billed annually) support up to four
              student profiles. Premium accounts (for schools and districts)
              support unlimited student profiles.
            </p>

            {/* Step 1 */}
            <h2
              id="click-add-student"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Step 1: Click &ldquo;Add Student&rdquo;
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Log in to your parent dashboard at{" "}
              <strong>app.aivolearning.com</strong>. On the main dashboard
              screen, locate the <strong>Add Student</strong> button. If this
              is your first time and you have no existing student profiles,
              the button will appear prominently in the center of the page
              alongside the Quick Start checklist. If you already have one or
              more student profiles, the button will appear as a{" "}
              <strong>+ Add Student</strong> card at the end of your student
              card row.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              Click the button to open the &ldquo;New Student Profile&rdquo;
              setup wizard. The wizard will guide you through each step in
              sequence.
            </p>

            {/* Step 2 */}
            <h2
              id="enter-student-name"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Step 2: Enter Student Name
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              In the <strong>Student First Name</strong> field, enter your
              child&apos;s first name. Alternatively, you can enter an alias or
              nickname of your choosing. AIVO Learning does not require a
              child&apos;s legal name; any name or alias chosen by the parent
              is accepted. This name will appear on the student&apos;s profile
              card, in progress reports, and as the greeting when your child
              logs into their learning session.
            </p>
            <div className="mt-4 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600 leading-relaxed">
                <strong>Privacy tip:</strong> If you prefer, you can use a
                nickname or alias instead of your child&apos;s real name. AIVO
                Learning does not collect the child&apos;s last name, date of
                birth, or any government-issued identifiers. The name you
                enter here is solely for personalization within the platform.
              </p>
            </div>

            {/* Step 3 */}
            <h2
              id="select-grade-level"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Step 3: Select Grade Level
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              From the <strong>Grade Level</strong> dropdown menu, select your
              child&apos;s current grade. AIVO Learning supports students from
              Kindergarten through 12th grade (K&ndash;12). The grade level you
              select determines the starting difficulty and curriculum alignment
              of the learning content delivered by our AI Tutors and the Brain
              Clone AI engine.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              If your child is between grades or has been placed in advanced or
              remedial courses, select the grade level that best represents
              their current overall academic level. The Brain Clone AI learning
              assessment (the next step after profile creation) will
              automatically adjust to your child&apos;s actual knowledge level
              regardless of the grade selected here.
            </p>

            {/* Step 4 */}
            <h2
              id="choose-subjects"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Step 4: Choose Subjects
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Select one or more subjects for your child to study with AIVO
              Learning. Each subject is powered by a dedicated AI Tutor:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Math</strong> &mdash; taught by Nova, who adapts
                  problem types, complexity, and pacing to your child&apos;s
                  mathematical reasoning skills
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>English Language Arts (ELA)</strong> &mdash; taught by
                  Sage, focusing on reading comprehension, writing, vocabulary,
                  and grammar
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Science</strong> &mdash; taught by Spark, covering
                  life science, physical science, earth science, and
                  grade-appropriate laboratory concepts
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>History</strong> &mdash; taught by Chrono, covering
                  U.S. history, world history, civics, and geography aligned to
                  grade-level standards
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Coding</strong> &mdash; taught by Pixel, introducing
                  block programming for younger students and Python/JavaScript
                  for older students
                </span>
              </li>
            </ul>
            <p className="text-aivo-navy-600 leading-relaxed mt-4">
              You can select as many subjects as you like. You can also add or
              remove subjects at any time after creating the student profile by
              going to the student&apos;s profile settings. After selecting
              your subjects, click <strong>Continue</strong>.
            </p>

            {/* Step 5 */}
            <h2
              id="coppa-consent"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Step 5: COPPA Consent Confirmation
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Before the student profile is finalized, you must complete the
              COPPA consent confirmation. This step is required by federal law
              for all child users. The consent screen displays a clear summary
              of:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  The specific categories of information AIVO Learning will
                  collect from your child (first name or alias, grade level,
                  assessment responses, tutor interaction data, and gamification
                  activity)
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  How the information will be used (personalized learning,
                  progress tracking, IEP goal support, gamification)
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  Your rights as a parent to review, export, and delete your
                  child&apos;s data at any time
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  A link to the full{" "}
                  <Link
                    href="/legal/coppa"
                    className="text-aivo-purple-600 font-semibold hover:text-aivo-purple-700 transition-colors"
                  >
                    COPPA Policy
                  </Link>
                </span>
              </li>
            </ul>
            <p className="text-aivo-navy-600 leading-relaxed mt-4">
              Review the consent summary carefully. When you are ready, check
              the <strong>I consent</strong> checkbox and click{" "}
              <strong>Create Student Profile</strong>. A confirmation email
              will be sent to your account email address for your records.
              Your consent is recorded in our system with the consent type,
              policy version, timestamp, and your IP address.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              You may withdraw your consent at any time from the
              student&apos;s profile settings. Withdrawing consent will
              suspend the student&apos;s access and, at your election,
              permanently delete all of their data.
            </p>

            {/* Student Profile Card */}
            <h2
              id="student-profile-card"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              What Appears on the Student Profile Card
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Once you complete the setup wizard, a new student profile card
              will appear on your parent dashboard. The profile card displays:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Student name</strong> (or alias) and a randomly
                  generated avatar that your child can customize later
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Grade level</strong> (e.g., &ldquo;Grade 4&rdquo;)
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Selected subjects</strong> shown as colored pills
                  (e.g., Math, ELA, Science)
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Brain Clone status</strong> which will show as
                  &ldquo;Assessment Pending&rdquo; until the student completes
                  the learning assessment
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>A &ldquo;Start Assessment&rdquo; button</strong>{" "}
                  prompting you to have your student complete their initial
                  Brain Clone AI learning assessment
                </span>
              </li>
            </ul>
            <p className="text-aivo-navy-600 leading-relaxed mt-4">
              Click the student card to open the student&apos;s detail view.
              From there, you can edit the student&apos;s name, grade level,
              or subjects; manage privacy settings (standard or strict mode);
              view the student&apos;s Brain Clone profile (once the assessment
              is complete); and launch the student into a learning session.
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

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Creating Your Account | Help | AIVO",
  description:
    "Step-by-step guide to creating your AIVO Learning parent account, verifying your email, and accessing the parent dashboard for the first time.",
  openGraph: {
    title: "Creating Your Account | AIVO Help",
    description:
      "Learn how to create your AIVO Learning parent account and get started.",
  },
};

export default function CreatingYourAccountPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-medium text-aivo-purple-600 uppercase tracking-wider">
            Getting Started
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl">
            Creating Your Account
          </h1>
          <p className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto">
            Everything you need to set up your AIVO Learning parent account and
            access your dashboard in just a few minutes.
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
                  href="#before-you-begin"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Before You Begin
                </a>
              </li>
              <li>
                <a
                  href="#navigate-to-get-started"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Step 1: Navigate to /get-started
                </a>
              </li>
              <li>
                <a
                  href="#enter-your-email"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Step 2: Enter Your Email
                </a>
              </li>
              <li>
                <a
                  href="#set-a-password"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Step 3: Set a Password
                </a>
              </li>
              <li>
                <a
                  href="#verify-your-email"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Step 4: Verify Your Email
                </a>
              </li>
              <li>
                <a
                  href="#first-login"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Step 5: Your First Login
                </a>
              </li>
              <li>
                <a
                  href="#what-you-see"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  What You See on First Login
                </a>
              </li>
            </ul>
          </nav>

          <div className="prose prose-aivo max-w-none">
            {/* Before You Begin */}
            <h2
              id="before-you-begin"
              className="text-2xl font-bold text-aivo-navy-800 mt-0 scroll-mt-24"
            >
              Before You Begin
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO Learning uses a parent-account model. Every student profile
              on AIVO Learning is created and managed by a parent or legal
              guardian. This means you must create a parent account before you
              can add any child learner profiles. This is a requirement of the
              Children&apos;s Online Privacy Protection Act (COPPA), which
              requires verifiable parental consent before any information is
              collected from children under 13.
            </p>
            <div className="mt-4 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600 leading-relaxed">
                <strong>Important:</strong> A parent or legal guardian account
                is required before any child profile can be created. Children
                cannot create accounts independently. This ensures full COPPA
                compliance and gives you complete control over your
                child&apos;s learning data from day one.
              </p>
            </div>

            {/* Step 1 */}
            <h2
              id="navigate-to-get-started"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Step 1: Navigate to /get-started
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Open your web browser and go to{" "}
              <strong>app.aivolearning.com/get-started</strong>. You can also
              reach this page by clicking the <strong>Get Started Free</strong>{" "}
              button on the AIVO Learning homepage or by tapping{" "}
              <strong>Sign Up</strong> in the top navigation bar. The
              registration page will display the account creation form with a
              brief overview of what you get with a free account: one student
              profile, two AI Tutor sessions per day, and access to the parent
              dashboard.
            </p>

            {/* Step 2 */}
            <h2
              id="enter-your-email"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Step 2: Enter Your Email
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              In the <strong>Parent Email</strong> field, enter the email
              address you want to associate with your AIVO Learning account.
              This email will be used for:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  Account verification and password recovery
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  Weekly progress reports for your student(s)
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  COPPA consent confirmations when adding child profiles
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>Billing notifications (if you upgrade to Pro or Premium)</span>
              </li>
            </ul>
            <p className="text-aivo-navy-600 leading-relaxed mt-4">
              Make sure you enter an email address you have access to, as you
              will need to verify it in the next step. Only one parent account
              can be associated with a given email address.
            </p>

            {/* Step 3 */}
            <h2
              id="set-a-password"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Step 3: Set a Password
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Create a strong password for your account. Your password must
              meet the following requirements:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>At least 12 characters long</span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  Contains at least one uppercase letter, one lowercase letter,
                  and one number
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  Contains at least one special character (such as !, @, #, $,
                  or %)
                </span>
              </li>
            </ul>
            <p className="text-aivo-navy-600 leading-relaxed mt-4">
              A strength indicator will appear below the password field as you
              type, showing whether your password is rated as weak, fair,
              strong, or very strong. We recommend aiming for{" "}
              <strong>strong</strong> or <strong>very strong</strong>. After
              entering your password, re-enter it in the{" "}
              <strong>Confirm Password</strong> field. Then click the{" "}
              <strong>Create Account</strong> button.
            </p>

            {/* Step 4 */}
            <h2
              id="verify-your-email"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Step 4: Verify Your Email
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              After clicking <strong>Create Account</strong>, you will see a
              confirmation screen that says &ldquo;Check your inbox.&rdquo; We
              have sent a verification email to the address you provided. Open
              your email and look for a message from{" "}
              <strong>no-reply@aivolearning.com</strong> with the subject line
              &ldquo;Verify your AIVO Learning account.&rdquo;
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              Inside the email, click the <strong>Verify My Email</strong>{" "}
              button. This link is valid for 24 hours. If you do not see the
              email within a few minutes, check your spam or junk folder. You
              can also click the <strong>Resend Verification Email</strong>{" "}
              link on the confirmation screen to have the email sent again.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              Once you click the verification link, your browser will open a
              new tab confirming that your email has been verified
              successfully. You will be automatically redirected to the login
              page.
            </p>

            {/* Step 5 */}
            <h2
              id="first-login"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Step 5: Your First Login
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              On the login page, enter the email address and password you used
              during registration, then click <strong>Sign In</strong>. If you
              have forgotten your password already, click{" "}
              <strong>Forgot password?</strong> to receive a password reset link
              via email.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              After signing in for the first time, you will be greeted by a
              brief welcome tour that highlights the key areas of the parent
              dashboard. You can complete the tour by clicking{" "}
              <strong>Next</strong> through each step, or skip it by clicking{" "}
              <strong>Skip Tour</strong> in the bottom-right corner. You can
              replay the tour at any time from{" "}
              <strong>Account Settings &rarr; Help &rarr; Replay Welcome
              Tour</strong>.
            </p>

            {/* What You See */}
            <h2
              id="what-you-see"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              What You See on First Login
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              When you first log in, your parent dashboard will display the
              following:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>An empty student card area</strong> with a prominent
                  &ldquo;Add Student&rdquo; button. Since you have not yet
                  created any student profiles, this section will prompt you to
                  add your first student.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Your current plan</strong> displayed in the top-right
                  corner. New accounts start on the Free plan, which includes
                  one student profile and two AI Tutor sessions per day.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>A navigation sidebar</strong> with links to your
                  Dashboard, Student Profiles, Progress Reports, Account
                  Settings, and Help &amp; Support.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>A &ldquo;Quick Start&rdquo; checklist</strong> in the
                  center of the page showing your setup progress: account
                  created (checked), add your first student (unchecked),
                  complete the learning assessment (unchecked), and explore AI
                  Tutors (unchecked).
                </span>
              </li>
            </ul>
            <p className="text-aivo-navy-600 leading-relaxed mt-4">
              Your next step is to add your first student profile. See the
              guide below for detailed instructions.
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
              href="/help/getting-started/setting-up-your-first-student"
              className="rounded-xl border border-aivo-navy-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-aivo-navy-800">
                Setting Up Your First Student
              </h3>
              <p className="mt-1 text-sm text-aivo-navy-500">
                Add a student profile and complete the COPPA consent step.
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

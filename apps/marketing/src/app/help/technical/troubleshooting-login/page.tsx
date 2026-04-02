import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Troubleshooting Login Issues | Help | AIVO",
  description:
    "Fix common AIVO login problems including forgotten passwords, email not recognized, locked accounts, two-factor authentication issues, and mobile app login errors.",
  openGraph: {
    title: "Troubleshooting Login Issues | AIVO Help",
    description:
      "Step-by-step solutions for the most common AIVO login issues.",
  },
};

export default function TroubleshootingLoginPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-medium text-aivo-purple-600 uppercase tracking-wider">
            Technical
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl">
            Troubleshooting Login Issues
          </h1>
          <p className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto">
            Can&rsquo;t get in? Here are step-by-step solutions for the most
            common login problems on AIVO Learning.
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
                  href="#forgotten-password"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Forgotten Password
                </a>
              </li>
              <li>
                <a
                  href="#email-not-recognized"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Email Not Recognized
                </a>
              </li>
              <li>
                <a
                  href="#account-locked"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Account Locked
                </a>
              </li>
              <li>
                <a
                  href="#two-factor"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Two-Factor Authentication Issues
                </a>
              </li>
              <li>
                <a
                  href="#session-expired"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Session Expired Errors
                </a>
              </li>
              <li>
                <a
                  href="#mobile-login"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Mobile App Login Issues
                </a>
              </li>
              <li>
                <a
                  href="#contact-support"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  How to Contact Support
                </a>
              </li>
            </ul>
          </nav>

          <div className="prose prose-aivo max-w-none">
            {/* Forgotten Password */}
            <h2
              id="forgotten-password"
              className="text-2xl font-bold text-aivo-navy-800 mt-0 scroll-mt-24"
            >
              Forgotten Password
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              If you&rsquo;ve forgotten your password, you can reset it in a few
              steps:
            </p>
            <ol className="mt-4 space-y-4">
              <li className="flex items-start gap-4 text-aivo-navy-600">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-sm font-bold text-aivo-purple-700">
                  1
                </span>
                <span>
                  Go to the{" "}
                  <strong>AIVO login page</strong> and click{" "}
                  <strong>&ldquo;Forgot Password?&rdquo;</strong>
                </span>
              </li>
              <li className="flex items-start gap-4 text-aivo-navy-600">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-sm font-bold text-aivo-purple-700">
                  2
                </span>
                <span>
                  Enter the email address you used to create your account.
                </span>
              </li>
              <li className="flex items-start gap-4 text-aivo-navy-600">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-sm font-bold text-aivo-purple-700">
                  3
                </span>
                <span>
                  Check your inbox for a password reset email. It should arrive
                  within a few minutes.
                </span>
              </li>
              <li className="flex items-start gap-4 text-aivo-navy-600">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-sm font-bold text-aivo-purple-700">
                  4
                </span>
                <span>
                  Click the reset link in the email and choose a new password.
                  Your password must be at least 8 characters and include a mix
                  of letters and numbers.
                </span>
              </li>
            </ol>
            <div className="mt-6 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600">
                <strong>Not seeing the email?</strong> Check your spam or junk
                folder. If you use Gmail, also check the Promotions or Updates
                tab. The reset link expires after 1 hour.
              </p>
            </div>

            {/* Email Not Recognized */}
            <h2
              id="email-not-recognized"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Email Not Recognized
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              If AIVO says your email address is not recognized, here are the
              most common causes:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Typo in your email:</strong> Double-check for
                  misspellings (e.g., &ldquo;gmial.com&rdquo; instead of
                  &ldquo;gmail.com&rdquo;).
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Different email address:</strong> You may have signed
                  up with a different email. Try any other email addresses you
                  commonly use.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Social login:</strong> If you signed up using
                  &ldquo;Continue with Google&rdquo; or &ldquo;Continue with
                  Apple,&rdquo; your account is linked to that provider. Try
                  signing in with the same social button instead of entering
                  your email manually.
                </span>
              </li>
            </ul>

            {/* Account Locked */}
            <h2
              id="account-locked"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Account Locked
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              For your security, AIVO temporarily locks your account after 5
              consecutive failed login attempts. Here&rsquo;s what to do:
            </p>
            <ol className="mt-4 space-y-4">
              <li className="flex items-start gap-4 text-aivo-navy-600">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-sm font-bold text-aivo-purple-700">
                  1
                </span>
                <span>
                  <strong>Wait 15 minutes.</strong> The lockout is temporary and
                  will expire automatically.
                </span>
              </li>
              <li className="flex items-start gap-4 text-aivo-navy-600">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-sm font-bold text-aivo-purple-700">
                  2
                </span>
                <span>
                  After the cooldown, try logging in again with the correct
                  password. If you&rsquo;re unsure of your password, use the{" "}
                  <a href="#forgotten-password" className="text-aivo-purple-600 underline">
                    password reset flow
                  </a>{" "}
                  above.
                </span>
              </li>
            </ol>
            <div className="mt-6 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600">
                <strong>Still locked out?</strong> If your account remains
                locked after 15 minutes,{" "}
                <Link
                  href="/contact"
                  className="text-aivo-purple-600 underline"
                >
                  contact our support team
                </Link>{" "}
                and we&rsquo;ll help you regain access.
              </p>
            </div>

            {/* Two-Factor Authentication */}
            <h2
              id="two-factor"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Two-Factor Authentication Issues
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              If you&rsquo;ve enabled two-factor authentication (2FA) and
              are having trouble logging in, try the following:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Code not working:</strong> Make sure you&rsquo;re
                  entering the code from your authenticator app quickly. Codes
                  refresh every 30 seconds. Check that your device&rsquo;s clock
                  is set to automatic time.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Lost your authenticator:</strong> Use one of the
                  backup codes you saved when you first set up 2FA. Each backup
                  code can be used only once.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>No backup codes:</strong> If you don&rsquo;t have any
                  remaining backup codes,{" "}
                  <Link
                    href="/contact"
                    className="text-aivo-purple-600 underline"
                  >
                    contact support
                  </Link>{" "}
                  with your account email. We&rsquo;ll verify your identity and
                  help you re-set up 2FA.
                </span>
              </li>
            </ul>

            {/* Session Expired */}
            <h2
              id="session-expired"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Session Expired Errors
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              A &ldquo;session expired&rdquo; message means your login session
              has timed out. This can happen after a period of inactivity or if
              your browser cleared its cookies.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed mt-3">
              To fix this:
            </p>
            <ol className="mt-4 space-y-4">
              <li className="flex items-start gap-4 text-aivo-navy-600">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-sm font-bold text-aivo-purple-700">
                  1
                </span>
                <span>
                  <strong>Clear your browser cookies</strong> for aivo.com, then
                  try logging in again.
                </span>
              </li>
              <li className="flex items-start gap-4 text-aivo-navy-600">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-sm font-bold text-aivo-purple-700">
                  2
                </span>
                <span>
                  Try opening AIVO in an{" "}
                  <strong>incognito / private browsing</strong> window to rule
                  out extension or cookie conflicts.
                </span>
              </li>
              <li className="flex items-start gap-4 text-aivo-navy-600">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-sm font-bold text-aivo-purple-700">
                  3
                </span>
                <span>
                  If you&rsquo;re using a shared or school computer, check
                  whether the browser is configured to clear cookies on close.
                  You may need to log in each time you return.
                </span>
              </li>
            </ol>

            {/* Mobile App Login */}
            <h2
              id="mobile-login"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Mobile App Login Issues
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              If you can&rsquo;t log in on the AIVO mobile app, try these steps
              in order:
            </p>
            <ol className="mt-4 space-y-4">
              <li className="flex items-start gap-4 text-aivo-navy-600">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-sm font-bold text-aivo-purple-700">
                  1
                </span>
                <span>
                  <strong>Force close the app</strong> and reopen it. On iOS,
                  swipe up from the app switcher. On Android, swipe the app away
                  from the recents screen.
                </span>
              </li>
              <li className="flex items-start gap-4 text-aivo-navy-600">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-sm font-bold text-aivo-purple-700">
                  2
                </span>
                <span>
                  <strong>Update the app</strong> to the latest version from the
                  App Store or Google Play. Outdated versions may have known
                  login bugs.
                </span>
              </li>
              <li className="flex items-start gap-4 text-aivo-navy-600">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-sm font-bold text-aivo-purple-700">
                  3
                </span>
                <span>
                  <strong>Check your internet connection.</strong> Switch between
                  Wi-Fi and mobile data to rule out a connectivity issue.
                </span>
              </li>
              <li className="flex items-start gap-4 text-aivo-navy-600">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-sm font-bold text-aivo-purple-700">
                  4
                </span>
                <span>
                  If the problem persists, <strong>uninstall and reinstall</strong>{" "}
                  the app. Your data is saved in the cloud and won&rsquo;t be
                  lost.
                </span>
              </li>
            </ol>

            {/* Contact Support */}
            <h2
              id="contact-support"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              How to Contact Support
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              If none of the above steps resolve your issue, our support team
              can help. When you reach out, include the following information to
              speed up the process:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>The email address associated with your account</span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>What device and browser (or app version) you&rsquo;re using</span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>The exact error message you&rsquo;re seeing (a screenshot helps)</span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>Which steps you&rsquo;ve already tried</span>
              </li>
            </ul>
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
              href="/help/technical/system-requirements"
              className="rounded-xl border border-aivo-navy-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-aivo-navy-800">
                System Requirements
              </h3>
              <p className="mt-1 text-sm text-aivo-navy-500">
                Check browser, device, and internet requirements.
              </p>
            </Link>
            <Link
              href="/help/technical/offline-mode-setup"
              className="rounded-xl border border-aivo-navy-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-aivo-navy-800">
                Offline Mode Setup
              </h3>
              <p className="mt-1 text-sm text-aivo-navy-500">
                Enable offline learning on Pro and Premium plans.
              </p>
            </Link>
            <Link
              href="/help/technical/browser-compatibility"
              className="rounded-xl border border-aivo-navy-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-aivo-navy-800">
                Browser Compatibility
              </h3>
              <p className="mt-1 text-sm text-aivo-navy-500">
                Check browser support and troubleshoot browser-specific issues.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

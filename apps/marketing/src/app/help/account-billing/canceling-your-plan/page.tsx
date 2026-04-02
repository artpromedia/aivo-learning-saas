import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Canceling Your Plan | Help | AIVO",
  description:
    "Learn how to cancel your AIVO Learning subscription, what happens to your data, and how to reactivate your plan later.",
  openGraph: {
    title: "Canceling Your Plan | AIVO Help",
    description:
      "Cancel your plan, understand data retention, and learn how to reactivate.",
  },
};

export default function CancelingYourPlanPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-medium text-aivo-purple-600 uppercase tracking-wider">
            Account &amp; Billing
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl">
            Canceling Your Plan
          </h1>
          <p className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto">
            We are sorry to see you go. Here is everything you need to know
            about canceling, what happens to your data, and how to come back.
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
                  href="#how-to-cancel"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  How to Cancel Your Subscription
                </a>
              </li>
              <li>
                <a
                  href="#what-happens-after"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  What Happens After You Cancel
                </a>
              </li>
              <li>
                <a
                  href="#data-retention"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Data Retention
                </a>
              </li>
              <li>
                <a
                  href="#downgrade-instead"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Consider Downgrading Instead
                </a>
              </li>
              <li>
                <a
                  href="#reactivating"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Reactivating Your Plan
                </a>
              </li>
              <li>
                <a
                  href="#canceling-trial"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Canceling During a Free Trial
                </a>
              </li>
            </ul>
          </nav>

          <div className="prose prose-aivo max-w-none">
            {/* How to Cancel */}
            <h2
              id="how-to-cancel"
              className="text-2xl font-bold text-aivo-navy-800 mt-0 scroll-mt-24"
            >
              How to Cancel Your Subscription
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              You can cancel your AIVO Learning subscription at any time. There
              are no cancellation fees. Follow these steps:
            </p>
            <ol className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  1
                </span>
                <span>
                  Log in to your AIVO Learning parent account at{" "}
                  <strong>app.aivolearning.com</strong>.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  2
                </span>
                <span>
                  Click your profile avatar in the top-right corner and select{" "}
                  <strong>Account Settings</strong>.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  3
                </span>
                <span>
                  Click the <strong>Subscription</strong> tab in the left
                  sidebar.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  4
                </span>
                <span>
                  Scroll to the bottom of the page and click{" "}
                  <strong>Cancel Subscription</strong>. A confirmation dialog
                  will appear summarizing what will happen and when your access
                  will end.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  5
                </span>
                <span>
                  Click <strong>Confirm Cancellation</strong>. You will receive
                  a confirmation email with the date your access will end. You
                  can continue using your paid plan features until that date.
                </span>
              </li>
            </ol>
            <div className="mt-6 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600">
                <strong>Note:</strong> Only the account owner (the parent who
                created the account) can cancel a subscription. If you are a
                co-parent or guardian who was invited to the account, you will
                need to ask the account owner to cancel.
              </p>
            </div>

            {/* What Happens After */}
            <h2
              id="what-happens-after"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              What Happens After You Cancel
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              When you cancel your subscription, here is what to expect:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Access continues until your billing period ends.</strong>{" "}
                  You will not be charged again, but you retain full access to
                  all paid features until the end of your current billing cycle.
                  For annual subscribers, this means until your annual renewal
                  date.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>After the billing period ends, your account
                  reverts to the Free plan.</strong> You will still be able to
                  log in, access 1 student profile, and use 2 AI Tutor sessions
                  per day.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Brain Clone profiles are never deleted.</strong>{" "}
                  Your student Brain Clone profiles, including the adaptive
                  learning model, assessment results, and tutor interaction
                  history, remain intact. Additional student profiles beyond
                  the Free plan limit are paused (not deleted) and can be
                  reactivated if you re-subscribe.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Gamification progress is preserved.</strong> XP,
                  streaks, badges, and leaderboard positions remain unchanged.
                  Students will not lose their earned achievements.
                </span>
              </li>
            </ul>

            {/* Data Retention */}
            <h2
              id="data-retention"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Data Retention
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              After your subscription is canceled and your billing period has
              ended, your data is retained for <strong>12 months</strong>. During
              this period, you can reactivate your subscription at any time and
              all your data will be fully restored.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              After 12 months of inactivity (no login and no active
              subscription), we will send you an email notification giving you
              30 days to reactivate or download your data before it is
              permanently deleted. You can request a full data export at any
              time by navigating to{" "}
              <strong>Account Settings &rarr; Privacy &rarr; Export My
              Data</strong>.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              If you want your data deleted immediately, you can submit a data
              deletion request through the same Privacy settings page, or by
              emailing <strong>privacy@aivolearning.com</strong>. Deletion
              requests are processed within 2 business days. Backups containing
              your data are purged within 90 days.
            </p>

            {/* Downgrade Instead */}
            <h2
              id="downgrade-instead"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Consider Downgrading Instead
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Before you cancel entirely, consider downgrading to the Free plan
              instead. Downgrading keeps your account active with 1 student
              profile and 2 AI Tutor sessions per day at no cost, while
              preserving all of your data, including paused student profiles.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              Downgrading means you do not need to worry about the 12-month
              data retention clock. Your data stays as long as your account
              exists. You can upgrade again whenever you are ready.
            </p>
            <div className="mt-6 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600">
                <strong>How to downgrade:</strong> Navigate to{" "}
                <strong>Account Settings &rarr; Subscription</strong> and click{" "}
                <strong>Change Plan</strong>. Select the Free plan and click{" "}
                <strong>Confirm</strong>. Your downgrade takes effect at the
                end of your current billing period.
              </p>
            </div>

            {/* Reactivating */}
            <h2
              id="reactivating"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Reactivating Your Plan
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              If you change your mind after canceling, you can reactivate your
              subscription at any time within the 12-month data retention
              period:
            </p>
            <ol className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  1
                </span>
                <span>
                  Log in to your AIVO Learning account. Your account still
                  exists on the Free plan.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  2
                </span>
                <span>
                  Navigate to <strong>Account Settings</strong> &rarr;{" "}
                  <strong>Subscription</strong>.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  3
                </span>
                <span>
                  Click <strong>Upgrade Plan</strong> and select the plan you
                  want. Enter or confirm your payment method and click{" "}
                  <strong>Confirm</strong>.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  4
                </span>
                <span>
                  Your plan is activated immediately. All previously paused
                  student profiles are automatically restored, and your Brain
                  Clone data picks up right where you left off.
                </span>
              </li>
            </ol>

            {/* Canceling Trial */}
            <h2
              id="canceling-trial"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Canceling During a Free Trial
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              If you are currently on the 14-day free trial of the Pro plan,
              you can cancel at any time before the trial ends to avoid being
              charged. Follow the same steps above to cancel.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              When you cancel during a trial, your account immediately reverts
              to the Free plan (since no billing period is active). You will
              not be charged. Any data created during the trial is preserved
              under the standard data retention policy.
            </p>
            <div className="mt-6 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600">
                <strong>Reminder:</strong> We send an email reminder 3 days
                before your trial ends. If you forget to cancel, you can request
                a full refund within 14 days of being charged. See our{" "}
                <Link
                  href="/help/account-billing/requesting-a-refund"
                  className="font-semibold text-aivo-purple-600 hover:text-aivo-purple-700"
                >
                  Requesting a Refund
                </Link>{" "}
                article for details.
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
              href="/help/account-billing/managing-your-subscription"
              className="rounded-xl border border-aivo-navy-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-aivo-navy-800">
                Managing Your Subscription
              </h3>
              <p className="mt-1 text-sm text-aivo-navy-500">
                View plans, billing cycle, invoices, and upgrade or downgrade.
              </p>
            </Link>
            <Link
              href="/help/account-billing/updating-payment-info"
              className="rounded-xl border border-aivo-navy-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-aivo-navy-800">
                Updating Payment Info
              </h3>
              <p className="mt-1 text-sm text-aivo-navy-500">
                Change your card, add a backup method, and update billing email.
              </p>
            </Link>
            <Link
              href="/help/account-billing/requesting-a-refund"
              className="rounded-xl border border-aivo-navy-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-aivo-navy-800">
                Requesting a Refund
              </h3>
              <p className="mt-1 text-sm text-aivo-navy-500">
                Eligibility, how to submit a request, and processing timeline.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

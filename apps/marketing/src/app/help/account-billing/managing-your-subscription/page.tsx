import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Managing Your Subscription | Help | AIVO",
  description:
    "Learn how to view your current plan, understand billing cycles, compare plan features, check invoices, and manage your AIVO Learning subscription.",
  openGraph: {
    title: "Managing Your Subscription | AIVO Help",
    description:
      "View your plan, billing cycle, invoices, and understand what happens when you change plans.",
  },
};

export default function ManagingYourSubscriptionPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-medium text-aivo-purple-600 uppercase tracking-wider">
            Account &amp; Billing
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl">
            Managing Your Subscription
          </h1>
          <p className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto">
            Everything you need to know about viewing your plan, understanding
            your billing cycle, and keeping your subscription up to date.
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
                  href="#viewing-your-current-plan"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Viewing Your Current Plan
                </a>
              </li>
              <li>
                <a
                  href="#understanding-your-billing-cycle"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Understanding Your Billing Cycle
                </a>
              </li>
              <li>
                <a
                  href="#plan-comparison"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  What Each Plan Includes
                </a>
              </li>
              <li>
                <a
                  href="#next-billing-date"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Checking Your Next Billing Date
                </a>
              </li>
              <li>
                <a
                  href="#past-invoices"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Viewing Past Invoices
                </a>
              </li>
              <li>
                <a
                  href="#upgrading-your-plan"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Upgrading Your Plan
                </a>
              </li>
              <li>
                <a
                  href="#downgrading-your-plan"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  What Happens When You Downgrade
                </a>
              </li>
            </ul>
          </nav>

          <div className="prose prose-aivo max-w-none">
            {/* Viewing Your Current Plan */}
            <h2
              id="viewing-your-current-plan"
              className="text-2xl font-bold text-aivo-navy-800 mt-0 scroll-mt-24"
            >
              Viewing Your Current Plan
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              To see which plan your account is on and review your subscription
              details, follow these steps:
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
                  Click your profile avatar in the top-right corner of the
                  parent dashboard. A dropdown menu will appear.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  3
                </span>
                <span>
                  Select <strong>Account Settings</strong> from the dropdown
                  menu.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  4
                </span>
                <span>
                  Click the <strong>Subscription</strong> tab in the left
                  sidebar. Your current plan name (Free, Pro, or Premium) will
                  be displayed at the top of the page in a highlighted card,
                  along with your billing frequency (monthly or annual) and the
                  date your plan was activated.
                </span>
              </li>
            </ol>

            {/* Understanding Your Billing Cycle */}
            <h2
              id="understanding-your-billing-cycle"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Understanding Your Billing Cycle
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Your billing cycle begins on the date you first subscribe to a
              paid plan (Pro or Premium) and recurs automatically on the same
              date each month or year, depending on your billing frequency. For
              example, if you subscribe to the Pro plan on March 15, your next
              charge will occur on April 15, and so on.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              If you started with a 14-day free trial of the Pro plan, your
              first billing date is the day after the trial ends. During the
              trial, no charges are made. You will receive an email reminder
              three days before your trial expires, giving you time to cancel if
              you prefer not to continue.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              Annual billing subscribers are charged once per year at the
              discounted annual rate. The annual Pro plan is billed at $24.99
              per month ($299.88 per year), compared to $39.99 per month on
              the monthly plan. You can switch between monthly and annual
              billing at any time from the Subscription tab.
            </p>

            {/* Plan Comparison */}
            <h2
              id="plan-comparison"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              What Each Plan Includes
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO Learning offers three plans designed for different needs.
              Here is what each plan includes:
            </p>

            <div className="mt-6 rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-aivo-navy-800">
                Free Plan
              </h3>
              <p className="mt-1 text-sm font-medium text-aivo-purple-600">
                $0 / month
              </p>
              <ul className="mt-3 space-y-2">
                <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                  <span>1 student profile</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                  <span>2 AI Tutor sessions per day</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                  <span>Basic parent dashboard</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                  <span>Community support</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 rounded-xl border border-aivo-purple-200 bg-white p-6 shadow-sm ring-2 ring-aivo-purple-100">
              <h3 className="text-lg font-bold text-aivo-navy-800">
                Pro Plan
              </h3>
              <p className="mt-1 text-sm font-medium text-aivo-purple-600">
                $39.99 / month &middot; or $24.99 / month billed annually
              </p>
              <ul className="mt-3 space-y-2">
                <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                  <span>Up to 4 student profiles</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                  <span>Unlimited AI Tutor sessions</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                  <span>IEP document upload &amp; goal tracking</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                  <span>Unlimited Homework Helper</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                  <span>Offline mobile access</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                  <span>Priority email support</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                  <span>14-day free trial</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-aivo-navy-800">
                Premium Plan
              </h3>
              <p className="mt-1 text-sm font-medium text-aivo-purple-600">
                $41.99 / month &middot; for schools &amp; districts
              </p>
              <ul className="mt-3 space-y-2">
                <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                  <span>Unlimited student profiles</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                  <span>
                    SIS integration via Clever &amp; ClassLink
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                  <span>District-wide analytics dashboard</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                  <span>Dedicated customer success manager</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                  <span>24/7 phone &amp; chat support</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                  <span>SOC 2 Type II certification</span>
                </li>
              </ul>
            </div>

            {/* Next Billing Date */}
            <h2
              id="next-billing-date"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Checking Your Next Billing Date
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Your next billing date is displayed on the Subscription tab in
              Account Settings. To find it:
            </p>
            <ol className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  1
                </span>
                <span>
                  Navigate to <strong>Account Settings</strong> &rarr;{" "}
                  <strong>Subscription</strong>.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  2
                </span>
                <span>
                  Look for the <strong>Next billing date</strong> field in
                  the plan summary card. The date is displayed in your local
                  time zone alongside the amount that will be charged.
                </span>
              </li>
            </ol>
            <p className="text-aivo-navy-600 leading-relaxed mt-4">
              If you are on an annual plan, this field shows the renewal date
              for your annual subscription. If you are currently in a free
              trial, the field shows the date the trial ends and your first
              charge will occur.
            </p>

            {/* Past Invoices */}
            <h2
              id="past-invoices"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Viewing Past Invoices
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO Learning keeps a complete history of all invoices associated
              with your account. To view and download past invoices:
            </p>
            <ol className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  1
                </span>
                <span>
                  Navigate to <strong>Account Settings</strong> &rarr;{" "}
                  <strong>Billing</strong>.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  2
                </span>
                <span>
                  Scroll down to the <strong>Invoice History</strong> section.
                  Each invoice is listed with the date, amount charged, payment
                  method used (last four digits of your card), and the status
                  (Paid, Pending, or Failed).
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  3
                </span>
                <span>
                  Click the <strong>Download PDF</strong> button next to any
                  invoice to save a copy to your device. Invoices include the
                  plan name, billing period, line-item charges, applicable
                  taxes, and total amount.
                </span>
              </li>
            </ol>

            {/* Upgrading */}
            <h2
              id="upgrading-your-plan"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Upgrading Your Plan
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              You can upgrade from Free to Pro, or from Pro to Premium, at any
              time. When you upgrade:
            </p>
            <ol className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  1
                </span>
                <span>
                  Navigate to <strong>Account Settings</strong> &rarr;{" "}
                  <strong>Subscription</strong>.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  2
                </span>
                <span>
                  Click the <strong>Upgrade Plan</strong> button. A comparison
                  modal will appear showing your current plan and the available
                  upgrade options with pricing.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  3
                </span>
                <span>
                  Select your desired plan and billing frequency (monthly or
                  annual). If you are upgrading from Free to Pro, you will be
                  prompted to enter a payment method.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  4
                </span>
                <span>
                  Click <strong>Confirm Upgrade</strong>. Your new plan takes
                  effect immediately. If you are upgrading mid-cycle, you will
                  be charged a prorated amount for the remaining days in your
                  current billing period.
                </span>
              </li>
            </ol>

            {/* Downgrading */}
            <h2
              id="downgrading-your-plan"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              What Happens When You Downgrade
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              If you downgrade from Pro to Free, or from Premium to Pro, your
              current plan remains active until the end of your current billing
              period. On the day your downgrade takes effect:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Your data is fully preserved.</strong> All student
                  Brain Clone profiles, assessment results, tutor interaction
                  history, IEP progress data, and gamification records remain
                  intact. Nothing is deleted.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Premium features become locked.</strong> Features
                  that are not included in your new plan are locked but not
                  removed. For example, if you downgrade from Pro to Free, your
                  IEP data is preserved but the IEP integration dashboard becomes
                  read-only, and AI Tutor sessions are limited to 2 per day.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Extra student profiles are paused.</strong> If you
                  downgrade from Pro (up to 4 students) to Free (1 student),
                  you will be asked to select which student profile remains
                  active. The other profiles are paused — their data is
                  preserved in full, and they will be automatically reactivated
                  if you upgrade again.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>You can upgrade again at any time.</strong> If you
                  decide to upgrade later, all your data and paused profiles
                  will be restored immediately. You pick up right where you
                  left off.
                </span>
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
              href="/help/account-billing/canceling-your-plan"
              className="rounded-xl border border-aivo-navy-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-aivo-navy-800">
                Canceling Your Plan
              </h3>
              <p className="mt-1 text-sm text-aivo-navy-500">
                Learn what happens when you cancel and how to reactivate.
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

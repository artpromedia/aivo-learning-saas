import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Requesting a Refund | Help | AIVO",
  description:
    "Learn about AIVO Learning's refund policy, eligibility, how to submit a refund request, and what to expect during processing.",
  openGraph: {
    title: "Requesting a Refund | AIVO Help",
    description:
      "Refund eligibility, how to request, and processing timeline.",
  },
};

export default function RequestingARefundPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-medium text-aivo-purple-600 uppercase tracking-wider">
            Account &amp; Billing
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl">
            Requesting a Refund
          </h1>
          <p className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto">
            We want you to be completely satisfied with AIVO Learning. If it is
            not the right fit, here is how to request a refund.
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
                  href="#refund-eligibility"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Refund Eligibility
                </a>
              </li>
              <li>
                <a
                  href="#how-to-request"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  How to Request a Refund
                </a>
              </li>
              <li>
                <a
                  href="#required-information"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Information Required
                </a>
              </li>
              <li>
                <a
                  href="#processing-timeline"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Processing Timeline
                </a>
              </li>
              <li>
                <a
                  href="#partial-refunds"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Partial Month Refunds
                </a>
              </li>
              <li>
                <a
                  href="#after-refund"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  What Happens After a Refund
                </a>
              </li>
              <li>
                <a
                  href="#annual-plans"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Refunds for Annual Plans
                </a>
              </li>
            </ul>
          </nav>

          <div className="prose prose-aivo max-w-none">
            {/* Refund Eligibility */}
            <h2
              id="refund-eligibility"
              className="text-2xl font-bold text-aivo-navy-800 mt-0 scroll-mt-24"
            >
              Refund Eligibility
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO Learning offers a <strong>14-day money-back
              guarantee</strong> on all paid plans. If you are not satisfied
              with your subscription for any reason, you can request a full
              refund within 14 days of your initial charge or most recent
              renewal.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              Refund eligibility includes:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>First-time subscribers:</strong> Full refund within 14
                  days of your first charge after the free trial ends.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Renewal charges:</strong> Full refund within 14 days
                  of any renewal charge (monthly or annual).
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Accidental charges:</strong> If you forgot to cancel
                  before a renewal, contact us and we will process a full
                  refund, regardless of when you reach out.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Technical issues:</strong> If you experienced a
                  service outage or technical problem that prevented you from
                  using AIVO Learning, you may be eligible for a prorated
                  refund. Contact support with details.
                </span>
              </li>
            </ul>
            <div className="mt-6 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600">
                <strong>Note:</strong> Refund requests made more than 14 days
                after a charge are reviewed on a case-by-case basis. We
                always try to find a fair resolution.
              </p>
            </div>

            {/* How to Request */}
            <h2
              id="how-to-request"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              How to Request a Refund
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              There are two ways to submit a refund request:
            </p>

            <h3 className="text-lg font-bold text-aivo-navy-800 mt-8">
              Option 1: From Your Account
            </h3>
            <ol className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  1
                </span>
                <span>
                  Log in at <strong>app.aivolearning.com</strong> and navigate
                  to <strong>Account Settings</strong> &rarr;{" "}
                  <strong>Billing</strong>.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  2
                </span>
                <span>
                  In the Invoice History section, find the charge you want
                  refunded and click the three-dot menu &rarr;{" "}
                  <strong>Request Refund</strong>.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  3
                </span>
                <span>
                  Select a reason for the refund from the dropdown (optional
                  but appreciated), and click <strong>Submit Request</strong>.
                  You will receive a confirmation email with a reference number.
                </span>
              </li>
            </ol>

            <h3 className="text-lg font-bold text-aivo-navy-800 mt-8">
              Option 2: By Email
            </h3>
            <p className="text-aivo-navy-600 leading-relaxed">
              Send an email to{" "}
              <strong>support@aivolearning.com</strong> with the subject line
              &ldquo;Refund Request&rdquo; and include the information listed
              below.
            </p>

            {/* Required Info */}
            <h2
              id="required-information"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Information Required
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              To process your refund as quickly as possible, please include the
              following in your request:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  The email address associated with your AIVO Learning account
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  The date of the charge you are requesting a refund for
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  The amount charged (found in your invoice history or payment
                  confirmation email)
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  The last four digits of the card that was charged
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  The reason for the refund (optional, but helps us improve)
                </span>
              </li>
            </ul>

            {/* Processing Timeline */}
            <h2
              id="processing-timeline"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Processing Timeline
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Here is what to expect after submitting a refund request:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Within 2 business days:</strong> Our billing team
                  reviews your request and sends a confirmation or follow-up
                  email.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Within 5&ndash;10 business days:</strong> The refund
                  is processed and returned to the original payment method.
                  Depending on your bank or card issuer, it may take an
                  additional 1&ndash;3 business days to appear on your
                  statement.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Confirmation email:</strong> You will receive a
                  final email confirming the refund has been issued, including
                  the amount and transaction reference.
                </span>
              </li>
            </ul>

            {/* Partial Refunds */}
            <h2
              id="partial-refunds"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Partial Month Refunds
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              If you cancel your subscription mid-billing-cycle and are outside
              the 14-day refund window, we do not issue partial refunds for the
              remaining days in your billing period. Instead, your access
              continues until the end of the billing period you have already
              paid for.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              However, if you upgraded mid-cycle (for example, from Pro to
              Premium) and want to revert to your previous plan within 14 days
              of the upgrade, we will refund the prorated difference between
              the two plans.
            </p>

            {/* Annual Plans */}
            <h2
              id="annual-plans"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Refunds for Annual Plans
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Annual plan subscribers are eligible for a full refund within 14
              days of their annual charge. If you request a refund after 14
              days but within the first 3 months of your annual subscription,
              we will issue a prorated refund for the remaining months.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              Refund requests made after 3 months into an annual subscription
              are reviewed case by case. In all situations, your access
              continues until the refund is processed.
            </p>

            {/* After Refund */}
            <h2
              id="after-refund"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              What Happens After a Refund
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Once a refund is processed:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  Your subscription is canceled and your account reverts to the
                  Free plan.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  You retain access to 1 student profile and 2 AI Tutor
                  sessions per day on the Free plan.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  All your data, Brain Clone profiles, and gamification progress
                  remain intact. Additional student profiles are paused, not
                  deleted.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  You can re-subscribe to any paid plan at any time and all
                  your data will be restored.
                </span>
              </li>
            </ul>
            <div className="mt-6 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600">
                <strong>Need help?</strong> If you have questions about your
                refund eligibility or the status of a pending refund, email us
                at <strong>support@aivolearning.com</strong> or use the Contact
                Support button below. We respond within 2 business days.
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
          </div>
        </div>
      </section>
    </>
  );
}

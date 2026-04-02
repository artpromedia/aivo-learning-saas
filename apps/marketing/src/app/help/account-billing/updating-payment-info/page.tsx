import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Updating Payment Info | Help | AIVO",
  description:
    "Learn how to update your credit or debit card, add a backup payment method, handle payment failures, and update your billing email on AIVO Learning.",
  openGraph: {
    title: "Updating Payment Info | AIVO Help",
    description:
      "Change your card, add a backup method, and manage billing email.",
  },
};

export default function UpdatingPaymentInfoPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-medium text-aivo-purple-600 uppercase tracking-wider">
            Account &amp; Billing
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl">
            Updating Payment Info
          </h1>
          <p className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto">
            Keep your payment details up to date to ensure uninterrupted access
            to your AIVO Learning subscription.
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
                  href="#updating-your-card"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Updating Your Card
                </a>
              </li>
              <li>
                <a
                  href="#adding-a-backup-method"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Adding a Backup Payment Method
                </a>
              </li>
              <li>
                <a
                  href="#payment-failures"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  What Happens When a Payment Fails
                </a>
              </li>
              <li>
                <a
                  href="#updating-billing-email"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Updating Your Billing Email
                </a>
              </li>
              <li>
                <a
                  href="#accepted-payment-methods"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Accepted Payment Methods
                </a>
              </li>
              <li>
                <a
                  href="#security"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Payment Security
                </a>
              </li>
            </ul>
          </nav>

          <div className="prose prose-aivo max-w-none">
            {/* Updating Your Card */}
            <h2
              id="updating-your-card"
              className="text-2xl font-bold text-aivo-navy-800 mt-0 scroll-mt-24"
            >
              Updating Your Card
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              If your credit or debit card has expired, been replaced, or you
              simply want to switch to a different card, follow these steps:
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
                  Click the <strong>Billing</strong> tab in the left sidebar.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  4
                </span>
                <span>
                  In the <strong>Payment Method</strong> section, click{" "}
                  <strong>Update Card</strong>. A secure form will appear where
                  you can enter your new card number, expiration date, and CVC.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  5
                </span>
                <span>
                  Click <strong>Save Payment Method</strong>. Your new card
                  will be used for all future billing. A confirmation email
                  will be sent to your billing email address.
                </span>
              </li>
            </ol>
            <div className="mt-6 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600">
                <strong>Tip:</strong> Update your card before the expiration
                date to avoid any interruption in service. You can see when
                your card expires in the Payment Method section of the Billing
                tab.
              </p>
            </div>

            {/* Adding a Backup Method */}
            <h2
              id="adding-a-backup-method"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Adding a Backup Payment Method
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              You can add a second payment method that will be automatically
              charged if your primary card fails. This helps prevent any
              disruption to your subscription.
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
                  Below your primary payment method, click{" "}
                  <strong>Add Backup Method</strong>.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  3
                </span>
                <span>
                  Enter your backup card details and click{" "}
                  <strong>Save</strong>. If your primary card is declined during
                  a billing cycle, the backup card will be charged
                  automatically.
                </span>
              </li>
            </ol>
            <p className="text-aivo-navy-600 leading-relaxed mt-4">
              You can remove or swap backup and primary methods at any time from
              the same Billing page. Click the three-dot menu next to any card
              to see options for <strong>Set as Primary</strong>,{" "}
              <strong>Edit</strong>, or <strong>Remove</strong>.
            </p>

            {/* Payment Failures */}
            <h2
              id="payment-failures"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              What Happens When a Payment Fails
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              If a scheduled payment cannot be processed, AIVO Learning follows
              a grace period process to give you time to update your payment
              information:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Day 1:</strong> The payment attempt fails. If you have
                  a backup payment method, it will be charged automatically. If
                  no backup method is on file, you will receive an email
                  notification asking you to update your payment details.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Day 3:</strong> A second payment attempt is made
                  automatically. If it fails again, you will receive another
                  email notification.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Day 7:</strong> A final payment attempt is made. If
                  this attempt also fails, your subscription is paused. You
                  retain access to your data, but premium features are locked
                  and AI Tutor sessions are limited to the Free plan allowance
                  (2 sessions per day).
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>After pause:</strong> Your subscription remains paused
                  until you update your payment method. Once updated, your plan
                  is immediately reactivated and any outstanding balance is
                  charged. No data is ever deleted due to a payment failure.
                </span>
              </li>
            </ul>

            {/* Billing Email */}
            <h2
              id="updating-billing-email"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Updating Your Billing Email
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              By default, billing receipts and payment notifications are sent to
              the email address you used to create your AIVO account. If you
              would like receipts sent to a different email address (for
              example, a shared family email):
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
                  In the <strong>Billing Email</strong> field, enter the new
                  email address where you want to receive billing
                  communications.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  3
                </span>
                <span>
                  Click <strong>Save</strong>. A verification email will be sent
                  to the new address. Click the confirmation link to activate
                  the change. Until confirmed, receipts continue to go to your
                  original email.
                </span>
              </li>
            </ol>

            {/* Accepted Payment Methods */}
            <h2
              id="accepted-payment-methods"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Accepted Payment Methods
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO Learning accepts the following payment methods:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>Visa</span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>Mastercard</span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>American Express</span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>Discover</span>
              </li>
            </ul>
            <p className="text-aivo-navy-600 leading-relaxed mt-4">
              All payments are processed in US Dollars (USD). We do not
              currently support PayPal, bank transfers, or cryptocurrency
              payments. If you need to pay via purchase order (schools and
              districts on the Premium plan), please contact our sales team at{" "}
              <strong>sales@aivolearning.com</strong>.
            </p>

            {/* Payment Security */}
            <h2
              id="security"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Payment Security
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Your payment information is handled with the highest level of
              security. AIVO Learning does not store your full card number on
              our servers. All payment processing is handled by Stripe, a
              PCI-DSS Level 1 certified payment processor. Your card details
              are encrypted end-to-end using TLS 1.3 and are tokenized for
              recurring charges.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              If you ever notice an unauthorized charge, contact our support
              team immediately at{" "}
              <strong>support@aivolearning.com</strong>.
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

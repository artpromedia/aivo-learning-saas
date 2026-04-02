import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Offline Mode Setup | Help | AIVO",
  description:
    "Learn how to enable AIVO's offline mode on Pro and Premium plans so your child can continue learning without an internet connection.",
  openGraph: {
    title: "Offline Mode Setup | AIVO Help",
    description:
      "Download lessons and continue learning offline with AIVO's mobile app.",
  },
};

export default function OfflineModeSetupPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-medium text-aivo-purple-600 uppercase tracking-wider">
            Technical
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl">
            Offline Mode Setup
          </h1>
          <p className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto">
            Download lessons to the AIVO mobile app so your child can keep
            learning even without an internet connection.
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
                  href="#availability"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Offline Mode Availability
                </a>
              </li>
              <li>
                <a
                  href="#enabling"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Enabling Offline Mode
                </a>
              </li>
              <li>
                <a
                  href="#downloaded-content"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  What Content Is Downloaded
                </a>
              </li>
              <li>
                <a
                  href="#storage"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Storage Requirements
                </a>
              </li>
              <li>
                <a
                  href="#syncing"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Syncing When You Reconnect
                </a>
              </li>
              <li>
                <a
                  href="#limitations"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Offline Mode Limitations
                </a>
              </li>
              <li>
                <a
                  href="#manual-sync"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Manual Sync
                </a>
              </li>
            </ul>
          </nav>

          <div className="prose prose-aivo max-w-none">
            {/* Availability */}
            <h2
              id="availability"
              className="text-2xl font-bold text-aivo-navy-800 mt-0 scroll-mt-24"
            >
              Offline Mode Availability
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Offline mode is available on <strong>Pro</strong> and{" "}
              <strong>Premium</strong> plans only. It is supported on the AIVO
              mobile app for iOS and Android. Offline mode is not available on
              the web version.
            </p>
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-aivo-navy-800">
                  Pro Plan
                </h3>
                <p className="mt-2 text-sm text-aivo-navy-600">
                  Offline mode included. Download up to 50 activities per
                  subject for up to 4 student profiles.
                </p>
              </div>
              <div className="rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-aivo-navy-800">
                  Premium Plan
                </h3>
                <p className="mt-2 text-sm text-aivo-navy-600">
                  Offline mode included. Download up to 50 activities per
                  subject for unlimited student profiles. Prioritized content
                  refresh for school and district accounts.
                </p>
              </div>
            </div>
            <div className="mt-6 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600">
                <strong>Free plan users:</strong> Offline mode is not available
                on the Free plan. You can{" "}
                <Link
                  href="/help/account-billing/managing-your-subscription"
                  className="text-aivo-purple-600 underline"
                >
                  upgrade your subscription
                </Link>{" "}
                to unlock offline learning.
              </p>
            </div>

            {/* Enabling */}
            <h2
              id="enabling"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Enabling Offline Mode
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              To enable offline mode on the AIVO mobile app:
            </p>
            <ol className="mt-4 space-y-4">
              <li className="flex items-start gap-4 text-aivo-navy-600">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-sm font-bold text-aivo-purple-700">
                  1
                </span>
                <span>
                  Open the AIVO app and tap the <strong>Settings</strong> icon
                  (gear icon) in the bottom navigation.
                </span>
              </li>
              <li className="flex items-start gap-4 text-aivo-navy-600">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-sm font-bold text-aivo-purple-700">
                  2
                </span>
                <span>
                  Scroll down to <strong>Offline Mode</strong> and tap to open.
                </span>
              </li>
              <li className="flex items-start gap-4 text-aivo-navy-600">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-sm font-bold text-aivo-purple-700">
                  3
                </span>
                <span>
                  Toggle <strong>Enable Offline Mode</strong> to on. The app
                  will begin downloading your next lesson queue while connected
                  to the internet.
                </span>
              </li>
            </ol>
            <div className="mt-6 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600">
                <strong>Tip:</strong> We recommend enabling offline mode while
                connected to Wi-Fi. Downloading over cellular data may use a
                significant amount of your mobile data allowance.
              </p>
            </div>

            {/* Downloaded Content */}
            <h2
              id="downloaded-content"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              What Content Is Downloaded
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              When offline mode is enabled, AIVO automatically downloads the
              following content for each student profile:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Lesson queue:</strong> The next set of activities
                  queued for each subject, based on the student&rsquo;s current
                  progress and Brain Clone recommendations.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Tutor context:</strong> Essential AI Tutor
                  personality and subject knowledge so the tutor can guide
                  your child through downloaded activities.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Up to 50 activities per subject.</strong> This
                  typically provides several days of learning material for each
                  subject area.
                </span>
              </li>
            </ul>

            {/* Storage */}
            <h2
              id="storage"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Storage Requirements
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Offline content requires additional storage on your device beyond
              the base app installation:
            </p>
            <div className="mt-6 overflow-hidden rounded-xl border border-aivo-navy-100">
              <table className="w-full text-sm text-left text-aivo-navy-600">
                <thead>
                  <tr className="bg-aivo-navy-50">
                    <th className="px-4 py-3 font-semibold text-aivo-navy-800">
                      Configuration
                    </th>
                    <th className="px-4 py-3 font-semibold text-aivo-navy-800">
                      Estimated Storage
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-aivo-navy-100">
                  <tr>
                    <td className="px-4 py-3">1 student, 1-2 subjects</td>
                    <td className="px-4 py-3">100-150 MB</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">1 student, all 5 subjects</td>
                    <td className="px-4 py-3">200-300 MB</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">4 students, all subjects</td>
                    <td className="px-4 py-3">400-500 MB</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-aivo-navy-600 leading-relaxed mt-4">
              You can check your current offline storage usage in{" "}
              <strong>Settings &rarr; Offline Mode &rarr; Storage</strong>. To
              free up space, you can remove downloaded content for individual
              subjects.
            </p>

            {/* Syncing */}
            <h2
              id="syncing"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Syncing When You Reconnect
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              When your device reconnects to the internet, AIVO automatically
              syncs all offline progress:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Automatic sync:</strong> Completed activities,
                  scores, and progress data upload to the cloud as soon as a
                  connection is detected.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Conflict resolution:</strong> If the same activity was
                  completed both online (on another device) and offline, the
                  most recent completion is used. No data is lost.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Fresh content download:</strong> After syncing, the
                  app automatically downloads the next set of activities to
                  keep your offline queue full.
                </span>
              </li>
            </ul>

            {/* Limitations */}
            <h2
              id="limitations"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Offline Mode Limitations
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              While offline mode covers most everyday learning, some features
              require an internet connection:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>No new AI Tutor sessions:</strong> Live, open-ended
                  AI Tutor conversations require a connection. Pre-downloaded
                  guided activities still work offline.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>No photo or file upload:</strong> Activities that
                  require uploading images (e.g., handwriting recognition) are
                  unavailable offline.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>No real-time sync:</strong> Progress and dashboard
                  updates for parents won&rsquo;t appear until the device
                  reconnects and syncs.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>No IEP document upload or sharing:</strong> IEP
                  features require a connection to process documents and
                  generate secure links.
                </span>
              </li>
            </ul>

            {/* Manual Sync */}
            <h2
              id="manual-sync"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Manual Sync
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              If you want to force a sync before it happens automatically:
            </p>
            <ol className="mt-4 space-y-4">
              <li className="flex items-start gap-4 text-aivo-navy-600">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-sm font-bold text-aivo-purple-700">
                  1
                </span>
                <span>
                  Make sure you&rsquo;re connected to the internet.
                </span>
              </li>
              <li className="flex items-start gap-4 text-aivo-navy-600">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-sm font-bold text-aivo-purple-700">
                  2
                </span>
                <span>
                  Go to{" "}
                  <strong>Settings &rarr; Offline Mode &rarr; Sync Now</strong>.
                </span>
              </li>
              <li className="flex items-start gap-4 text-aivo-navy-600">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-sm font-bold text-aivo-purple-700">
                  3
                </span>
                <span>
                  The app will upload all pending progress and download fresh
                  activities. A progress indicator shows the sync status.
                </span>
              </li>
            </ol>
            <div className="mt-6 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600">
                <strong>Tip:</strong> Trigger a manual sync the night before a
                road trip or any time you know you&rsquo;ll be without internet.
                This ensures your child has the freshest content available.
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
              href="/help/technical/troubleshooting-login"
              className="rounded-xl border border-aivo-navy-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-aivo-navy-800">
                Troubleshooting Login Issues
              </h3>
              <p className="mt-1 text-sm text-aivo-navy-500">
                Fix common login problems including password resets and 2FA.
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

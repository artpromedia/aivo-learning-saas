import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "System Requirements | Help | AIVO",
  description:
    "Check browser versions, internet speed, mobile app requirements, and accessibility support for AIVO Learning — including screen readers, keyboard navigation, and supported devices.",
  openGraph: {
    title: "System Requirements | AIVO Help",
    description:
      "Minimum browser, internet, and device requirements for AIVO Learning on web and mobile.",
  },
};

export default function SystemRequirementsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-medium text-aivo-purple-600 uppercase tracking-wider">
            Technical
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl">
            System Requirements
          </h1>
          <p className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto">
            Make sure your browser, device, and internet connection meet the
            requirements for the best AIVO Learning experience.
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
                  href="#browsers"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Supported Browsers
                </a>
              </li>
              <li>
                <a
                  href="#internet"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Internet Speed
                </a>
              </li>
              <li>
                <a
                  href="#mobile"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Mobile App Requirements
                </a>
              </li>
              <li>
                <a
                  href="#screen-sizes"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Recommended Screen Sizes
                </a>
              </li>
              <li>
                <a
                  href="#accessibility"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Accessibility Technology Support
                </a>
              </li>
              <li>
                <a
                  href="#devices"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Tested and Supported Devices
                </a>
              </li>
            </ul>
          </nav>

          <div className="prose prose-aivo max-w-none">
            {/* Browsers */}
            <h2
              id="browsers"
              className="text-2xl font-bold text-aivo-navy-800 mt-0 scroll-mt-24"
            >
              Supported Browsers
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO Learning works best in modern, evergreen browsers. We
              recommend keeping your browser up to date for optimal performance
              and security.
            </p>
            <div className="mt-6 overflow-hidden rounded-xl border border-aivo-navy-100">
              <table className="w-full text-sm text-left text-aivo-navy-600">
                <thead>
                  <tr className="bg-aivo-navy-50">
                    <th className="px-4 py-3 font-semibold text-aivo-navy-800">
                      Browser
                    </th>
                    <th className="px-4 py-3 font-semibold text-aivo-navy-800">
                      Minimum Version
                    </th>
                    <th className="px-4 py-3 font-semibold text-aivo-navy-800">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-aivo-navy-100">
                  <tr>
                    <td className="px-4 py-3">Google Chrome</td>
                    <td className="px-4 py-3">90+</td>
                    <td className="px-4 py-3 text-green-600 font-medium">
                      Fully supported
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Apple Safari</td>
                    <td className="px-4 py-3">15+</td>
                    <td className="px-4 py-3 text-green-600 font-medium">
                      Fully supported
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Mozilla Firefox</td>
                    <td className="px-4 py-3">90+</td>
                    <td className="px-4 py-3 text-green-600 font-medium">
                      Fully supported
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Microsoft Edge</td>
                    <td className="px-4 py-3">90+</td>
                    <td className="px-4 py-3 text-green-600 font-medium">
                      Fully supported
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Internet Explorer 11</td>
                    <td className="px-4 py-3">—</td>
                    <td className="px-4 py-3 text-red-600 font-medium">
                      Not supported
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-aivo-navy-600 leading-relaxed mt-4">
              JavaScript must be enabled for AIVO to function. If your browser
              has JavaScript disabled, you&rsquo;ll see a message prompting
              you to enable it.
            </p>

            {/* Internet Speed */}
            <h2
              id="internet"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Internet Speed
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO Learning requires an active internet connection for all
              online features. Here are the speed requirements:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Minimum:</strong> 1 Mbps download speed. This is
                  sufficient for text-based AI Tutor sessions, dashboard
                  navigation, and progress reports.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Recommended:</strong> 5 Mbps download speed. This
                  ensures smooth performance for interactive learning
                  activities, real-time tutor sessions with visual content,
                  and simultaneous usage by multiple students.
                </span>
              </li>
            </ul>
            <div className="mt-6 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600">
                <strong>Tip:</strong> If you experience slow loading or
                buffering, try running a speed test at{" "}
                <strong>fast.com</strong> or{" "}
                <strong>speedtest.net</strong> to check your connection.
                You can also enable{" "}
                <Link
                  href="/help/technical/offline-mode-setup"
                  className="text-aivo-purple-600 underline"
                >
                  Offline Mode
                </Link>{" "}
                on Pro and Premium plans to reduce reliance on internet speed.
              </p>
            </div>

            {/* Mobile App */}
            <h2
              id="mobile"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Mobile App Requirements
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO Learning offers native apps for iOS and Android:
            </p>
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-aivo-navy-800">
                  iOS (iPhone and iPad)
                </h3>
                <ul className="mt-3 space-y-2">
                  <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                    <span>iOS 15.0 or later</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                    <span>200 MB free storage (app + offline content cache)</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                    <span>Available on the App Store</span>
                  </li>
                </ul>
              </div>
              <div className="rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-aivo-navy-800">
                  Android
                </h3>
                <ul className="mt-3 space-y-2">
                  <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                    <span>Android 10 (API level 29) or later</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                    <span>200 MB free storage (app + offline content cache)</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                    <span>Available on Google Play</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Screen Sizes */}
            <h2
              id="screen-sizes"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Recommended Screen Sizes
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO Learning is fully responsive and adapts to all screen sizes.
              For the best experience:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Phone:</strong> 375px width or wider (iPhone SE and
                  up). Full functionality is available, with a mobile-optimized
                  layout.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Tablet:</strong> 768px width or wider. Ideal for
                  interactive activities and tutor sessions with side panels.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Laptop / Desktop:</strong> 1024px width or wider
                  (recommended). Provides the most comfortable experience with
                  full dashboards, side-by-side views, and multi-panel
                  layouts.
                </span>
              </li>
            </ul>

            {/* Accessibility */}
            <h2
              id="accessibility"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Accessibility Technology Support
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO Learning is built with accessibility as a core priority. We
              support the following assistive technologies:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Screen readers:</strong> NVDA (Windows), JAWS
                  (Windows), VoiceOver (macOS and iOS), TalkBack (Android). All
                  interactive elements include proper ARIA labels and live
                  region announcements for AI Tutor messages.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Keyboard navigation:</strong> All features are
                  fully accessible via keyboard. Tab through interactive
                  elements, use Enter or Space to activate buttons, and use
                  arrow keys within menus and session interfaces.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Voice control:</strong> Compatible with system-level
                  voice control on macOS, iOS, and Android for hands-free
                  navigation.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>High contrast and zoom:</strong> Respects system-level
                  high-contrast modes and supports browser-level zoom up to
                  200% without layout breakage.
                </span>
              </li>
            </ul>

            {/* Devices */}
            <h2
              id="devices"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Tested and Supported Devices
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO Learning is tested and supported on the following device
              categories:
            </p>
            <div className="mt-6 overflow-hidden rounded-xl border border-aivo-navy-100">
              <table className="w-full text-sm text-left text-aivo-navy-600">
                <thead>
                  <tr className="bg-aivo-navy-50">
                    <th className="px-4 py-3 font-semibold text-aivo-navy-800">
                      Device Type
                    </th>
                    <th className="px-4 py-3 font-semibold text-aivo-navy-800">
                      Examples
                    </th>
                    <th className="px-4 py-3 font-semibold text-aivo-navy-800">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-aivo-navy-100">
                  <tr>
                    <td className="px-4 py-3">Laptop</td>
                    <td className="px-4 py-3">MacBook, Chromebook, Windows laptop</td>
                    <td className="px-4 py-3 text-green-600 font-medium">
                      Fully supported
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Desktop</td>
                    <td className="px-4 py-3">iMac, Windows PC</td>
                    <td className="px-4 py-3 text-green-600 font-medium">
                      Fully supported
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Tablet</td>
                    <td className="px-4 py-3">iPad, Android tablet, Surface</td>
                    <td className="px-4 py-3 text-green-600 font-medium">
                      Fully supported
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Phone</td>
                    <td className="px-4 py-3">iPhone, Android phone</td>
                    <td className="px-4 py-3 text-green-600 font-medium">
                      Fully supported
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-6 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600">
                <strong>Chromebooks:</strong> AIVO Learning works fully in
                Chrome on Chromebooks. The Android app can also be installed
                from Google Play on Chromebooks that support Android apps.
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
              href="/help/technical/troubleshooting-login"
              className="rounded-xl border border-aivo-navy-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-aivo-navy-800">
                Troubleshooting Login Issues
              </h3>
              <p className="mt-1 text-sm text-aivo-navy-500">
                Fix common login problems including password resets and 2FA
                issues.
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

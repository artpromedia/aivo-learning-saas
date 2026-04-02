import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Browser Compatibility | Help | AIVO",
  description:
    "Check which browsers are fully supported by AIVO Learning, learn about known issues with older browsers, and troubleshoot browser-specific problems.",
  openGraph: {
    title: "Browser Compatibility | AIVO Help",
    description:
      "Supported browsers, known issues, and how to fix browser-specific problems on AIVO Learning.",
  },
};

export default function BrowserCompatibilityPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-medium text-aivo-purple-600 uppercase tracking-wider">
            Technical
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl">
            Browser Compatibility
          </h1>
          <p className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto">
            Find out which browsers work best with AIVO Learning and how to
            resolve browser-specific issues.
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
                  href="#supported-browsers"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Fully Supported Browsers
                </a>
              </li>
              <li>
                <a
                  href="#known-issues"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Known Issues with Older Browsers
                </a>
              </li>
              <li>
                <a
                  href="#check-version"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  How to Check Your Browser Version
                </a>
              </li>
              <li>
                <a
                  href="#update-browser"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  How to Update Your Browser
                </a>
              </li>
              <li>
                <a
                  href="#webgl"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  WebGL Requirements
                </a>
              </li>
              <li>
                <a
                  href="#javascript"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  JavaScript Must Be Enabled
                </a>
              </li>
              <li>
                <a
                  href="#extensions"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Extensions That May Cause Issues
                </a>
              </li>
              <li>
                <a
                  href="#report-bug"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  How to Report a Browser-Specific Bug
                </a>
              </li>
            </ul>
          </nav>

          <div className="prose prose-aivo max-w-none">
            {/* Supported Browsers */}
            <h2
              id="supported-browsers"
              className="text-2xl font-bold text-aivo-navy-800 mt-0 scroll-mt-24"
            >
              Fully Supported Browsers
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO Learning is tested and fully supported on the following
              browsers. We recommend always using the latest version for the
              best experience.
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
                      Platforms
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-aivo-navy-100">
                  <tr>
                    <td className="px-4 py-3">Google Chrome</td>
                    <td className="px-4 py-3">90+</td>
                    <td className="px-4 py-3">Windows, macOS, ChromeOS, Android</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Apple Safari</td>
                    <td className="px-4 py-3">15+</td>
                    <td className="px-4 py-3">macOS, iOS, iPadOS</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Mozilla Firefox</td>
                    <td className="px-4 py-3">90+</td>
                    <td className="px-4 py-3">Windows, macOS, Linux</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Microsoft Edge</td>
                    <td className="px-4 py-3">90+</td>
                    <td className="px-4 py-3">Windows, macOS</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Known Issues */}
            <h2
              id="known-issues"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Known Issues with Older Browsers
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Some older or discontinued browsers have known compatibility
              issues with AIVO Learning:
            </p>
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                <h3 className="text-base font-bold text-red-800">
                  Internet Explorer 11
                </h3>
                <p className="mt-2 text-sm text-red-700">
                  Not supported. Internet Explorer has been retired by
                  Microsoft. AIVO will not load in IE11. Please switch to
                  Microsoft Edge, which is pre-installed on Windows 10 and 11.
                </p>
              </div>
              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6">
                <h3 className="text-base font-bold text-yellow-800">
                  Safari 14 and Earlier
                </h3>
                <p className="mt-2 text-sm text-yellow-700">
                  Limited support. Some interactive activities and animations
                  may not render correctly. The AI Tutor chat interface may
                  experience layout issues. We strongly recommend updating to
                  Safari 15 or later.
                </p>
              </div>
              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6">
                <h3 className="text-base font-bold text-yellow-800">
                  Chrome and Firefox Below Version 90
                </h3>
                <p className="mt-2 text-sm text-yellow-700">
                  Partial support. Core features may work, but you could
                  encounter visual bugs, slower performance, or missing
                  accessibility features. Update for the best experience.
                </p>
              </div>
            </div>

            {/* Check Version */}
            <h2
              id="check-version"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              How to Check Your Browser Version
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Not sure which browser version you&rsquo;re running? Here&rsquo;s
              how to check:
            </p>
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-aivo-navy-800">
                  Chrome
                </h3>
                <p className="mt-2 text-sm text-aivo-navy-600">
                  Click the three-dot menu (top-right) &rarr;{" "}
                  <strong>Help</strong> &rarr;{" "}
                  <strong>About Google Chrome</strong>. Your version number is
                  displayed at the top.
                </p>
              </div>
              <div className="rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-aivo-navy-800">
                  Safari
                </h3>
                <p className="mt-2 text-sm text-aivo-navy-600">
                  In the menu bar, click <strong>Safari</strong> &rarr;{" "}
                  <strong>About Safari</strong>. On iOS, your Safari version is
                  tied to your iOS version &mdash; go to{" "}
                  <strong>Settings &rarr; General &rarr; About</strong>.
                </p>
              </div>
              <div className="rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-aivo-navy-800">
                  Firefox
                </h3>
                <p className="mt-2 text-sm text-aivo-navy-600">
                  Click the hamburger menu (three lines, top-right) &rarr;{" "}
                  <strong>Help</strong> &rarr;{" "}
                  <strong>About Firefox</strong>.
                </p>
              </div>
              <div className="rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-aivo-navy-800">
                  Edge
                </h3>
                <p className="mt-2 text-sm text-aivo-navy-600">
                  Click the three-dot menu (top-right) &rarr;{" "}
                  <strong>Help and feedback</strong> &rarr;{" "}
                  <strong>About Microsoft Edge</strong>.
                </p>
              </div>
            </div>

            {/* Update Browser */}
            <h2
              id="update-browser"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              How to Update Your Browser
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Most modern browsers update automatically. If yours hasn&rsquo;t,
              follow these steps:
            </p>
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-aivo-navy-800">
                  Chrome
                </h3>
                <ol className="mt-2 space-y-1 text-sm text-aivo-navy-600">
                  <li>
                    1. Go to <strong>About Google Chrome</strong> (see above).
                  </li>
                  <li>
                    2. Chrome will automatically check for updates and install
                    them.
                  </li>
                  <li>
                    3. Click <strong>Relaunch</strong> to restart the browser.
                  </li>
                </ol>
              </div>
              <div className="rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-aivo-navy-800">
                  Firefox
                </h3>
                <ol className="mt-2 space-y-1 text-sm text-aivo-navy-600">
                  <li>
                    1. Go to <strong>About Firefox</strong> (see above).
                  </li>
                  <li>
                    2. Firefox will download and prepare the update.
                  </li>
                  <li>
                    3. Click{" "}
                    <strong>Restart to Update Firefox</strong>.
                  </li>
                </ol>
              </div>
              <div className="rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-aivo-navy-800">
                  Safari
                </h3>
                <ol className="mt-2 space-y-1 text-sm text-aivo-navy-600">
                  <li>
                    1. Safari updates are included with macOS updates. Open{" "}
                    <strong>System Settings &rarr; General &rarr; Software Update</strong>.
                  </li>
                  <li>
                    2. Install any available macOS update.
                  </li>
                  <li>
                    3. On iOS, go to{" "}
                    <strong>Settings &rarr; General &rarr; Software Update</strong>.
                  </li>
                </ol>
              </div>
              <div className="rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-aivo-navy-800">
                  Edge
                </h3>
                <ol className="mt-2 space-y-1 text-sm text-aivo-navy-600">
                  <li>
                    1. Go to <strong>About Microsoft Edge</strong> (see above).
                  </li>
                  <li>
                    2. Edge will automatically download and install updates.
                  </li>
                  <li>
                    3. Click <strong>Restart</strong> to apply.
                  </li>
                </ol>
              </div>
            </div>

            {/* WebGL */}
            <h2
              id="webgl"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              WebGL Requirements
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Some AIVO interactive activities use WebGL for animations and
              visual content. WebGL is enabled by default in all supported
              browsers. If you see a &ldquo;WebGL not supported&rdquo; error:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Update your browser</strong> to the latest version.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Update your graphics drivers.</strong> On Windows,
                  check for updates through Device Manager or your GPU
                  manufacturer&rsquo;s website.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Disable hardware acceleration override.</strong> In
                  Chrome, go to{" "}
                  <strong>Settings &rarr; System</strong> and make sure
                  &ldquo;Use hardware acceleration when available&rdquo; is
                  turned on.
                </span>
              </li>
            </ul>

            {/* JavaScript */}
            <h2
              id="javascript"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              JavaScript Must Be Enabled
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO Learning requires JavaScript to function. JavaScript is
              enabled by default in all modern browsers. If it has been
              disabled:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Chrome:</strong> Settings &rarr; Privacy and security
                  &rarr; Site settings &rarr; JavaScript &rarr; toggle to
                  &ldquo;Allowed.&rdquo;
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Safari:</strong> Safari menu &rarr; Preferences
                  &rarr; Security &rarr; check &ldquo;Enable
                  JavaScript.&rdquo;
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Firefox:</strong> Type{" "}
                  <code className="bg-aivo-navy-100 px-1.5 py-0.5 rounded text-xs">
                    about:config
                  </code>{" "}
                  in the address bar, search for{" "}
                  <code className="bg-aivo-navy-100 px-1.5 py-0.5 rounded text-xs">
                    javascript.enabled
                  </code>{" "}
                  , and set it to <strong>true</strong>.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Edge:</strong> Settings &rarr; Cookies and site
                  permissions &rarr; JavaScript &rarr; toggle to
                  &ldquo;Allowed.&rdquo;
                </span>
              </li>
            </ul>

            {/* Extensions */}
            <h2
              id="extensions"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Extensions That May Cause Issues
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Certain browser extensions can interfere with AIVO&rsquo;s
              functionality. If you&rsquo;re experiencing unexpected behavior,
              try disabling the following types of extensions:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Ad blockers</strong> (e.g., uBlock Origin, AdBlock
                  Plus) &mdash; may block AIVO&rsquo;s content delivery or
                  analytics. Try adding AIVO to your ad blocker&rsquo;s
                  allowlist.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Privacy / script blockers</strong> (e.g., NoScript,
                  Privacy Badger) &mdash; may prevent JavaScript from running,
                  which AIVO requires.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Translation extensions</strong> &mdash; may interfere
                  with AIVO&rsquo;s AI Tutor text rendering and cause
                  formatting issues.
                </span>
              </li>
            </ul>
            <div className="mt-6 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600">
                <strong>Quick test:</strong> Open AIVO in an{" "}
                <strong>incognito / private browsing</strong> window (which
                disables most extensions by default). If everything works
                there, one of your extensions is likely causing the issue.
              </p>
            </div>

            {/* Report Bug */}
            <h2
              id="report-bug"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              How to Report a Browser-Specific Bug
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              If you encounter a bug that only appears in a specific browser,
              we want to know about it. When filing a report, please include:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>Browser name and version number</span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>Operating system (e.g., Windows 11, macOS Sonoma, ChromeOS)</span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>A description of what happened vs. what you expected</span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>A screenshot or screen recording, if possible</span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>Whether the issue also occurs in an incognito/private window</span>
              </li>
            </ul>
            <p className="text-aivo-navy-600 leading-relaxed mt-4">
              Submit your report through our{" "}
              <Link
                href="/contact"
                className="text-aivo-purple-600 underline"
              >
                contact page
              </Link>{" "}
              and our team will investigate.
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
          </div>
        </div>
      </section>
    </>
  );
}

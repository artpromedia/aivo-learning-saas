import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Uploading IEP Documents | Help | AIVO",
  description:
    "Learn how to upload your student's IEP document to AIVO Learning, what the AI extracts, how to verify and edit goals, and how your data is protected.",
  openGraph: {
    title: "Uploading IEP Documents | AIVO Help",
    description:
      "Upload IEP documents so AIVO can align curriculum, accommodations, and progress tracking to your student's goals.",
  },
};

export default function UploadingIepDocumentsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-medium text-aivo-purple-600 uppercase tracking-wider">
            IEP Support
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl">
            Uploading IEP Documents
          </h1>
          <p className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto">
            Upload your student&rsquo;s Individualized Education Program to
            AIVO and let the AI automatically align curriculum,
            accommodations, and progress tracking to their specific goals.
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
                  href="#how-to-upload"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  How to Upload an IEP
                </a>
              </li>
              <li>
                <a
                  href="#supported-formats"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Supported Formats and File Size
                </a>
              </li>
              <li>
                <a
                  href="#what-ai-extracts"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  What the AI Extracts
                </a>
              </li>
              <li>
                <a
                  href="#processing-time"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Processing Time
                </a>
              </li>
              <li>
                <a
                  href="#verifying-goals"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Verifying Extracted Goals
                </a>
              </li>
              <li>
                <a
                  href="#editing-goals"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Manually Editing or Adding Goals
                </a>
              </li>
              <li>
                <a
                  href="#re-uploading"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Re-Uploading an Updated IEP
                </a>
              </li>
              <li>
                <a
                  href="#data-security"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Data Security
                </a>
              </li>
            </ul>
          </nav>

          <div className="prose prose-aivo max-w-none">
            {/* How to Upload */}
            <h2
              id="how-to-upload"
              className="text-2xl font-bold text-aivo-navy-800 mt-0 scroll-mt-24"
            >
              How to Upload an IEP
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              IEP uploads are available on Pro and Premium plans. Follow these
              steps to upload your student&rsquo;s IEP document:
            </p>
            <ol className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  1
                </span>
                <span>
                  From the parent dashboard, click the student&rsquo;s name to
                  open their <strong>Student Profile</strong>.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  2
                </span>
                <span>
                  Navigate to the <strong>IEP</strong> tab. If this is the
                  first upload, you&rsquo;ll see a prompt with an upload area.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  3
                </span>
                <span>
                  Click <strong>Upload IEP Document</strong> or drag and drop
                  the file into the upload area.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  4
                </span>
                <span>
                  Confirm the upload. AIVO will begin processing the document
                  immediately.
                </span>
              </li>
            </ol>

            {/* Supported Formats */}
            <h2
              id="supported-formats"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Supported Formats and File Size
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO currently supports <strong>PDF</strong> files for IEP
              uploads. This covers the vast majority of IEP documents provided
              by school districts, which are typically generated as PDF exports
              from their special education management systems.
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Accepted format:</strong> PDF (.pdf)
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Maximum file size:</strong> 25 MB
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Scanned documents:</strong> Scanned PDFs are
                  supported — AIVO uses OCR (optical character recognition) to
                  extract text. For best results, ensure the scan is clear and
                  not rotated.
                </span>
              </li>
            </ul>
            <div className="mt-6 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600">
                <strong>Tip:</strong> If your school provides the IEP in a
                Word document (.docx), you can convert it to PDF using your
                operating system&rsquo;s built-in print-to-PDF feature before
                uploading.
              </p>
            </div>

            {/* What AI Extracts */}
            <h2
              id="what-ai-extracts"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              What the AI Extracts
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              When you upload an IEP, AIVO&rsquo;s AI parses the document and
              extracts the following information:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Annual goals and short-term objectives:</strong> Each
                  measurable goal listed in the IEP, along with any benchmarks
                  or objectives tied to that goal.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Accommodations:</strong> Classroom and testing
                  accommodations such as extended time, text-to-speech,
                  simplified language, visual supports, preferential seating
                  notes, and reduced assignment length.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Service minutes:</strong> The type and frequency of
                  related services (e.g., speech therapy 30 min/week,
                  occupational therapy 45 min/week).
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Present levels of performance:</strong> The
                  student&rsquo;s current academic and functional performance
                  levels as described in the IEP, which AIVO uses to calibrate
                  the initial difficulty for AI Tutor sessions.
                </span>
              </li>
            </ul>
            <p className="text-aivo-navy-600 leading-relaxed mt-4">
              Extracted data is used to automatically configure your
              student&rsquo;s Brain Clone profile, set accommodation
              preferences, and align AI Tutor sessions with IEP goals.
            </p>

            {/* Processing Time */}
            <h2
              id="processing-time"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Processing Time
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              IEP processing typically takes <strong>2 to 5 minutes</strong>,
              depending on the length and complexity of the document. During
              processing, you&rsquo;ll see a progress indicator on the IEP tab.
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  You can navigate away from the page — processing continues
                  in the background.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  You&rsquo;ll receive an email and push notification (if
                  enabled) when processing is complete.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  Scanned PDFs may take slightly longer due to OCR processing.
                </span>
              </li>
            </ul>

            {/* Verifying Goals */}
            <h2
              id="verifying-goals"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Verifying Extracted Goals
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              After processing completes, AIVO displays all extracted goals and
              accommodations on the IEP tab for your review. We strongly
              recommend verifying this information before your student begins
              IEP-aligned sessions.
            </p>
            <ol className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  1
                </span>
                <span>
                  Navigate to <strong>Student Profile &rarr; IEP</strong>.
                  You&rsquo;ll see a list of extracted goals, each displayed as
                  a card with the goal text, subject area, and any associated
                  benchmarks.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  2
                </span>
                <span>
                  Compare each extracted goal against your student&rsquo;s
                  official IEP document. Check that the goal text, subject
                  classification, and benchmarks are accurate.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  3
                </span>
                <span>
                  Review the <strong>Accommodations</strong> section to confirm
                  that all accommodations were correctly identified.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  4
                </span>
                <span>
                  Once you&rsquo;ve reviewed everything, click{" "}
                  <strong>Confirm Goals</strong> to activate IEP-aligned
                  learning. You can always edit goals later.
                </span>
              </li>
            </ol>

            {/* Editing Goals */}
            <h2
              id="editing-goals"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Manually Editing or Adding Goals
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              If the AI missed a goal, misclassified a subject area, or you
              need to add a goal that isn&rsquo;t in the IEP document (such as
              a parent-identified priority), you can edit or add goals manually.
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Edit a goal:</strong> Click the pencil icon on any
                  goal card to modify the goal text, subject area, benchmarks,
                  or target date.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Add a goal:</strong> Click{" "}
                  <strong>+ Add Goal</strong> at the bottom of the goals list.
                  Enter the goal text, select a subject area, add optional
                  benchmarks, and set a target date.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Remove a goal:</strong> Click the trash icon on a
                  goal card, then confirm. Removed goals can be restored within
                  30 days from the <strong>Archived Goals</strong> section.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Edit accommodations:</strong> In the Accommodations
                  section, toggle specific accommodations on or off, or add
                  custom ones using the <strong>+ Add Accommodation</strong>{" "}
                  button.
                </span>
              </li>
            </ul>

            {/* Re-Uploading */}
            <h2
              id="re-uploading"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Re-Uploading an Updated IEP
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              IEPs are typically reviewed and updated annually. When your
              student receives an updated IEP after their annual review, you
              should upload the new document to keep AIVO aligned with the
              latest goals and accommodations.
            </p>
            <ol className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  1
                </span>
                <span>
                  Navigate to <strong>Student Profile &rarr; IEP</strong> and
                  click <strong>Upload Updated IEP</strong>.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  2
                </span>
                <span>
                  Upload the new PDF. AIVO will process it and display a
                  side-by-side comparison of the previous goals and the newly
                  extracted goals.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  3
                </span>
                <span>
                  Review the changes: new goals added, goals continued from the
                  previous IEP, and goals that have been removed or
                  mastered.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-xs font-bold text-aivo-purple-700">
                  4
                </span>
                <span>
                  Click <strong>Confirm Updated Goals</strong>. Progress data
                  from continued goals is preserved; retired goals are moved to
                  the <strong>Goal History</strong> archive.
                </span>
              </li>
            </ol>
            <div className="mt-6 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600">
                <strong>Note:</strong> Previous IEP documents are retained in
                your account&rsquo;s document history. You can view or download
                any previously uploaded IEP from the{" "}
                <strong>Document History</strong> section of the IEP tab.
              </p>
            </div>

            {/* Data Security */}
            <h2
              id="data-security"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Data Security
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              IEP documents contain highly sensitive educational and health
              information. AIVO takes the security of this data extremely
              seriously:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Encrypted at rest:</strong> All uploaded IEP documents
                  are encrypted using AES-256 encryption at rest and TLS 1.3 in
                  transit.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Parent-only access:</strong> IEP documents and
                  extracted data are only accessible to the parent account that
                  uploaded them. No other user — including school accounts on
                  the Premium plan — can access IEP data unless the parent
                  explicitly shares a progress report.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>FERPA and COPPA compliant:</strong> AIVO&rsquo;s
                  handling of IEP data is fully compliant with FERPA and COPPA.
                  See our{" "}
                  <Link
                    href="/legal/ferpa"
                    className="text-aivo-purple-600 underline"
                  >
                    FERPA
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/legal/coppa"
                    className="text-aivo-purple-600 underline"
                  >
                    COPPA
                  </Link>{" "}
                  pages for details.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Deletion on request:</strong> You can permanently
                  delete all IEP documents and extracted data at any time from{" "}
                  <strong>Account Settings &rarr; Data &amp; Privacy</strong>.
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
              href="/help/iep-support/tracking-iep-goals"
              className="rounded-xl border border-aivo-navy-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-aivo-navy-800">
                Tracking IEP Goals
              </h3>
              <p className="mt-1 text-sm text-aivo-navy-500">
                Monitor progress toward each goal with visual dashboards.
              </p>
            </Link>
            <Link
              href="/help/iep-support/generating-progress-reports"
              className="rounded-xl border border-aivo-navy-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-aivo-navy-800">
                Generating Progress Reports
              </h3>
              <p className="mt-1 text-sm text-aivo-navy-500">
                Create detailed reports mapped to IEP goals for team meetings.
              </p>
            </Link>
            <Link
              href="/help/iep-support/sharing-with-your-iep-team"
              className="rounded-xl border border-aivo-navy-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-aivo-navy-800">
                Sharing With Your IEP Team
              </h3>
              <p className="mt-1 text-sm text-aivo-navy-500">
                Securely share progress data with teachers and coordinators.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FERPA Compliance Details | Help | AIVO",
  description:
    "Understand your FERPA rights as a parent using AIVO Learning — including how to inspect, review, amend, and control disclosure of your child's educational records.",
  openGraph: {
    title: "FERPA Compliance Details | AIVO Help",
    description:
      "Your rights under FERPA, how AIVO qualifies as a school official, and how to exercise your rights.",
  },
};

export default function FerpaComplianceDetailsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-medium text-aivo-purple-600 uppercase tracking-wider">
            Privacy &amp; Security
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl">
            FERPA Compliance Details
          </h1>
          <p className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto">
            What FERPA means for your family, how AIVO protects your
            child&rsquo;s educational records, and how to exercise your rights.
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
                  href="#what-is-ferpa"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  What FERPA Means for Parents
                </a>
              </li>
              <li>
                <a
                  href="#school-official"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  AIVO as a &ldquo;School Official&rdquo;
                </a>
              </li>
              <li>
                <a
                  href="#consent-model"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  School-as-Agent-of-Parent Consent Model
                </a>
              </li>
              <li>
                <a
                  href="#parent-rights"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Your Rights Under FERPA
                </a>
              </li>
              <li>
                <a
                  href="#exercise-rights"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  How to Exercise Your FERPA Rights
                </a>
              </li>
              <li>
                <a
                  href="#audit-logging"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Audit Logging
                </a>
              </li>
              <li>
                <a
                  href="#file-complaint"
                  className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  How to File a FERPA Complaint
                </a>
              </li>
            </ul>
          </nav>

          <div className="prose prose-aivo max-w-none">
            {/* What Is FERPA */}
            <h2
              id="what-is-ferpa"
              className="text-2xl font-bold text-aivo-navy-800 mt-0 scroll-mt-24"
            >
              What FERPA Means for Parents
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              The <strong>Family Educational Rights and Privacy Act</strong>{" "}
              (FERPA) is a federal law that protects the privacy of student
              educational records. It gives parents specific rights over their
              children&rsquo;s educational data held by schools and
              school-authorized service providers like AIVO.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed mt-3">
              In plain terms, FERPA means:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  You have the right to see what educational data is collected
                  about your child.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  You have the right to request corrections if something is
                  inaccurate.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  Your child&rsquo;s records cannot be shared with third
                  parties without your consent (with limited exceptions).
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  You can control who has access to your child&rsquo;s
                  educational records.
                </span>
              </li>
            </ul>

            {/* School Official */}
            <h2
              id="school-official"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              AIVO as a &ldquo;School Official&rdquo;
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              When AIVO Learning is used through a school or district
              partnership (our B2B Premium plan), AIVO qualifies as a{" "}
              <strong>&ldquo;school official&rdquo;</strong> with a{" "}
              <strong>&ldquo;legitimate educational interest&rdquo;</strong>{" "}
              under FERPA (34 CFR &sect; 99.31(a)(1)). This means:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  The school or district has a Data Processing Agreement (DPA)
                  with AIVO that specifies what data we can access and how we
                  must protect it.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  AIVO is under the direct control of the school regarding the
                  use and maintenance of educational records.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  AIVO may only use student data for the educational purposes
                  specified in the DPA &mdash; never for advertising, profiling,
                  or sale.
                </span>
              </li>
            </ul>
            <div className="mt-6 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600">
                <strong>Direct-to-parent accounts:</strong> When parents sign
                up directly (Free or Pro plans), AIVO operates under parental
                consent. Parents are the data controllers and retain full
                authority over their child&rsquo;s data.
              </p>
            </div>

            {/* Consent Model */}
            <h2
              id="consent-model"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              School-as-Agent-of-Parent Consent Model
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              For B2B (school and district) deployments, AIVO follows the
              school-as-agent-of-parent consent model:
            </p>
            <ol className="mt-4 space-y-4">
              <li className="flex items-start gap-4 text-aivo-navy-600">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-sm font-bold text-aivo-purple-700">
                  1
                </span>
                <span>
                  The <strong>school or district</strong> determines that AIVO
                  serves a legitimate educational purpose and executes a Data
                  Processing Agreement.
                </span>
              </li>
              <li className="flex items-start gap-4 text-aivo-navy-600">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-sm font-bold text-aivo-purple-700">
                  2
                </span>
                <span>
                  The school provides consent{" "}
                  <strong>on behalf of the parent</strong> under FERPA&rsquo;s
                  school official exception, as the school is acting in the
                  educational interest of the student.
                </span>
              </li>
              <li className="flex items-start gap-4 text-aivo-navy-600">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-aivo-purple-100 text-sm font-bold text-aivo-purple-700">
                  3
                </span>
                <span>
                  Parents retain all FERPA rights and can contact either the
                  school or AIVO directly to inspect, review, or amend their
                  child&rsquo;s records.
                </span>
              </li>
            </ol>
            <p className="text-aivo-navy-600 leading-relaxed mt-4">
              This model is consistent with U.S. Department of Education
              guidance on the use of online educational services.
            </p>

            {/* Parent Rights */}
            <h2
              id="parent-rights"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Your Rights Under FERPA
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              As a parent, FERPA grants you the following rights with respect
              to your child&rsquo;s educational records held by AIVO:
            </p>
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-aivo-navy-800">
                  Right to Inspect and Review
                </h3>
                <p className="mt-2 text-sm text-aivo-navy-600">
                  You can view all educational records AIVO holds about your
                  child at any time through the parent dashboard. You may also
                  request a complete data export.
                </p>
              </div>
              <div className="rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-aivo-navy-800">
                  Right to Amend
                </h3>
                <p className="mt-2 text-sm text-aivo-navy-600">
                  If you believe any educational record is inaccurate or
                  misleading, you can request a correction. Many fields can be
                  edited directly from the dashboard. For other corrections,
                  contact our privacy team.
                </p>
              </div>
              <div className="rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-aivo-navy-800">
                  Right to Consent to Disclosure
                </h3>
                <p className="mt-2 text-sm text-aivo-navy-600">
                  AIVO will not share your child&rsquo;s educational records
                  with any third party without your explicit consent, except as
                  required by law or as permitted under FERPA&rsquo;s limited
                  exceptions (e.g., health or safety emergencies).
                </p>
              </div>
              <div className="rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-aivo-navy-800">
                  Right to File a Complaint
                </h3>
                <p className="mt-2 text-sm text-aivo-navy-600">
                  If you believe AIVO has violated your FERPA rights, you have
                  the right to file a complaint with the U.S. Department of
                  Education. See the{" "}
                  <a href="#file-complaint" className="text-aivo-purple-600 underline">
                    complaint filing section
                  </a>{" "}
                  below.
                </p>
              </div>
            </div>

            {/* Exercise Rights */}
            <h2
              id="exercise-rights"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              How to Exercise Your FERPA Rights
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              You can exercise your FERPA rights through two channels:
            </p>
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-aivo-navy-800">
                  Parent Dashboard
                </h3>
                <ul className="mt-2 space-y-2">
                  <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                    <span>
                      <strong>Inspect and review:</strong> View all student
                      profiles, learning data, assessment results, tutor
                      transcripts, and IEP progress directly from the
                      dashboard.
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                    <span>
                      <strong>Amend:</strong> Edit student profile information,
                      learning preferences, and IEP goals directly.
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                    <span>
                      <strong>Export:</strong> Download a complete copy of your
                      data via{" "}
                      <strong>Account Settings &rarr; Privacy &rarr; Export Data</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-aivo-navy-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                    <span>
                      <strong>Delete:</strong> Request full account and data
                      deletion via{" "}
                      <strong>Account Settings &rarr; Privacy &rarr; Delete Account</strong>.
                    </span>
                  </li>
                </ul>
              </div>
              <div className="rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-aivo-navy-800">
                  Email Our Privacy Team
                </h3>
                <p className="mt-2 text-sm text-aivo-navy-600">
                  For any FERPA-related request, you can contact us at{" "}
                  <strong>privacy@aivolearning.com</strong>. Include your
                  account email address and a description of your request. Our
                  privacy team will respond within 2 business days.
                </p>
              </div>
            </div>

            {/* Audit Logging */}
            <h2
              id="audit-logging"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              Audit Logging
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO maintains an <strong>append-only audit log</strong> of all
              access to educational records. This means:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  Every time an educational record is accessed, created,
                  modified, or shared, it is recorded in the audit log with a
                  timestamp and the identity of the accessor.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  Audit logs are append-only &mdash; entries cannot be edited
                  or deleted, ensuring a tamper-proof record.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  For B2B (school/district) deployments, administrators can
                  view audit logs for their institution&rsquo;s records.
                  Parents can request audit log excerpts for their child&rsquo;s
                  records by contacting our privacy team.
                </span>
              </li>
            </ul>
            <div className="mt-6 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600">
                <strong>Tenant isolation:</strong> AIVO uses PostgreSQL
                Row-Level Security to ensure that each account&rsquo;s data is
                completely isolated. No user can ever access another
                user&rsquo;s educational records, even in the event of an
                application-level bug.
              </p>
            </div>

            {/* File Complaint */}
            <h2
              id="file-complaint"
              className="text-2xl font-bold text-aivo-navy-800 mt-12 scroll-mt-24"
            >
              How to File a FERPA Complaint
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              If you believe your FERPA rights have been violated, you have the
              right to file a complaint with the U.S. Department of Education:
            </p>
            <div className="mt-6 rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-aivo-navy-800">
                Family Policy Compliance Office (FPCO)
              </h3>
              <address className="mt-3 not-italic text-sm text-aivo-navy-600 leading-relaxed">
                U.S. Department of Education
                <br />
                Family Policy Compliance Office
                <br />
                400 Maryland Avenue SW
                <br />
                Washington, DC 20202
              </address>
              <p className="mt-3 text-sm text-aivo-navy-600">
                Complaints must be filed within 180 days of the alleged
                violation, or within 180 days of when you learned about the
                violation.
              </p>
            </div>
            <p className="text-aivo-navy-600 leading-relaxed mt-6">
              We encourage you to contact us first at{" "}
              <strong>privacy@aivolearning.com</strong> so we can attempt to
              resolve your concern directly. However, filing a complaint with
              FPCO is always your right regardless of whether you contact us.
            </p>

            {/* Full FERPA Page Link */}
            <div className="mt-8 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600">
                For our complete FERPA compliance documentation, including
                technical security measures and data processing details, visit
                the{" "}
                <Link
                  href="/legal/ferpa"
                  className="text-aivo-purple-600 underline font-medium"
                >
                  full FERPA Compliance page
                </Link>.
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
            If you have FERPA-related questions, our privacy team is here to
            help.
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
              href="/help/privacy-security/data-privacy-overview"
              className="rounded-xl border border-aivo-navy-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-aivo-navy-800">
                Data Privacy Overview
              </h3>
              <p className="mt-1 text-sm text-aivo-navy-500">
                How AIVO protects your family&rsquo;s data at every level.
              </p>
            </Link>
            <Link
              href="/help/privacy-security/exporting-your-data"
              className="rounded-xl border border-aivo-navy-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-aivo-navy-800">
                Exporting Your Data
              </h3>
              <p className="mt-1 text-sm text-aivo-navy-500">
                Download a full copy of your family&rsquo;s data at any time.
              </p>
            </Link>
            <Link
              href="/help/privacy-security/deleting-your-account"
              className="rounded-xl border border-aivo-navy-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-aivo-navy-800">
                Deleting Your Account
              </h3>
              <p className="mt-1 text-sm text-aivo-navy-500">
                Permanently erase all data with our full deletion pipeline.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

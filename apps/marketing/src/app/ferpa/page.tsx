import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FERPA Compliance | AIVO",
  description:
    "Learn how AIVO Learning complies with the Family Educational Rights and Privacy Act (FERPA) to protect student education records in K-12 schools and districts.",
  openGraph: {
    title: "FERPA Compliance | AIVO",
    description:
      "How AIVO Learning protects student education records under FERPA.",
  },
};

export default function FerpaPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl">
            FERPA Compliance
          </h1>
          <p className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto">
            How AIVO Learning protects student education records and upholds
            the rights of parents and eligible students under federal law.
          </p>
          <p className="mt-3 text-sm text-aivo-navy-400">
            Last updated: January 2025
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="prose prose-aivo max-w-none">
            {/* What is FERPA */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-0">
              What is FERPA
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              The Family Educational Rights and Privacy Act (FERPA) is a federal
              law enacted in 1974 that protects the privacy of student education
              records. FERPA applies to all educational agencies and institutions
              that receive funding from the U.S. Department of Education,
              including K-12 public schools and school districts. Under FERPA,
              parents (and eligible students aged 18 and older) have the right to
              access their child&apos;s education records, request corrections,
              and control the disclosure of personally identifiable information
              (PII) from those records.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              When schools and districts use AIVO Learning, we operate as a
              &ldquo;school official&rdquo; with a legitimate educational
              interest under FERPA. This means we are contractually bound to
              protect student education records with the same rigor required of
              the school itself. We take this responsibility seriously and have
              built our entire platform with FERPA compliance as a foundational
              requirement.
            </p>

            {/* Our Commitments Under FERPA */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              Our Commitments Under FERPA
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO Learning makes the following specific commitments to schools,
              districts, parents, and students regarding the handling of
              education records:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Parent as sole data controller.</strong> For
                  consumer (B2C) accounts, the parent or legal guardian is the
                  sole data controller for their child&apos;s education records.
                  No teacher, administrator, or third party may override the
                  parent&apos;s data governance decisions, including access to
                  the child&apos;s Brain Clone AI learning profile.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Read-only teacher access to Brain data.</strong>{" "}
                  Teachers who are granted access to a student&apos;s Brain
                  Clone learning profile receive read-only permissions. They can
                  review learning insights and progress data to inform
                  instruction but cannot modify, export, or delete the
                  underlying education records.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>District admin restrictions.</strong> District
                  administrators cannot override a parent&apos;s Brain Clone
                  approval settings. Even in B2B deployments, parent consent
                  remains the authoritative control for Brain Clone data access.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Comprehensive audit logging.</strong> Every access to,
                  modification of, or disclosure of student education records is
                  logged in our append-only audit_events table. These logs
                  include the identity of the accessor, the timestamp, the
                  action performed, and the records affected. Audit logs are
                  available to authorized school administrators and parents upon
                  request.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>School-as-agent-of-parent for B2B.</strong> When
                  schools and districts enroll students through our B2B
                  agreements, the school acts as an agent of the parent for
                  purposes of consenting to AIVO&apos;s access to education
                  records, consistent with FERPA&apos;s school official
                  exception (34 CFR &sect; 99.31(a)(1)).
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Directory information opt-out.</strong> AIVO Learning
                  respects directory information opt-out elections made by
                  parents or eligible students at the school level. Schools can
                  configure opt-out flags during roster synchronization via
                  Clever or ClassLink, and we will suppress any directory
                  information for opted-out students.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Annual FERPA notification support.</strong> We provide
                  template language and documentation that districts can
                  incorporate into their annual FERPA notification to parents,
                  disclosing AIVO Learning as a school official with a
                  legitimate educational interest.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>No behavioral advertising.</strong> We never use
                  student education records for behavioral advertising,
                  marketing profiling, or any purpose unrelated to the
                  educational services we provide. Our marketing site uses
                  Plausible cookieless analytics, which collects no personally
                  identifiable information.
                </span>
              </li>
            </ul>

            {/* How We Protect Student Education Records */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              How We Protect Student Education Records
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO Learning employs multiple layers of technical and
              organizational safeguards to protect the confidentiality,
              integrity, and availability of student education records:
            </p>

            <div className="mt-6 rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-aivo-navy-800">
                Encryption
              </h3>
              <p className="mt-3 text-sm text-aivo-navy-600 leading-relaxed">
                All student education records are encrypted at rest using
                AES-256 encryption, the same standard used by financial
                institutions and government agencies. Data in transit is
                protected by TLS 1.3, ensuring that information cannot be
                intercepted or tampered with during transmission between your
                device and our servers.
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-aivo-navy-800">
                Tenant Isolation
              </h3>
              <p className="mt-3 text-sm text-aivo-navy-600 leading-relaxed">
                Our PostgreSQL database enforces row-level security (RLS)
                policies that isolate each school, district, and family&apos;s
                data at the database engine level. This means that even in the
                event of an application-layer vulnerability, one tenant&apos;s
                education records cannot be accessed by another tenant. RLS
                policies are audited regularly and tested as part of our
                continuous integration pipeline.
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-aivo-navy-800">
                Authentication &amp; Authorization
              </h3>
              <p className="mt-3 text-sm text-aivo-navy-600 leading-relaxed">
                User sessions are authenticated using RS256 JWT tokens with
                short expiration windows and automatic rotation. Role-based
                access controls enforce the principle of least privilege: parents
                have full control over their children&apos;s records, teachers
                receive read-only access, and district administrators are
                subject to parent consent overrides for Brain Clone data. Every
                API request is validated against the authenticated user&apos;s
                permissions before any data is returned.
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-aivo-navy-800">
                Audit Trail
              </h3>
              <p className="mt-3 text-sm text-aivo-navy-600 leading-relaxed">
                All access to student education records is logged in an
                append-only audit_events table. Log entries capture the user
                identity, timestamp, IP address, action performed (read, update,
                export, delete), and the specific records affected. Audit logs
                cannot be modified or deleted and are retained for a minimum of
                seven years in compliance with FERPA record-keeping
                requirements.
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-aivo-navy-800">
                Privacy-Preserving Analytics
              </h3>
              <p className="mt-3 text-sm text-aivo-navy-600 leading-relaxed">
                Our public-facing marketing website uses Plausible Analytics, a
                cookieless, privacy-first analytics platform that collects no
                personally identifiable information and requires no cookie
                consent banners. Within the AIVO Learning platform itself,
                analytics and reporting data is aggregated and anonymized before
                being used for product improvement, ensuring that no individual
                student can be identified from platform usage metrics.
              </p>
            </div>

            {/* Parent & Guardian Rights */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              Parent &amp; Guardian Rights
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Under FERPA, parents and legal guardians of students under 18 (and
              eligible students aged 18 and older) have the following rights with
              respect to education records maintained by AIVO Learning:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Right to inspect and review.</strong> You may request
                  to inspect and review your child&apos;s education records held
                  by AIVO Learning at any time. We will provide access within 45
                  days of receiving your written request. You can also export a
                  complete copy of your child&apos;s data in a structured,
                  machine-readable format directly from your parent dashboard.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Right to request amendment.</strong> If you believe
                  that any education record maintained by AIVO Learning is
                  inaccurate, misleading, or in violation of your child&apos;s
                  privacy rights, you may request that we amend the record. We
                  will respond to amendment requests within 30 days and notify
                  you of our determination.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Right to consent to disclosures.</strong> AIVO
                  Learning will not disclose personally identifiable information
                  from your child&apos;s education records to any third party
                  without your prior written consent, except as permitted under
                  FERPA (e.g., to school officials with a legitimate educational
                  interest, in response to a lawful subpoena, or in connection
                  with a health or safety emergency).
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Data export.</strong> Parents can export their
                  child&apos;s complete education records, including Brain Clone
                  learning profile data, assessment results, lesson completion
                  history, and AI tutor interaction summaries, in a structured
                  JSON or CSV format at any time from the parent dashboard.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Data deletion.</strong> Parents can request the
                  complete deletion of their child&apos;s education records at
                  any time. Upon receiving a deletion request, we initiate a
                  cascading deletion pipeline that removes all associated data,
                  including Brain Clone profiles, tutor interaction logs,
                  assessment results, and gamification records.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Right to file a complaint.</strong> If you believe that
                  AIVO Learning or your child&apos;s school has violated your
                  rights under FERPA, you have the right to file a complaint
                  with the U.S. Department of Education at: Student Privacy
                  Policy Office (SPPO), U.S. Department of Education, 400
                  Maryland Avenue SW, Washington, DC 20202-8520.
                </span>
              </li>
            </ul>

            {/* School & District Agreements */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              School &amp; District Agreements
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              When a school or district contracts with AIVO Learning to provide
              educational technology services, we enter into a Data Processing
              Agreement (DPA) that governs the handling of student education
              records. Our DPA is aligned with the Student Data Privacy
              Consortium (SDPC) National Data Privacy Agreement and addresses all
              FERPA requirements.
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>School official exception.</strong> Under our DPA, AIVO
                  Learning operates as a &ldquo;school official&rdquo; with a
                  legitimate educational interest as defined by 34 CFR &sect;
                  99.31(a)(1). The district designates AIVO as a school official
                  in its annual FERPA notification to parents, and we are
                  contractually prohibited from using education records for any
                  purpose other than providing the contracted educational
                  services.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>DPA provisions.</strong> Our Data Processing Agreement
                  specifies the categories of education records processed, the
                  purposes for which they may be used, security requirements,
                  breach notification procedures (within 72 hours), data
                  retention and deletion obligations, and sub-processor
                  restrictions. Districts may request a copy of our DPA template
                  at any time.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>SIS integration.</strong> AIVO Learning integrates
                  with Clever and ClassLink for automatic roster synchronization.
                  Student demographic and enrollment data is imported directly
                  from the district&apos;s Student Information System (SIS),
                  minimizing manual data entry and reducing the risk of errors.
                  Roster data is encrypted in transit and at rest, and access is
                  restricted to authorized district administrators.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>End-of-contract data return &amp; deletion.</strong>{" "}
                  Upon termination of a district agreement, AIVO Learning will,
                  at the district&apos;s election, either return all education
                  records in a structured format or securely delete them within
                  60 days. A certificate of deletion is provided upon request.
                </span>
              </li>
            </ul>

            {/* Data Retention & Deletion */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              Data Retention &amp; Deletion
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO Learning retains student education records only for as long
              as reasonably necessary to provide our educational services and
              fulfill our contractual and legal obligations. For B2C accounts,
              education records are retained for the duration of the active
              parent account plus 90 days following account closure. For B2B
              (school and district) accounts, retention periods are governed by
              the applicable Data Processing Agreement.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              When a parent or district requests data deletion, we execute a
              cascading deletion pipeline that removes all associated records
              across our systems, including Brain Clone learning profiles, AI
              tutor interaction logs, assessment results, IEP progress data,
              gamification records (XP, streaks, badges, leaderboard entries),
              and consent records. Deleted data is purged from all primary
              databases immediately and from backup systems within 30 days.
              Audit log entries referencing the deleted records are
              pseudonymized (the student identifier is replaced with a
              non-reversible hash) but retained for compliance purposes.
            </p>

            {/* Contact Our Privacy Team */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              Contact Our Privacy Team
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              If you have questions about our FERPA compliance practices, need
              to exercise any of the rights described above, or would like to
              request a copy of our Data Processing Agreement, please contact
              our privacy team:
            </p>
            <div className="mt-4 rounded-xl bg-aivo-navy-50 p-6">
              <a
                href="mailto:privacy@aivolearning.com"
                className="text-aivo-purple-600 font-semibold hover:text-aivo-purple-700 transition-colors"
              >
                privacy@aivolearning.com
              </a>
              <p className="mt-2 text-sm text-aivo-navy-500">
                AIVO Learning, 123 Education Lane, San Francisco, CA 94105
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Links */}
      <section className="bg-aivo-navy-50 py-12">
        <div className="mx-auto max-w-3xl px-6 flex flex-wrap items-center justify-center gap-6 text-sm">
          <Link
            href="/legal/privacy"
            className="font-medium text-aivo-navy-600 hover:text-aivo-purple-600 transition-colors"
          >
            Privacy Policy
          </Link>
          <span className="text-aivo-navy-300">|</span>
          <Link
            href="/legal/terms"
            className="font-medium text-aivo-navy-600 hover:text-aivo-purple-600 transition-colors"
          >
            Terms of Service
          </Link>
          <span className="text-aivo-navy-300">|</span>
          <Link
            href="/coppa"
            className="font-medium text-aivo-navy-600 hover:text-aivo-purple-600 transition-colors"
          >
            COPPA Policy
          </Link>
          <span className="text-aivo-navy-300">|</span>
          <Link
            href="/accessibility"
            className="font-medium text-aivo-navy-600 hover:text-aivo-purple-600 transition-colors"
          >
            Accessibility
          </Link>
        </div>
      </section>
    </>
  );
}

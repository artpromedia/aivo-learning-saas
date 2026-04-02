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
            AIVO Learning is committed to protecting the privacy of student
            educational records in full compliance with the Family Educational
            Rights and Privacy Act.
          </p>
          <p className="mt-3 text-sm text-aivo-navy-400">
            Last updated: April 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="prose prose-aivo max-w-none">
            {/* 1. What is FERPA */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-0">
              What is FERPA
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              The Family Educational Rights and Privacy Act (FERPA) is a federal
              law enacted in 1974 (20 U.S.C. &sect; 1232g; 34 CFR Part 99)
              that protects the privacy of student education records. FERPA
              applies to all educational agencies and institutions that receive
              funding under any program administered by the U.S. Department of
              Education, including K-12 public schools and school districts.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              Under FERPA, parents and legal guardians have the right to inspect
              and review their child&apos;s education records, request
              corrections to records they believe are inaccurate or misleading,
              and control the disclosure of personally identifiable information
              (PII) from those records. When a student turns 18 or enrolls in a
              postsecondary institution, these rights transfer from the parent
              to the student (who becomes an &ldquo;eligible student&rdquo;).
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO Learning serves K-12 students, including students with
              Individualized Education Programs (IEPs), through our Brain Clone
              AI adaptive learning profiles and our five AI Tutors (Nova for
              Math, Sage for ELA, Spark for Science, Chrono for History, and
              Pixel for Coding). Because our platform maintains education
              records on behalf of schools and parents, FERPA compliance is
              foundational to every aspect of how we collect, store, process,
              and share student data.
            </p>

            {/* 2. How AIVO Complies with FERPA */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              How AIVO Complies with FERPA
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO Learning has designed its platform, policies, and contracts
              to satisfy every applicable FERPA requirement. The following
              commitments govern how we handle student education records:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Parent/guardian as sole data controller.</strong> For
                  all consumer (B2C) accounts, the parent or legal guardian is
                  the sole data controller for every element of their
                  child&apos;s Brain Clone AI learning profile and associated
                  education records. No teacher, school administrator, or third
                  party may override the parent&apos;s data governance
                  decisions.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Read-only teacher/school official access.</strong>{" "}
                  Teachers and school officials who are granted access to a
                  student&apos;s Brain Clone learning profile receive read-only
                  permissions. They can review learning insights, assessment
                  results, and IEP goal progress data to inform instruction,
                  but they cannot modify, export, or delete the underlying
                  education records.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>District admins cannot override parent gates.</strong>{" "}
                  Even in B2B (school or district) deployments, district
                  administrators cannot override a parent&apos;s approval
                  settings for AI-generated recommendations or Brain Clone data
                  access. Parent consent remains the authoritative control in
                  every deployment model.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>School-as-agent-of-parent consent model.</strong> When
                  schools and districts enroll students through B2B agreements,
                  the school acts as an agent of the parent for the purpose of
                  consenting to AIVO&apos;s access to education records,
                  consistent with FERPA&apos;s school official exception
                  (34 CFR &sect; 99.31(a)(1)). Schools must include AIVO
                  Learning in their annual FERPA notification and provide
                  parents the opportunity to opt out.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Directory information opt-out.</strong> AIVO Learning
                  supports per-learner directory information opt-out. Parents
                  can configure their child&apos;s profile with either standard
                  or strict privacy modes. In strict mode, directory information
                  such as the student&apos;s name and grade level is suppressed
                  from leaderboards, class rosters, and any feature visible to
                  peers. Schools can also set opt-out flags during roster
                  synchronization via Clever or ClassLink.
                </span>
              </li>
            </ul>

            {/* 3. Educational Records We Maintain */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              Educational Records We Maintain
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Under FERPA, an &ldquo;education record&rdquo; is any record that
              is directly related to a student and maintained by an educational
              agency or institution, or by a party acting on its behalf. The
              following categories of data maintained by AIVO Learning
              constitute education records:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Brain Clone AI profiles.</strong> Each student&apos;s
                  adaptive learning profile, including identified strengths,
                  areas for growth, preferred learning modalities, pacing
                  preferences, and knowledge state models generated by our AI
                  engine.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Assessment results.</strong> Scores, responses, and
                  performance data from diagnostic assessments, formative
                  quizzes, and practice exercises administered through the
                  platform.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>IEP goal progress data.</strong> For students with
                  Individualized Education Programs, AIVO tracks progress
                  toward uploaded IEP goals, including measurable benchmarks,
                  accommodation usage, and progress reports generated for
                  parent and educator review.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>AI tutor session transcripts.</strong> Interaction
                  logs from sessions with Nova, Sage, Spark, Chrono, and Pixel,
                  including questions asked, hints provided, explanations
                  delivered, and Homework Helper queries. These transcripts are
                  retained solely for learning adaptation and quality assurance.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Progress reports.</strong> Summaries of lesson
                  completion, skill mastery levels, gamification metrics (XP,
                  streaks, badges), and learning trajectory analyses shared with
                  parents and authorized educators.
                </span>
              </li>
            </ul>
            <p className="text-aivo-navy-600 leading-relaxed mt-4">
              The following data maintained by AIVO Learning does{" "}
              <strong>not</strong> constitute education records under FERPA:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>De-identified aggregate analytics.</strong> Statistical
                  data from which all personally identifiable information has
                  been removed and that cannot reasonably be used to identify an
                  individual student. We use aggregated analytics solely to
                  improve our educational content and AI tutoring algorithms.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>System and infrastructure logs.</strong> Server access
                  logs, error logs, and performance telemetry that relate to
                  platform operations rather than to individual students. These
                  logs do not contain education record content.
                </span>
              </li>
            </ul>

            {/* 4. Parental Rights Under FERPA */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              Parental Rights Under FERPA
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              FERPA guarantees parents and legal guardians (and eligible
              students) a set of specific rights with respect to education
              records. AIVO Learning honors each of these rights:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Right to inspect and review.</strong> Parents may
                  request to inspect and review all education records AIVO
                  Learning maintains about their child. We will provide access
                  within 45 days of receiving a written request. Parents can
                  also export a complete copy of their child&apos;s data in
                  structured JSON or CSV format at any time from the parent
                  dashboard.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Right to request amendment.</strong> If a parent
                  believes that any education record maintained by AIVO Learning
                  is inaccurate, misleading, or in violation of the
                  student&apos;s privacy rights, the parent may submit a written
                  request for amendment. We will respond within 30 days. If we
                  decline the request, we will advise the parent of their right
                  to a formal hearing and their right to place a statement in
                  the record contesting the information.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Right to consent to disclosure.</strong> AIVO Learning
                  will not disclose personally identifiable information from a
                  student&apos;s education records to any third party without
                  prior written consent from the parent, except in the limited
                  circumstances permitted by FERPA (described in the Disclosure
                  Practices section below).
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Right to file a complaint.</strong> Parents who
                  believe that AIVO Learning or their child&apos;s school has
                  violated FERPA may file a complaint with the U.S. Department
                  of Education at: Student Privacy Policy Office (SPPO), U.S.
                  Department of Education, 400 Maryland Avenue SW, Washington,
                  DC 20202-8520.
                </span>
              </li>
            </ul>

            {/* 5. Disclosure Practices */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              Disclosure Practices
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO Learning discloses personally identifiable information from
              education records only with prior written parental consent, except
              in the following limited circumstances permitted by FERPA:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>School official exception.</strong> We may disclose
                  education records to school officials (including teachers,
                  administrators, and other authorized personnel) who have a
                  legitimate educational interest in the information, as defined
                  by the school or district in its annual FERPA notification and
                  in our Data Processing Agreement (34 CFR &sect;
                  99.31(a)(1)).
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Directory information.</strong> Certain information
                  designated by the school as &ldquo;directory
                  information&rdquo; (such as name and grade level) may be
                  disclosed unless the parent has opted out through the school
                  or through AIVO&apos;s strict privacy mode. We always honor
                  opt-out elections.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Health or safety emergency.</strong> In connection
                  with a health or safety emergency, we may disclose education
                  records to appropriate parties (such as law enforcement,
                  public health officials, or trained medical personnel) if
                  knowledge of the information is necessary to protect the
                  health or safety of the student or other individuals (34 CFR
                  &sect; 99.36).
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Judicial order or subpoena.</strong> We may disclose
                  education records in response to a lawfully issued subpoena
                  or court order. In such cases, we will make reasonable efforts
                  to notify the parent or eligible student in advance of
                  compliance, unless the order prohibits such notification
                  (34 CFR &sect; 99.31(a)(9)).
                </span>
              </li>
            </ul>
            <div className="mt-6 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600 leading-relaxed">
                <strong>AIVO never sells student data.</strong> We do not sell,
                rent, or license education records or any personally
                identifiable information derived from them. We do not use
                student data for behavioral advertising, marketing profiling,
                or any purpose unrelated to the educational services we
                provide. Our marketing site uses Plausible cookieless analytics,
                which collects no personally identifiable information.
              </p>
            </div>

            {/* 6. Data Security Measures */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              Data Security Measures
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO Learning employs multiple layers of technical and
              organizational safeguards to protect the confidentiality,
              integrity, and availability of student education records:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>AES-256 encryption at rest.</strong> All student
                  education records are encrypted at rest using AES-256
                  encryption, the same standard employed by financial
                  institutions and government agencies. Encryption keys are
                  managed through a dedicated key management service with
                  automatic rotation.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>TLS 1.3 encryption in transit.</strong> All data
                  transmitted between your device and our servers is protected
                  by TLS 1.3, ensuring that information cannot be intercepted or
                  tampered with during transmission. We enforce HSTS headers and
                  certificate pinning on all API endpoints.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>PostgreSQL Row-Level Security.</strong> Our database
                  enforces row-level security (RLS) policies that isolate each
                  school, district, and family&apos;s data at the database
                  engine level. Even in the event of an application-layer
                  vulnerability, one tenant&apos;s education records cannot be
                  accessed by another tenant. RLS policies are audited regularly
                  and tested as part of our continuous integration pipeline.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Append-only audit logging.</strong> Every access to
                  student education records is logged in an append-only
                  audit_events table (described in detail in the next section).
                  Audit logs cannot be modified or deleted.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>SOC 2 Type II certification.</strong> AIVO Learning
                  has achieved SOC 2 Type II certification, which independently
                  validates that our security controls, availability, processing
                  integrity, confidentiality, and privacy practices meet
                  rigorous industry standards over an extended observation
                  period. Our most recent audit report is available to schools
                  and districts under NDA upon request.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Annual penetration testing.</strong> We engage
                  independent third-party security firms to conduct
                  comprehensive penetration testing of our infrastructure,
                  APIs, and application surfaces at least once per year.
                  Critical and high-severity findings are remediated within 30
                  days, and summaries of testing results are available to
                  district partners upon request.
                </span>
              </li>
            </ul>

            {/* 7. Audit Trail & Access Logs */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              Audit Trail &amp; Access Logs
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO Learning maintains a comprehensive, tamper-resistant audit
              trail of every access to student education records. All audit data
              is stored in our append-only <code>audit_events</code> table,
              which cannot be modified or deleted after writing.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              Each audit log entry captures the following information:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Timestamp.</strong> The precise date and time (UTC) at
                  which the access or action occurred.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Accessor identity.</strong> The authenticated user ID,
                  role (parent, teacher, district admin, system service), and IP
                  address of the individual or process that accessed the record.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Action type.</strong> The specific operation performed:
                  read, create, update, export, delete, or share.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Record scope.</strong> The specific education record(s)
                  affected, including the student identifier, record type (Brain
                  Clone profile, assessment, IEP data, tutor transcript, or
                  progress report), and the tenant (family or school/district).
                </span>
              </li>
            </ul>
            <p className="text-aivo-navy-600 leading-relaxed mt-4">
              Audit logs are retained for a minimum of seven years in compliance
              with FERPA record-keeping requirements. Authorized school
              administrators can request audit reports for their students at any
              time, and parents can request a log of all access to their
              child&apos;s records by contacting our privacy team.
            </p>

            {/* 8. Annual FERPA Notification */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              Annual FERPA Notification
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              FERPA requires schools and districts to notify parents annually of
              their rights under the Act and to identify the criteria for
              determining who constitutes a &ldquo;school official&rdquo; with
              a legitimate educational interest. When a district uses AIVO
              Learning, AIVO must be disclosed in that annual notification as a
              school official.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              To assist our partner districts, AIVO Learning provides:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Template notification language.</strong> Pre-written
                  paragraphs that districts can incorporate directly into their
                  annual FERPA notification letters, identifying AIVO Learning
                  as a designated school official and describing the education
                  records we access and the educational purposes for which we
                  access them.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Compliance documentation.</strong> A comprehensive
                  FERPA compliance packet that includes our Data Processing
                  Agreement, data flow diagrams, security architecture overview,
                  SOC 2 Type II summary, and answers to common parent questions
                  about how student data is handled within AIVO Learning.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Dedicated compliance support.</strong> Our privacy
                  team is available to work directly with district FERPA
                  compliance officers to answer questions, participate in parent
                  information sessions, and address any concerns about how AIVO
                  Learning handles education records.
                </span>
              </li>
            </ul>

            {/* 9. Contact */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              Contact
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              If you have questions about our FERPA compliance practices, need
              to exercise any of the parental rights described above, or would
              like to request a copy of our Data Processing Agreement or SOC 2
              report, please contact our privacy team:
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
              <p className="mt-2 text-sm text-aivo-navy-500">
                We respond to all privacy inquiries within two (2) business
                days.
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
            href="/legal/coppa"
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

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "COPPA Policy | AIVO",
  description:
    "Learn how AIVO Learning protects the privacy of children under 13 in compliance with the Children's Online Privacy Protection Act (COPPA).",
  openGraph: {
    title: "COPPA Policy | AIVO",
    description:
      "How AIVO Learning protects children's privacy under COPPA.",
  },
};

export default function CoppaPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl">
            Children&apos;s Privacy (COPPA)
          </h1>
          <p className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto">
            How AIVO Learning protects the privacy of children under 13 and
            empowers parents to control their child&apos;s data.
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
            {/* What is COPPA */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-0">
              What is COPPA
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              The Children&apos;s Online Privacy Protection Act (COPPA) is a
              federal law enacted in 1998 that imposes specific requirements on
              operators of websites and online services directed at children
              under 13, or that have actual knowledge they are collecting
              personal information from children under 13. COPPA requires
              operators to provide clear notice of their data practices, obtain
              verifiable parental consent before collecting personal information
              from children, and give parents the ability to review, delete, and
              control the use of their child&apos;s data.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              Because AIVO Learning is an AI-powered personalized learning
              platform designed for K-12 students, including those under 13, we
              are fully committed to complying with COPPA. We have designed
              every aspect of our platform, from account creation to data
              collection to analytics, to meet or exceed COPPA&apos;s
              requirements. This policy explains how we fulfill those
              obligations.
            </p>

            {/* Verifiable Parental Consent */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              Verifiable Parental Consent
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO Learning requires a parent or legal guardian account as a
              prerequisite for creating any child learner profile. A child
              cannot independently create an account, access the platform, or
              provide personal information without a parent first establishing
              an account and explicitly consenting to the collection and use of
              their child&apos;s data.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              Our consent process works as follows:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Parent account creation.</strong> A parent or legal
                  guardian creates their own verified account with AIVO Learning
                  before adding any child learner profiles.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Informed consent.</strong> Before creating a child
                  profile, the parent is presented with a clear, comprehensive
                  description of the personal information we collect from
                  children, how it is used, and with whom it may be shared. The
                  parent must affirmatively consent to these practices.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Consent record keeping.</strong> Each consent event is
                  recorded in our consent_records table with the consent type,
                  policy version agreed to, timestamp, and IP address. This
                  ensures a verifiable audit trail of parental consent as
                  required by the FTC&apos;s COPPA Rule.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Revocation at any time.</strong> Parents may revoke
                  their consent at any time through their account dashboard. Upon
                  revocation, we will cease collecting information from the child
                  and, at the parent&apos;s request, delete all previously
                  collected information.
                </span>
              </li>
            </ul>

            {/* Information We Collect From Children */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              Information We Collect From Children
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO Learning practices strict data minimization. We collect only
              the information that is directly necessary to provide our
              personalized educational services. The categories of information
              we collect from children are limited to educational data:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  Learning assessment responses (answers to diagnostic and
                  formative assessments used to build the child&apos;s Brain
                  Clone learning profile)
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  Lesson completion data (which lessons, modules, and topics
                  have been completed)
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  Quiz and exercise scores (performance results from practice
                  activities and assessments)
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  AI tutor interaction logs (conversations with Nova, Sage,
                  Spark, Chrono, and Pixel tutors, retained solely for learning
                  adaptation and quality assurance)
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  IEP goal progress metrics (for students with Individualized
                  Education Programs, tracked with parental and school
                  authorization)
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  Gamification activity (XP earned, streaks, badges achieved,
                  and leaderboard standings, used solely to motivate and engage
                  the learner)
                </span>
              </li>
            </ul>
            <p className="text-aivo-navy-600 leading-relaxed mt-4">
              <strong>We do NOT collect</strong> the following from children:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>No photos, videos, or audio recordings of children</span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>No geolocation data or precise location information</span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>No contact lists, address books, or phone numbers</span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  No social media data or connections to social platforms
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  No behavioral advertising profiles, interest categories, or
                  tracking identifiers
                </span>
              </li>
            </ul>

            {/* How We Use Children's Information */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              How We Use Children&apos;s Information
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              The information we collect from children is used solely for the
              following educational purposes:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Personalized learning.</strong> The child&apos;s Brain
                  Clone AI learning profile uses assessment data and interaction
                  patterns to adapt lesson difficulty, pacing, and content to
                  the individual learner&apos;s strengths, weaknesses, and
                  learning style.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Progress tracking for parents and teachers.</strong>{" "}
                  Parents can view their child&apos;s learning progress,
                  assessment results, and tutor interaction summaries through
                  their dashboard. Teachers with parent-approved access can
                  review read-only progress reports to inform classroom
                  instruction.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>IEP compliance reporting.</strong> For students with
                  Individualized Education Programs, progress data is structured
                  to support IEP goal tracking and reporting requirements.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Platform improvement.</strong> We use aggregated and
                  anonymized data (from which no individual child can be
                  identified) to improve our educational content, AI tutoring
                  algorithms, and platform features.
                </span>
              </li>
            </ul>
            <p className="text-aivo-navy-600 leading-relaxed mt-4">
              We never use children&apos;s information for behavioral
              advertising, marketing profiling, or any purpose unrelated to the
              educational services described above.
            </p>

            {/* Parental Rights & Controls */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              Parental Rights &amp; Controls
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              As the sole data controller for their child&apos;s information,
              parents and legal guardians have the following rights and controls:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Review all data collected.</strong> Parents can review
                  all personal information collected from their child at any time
                  through the parent dashboard, including learning data, AI
                  tutor interactions, and Brain Clone profile insights.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Export data in structured format.</strong> Parents can
                  export their child&apos;s complete data in a structured,
                  machine-readable format (JSON or CSV), consistent with GDPR
                  Article 20 data portability requirements.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Delete all data.</strong> Parents can request the
                  complete deletion of their child&apos;s data through a
                  cascading deletion pipeline that removes all associated
                  records, including Brain Clone profiles, tutor interactions,
                  assessment results, and gamification data.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Revoke consent.</strong> Parents may revoke consent for
                  the collection and use of their child&apos;s information at
                  any time. Upon revocation, the child&apos;s access to AIVO
                  Learning will be suspended and, at the parent&apos;s election,
                  all data will be deleted.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Toggle privacy modes.</strong> Parents can configure
                  each learner profile with either standard or strict privacy
                  settings. Strict mode further limits the data retained from AI
                  tutor interactions and restricts leaderboard visibility.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Control teacher and school access.</strong> Parents
                  control whether teachers or school administrators can access
                  their child&apos;s Brain Clone learning profile. Access is
                  granted on a per-teacher basis and can be revoked at any time.
                  Even in B2B deployments, district administrators cannot
                  override parent consent for Brain Clone data access.
                </span>
              </li>
            </ul>

            {/* School & District COPPA Consent */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              School &amp; District COPPA Consent
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              When a school or district deploys AIVO Learning for classroom use,
              the school may provide consent on behalf of parents under
              COPPA&apos;s &ldquo;school official&rdquo; exception. The FTC has
              recognized that schools may act as agents of parents to consent to
              the collection of children&apos;s personal information when the
              information is used solely for educational purposes and not for
              any commercial purpose.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              Under this model, the school or district enters into a Data
              Processing Agreement with AIVO Learning that contractually limits
              our use of student data to educational purposes only. The school
              is responsible for notifying parents of AIVO Learning&apos;s data
              practices and providing parents the opportunity to review and
              refuse further collection. We provide schools with template
              notification language and support materials to facilitate
              transparent communication with parents.
            </p>

            {/* Third-Party Services */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              Third-Party Services
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO Learning is committed to minimizing children&apos;s exposure
              to third-party data collection. Our third-party service usage is
              strictly limited:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Plausible Analytics.</strong> Our marketing website
                  uses Plausible, a cookieless analytics platform that collects
                  no personally identifiable information, does not use cookies,
                  and does not track users across websites. No data about
                  children is collected by Plausible.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>No advertising SDKs.</strong> We do not integrate any
                  third-party advertising libraries, ad networks, or demand-side
                  platforms into any part of the AIVO Learning product, including
                  child-facing learning surfaces.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>No social media integrations.</strong> Child-facing
                  surfaces within AIVO Learning contain no social media
                  integrations, share buttons, login-with-social options, or
                  embedded social content. Children are not exposed to social
                  media tracking pixels or SDKs.
                </span>
              </li>
            </ul>

            {/* Data Security */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              Data Security
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO Learning employs industry-leading security measures to
              protect children&apos;s personal information from unauthorized
              access, disclosure, alteration, or destruction:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Encryption at rest.</strong> All children&apos;s data
                  is encrypted at rest using AES-256 encryption, ensuring data
                  remains protected even in the event of physical storage
                  compromise.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Encryption in transit.</strong> All communications
                  between the user&apos;s device and our servers are protected
                  by TLS encryption, preventing interception of data during
                  transmission.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>PostgreSQL row-level security.</strong> Our database
                  enforces row-level security (RLS) policies that isolate each
                  family, school, and district&apos;s data at the database
                  engine level, preventing cross-tenant data leakage.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>SOC 2 Type II certification.</strong> AIVO Learning
                  has achieved SOC 2 Type II certification, which independently
                  validates that our security controls, availability,
                  processing integrity, confidentiality, and privacy practices
                  meet rigorous industry standards over an extended observation
                  period.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Regular penetration testing.</strong> We conduct
                  regular third-party penetration testing and vulnerability
                  assessments to identify and remediate potential security
                  weaknesses before they can be exploited.
                </span>
              </li>
            </ul>

            {/* Data Retention & Deletion */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              Data Retention &amp; Deletion
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Children&apos;s personal information is retained only for as long
              as reasonably necessary to provide our educational services. For
              consumer accounts, data is retained for the duration of the active
              parent account. For school and district accounts, retention
              periods are governed by the applicable Data Processing Agreement.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              When a parent requests deletion of their child&apos;s data, or
              when consent is revoked, we execute a cascading deletion through
              our data_lifecycle pipeline. This process removes all associated
              records, including Brain Clone learning profiles, AI tutor
              interaction logs, assessment results, IEP metrics, and
              gamification data. Deleted data is purged from primary databases
              immediately and permanently removed from all backup systems within
              30 days of the deletion request.
            </p>

            {/* Changes to This Policy */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              Changes to This Policy
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              We may update this COPPA Policy from time to time to reflect
              changes in our practices, regulatory guidance, or the law. When
              we make changes, we will update the &ldquo;Last updated&rdquo;
              date at the top of this page. If we make material changes that
              affect how we collect, use, or share children&apos;s personal
              information, we will notify parents directly (by email to the
              address associated with the parent account) and obtain new
              verifiable parental consent before implementing the changes with
              respect to previously collected information.
            </p>

            {/* Contact */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              Contact
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              If you have questions about this COPPA Policy, our
              children&apos;s privacy practices, or wish to exercise any of the
              parental rights described above, please contact our privacy team:
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
            <p className="text-aivo-navy-600 leading-relaxed mt-4">
              If you believe that AIVO Learning has collected personal
              information from a child under 13 without proper parental consent,
              please contact us immediately at the email above. You may also
              file a complaint with the Federal Trade Commission (FTC) at{" "}
              <a
                href="https://www.ftc.gov/complaint"
                className="text-aivo-purple-600 font-semibold hover:text-aivo-purple-700 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                ftc.gov/complaint
              </a>{" "}
              or by calling 1-877-FTC-HELP (1-877-382-4357).
            </p>
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
            href="/ferpa"
            className="font-medium text-aivo-navy-600 hover:text-aivo-purple-600 transition-colors"
          >
            FERPA Compliance
          </Link>
          <span className="text-aivo-navy-300">|</span>
          <Link
            href="/cookies"
            className="font-medium text-aivo-navy-600 hover:text-aivo-purple-600 transition-colors"
          >
            Cookie Policy
          </Link>
        </div>
      </section>
    </>
  );
}

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
            COPPA Policy
          </h1>
          <p className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto">
            AIVO Learning is committed to protecting the online privacy of
            children under 13 and ensuring parents have full visibility and
            control over their child&apos;s data.
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
            {/* 1. What is COPPA */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-0">
              What is COPPA
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              The Children&apos;s Online Privacy Protection Act (COPPA) is a
              federal law enacted in 1998 (15 U.S.C. &sect;&sect; 6501&ndash;6506)
              that imposes specific requirements on operators of websites,
              mobile applications, and online services that are directed at
              children under the age of 13, or that have actual knowledge that
              they are collecting personal information from children under 13.
              COPPA is enforced by the Federal Trade Commission (FTC), which has
              the authority to investigate violations, issue civil penalties of
              up to $50,120 per violation, and require operators to implement
              comprehensive compliance programs.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              The FTC&apos;s COPPA Rule (16 CFR Part 312) requires operators to:
              post a clear and comprehensive online privacy policy describing
              their data practices with respect to children; provide direct
              notice to parents before collecting personal information from
              their child; obtain verifiable parental consent prior to any
              collection, use, or disclosure of a child&apos;s personal
              information; give parents the right to review, delete, and control
              the ongoing collection of their child&apos;s information; and
              maintain reasonable security procedures to protect the
              confidentiality, integrity, and availability of children&apos;s
              data. The FTC has also signaled through COPPA 2.0 rulemaking
              proceedings its intent to strengthen protections around
              algorithmic profiling, push notifications, and persistent
              identifiers used in child-directed services.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO Learning is an AI-powered personalized learning platform
              designed for K-12 students, and many of our users are children
              under 13. Our platform — including Brain Clone AI adaptive
              learning profiles, our five AI Tutors (Nova for Math, Sage for
              ELA, Spark for Science, Chrono for History, and Pixel for Coding),
              Homework Helper, IEP goal tracking, and gamification features — is
              a service directed at children within the meaning of the COPPA
              Rule. We have designed every aspect of our platform, from account
              creation to data collection to analytics, to meet or exceed
              COPPA&apos;s requirements. This policy explains in detail how we
              fulfill those obligations.
            </p>

            {/* 2. Information We Collect from Children */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              Information We Collect from Children
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO Learning practices strict data minimization in accordance
              with the COPPA Rule&apos;s requirement that operators collect only
              the personal information reasonably necessary to enable a child to
              participate in an activity. The following categories of
              information are collected from or about child users of our
              platform:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>First name or parent-chosen alias.</strong> When a
                  parent creates a child learner profile, they provide either
                  the child&apos;s first name or a pseudonym/alias of their
                  choosing. We do not require or collect the child&apos;s last
                  name, full legal name, or any government-issued identifiers.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Grade level.</strong> The child&apos;s current grade
                  level is collected to calibrate the difficulty and curriculum
                  alignment of learning content delivered by our AI Tutors and
                  Brain Clone AI engine.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Learning assessment responses.</strong> Answers to
                  diagnostic assessments, formative quizzes, and practice
                  exercises used to build and continuously refine the
                  child&apos;s Brain Clone adaptive learning profile, including
                  identified strengths, areas for growth, preferred learning
                  modalities, and pacing preferences.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>AI tutor session interaction data.</strong>{" "}
                  Interaction logs from sessions with Nova, Sage, Spark, Chrono,
                  and Pixel, including questions asked by the child, hints and
                  explanations delivered by the tutor, Homework Helper queries,
                  and session duration. These logs are retained solely for
                  learning adaptation and educational quality assurance.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>IEP goal progress data.</strong> For students with
                  Individualized Education Programs, when IEP goals are uploaded
                  by the parent or authorized school official, AIVO tracks
                  progress toward those goals, including measurable benchmarks,
                  accommodation usage, and progress summaries generated for
                  parent and educator review.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Gamification data.</strong> Experience points (XP)
                  earned, active streaks, badges achieved, and leaderboard
                  standings. Gamification data is used solely to motivate and
                  engage the learner within the educational experience.
                </span>
              </li>
            </ul>
            <p className="text-aivo-navy-600 leading-relaxed mt-4">
              <strong>We do NOT collect</strong> the following from children:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  No email addresses from children (only the parent&apos;s
                  email is collected, on the parent account)
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  No social media profiles, usernames, or connections to social
                  platforms
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  No precise geolocation data or location information of any
                  kind
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  No photographs, videos, or images of children
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  No voice recordings or audio data (all AI tutor interactions
                  are text-based)
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  No behavioral advertising profiles, interest categories,
                  cross-site tracking identifiers, or persistent device
                  fingerprints
                </span>
              </li>
            </ul>

            {/* 3. Verifiable Parental Consent */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              Verifiable Parental Consent
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO Learning requires a parent or legal guardian account as an
              absolute prerequisite for creating any child learner profile. A
              child cannot independently create an account, access the platform,
              or provide any personal information without a parent first
              establishing a verified account and explicitly consenting to the
              collection and use of their child&apos;s data. Our verifiable
              parental consent process is designed to satisfy the FTC&apos;s
              requirements under 16 CFR &sect; 312.5.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              Our consent process works as follows:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Parent account creation.</strong> A parent or legal
                  guardian creates their own verified account with AIVO Learning,
                  providing a valid email address and completing email
                  verification, before adding any child learner profiles.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Email-plus confirmation flow.</strong> When a parent
                  initiates the creation of a child profile, we employ the
                  &ldquo;email plus&rdquo; method of verifiable parental consent
                  recognized by the FTC. The parent receives a detailed
                  notification email describing the specific personal
                  information we will collect from the child, how it will be
                  used, and the parent&apos;s rights. The parent must respond to
                  this email with affirmative consent or click a unique
                  time-limited confirmation link to authorize the child profile
                  creation. A delayed confirmation window provides the parent
                  an additional opportunity to withdraw consent before any data
                  collection begins.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Consent record keeping.</strong> Each consent event is
                  recorded in our <code>consent_records</code> table with the
                  following fields: consent type (e.g., child profile creation,
                  IEP data access, teacher access grant), the specific policy
                  version agreed to, a precise UTC timestamp, and the IP address
                  from which consent was provided. This ensures a verifiable,
                  tamper-resistant audit trail of parental consent as required by
                  the FTC&apos;s COPPA Rule.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Withdrawal at any time.</strong> Parents may withdraw
                  their consent at any time through the parent dashboard or by
                  emailing{" "}
                  <a
                    href="mailto:privacy@aivolearning.com"
                    className="text-aivo-purple-600 font-semibold hover:text-aivo-purple-700 transition-colors"
                  >
                    privacy@aivolearning.com
                  </a>
                  . Upon withdrawal, we immediately cease collecting information
                  from the child, suspend the child&apos;s access to the
                  platform, and, at the parent&apos;s election, permanently
                  delete all previously collected information from the child
                  profile.
                </span>
              </li>
            </ul>

            {/* 4. How We Use Children's Information */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              How We Use Children&apos;s Information
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              The information we collect from children is used exclusively for
              the following educational purposes:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Delivering personalized learning via Brain Clone
                  AI.</strong> The child&apos;s Brain Clone adaptive learning
                  profile uses assessment data and interaction patterns to
                  continuously calibrate lesson difficulty, pacing, content
                  sequencing, and instructional approach to the individual
                  learner&apos;s strengths, areas for growth, and preferred
                  learning modalities.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Tracking progress against IEP goals.</strong> For
                  students with Individualized Education Programs, we use
                  collected data to track measurable progress toward uploaded
                  IEP goals and generate compliance-ready progress reports for
                  parents and authorized educators.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Generating progress reports.</strong> Parents can view
                  their child&apos;s learning progress, assessment results, skill
                  mastery levels, and AI tutor interaction summaries through the
                  parent dashboard. Teachers with parent-approved read-only
                  access can review progress reports to inform classroom
                  instruction.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Powering gamification features.</strong> XP, streaks,
                  badges, and leaderboard standings are calculated from the
                  child&apos;s learning activity to provide motivational
                  feedback and encourage sustained engagement with educational
                  content.
                </span>
              </li>
            </ul>
            <div className="mt-6 rounded-xl bg-aivo-navy-50 p-6">
              <p className="text-sm text-aivo-navy-600 leading-relaxed">
                <strong>We never use children&apos;s information
                for:</strong> advertising of any kind (behavioral, contextual,
                or otherwise), marketing profiling, building predictive
                consumer profiles, sale or rental to third parties, or any
                purpose unrelated to the educational services described above.
                Our marketing site uses Plausible cookieless analytics, which
                collects no personally identifiable information and is not
                connected to the child-facing learning platform in any way.
              </p>
            </div>

            {/* 5. Parental Rights */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              Parental Rights
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Under COPPA, parents and legal guardians have specific, enumerated
              rights with respect to personal information collected from their
              children. AIVO Learning honors each of these rights fully:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Right to review.</strong> Parents may review all
                  personal information collected from their child at any time
                  through the parent dashboard. This includes the child&apos;s
                  Brain Clone learning profile, assessment results, AI tutor
                  interaction summaries, IEP goal progress data, and
                  gamification activity. Parents may also request a complete
                  data export in structured format.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Right to request deletion.</strong> Parents may
                  request the complete deletion of all personal information
                  collected from their child. Deletion requests can be submitted
                  through the parent dashboard or by emailing{" "}
                  <a
                    href="mailto:privacy@aivolearning.com"
                    className="text-aivo-purple-600 font-semibold hover:text-aivo-purple-700 transition-colors"
                  >
                    privacy@aivolearning.com
                  </a>
                  . All deletion requests are processed within 30 days. Upon
                  deletion, all associated records — including Brain Clone
                  profiles, tutor interaction logs, assessment results, IEP
                  metrics, and gamification data — are permanently removed via
                  our cascading deletion pipeline.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Right to refuse further collection.</strong> Parents
                  may direct AIVO Learning to stop collecting personal
                  information from their child at any time. Upon receiving such
                  a request, we will immediately cease data collection. If the
                  parent allows us to retain previously collected information,
                  the child may continue to access previously completed content
                  in a read-only mode, but no new data will be generated or
                  stored.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Right to revoke consent.</strong> Parents may revoke
                  their consent for the collection and use of their child&apos;s
                  information at any time through the parent dashboard or by
                  contacting our privacy team. Upon revocation, the child&apos;s
                  access to the platform will be suspended and, at the
                  parent&apos;s election, all data will be permanently deleted.
                  Revocation does not affect the lawfulness of collection that
                  occurred prior to the withdrawal, but no further collection
                  will take place.
                </span>
              </li>
            </ul>

            {/* 6. Third-Party Operators */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              Third-Party Operators
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO Learning is committed to minimizing children&apos;s exposure
              to third-party data collection. We carefully vet every third-party
              service that may interact with or process children&apos;s data,
              and we contractually require each to maintain protections
              consistent with COPPA:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Plausible Analytics.</strong> Our marketing website
                  uses Plausible, a cookieless, privacy-first analytics platform
                  that collects no personally identifiable information, does not
                  use cookies, does not employ fingerprinting or persistent
                  identifiers, and does not track users across websites.
                  Plausible runs only on the marketing site and has no access to
                  child user data within the learning platform.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Cloud hosting infrastructure.</strong> AIVO
                  Learning&apos;s platform is hosted on enterprise-grade cloud
                  infrastructure. We maintain Data Processing Agreements (DPAs)
                  with all cloud hosting providers that contractually prohibit
                  the use of children&apos;s data for any purpose other than
                  providing the hosting services, require compliance with
                  industry-standard security certifications, and mandate
                  immediate breach notification.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>No advertising networks.</strong> We do not share
                  children&apos;s data with any advertising network, demand-side
                  platform, data broker, or social media platform. No
                  advertising SDKs, tracking pixels, or social media
                  integrations are present in any child-facing surface of the
                  AIVO Learning product.
                </span>
              </li>
            </ul>

            {/* 7. Data Retention & Deletion */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              Data Retention &amp; Deletion
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              Children&apos;s personal information is retained only while the
              parent account remains active and the parent has not withdrawn
              consent. We do not retain children&apos;s data beyond what is
              reasonably necessary to provide our educational services.
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Data export at any time.</strong> Parents can export
                  all of their child&apos;s data at any time from the parent
                  dashboard. Exports are provided as a ZIP archive containing
                  structured JSON data files and human-readable Markdown
                  summaries, including Brain Clone profile data, assessment
                  results, tutor interaction summaries, IEP progress reports,
                  and gamification records.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Deletion upon request or consent withdrawal.</strong>{" "}
                  When a parent requests deletion of their child&apos;s data,
                  closes their parent account, or withdraws consent, we execute
                  a cascading deletion pipeline that permanently removes all
                  associated records from our primary databases within 30 days.
                  This includes Brain Clone learning profiles, AI tutor
                  interaction logs, assessment responses and scores, IEP goal
                  progress data, gamification records (XP, streaks, badges, and
                  leaderboard entries), and consent records.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Backup purge.</strong> Deleted data is permanently
                  purged from all backup and disaster recovery systems within 90
                  days of the deletion request. Audit log entries referencing the
                  deleted child profile are pseudonymized (the child identifier
                  is replaced with a non-reversible hash) but retained for
                  compliance record-keeping purposes.
                </span>
              </li>
            </ul>

            {/* 8. Security Measures */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              Security Measures
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO Learning employs comprehensive technical and organizational
              safeguards to protect children&apos;s personal information from
              unauthorized access, disclosure, alteration, or destruction:
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>AES-256 encryption at rest.</strong> All
                  children&apos;s personal information and education records are
                  encrypted at rest using AES-256 encryption with automatically
                  rotated encryption keys managed through a dedicated key
                  management service.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>TLS 1.3 encryption in transit.</strong> All
                  communications between the child&apos;s device and our servers
                  are protected by TLS 1.3, ensuring data cannot be intercepted
                  or tampered with during transmission. We enforce HSTS headers
                  and certificate pinning on all API endpoints.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>PostgreSQL Row-Level Security.</strong> Our database
                  enforces row-level security (RLS) policies that isolate each
                  family, school, and district&apos;s data at the database
                  engine level, preventing cross-tenant data access even in the
                  event of an application-layer vulnerability. RLS policies are
                  audited regularly and tested as part of our continuous
                  integration pipeline.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>API rate limiting.</strong> All API endpoints are
                  protected by tiered rate limiting to prevent brute-force
                  attacks, credential stuffing, and abuse. Rate limits are
                  enforced per-account and per-IP, with automatic temporary
                  lockouts for repeated violations.
                </span>
              </li>
              <li className="flex items-start gap-3 text-aivo-navy-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-500" />
                <span>
                  <strong>Prompt injection prevention.</strong> All five AI
                  Tutors (Nova, Sage, Spark, Chrono, and Pixel) implement
                  multi-layered prompt injection defenses, including input
                  sanitization, system prompt hardening, output content
                  filtering, and behavioral guardrails, to ensure that child
                  users cannot be exposed to inappropriate content or
                  manipulated into disclosing personal information through AI
                  tutor interactions.
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
                  period. Our most recent audit report is available to schools,
                  districts, and parents upon request.
                </span>
              </li>
            </ul>

            {/* 9. Changes to This Policy */}
            <h2 className="text-2xl font-bold text-aivo-navy-800 mt-12">
              Changes to This Policy
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed">
              We may update this COPPA Policy from time to time to reflect
              changes in our practices, FTC regulatory guidance, or the law.
              When we make changes, we will update the &ldquo;Last
              updated&rdquo; date at the top of this page and publish the
              revised policy.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              If we make material changes that affect how we collect, use, or
              share children&apos;s personal information, we will notify
              parents directly by email to the address associated with the
              parent account and provide a clear summary of the changes. For
              material changes that expand the categories of information
              collected from children, alter the purposes for which
              children&apos;s data is used, or introduce new third-party data
              sharing, we will obtain new verifiable parental consent before
              implementing the changes with respect to any previously collected
              or future-collected information. The child&apos;s access to the
              platform will not be affected during the re-consent period, but
              no newly authorized data collection will begin until the parent
              has provided fresh consent.
            </p>

            {/* 10. Contact */}
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
              <p className="mt-2 text-sm text-aivo-navy-500">
                We respond to all privacy inquiries within two (2) business
                days.
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
            href="/legal/ferpa"
            className="font-medium text-aivo-navy-600 hover:text-aivo-purple-600 transition-colors"
          >
            FERPA Compliance
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

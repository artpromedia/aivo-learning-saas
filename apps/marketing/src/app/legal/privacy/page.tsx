import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | AIVO",
  description:
    "AIVO Learning Privacy Policy. Learn how we collect, use, and protect your personal information and student data.",
  openGraph: {
    title: "Privacy Policy | AIVO",
    description:
      "AIVO Learning Privacy Policy. Learn how we collect, use, and protect your personal information and student data.",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center justify-center gap-2 text-sm text-aivo-navy-400">
            <Link
              href="/"
              className="hover:text-aivo-purple-600 transition-colors"
            >
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <Link
              href="/legal"
              className="hover:text-aivo-purple-600 transition-colors"
            >
              Legal
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-aivo-navy-600 font-medium">
              Privacy Policy
            </span>
          </nav>
          <h1 className="text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-lg text-aivo-navy-500">
            Last Updated: January 2025
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          {/* 1. Introduction */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-4">
              1. Introduction
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              AIVO Learning, Inc. (&quot;AIVO,&quot; &quot;we,&quot;
              &quot;us,&quot; or &quot;our&quot;) operates the AIVO Learning
              platform, an AI-powered personalized learning service designed for
              students of all functioning levels. This Privacy Policy describes
              how we collect, use, store, share, and protect personal
              information when you use our website, applications, and services
              (collectively, the &quot;Service&quot;).
            </p>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              We are deeply committed to protecting the privacy of our users,
              especially the students who use our platform. We understand the
              sensitivity of educational data and have designed our practices to
              exceed industry standards for student data protection. We comply
              with the Family Educational Rights and Privacy Act (FERPA), the
              Children&apos;s Online Privacy Protection Act (COPPA), the General
              Data Protection Regulation (GDPR), and applicable state privacy
              laws.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              By using the Service, you consent to the collection, use, and
              disclosure of your information as described in this Privacy Policy.
              If you do not agree with any part of this policy, please do not
              use the Service. This policy should be read in conjunction with
              our{" "}
              <Link
                href="/legal/terms"
                className="text-aivo-purple-600 hover:text-aivo-purple-700 underline"
              >
                Terms of Service
              </Link>
              .
            </p>
          </div>

          {/* 2. Information We Collect */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-4">
              2. Information We Collect
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              We collect several categories of information to provide and
              improve our Service. The types and amount of information collected
              depend on your role (parent, teacher, or administrator) and how
              you interact with the platform.
            </p>

            <h3 className="text-lg font-medium text-aivo-navy-800 mb-3 mt-6">
              Account Information
            </h3>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              When you create an account, we collect your name, email address,
              and role (parent, teacher, or administrator). For paid
              subscriptions, we also collect billing information, which is
              processed securely by our third-party payment processor (Stripe)
              and is not stored on our servers.
            </p>

            <h3 className="text-lg font-medium text-aivo-navy-800 mb-3 mt-6">
              Student Information
            </h3>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              To personalize the learning experience, we collect student
              information including the student&apos;s name, grade level, age,
              learning preferences, and, when provided, IEP (Individualized
              Education Program) documents. IEP documents are processed by our
              AI to extract learning goals and accommodations, then securely
              stored in encrypted form. This information is provided by parents,
              guardians, or authorized school personnel and is used solely for
              educational purposes.
            </p>

            <h3 className="text-lg font-medium text-aivo-navy-800 mb-3 mt-6">
              Usage Data
            </h3>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              We collect data about how students and users interact with the
              Service, including session logs, assessment results, tutor
              interaction histories, learning progress data, time spent on
              activities, and feature usage patterns. This data is essential for
              tracking educational progress and improving our AI models.
            </p>

            <h3 className="text-lg font-medium text-aivo-navy-800 mb-3 mt-6">
              Brain Clone Data
            </h3>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              Our Brain Clone technology generates AI-powered learning profiles
              for each student. This data includes mastery levels across
              subjects and skills, learning style preferences, personalized
              recommendations, adaptive difficulty settings, and predicted areas
              where additional support may be beneficial. Brain Clone data is
              derived from student interactions and is considered student data
              under FERPA.
            </p>

            <h3 className="text-lg font-medium text-aivo-navy-800 mb-3 mt-6">
              Technical Information
            </h3>
            <p className="text-aivo-navy-600 leading-relaxed">
              We automatically collect certain technical information when you
              access the Service, including your IP address, browser type and
              version, device type and operating system, and general geographic
              location (city/region level). We do not use tracking cookies or
              cross-site tracking technologies. See Section 11 for details on
              our analytics practices.
            </p>
          </div>

          {/* 3. How We Use Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-4">
              3. How We Use Information
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              We use the information we collect for the following purposes, all
              of which are directly related to providing and improving our
              educational Service:
            </p>
            <ul className="list-disc pl-6 text-aivo-navy-600 leading-relaxed mb-4 space-y-2">
              <li>
                <strong className="text-aivo-navy-700">
                  Personalizing learning experiences:
                </strong>{" "}
                Using student data and Brain Clone profiles to adapt tutoring
                sessions, select appropriate content, and adjust difficulty
                levels to each student&apos;s needs.
              </li>
              <li>
                <strong className="text-aivo-navy-700">
                  Generating and updating Brain Clone profiles:
                </strong>{" "}
                Continuously refining AI-generated learning profiles based on
                student interactions and assessment results.
              </li>
              <li>
                <strong className="text-aivo-navy-700">
                  Tracking and reporting progress:
                </strong>{" "}
                Providing parents, teachers, and administrators with dashboards,
                reports, and insights on student learning progress.
              </li>
              <li>
                <strong className="text-aivo-navy-700">
                  Communicating with users:
                </strong>{" "}
                Sending account-related notifications, progress updates, and
                important service announcements via email.
              </li>
              <li>
                <strong className="text-aivo-navy-700">
                  Improving the platform:
                </strong>{" "}
                Analyzing aggregated, de-identified usage data to improve our AI
                models, user experience, and educational content.
              </li>
              <li>
                <strong className="text-aivo-navy-700">
                  Complying with legal obligations:
                </strong>{" "}
                Meeting our obligations under FERPA, COPPA, and other applicable
                privacy and education laws.
              </li>
            </ul>
            <p className="text-aivo-navy-600 leading-relaxed">
              We will never use student data for advertising, marketing to
              students, or building advertising profiles. Any data used for
              platform improvement is aggregated and de-identified so that no
              individual student can be identified.
            </p>
          </div>

          {/* 4. Student Data Protection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-4">
              4. Student Data Protection
            </h2>

            <h3 className="text-lg font-medium text-aivo-navy-800 mb-3 mt-6">
              FERPA Compliance
            </h3>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              When AIVO is used by schools or districts, we act as a
              &quot;school official&quot; with a legitimate educational interest
              under the Family Educational Rights and Privacy Act (FERPA). We
              use student education records solely for the purpose of providing
              the educational Service as directed by the school or district. We
              do not use student data for advertising, do not build advertising
              profiles, and do not sell student data under any circumstances.
            </p>

            <h3 className="text-lg font-medium text-aivo-navy-800 mb-3 mt-6">
              COPPA Compliance
            </h3>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              We do not knowingly collect personal information from children
              under the age of 13 without verifiable parental consent or, in the
              school context, without the school acting as the parent&apos;s
              agent for consent purposes as permitted by COPPA. When a parent
              creates a student profile for a child under 13, the parent
              provides consent for collection of their child&apos;s information
              in connection with the educational services. If we learn that we
              have collected personal information from a child under 13 without
              appropriate consent, we will promptly delete that information.
            </p>

            <h3 className="text-lg font-medium text-aivo-navy-800 mb-3 mt-6">
              Brain Clone Data Ownership
            </h3>
            <p className="text-aivo-navy-600 leading-relaxed">
              Brain Clone data — the AI-generated learning profiles that power
              personalized learning — is owned by the student&apos;s parent or
              legal guardian. You have full control over this data at all times.
              You may export Brain Clone data in a standard, machine-readable
              format (JSON) through your account settings. You may request
              complete deletion of Brain Clone data at any time, and we will
              process deletion requests within 30 days. Deleted Brain Clone data
              cannot be recovered.
            </p>
          </div>

          {/* 5. Data Sharing */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-4">
              5. Data Sharing
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              We share personal information only in the following limited
              circumstances, and never for advertising or marketing purposes:
            </p>
            <ul className="list-disc pl-6 text-aivo-navy-600 leading-relaxed mb-4 space-y-2">
              <li>
                <strong className="text-aivo-navy-700">
                  School and district administrators:
                </strong>{" "}
                For students enrolled through a school or district account,
                authorized administrators may access student progress data,
                assessment results, and Brain Clone summaries as needed for
                educational oversight.
              </li>
              <li>
                <strong className="text-aivo-navy-700">
                  Service providers:
                </strong>{" "}
                We work with trusted third-party service providers for hosting,
                infrastructure, analytics, and customer support. All service
                providers are bound by Data Processing Agreements (DPAs) that
                restrict their use of data to providing services on our behalf
                and require them to maintain appropriate security measures.
              </li>
              <li>
                <strong className="text-aivo-navy-700">
                  Legal requirements:
                </strong>{" "}
                We may disclose information when required by law, regulation,
                legal process, or governmental request, or when we believe in
                good faith that disclosure is necessary to protect the rights,
                safety, or property of AIVO, our users, or the public.
              </li>
            </ul>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              We never sell personal information or student data to third
              parties. We never share student data with advertisers or marketing
              companies. We never use student data to build profiles for
              non-educational purposes.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              In the event of a merger, acquisition, or sale of assets, user
              data may be transferred as part of the transaction. We will notify
              affected users before their data becomes subject to a different
              privacy policy.
            </p>
          </div>

          {/* 6. Data Security */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-4">
              6. Data Security
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              We implement industry-leading security measures to protect your
              data from unauthorized access, alteration, disclosure, or
              destruction. Our security program includes the following technical
              and organizational safeguards:
            </p>
            <ul className="list-disc pl-6 text-aivo-navy-600 leading-relaxed mb-4 space-y-2">
              <li>
                <strong className="text-aivo-navy-700">
                  Encryption at rest:
                </strong>{" "}
                All data stored on our servers is encrypted using AES-256
                encryption, the same standard used by financial institutions and
                government agencies.
              </li>
              <li>
                <strong className="text-aivo-navy-700">
                  Encryption in transit:
                </strong>{" "}
                All data transmitted between your device and our servers is
                protected using TLS 1.3, the latest transport layer security
                protocol.
              </li>
              <li>
                <strong className="text-aivo-navy-700">
                  SOC 2 Type II certification:
                </strong>{" "}
                Our systems and processes are independently audited and
                certified under the SOC 2 Type II framework, covering security,
                availability, processing integrity, confidentiality, and
                privacy.
              </li>
              <li>
                <strong className="text-aivo-navy-700">
                  Penetration testing:
                </strong>{" "}
                We conduct annual third-party penetration testing to identify
                and remediate potential vulnerabilities before they can be
                exploited.
              </li>
              <li>
                <strong className="text-aivo-navy-700">
                  Role-based access control:
                </strong>{" "}
                Access to personal data within our organization is restricted on
                a need-to-know basis using role-based access controls, with all
                access logged and monitored.
              </li>
            </ul>
            <p className="text-aivo-navy-600 leading-relaxed">
              While we take extensive measures to protect your data, no method
              of electronic storage or transmission is 100% secure. We
              continuously monitor our systems and update our security practices
              to address emerging threats. In the unlikely event of a data
              breach, we will notify affected users and relevant authorities in
              accordance with applicable law.
            </p>
          </div>

          {/* 7. Data Retention */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-4">
              7. Data Retention
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              We retain personal information only for as long as necessary to
              fulfill the purposes described in this Privacy Policy or as
              required by law. Our data retention practices are as follows:
            </p>
            <ul className="list-disc pl-6 text-aivo-navy-600 leading-relaxed mb-4 space-y-2">
              <li>
                <strong className="text-aivo-navy-700">
                  Active account data:
                </strong>{" "}
                Personal information, student data, and Brain Clone profiles are
                retained for as long as your account remains active and the
                Service is in use.
              </li>
              <li>
                <strong className="text-aivo-navy-700">
                  Deleted data:
                </strong>{" "}
                When you request deletion of your account or specific data, we
                purge the data from our active systems within 30 days of the
                request.
              </li>
              <li>
                <strong className="text-aivo-navy-700">Backup purging:</strong>{" "}
                Deleted data is removed from our backup systems within 90 days
                of the deletion request. During this period, backup data is
                encrypted and not accessible for normal operations.
              </li>
            </ul>
            <p className="text-aivo-navy-600 leading-relaxed">
              Upon account termination, you will have a 30-day grace period to
              export your data before deletion begins. After this period, data
              will be deleted according to the schedule above. We may retain
              aggregated, de-identified data that cannot be linked back to any
              individual for analytical and research purposes.
            </p>
          </div>

          {/* 8. Your Rights */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-4">
              8. Your Rights
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              We respect your right to control your personal information.
              Depending on your location and applicable laws, you may have the
              following rights:
            </p>
            <ul className="list-disc pl-6 text-aivo-navy-600 leading-relaxed mb-4 space-y-2">
              <li>
                <strong className="text-aivo-navy-700">
                  Right to access:
                </strong>{" "}
                You may request a copy of all personal information we hold about
                you, including student data and Brain Clone profiles. We will
                provide this information in a commonly used electronic format
                within 30 days of your request.
              </li>
              <li>
                <strong className="text-aivo-navy-700">
                  Right to correction:
                </strong>{" "}
                You may request that we correct any inaccurate or incomplete
                personal information. You can also update most information
                directly through your account settings.
              </li>
              <li>
                <strong className="text-aivo-navy-700">
                  Right to deletion:
                </strong>{" "}
                You may request complete erasure of your personal data from our
                systems. We will process deletion requests within 30 days,
                subject to any legal obligations that require us to retain
                certain information.
              </li>
              <li>
                <strong className="text-aivo-navy-700">
                  Right to portability:
                </strong>{" "}
                You may request that we provide your data in a structured,
                commonly used, machine-readable format (such as JSON or CSV) so
                that you can transfer it to another service.
              </li>
              <li>
                <strong className="text-aivo-navy-700">
                  Right to object:
                </strong>{" "}
                You may object to certain types of data processing, such as the
                use of your data for platform improvement analytics. We will
                honor such objections unless we have compelling legitimate
                grounds for the processing.
              </li>
              <li>
                <strong className="text-aivo-navy-700">GDPR rights:</strong>{" "}
                Residents of the European Union have additional rights under the
                General Data Protection Regulation, including the right to
                restrict processing, the right not to be subject to automated
                decision-making, and the right to lodge a complaint with a
                supervisory authority. California residents have additional
                rights under the CCPA/CPRA.
              </li>
            </ul>
            <p className="text-aivo-navy-600 leading-relaxed">
              To exercise any of these rights, please contact us at{" "}
              <a
                href="mailto:privacy@aivolearning.com"
                className="text-aivo-purple-600 hover:text-aivo-purple-700 underline"
              >
                privacy@aivolearning.com
              </a>
              . We will respond to all requests within 30 days and will not
              charge a fee for processing reasonable requests.
            </p>
          </div>

          {/* 9. International Transfers */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-4">
              9. International Data Transfers
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              AIVO is headquartered in the United States, and your data is
              primarily processed and stored on servers located in the United
              States. If you access the Service from outside the United States,
              your information will be transferred to, stored, and processed in
              the United States, where data protection laws may differ from
              those in your country.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              For transfers of personal data from the European Economic Area
              (EEA) or the United Kingdom, we rely on Standard Contractual
              Clauses (SCCs) approved by the European Commission to ensure an
              adequate level of data protection. We also implement supplementary
              technical and organizational measures, including encryption and
              access controls, to safeguard your data during and after transfer.
              You may request a copy of the applicable SCCs by contacting our
              Data Protection Officer.
            </p>
          </div>

          {/* 10. Children's Privacy */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-4">
              10. Children&apos;s Privacy
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              We take the privacy of children very seriously. Our Service is
              designed to be used by students of all ages, including children
              under the age of 13. We implement additional protections for
              children&apos;s data in accordance with COPPA and other applicable
              children&apos;s privacy laws.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              Children under 13 cannot create their own accounts. A parent,
              guardian, or authorized school official must create the account and
              provide verifiable consent before any data is collected from a
              child under 13. In the school context, the school may act as the
              parent&apos;s agent for consent purposes in accordance with COPPA
              guidelines.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              Parents and guardians have the right to review the personal
              information we have collected from their child, request that we
              stop collecting information from their child, and request that we
              delete their child&apos;s information. To exercise these rights,
              contact us at{" "}
              <a
                href="mailto:privacy@aivolearning.com"
                className="text-aivo-purple-600 hover:text-aivo-purple-700 underline"
              >
                privacy@aivolearning.com
              </a>
              . We will verify the identity of the requesting parent or guardian
              before fulfilling any requests.
            </p>
          </div>

          {/* 11. Analytics */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-4">
              11. Analytics
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              We use Plausible Analytics, a privacy-friendly, cookieless
              analytics tool, to understand how visitors interact with our
              website and Service. Plausible does not collect personal data, does
              not use cookies, and does not track users across websites or
              devices.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              Plausible collects only aggregate, anonymized data such as page
              views, referral sources, browser types, and general geographic
              regions. This data cannot be used to identify individual users and
              is used solely to improve our website and Service experience.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              We chose Plausible specifically because it aligns with our
              commitment to privacy. Unlike traditional analytics tools,
              Plausible is fully compliant with GDPR, CCPA, and PECR without
              requiring cookie consent banners. All analytics data is hosted on
              EU-owned infrastructure.
            </p>
          </div>

          {/* 12. Changes */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-4">
              12. Changes to This Policy
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              We may update this Privacy Policy from time to time to reflect
              changes in our practices, technologies, legal requirements, or
              other factors. When we make material changes to this policy, we
              will notify affected users via email at least 30 days before the
              changes take effect.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              Non-material changes, such as formatting updates or clarifications
              that do not alter the substance of the policy, may be made without
              prior notice. We will always update the &quot;Last Updated&quot;
              date at the top of this page when any changes are made.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              We encourage you to review this Privacy Policy periodically to
              stay informed about how we protect your information. Your
              continued use of the Service after the effective date of any
              changes constitutes your acceptance of the updated policy.
            </p>
          </div>

          {/* 13. Contact */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-4">
              13. Contact Information
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              If you have any questions, concerns, or requests regarding this
              Privacy Policy or our data practices, please contact us using the
              information below:
            </p>
            <div className="rounded-xl border border-aivo-navy-100 bg-aivo-navy-50 p-6 text-aivo-navy-600">
              <p className="font-semibold text-aivo-navy-800">
                AIVO Learning, Inc.
              </p>
              <p className="mt-1">Privacy Team</p>
              <p className="mt-1">
                Email:{" "}
                <a
                  href="mailto:privacy@aivolearning.com"
                  className="text-aivo-purple-600 hover:text-aivo-purple-700 underline"
                >
                  privacy@aivolearning.com
                </a>
              </p>
              <p className="mt-1">
                Data Protection Officer:{" "}
                <a
                  href="mailto:dpo@aivolearning.com"
                  className="text-aivo-purple-600 hover:text-aivo-purple-700 underline"
                >
                  dpo@aivolearning.com
                </a>
              </p>
            </div>
          </div>

          {/* Back Link */}
          <div className="mt-12 pt-8 border-t border-aivo-navy-100">
            <Link
              href="/legal"
              className="inline-flex items-center gap-2 text-aivo-purple-600 hover:text-aivo-purple-700 font-medium transition-colors"
            >
              <span aria-hidden="true">&larr;</span>
              Back to Legal
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

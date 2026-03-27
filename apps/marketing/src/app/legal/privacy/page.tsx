import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | AIVO",
  description:
    "How AIVO Learning collects, uses, and protects your personal information. FERPA, COPPA, and GDPR compliant.",
  openGraph: {
    title: "Privacy Policy | AIVO",
    description: "How AIVO Learning collects, uses, and protects your personal information.",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-aivo-navy-400 mb-8">
          <Link href="/" className="hover:text-aivo-purple-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/legal" className="hover:text-aivo-purple-600">Legal</Link>
          <span className="mx-2">/</span>
          <span className="text-aivo-navy-600">Privacy Policy</span>
        </nav>

        <h1 className="text-4xl font-extrabold text-aivo-navy-800 mb-4">Privacy Policy</h1>
        <p className="text-aivo-navy-400 mb-12">Last Updated: January 2025</p>

        <div className="space-y-10 text-aivo-navy-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-3">1. Introduction</h2>
            <p>
              AIVO Learning (&ldquo;AIVO,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) operates the AIVO Learning platform, including our website at aivolearning.com, mobile applications, and related services (collectively, the &ldquo;Service&rdquo;). This Privacy Policy describes how we collect, use, store, and protect personal information when you use our Service.
            </p>
            <p className="mt-3">
              We are committed to protecting the privacy of all our users, especially children. We comply with the Family Educational Rights and Privacy Act (FERPA), the Children&apos;s Online Privacy Protection Act (COPPA), the General Data Protection Regulation (GDPR), and applicable state privacy laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-3">2. Information We Collect</h2>
            <h3 className="text-lg font-medium text-aivo-navy-700 mt-4 mb-2">Account Information</h3>
            <p>When you create an account, we collect your name, email address, and role (parent, teacher, or administrator). If you subscribe to a paid plan, we collect billing information through our payment processor, Stripe. We do not store credit card numbers on our servers.</p>

            <h3 className="text-lg font-medium text-aivo-navy-700 mt-4 mb-2">Student Information</h3>
            <p>For student profiles, we collect the student&apos;s first name (or nickname), grade level, age range, learning preferences, and optionally, IEP documents uploaded by parents or educators. IEP documents are processed by our AI to extract learning goals and accommodations, then securely stored in encrypted form.</p>

            <h3 className="text-lg font-medium text-aivo-navy-700 mt-4 mb-2">Usage and Learning Data</h3>
            <p>We collect data generated through use of the Service, including session logs, assessment results, AI tutor interactions, lesson completion data, quiz scores, and progress metrics. This data is used to power our Brain Clone AI and provide personalized learning experiences.</p>

            <h3 className="text-lg font-medium text-aivo-navy-700 mt-4 mb-2">Brain Clone Data</h3>
            <p>Our AI generates learning profiles (&ldquo;Brain Clones&rdquo;) for each student, which include knowledge graphs, mastery levels, engagement patterns, and personalized recommendations. Brain Clone data is derived from student interactions and is considered student data under FERPA.</p>

            <h3 className="text-lg font-medium text-aivo-navy-700 mt-4 mb-2">Technical Data</h3>
            <p>We automatically collect IP addresses, browser type, device information, and operating system version for security and service improvement purposes. We do not use tracking cookies. Our analytics provider, Plausible, is cookieless and does not collect personally identifiable information.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-3">3. How We Use Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Provide and personalize the learning experience through Brain Clone AI</li>
              <li>Generate adaptive content, assessments, and AI tutor interactions</li>
              <li>Track and report student progress toward learning goals and IEP objectives</li>
              <li>Communicate with you about your account, updates, and support requests</li>
              <li>Improve our Service through aggregated, de-identified analytics</li>
              <li>Comply with legal obligations, including FERPA reporting requirements</li>
              <li>Ensure the security and integrity of our platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-3">4. Student Data Protection</h2>
            <h3 className="text-lg font-medium text-aivo-navy-700 mt-4 mb-2">FERPA Compliance</h3>
            <p>When AIVO is used by schools or districts, we act as a &ldquo;school official&rdquo; with a legitimate educational interest under FERPA. We use student education records solely for the purpose of providing the educational services described in our agreements with schools. We do not use student data for advertising, marketing, or any purpose unrelated to education.</p>

            <h3 className="text-lg font-medium text-aivo-navy-700 mt-4 mb-2">COPPA Compliance</h3>
            <p>We do not knowingly collect personal information from children under 13 without verifiable parental consent. When a parent creates a student profile for a child under 13, the parent provides consent for collection of their child&apos;s information in connection with the educational services. Parents may review their child&apos;s information, request deletion, and withdraw consent at any time.</p>

            <h3 className="text-lg font-medium text-aivo-navy-700 mt-4 mb-2">Brain Clone Data Ownership</h3>
            <p>Brain Clone data is owned by the parent or guardian (for family accounts) or the school/district (for institutional accounts). Brain Clone data can be exported in a standard machine-readable format at any time. Upon account deletion, all Brain Clone data is permanently deleted within 30 days.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-3">5. Data Sharing</h2>
            <p>We share personal information only in the following limited circumstances:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>School and district administrators:</strong> For enrolled students, authorized educators and administrators can access student progress data and Brain Clone insights through their dashboard.</li>
              <li><strong>Service providers:</strong> We use third-party service providers for hosting (cloud infrastructure), payment processing (Stripe), and analytics (Plausible). All service providers are bound by data processing agreements and may only use data to provide services to us.</li>
              <li><strong>Legal requirements:</strong> We may disclose information when required by law, subpoena, court order, or to protect the safety of our users.</li>
            </ul>
            <p className="mt-3 font-medium">We never sell personal information to third parties. We never use student data for advertising or marketing purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-3">6. Data Security</h2>
            <p>We implement industry-standard security measures to protect your data:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>AES-256 encryption for data at rest</li>
              <li>TLS 1.3 encryption for data in transit</li>
              <li>SOC 2 Type II certified infrastructure</li>
              <li>Annual third-party penetration testing</li>
              <li>Role-based access controls with least-privilege principles</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Employee security training and background checks</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-3">7. Data Retention</h2>
            <p>We retain personal information for as long as your account is active or as needed to provide the Service. When you delete your account or request data deletion:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Active data is deleted within 30 days of the request</li>
              <li>Backup copies are purged within 90 days</li>
              <li>Aggregated, de-identified data may be retained for research and improvement purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-3">8. Your Rights</h2>
            <p>You have the following rights regarding your personal information:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>Access:</strong> Request a copy of all personal data we hold about you or your child</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request complete erasure of your data</li>
              <li><strong>Portability:</strong> Export your data in a standard machine-readable format (JSON or CSV)</li>
              <li><strong>Objection:</strong> Object to certain types of data processing</li>
              <li><strong>Restriction:</strong> Request that we limit how we process your data</li>
            </ul>
            <p className="mt-3">EU and UK residents have additional rights under the GDPR and UK GDPR, including the right to lodge a complaint with a supervisory authority. California residents have additional rights under the CCPA/CPRA.</p>
            <p className="mt-3">To exercise any of these rights, contact us at <a href="mailto:privacy@aivolearning.com" className="text-aivo-purple-600 hover:underline">privacy@aivolearning.com</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-3">9. International Data Transfers</h2>
            <p>AIVO is based in the United States, and personal data is processed and stored in the United States. If you are located outside the United States, your data will be transferred to and processed in the United States. For EU residents, we use Standard Contractual Clauses (SCCs) approved by the European Commission to ensure adequate data protection for international transfers.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-3">10. Children&apos;s Privacy</h2>
            <p>We provide additional protections for children under 13 in compliance with COPPA. Parental consent is required before we collect any personal information from a child under 13. Parents can at any time:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Review their child&apos;s personal information and Brain Clone data</li>
              <li>Request corrections to their child&apos;s information</li>
              <li>Request deletion of their child&apos;s account and all associated data</li>
              <li>Withdraw consent for further data collection</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-3">11. Analytics</h2>
            <p>We use Plausible Analytics, a privacy-friendly, cookieless web analytics tool. Plausible does not collect personal data, does not use cookies, and is fully compliant with GDPR, CCPA, and PECR. All analytics data is aggregated and cannot be used to identify individual users.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-3">12. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of material changes by email at least 30 days before they take effect. Continued use of the Service after the effective date constitutes acceptance of the updated policy. We encourage you to review this policy periodically.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-3">13. Contact Us</h2>
            <p>If you have questions about this Privacy Policy or our data practices, contact us:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Email: <a href="mailto:privacy@aivolearning.com" className="text-aivo-purple-600 hover:underline">privacy@aivolearning.com</a></li>
              <li>Data Protection Officer: <a href="mailto:dpo@aivolearning.com" className="text-aivo-purple-600 hover:underline">dpo@aivolearning.com</a></li>
              <li>Mail: AIVO Learning, 123 Education Lane, San Francisco, CA 94105</li>
            </ul>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-aivo-navy-100">
          <Link href="/legal" className="text-aivo-purple-600 hover:text-aivo-purple-700 font-medium">
            ← Back to Legal
          </Link>
        </div>
      </div>
    </div>
  );
}

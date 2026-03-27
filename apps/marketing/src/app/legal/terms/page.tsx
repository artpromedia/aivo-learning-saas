import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | AIVO",
  description:
    "Terms of Service governing use of the AIVO Learning platform. Read about your rights and obligations.",
  openGraph: {
    title: "Terms of Service | AIVO",
    description:
      "Terms of Service governing use of the AIVO Learning platform.",
  },
};

export default function TermsOfServicePage() {
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
              Terms of Service
            </span>
          </nav>
          <h1 className="text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-lg text-aivo-navy-500">
            Last Updated: January 2025
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          {/* 1. Acceptance of Terms */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              By accessing or using the AIVO Learning platform ("Service"),
              including any associated websites, mobile applications, and APIs,
              you ("User," "you," or "your") agree to be bound by these Terms of
              Service ("Terms"). If you do not agree to all of these Terms, you
              may not access or use the Service.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              These Terms constitute a legally binding agreement between you and
              AIVO Learning, Inc. ("AIVO," "we," "us," or "our"). By creating
              an account, subscribing to a plan, or otherwise using the Service,
              you acknowledge that you have read, understood, and agree to be
              bound by these Terms, as well as our Privacy Policy, which is
              incorporated herein by reference.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              We may update these Terms from time to time. Your continued use of
              the Service following the posting of revised Terms means that you
              accept and agree to the changes. If you are using the Service on
              behalf of an organization, you represent and warrant that you have
              the authority to bind that organization to these Terms.
            </p>
          </div>

          {/* 2. Description of Service */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-4">
              2. Description of Service
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              AIVO provides an AI-powered personalized learning platform
              designed to deliver tailored educational experiences for students
              of all functioning levels. The Service includes, but is not
              limited to, AI-driven tutoring sessions, adaptive learning paths,
              Brain Clone technology for personalized learning profiles,
              progress tracking dashboards, and IEP integration tools.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              The Service is intended for use by parents, guardians, teachers,
              school administrators, and district officials to support student
              learning outcomes. AIVO continuously improves its AI models and
              platform features, and the specific features and functionality of
              the Service may change over time.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              While AIVO strives to provide high-quality educational tools and
              content, the Service is designed to supplement — not replace —
              traditional education, certified teachers, licensed therapists, or
              other professional educational services. The AI tutors and
              generated content are educational aids and should be treated as
              such.
            </p>
          </div>

          {/* 3. Account Registration */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-4">
              3. Account Registration
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              To access certain features of the Service, you must create an
              account. You must be at least 18 years of age, or the age of
              majority in your jurisdiction, to create an account. If you are
              under 18, you may only use the Service with the involvement and
              consent of a parent or legal guardian who agrees to be bound by
              these Terms.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              When registering for an account, you agree to provide accurate,
              current, and complete information, including your name, email
              address, and role (parent, teacher, or administrator). You are
              responsible for maintaining the accuracy of this information and
              for promptly updating it if it changes.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              You are solely responsible for maintaining the confidentiality of
              your account credentials, including your password. You agree to
              immediately notify AIVO of any unauthorized use of your account or
              any other breach of security. AIVO will not be liable for any
              losses or damages arising from your failure to safeguard your
              account credentials.
            </p>
          </div>

          {/* 4. Subscription and Billing */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-4">
              4. Subscription and Billing
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              AIVO offers multiple subscription plans, including a Free plan, a
              Pro plan, and a Premium plan. The Pro plan is available at $39.99
              per month when billed monthly, or $24.99 per month when billed
              annually. Premium plan pricing is available for districts and
              institutional accounts upon request. The features available under
              each plan are described on our pricing page and may be updated
              from time to time.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              Paid subscriptions are billed on a recurring basis (monthly or
              annually, depending on your selected billing cycle) until you
              cancel. By subscribing to a paid plan, you authorize AIVO to
              charge your designated payment method at the beginning of each
              billing cycle. All fees are stated in U.S. dollars and are
              non-refundable except as expressly set forth in these Terms.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              You may cancel your subscription at any time through your account
              settings. Cancellation will take effect at the end of your current
              billing period, and you will retain access to paid features until
              that time. For annual subscriptions, if you cancel within the
              first 30 days, you are eligible for a pro-rated refund of the
              unused portion of your subscription. No refunds will be issued for
              cancellations after 30 days on annual plans or for monthly
              subscriptions.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO reserves the right to change subscription pricing with at
              least 30 days notice. Price changes will take effect at the start
              of your next billing cycle. If you do not agree with the new
              pricing, you may cancel your subscription before the change takes
              effect.
            </p>
          </div>

          {/* 5. Student Data and Privacy */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-4">
              5. Student Data and Privacy
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              AIVO is committed to protecting student data and complying with
              all applicable privacy laws, including the Family Educational
              Rights and Privacy Act (FERPA), the Children&apos;s Online Privacy
              Protection Act (COPPA), and applicable state student privacy laws.
              We treat all student data with the highest level of care and
              security.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              Student data, including educational records, assessment results,
              and learning profiles, is owned by the student&apos;s parent or
              legal guardian (or the student, if over 18). AIVO does not claim
              ownership of any student data and will not use student data for
              advertising, marketing, or any purpose other than providing and
              improving the educational Service.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              Brain Clone data — the AI-generated learning profiles created for
              each student — can be exported in a standard, machine-readable
              format at any time. You may also request complete deletion of
              Brain Clone data through your account settings or by contacting
              our support team. For full details on how we handle personal and
              student data, please review our{" "}
              <Link
                href="/legal/privacy"
                className="text-aivo-purple-600 hover:text-aivo-purple-700 underline"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>

          {/* 6. Acceptable Use */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-4">
              6. Acceptable Use
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              You agree to use the Service only for lawful purposes and in
              accordance with these Terms. You are responsible for all activity
              that occurs under your account and for ensuring that all users you
              authorize comply with these Terms.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              You agree not to engage in any of the following prohibited
              activities:
            </p>
            <ul className="list-disc pl-6 text-aivo-navy-600 leading-relaxed mb-4 space-y-2">
              <li>
                Reverse engineering, decompiling, disassembling, or otherwise
                attempting to discover the source code, algorithms, or
                underlying technology of the Service or its AI models.
              </li>
              <li>
                Scraping, crawling, or using automated tools to extract data or
                content from the Service without express written permission.
              </li>
              <li>
                Disrupting, interfering with, or attempting to gain unauthorized
                access to the Service, its servers, or related systems or
                networks.
              </li>
              <li>
                Sharing your account credentials with third parties or allowing
                multiple individuals to use a single account.
              </li>
              <li>
                Using the Service for any unauthorized commercial purpose,
                including reselling access, content, or AI-generated materials.
              </li>
              <li>
                Uploading or transmitting any content that is unlawful, harmful,
                threatening, abusive, defamatory, or otherwise objectionable.
              </li>
            </ul>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO reserves the right to suspend or terminate your account if
              you violate these acceptable use provisions, with or without prior
              notice, depending on the severity of the violation.
            </p>
          </div>

          {/* 7. Intellectual Property */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-4">
              7. Intellectual Property
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              The Service, including all software, AI models, algorithms,
              designs, text, graphics, logos, and other content provided by AIVO
              ("AIVO Content"), is the exclusive property of AIVO Learning, Inc.
              and is protected by copyright, trademark, patent, and other
              intellectual property laws. You may not copy, modify, distribute,
              or create derivative works based on AIVO Content without our
              express written permission.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              You retain full ownership of all content you upload to the
              Service, including IEP documents, assignments, educational
              materials, and other user-generated content ("User Content"). By
              uploading User Content, you grant AIVO a limited,
              non-exclusive, non-transferable license to use, process, and
              analyze such content solely for the purpose of providing and
              improving the Service for you.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              This license does not grant AIVO any ownership rights in your User
              Content and will terminate upon deletion of your content or
              account. AIVO will not use your User Content to train general AI
              models that would be shared with or benefit other users without
              your explicit consent.
            </p>
          </div>

          {/* 8. AI Tutors and Generated Content */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-4">
              8. AI Tutors and Generated Content
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              AIVO&apos;s AI tutors provide educational guidance, explanations,
              practice problems, and personalized learning recommendations. The
              AI-generated content and tutoring interactions are designed to
              support and enhance the learning process but are not a substitute
              for instruction from certified teachers, licensed therapists, or
              other qualified professionals.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              While our AI tutors are designed to be accurate and helpful, they
              may occasionally produce errors, incomplete information, or
              responses that do not fully address a student&apos;s specific
              needs. Parents, guardians, and educators should exercise their own
              judgment and not rely solely on AI-generated content for
              educational or therapeutic decisions.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO does not provide medical, psychological, or therapeutic
              advice through its AI tutors. If you have concerns about a
              student&apos;s learning, development, or well-being, please
              consult with qualified professionals. The AI tutors&apos;
              recommendations regarding IEP goals and accommodations are
              suggestions only and should be reviewed by qualified IEP team
              members.
            </p>
          </div>

          {/* 9. Disclaimer of Warranties */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-4">
              9. Disclaimer of Warranties
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS
              AVAILABLE&quot; BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER
              EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES
              OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
              NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              AIVO does not warrant that the Service will be uninterrupted,
              error-free, or completely secure. We do not guarantee any specific
              educational outcomes, improvements in test scores, or achievement
              of IEP goals as a result of using the Service. Educational
              outcomes depend on numerous factors, many of which are outside of
              AIVO&apos;s control.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              Some jurisdictions do not allow the exclusion of certain
              warranties, so some of the above exclusions may not apply to you.
              In such cases, AIVO&apos;s warranties will be limited to the
              fullest extent permitted by applicable law.
            </p>
          </div>

          {/* 10. Limitation of Liability */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-4">
              10. Limitation of Liability
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT
              SHALL AIVO, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR
              AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
              CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO
              LOSS OF DATA, LOSS OF PROFITS, OR INTERRUPTION OF SERVICE, ARISING
              OUT OF OR RELATED TO YOUR USE OF OR INABILITY TO USE THE SERVICE.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              AIVO&apos;s total aggregate liability arising out of or relating
              to these Terms or the Service shall not exceed the total amount of
              fees paid by you to AIVO during the twelve (12) months immediately
              preceding the event giving rise to the claim. If you have not paid
              any fees to AIVO, our total liability shall not exceed one hundred
              dollars ($100).
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              These limitations apply regardless of the theory of liability,
              whether based on warranty, contract, tort (including negligence),
              strict liability, or any other legal theory, and whether or not
              AIVO has been advised of the possibility of such damages.
            </p>
          </div>

          {/* 11. Indemnification */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-4">
              11. Indemnification
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              You agree to indemnify, defend, and hold harmless AIVO Learning,
              Inc. and its officers, directors, employees, agents, and
              affiliates from and against any and all claims, damages, losses,
              liabilities, costs, and expenses (including reasonable
              attorneys&apos; fees) arising out of or relating to: (a) your use
              of the Service; (b) your violation of these Terms; (c) your
              violation of any applicable law or the rights of any third party;
              or (d) any content you upload or submit through the Service.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              AIVO reserves the right, at its own expense, to assume the
              exclusive defense and control of any matter otherwise subject to
              indemnification by you, in which event you agree to cooperate with
              AIVO in the defense of such claim. This indemnification obligation
              shall survive the termination of your account and these Terms.
            </p>
          </div>

          {/* 12. Modifications */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-4">
              12. Modifications to Terms
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              AIVO reserves the right to modify these Terms at any time. If we
              make material changes, we will provide at least 30 days advance
              notice by posting the updated Terms on our website and sending a
              notification to the email address associated with your account.
              Non-material changes may be made without prior notice.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              Your continued use of the Service after the effective date of any
              modifications constitutes your acceptance of the revised Terms. If
              you do not agree to the modified Terms, you must discontinue your
              use of the Service and may cancel your subscription as described
              in Section 4.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              We encourage you to periodically review these Terms to stay
              informed about our terms and conditions. The &quot;Last
              Updated&quot; date at the top of this page indicates when these
              Terms were last revised.
            </p>
          </div>

          {/* 13. Termination */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-4">
              13. Termination
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              Either party may terminate these Terms at any time. You may
              terminate by canceling your account through your account settings
              or by contacting our support team. AIVO may terminate or suspend
              your account at any time for cause, including violation of these
              Terms, or without cause upon 30 days written notice.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              Upon termination, your right to access the Service will cease
              immediately. However, you will have a 30-day grace period after
              termination during which you may export your data, including
              student records, Brain Clone profiles, progress reports, and other
              content stored in your account. After this 30-day period, AIVO
              will delete your data in accordance with our data retention
              policies described in our Privacy Policy.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              Provisions of these Terms that by their nature should survive
              termination shall survive, including but not limited to ownership
              provisions, warranty disclaimers, indemnification, and limitations
              of liability.
            </p>
          </div>

          {/* 14. Governing Law */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-4">
              14. Governing Law
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              These Terms shall be governed by and construed in accordance with
              the laws of the State of California, United States of America,
              without regard to its conflict of law provisions. Any legal
              proceedings arising out of or relating to these Terms that are not
              subject to arbitration (as described in Section 15) shall be
              brought exclusively in the state or federal courts located in San
              Francisco County, California.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              You consent to the personal jurisdiction of such courts and waive
              any objection to venue in such courts. The United Nations
              Convention on Contracts for the International Sale of Goods does
              not apply to these Terms.
            </p>
          </div>

          {/* 15. Dispute Resolution */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-4">
              15. Dispute Resolution
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              Any dispute, controversy, or claim arising out of or relating to
              these Terms, or the breach, termination, or invalidity thereof,
              shall be resolved through binding arbitration administered by the
              American Arbitration Association (AAA) in accordance with its
              Commercial Arbitration Rules. The arbitration shall take place in
              San Francisco, California, and the language of the arbitration
              shall be English.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              The arbitrator&apos;s decision shall be final and binding on both
              parties and may be entered as a judgment in any court of competent
              jurisdiction. Each party shall bear its own costs of arbitration,
              and the parties shall share equally the fees and expenses of the
              arbitrator. The arbitrator shall have no authority to award
              punitive or exemplary damages.
            </p>
            <p className="text-aivo-navy-600 leading-relaxed">
              Notwithstanding the above, you may opt out of binding arbitration
              and instead pursue claims in small claims court, provided that
              your claims qualify for small claims court jurisdiction. To opt
              out, you must notify AIVO in writing within 30 days of first
              accepting these Terms. Additionally, either party may seek
              injunctive or other equitable relief in any court of competent
              jurisdiction to prevent the actual or threatened infringement of
              intellectual property rights.
            </p>
          </div>

          {/* 16. Contact */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-aivo-navy-800 mb-4">
              16. Contact Information
            </h2>
            <p className="text-aivo-navy-600 leading-relaxed mb-4">
              If you have any questions, concerns, or requests regarding these
              Terms of Service, please contact us at:
            </p>
            <div className="rounded-xl border border-aivo-navy-100 bg-aivo-navy-50 p-6 text-aivo-navy-600">
              <p className="font-semibold text-aivo-navy-800">
                AIVO Learning, Inc.
              </p>
              <p className="mt-1">Legal Department</p>
              <p className="mt-1">
                Email:{" "}
                <a
                  href="mailto:legal@aivolearning.com"
                  className="text-aivo-purple-600 hover:text-aivo-purple-700 underline"
                >
                  legal@aivolearning.com
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

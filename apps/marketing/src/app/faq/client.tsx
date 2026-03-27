"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  FAQ data                                                           */
/* ------------------------------------------------------------------ */

interface FaqEntry {
  question: string;
  answer: string;
  category: string;
}

const faqs: FaqEntry[] = [
  // ---- Pricing ----
  {
    question: "Is there really a free plan?",
    answer:
      "Yes! Our Free plan gives you access to core features for one student, including Brain Clone AI assessment and 2 AI Tutor sessions per day. No credit card required.",
    category: "Pricing",
  },
  {
    question: "Can I switch plans at any time?",
    answer:
      "Absolutely. You can upgrade or downgrade at any time. If you upgrade mid-cycle, you'll be prorated. If you downgrade, the change takes effect at your next billing date.",
    category: "Pricing",
  },
  {
    question: "Do you offer school or district pricing?",
    answer:
      "Yes! Our Premium plan is designed for schools and districts. Contact our sales team for volume pricing, custom contracts, and implementation support.",
    category: "Pricing",
  },
  {
    question: "How does the free trial work?",
    answer:
      "The Pro plan comes with a 14-day free trial. You get full access to all Pro features. Cancel anytime during the trial and you won't be charged.",
    category: "Pricing",
  },
  {
    question: "Can I use AIVO offline?",
    answer:
      "Pro and Premium plans include offline access through our mobile app. Lessons and tutor sessions sync automatically when you reconnect.",
    category: "Pricing",
  },
  {
    question: "What subjects does AIVO cover?",
    answer:
      "AIVO covers Math, English Language Arts, Science, History, and Coding through our five specialized AI Tutors: Nova, Sage, Spark, Chrono, and Pixel.",
    category: "Pricing",
  },
  {
    question: "Is my child's data safe?",
    answer:
      "We are FERPA and COPPA compliant, and SOC 2 Type II certified. All student data is encrypted at rest and in transit. We never sell data to third parties.",
    category: "Pricing",
  },
  {
    question: "What if my child has an IEP?",
    answer:
      "AIVO is built for students with IEPs. Upload your child's IEP document and our AI automatically aligns content, accommodations, and progress tracking to their specific goals.",
    category: "Pricing",
  },

  // ---- Getting Started ----
  {
    question: "How do I create an account?",
    answer:
      "Visit aivolearning.com/get-started and sign up with your email. You'll complete a quick learning assessment, and your Brain Clone AI will be ready in minutes.",
    category: "Getting Started",
  },
  {
    question: "What devices does AIVO support?",
    answer:
      "AIVO works on any modern web browser (Chrome, Safari, Firefox, Edge) and our native mobile apps for iOS and Android. Offline access is available on Pro and Premium plans.",
    category: "Getting Started",
  },

  // ---- AI Tutors ----
  {
    question: "Can my child switch between AI tutors?",
    answer:
      "Yes! Students can work with any of our 5 AI tutors at any time. Each tutor specializes in a different subject: Nova (Math), Sage (ELA), Spark (Science), Chrono (History), and Pixel (Coding).",
    category: "AI Tutors",
  },
  {
    question: "How do AI tutors adapt to my child?",
    answer:
      "Our Brain Clone AI builds a unique learning profile for each student. AI tutors use this profile to adjust difficulty, pacing, teaching style, and content to match how your child learns best.",
    category: "AI Tutors",
  },

  // ---- IEP Support ----
  {
    question: "How does AIVO handle IEP goals?",
    answer:
      "Upload your child's IEP document and AIVO automatically identifies goals, creates aligned learning activities, tracks progress, and generates compliant progress reports for IEP meetings.",
    category: "IEP Support",
  },
  {
    question: "Is AIVO approved for use in IEP accommodations?",
    answer:
      "Many districts include AIVO as an assistive technology accommodation in IEPs. Contact our education team for documentation to share with your child's IEP team.",
    category: "IEP Support",
  },

  // ---- Technical ----
  {
    question: "What are the system requirements?",
    answer:
      "AIVO requires a modern web browser and an internet connection (minimum 1 Mbps). For offline access, download our mobile app on iOS 15+ or Android 10+.",
    category: "Technical",
  },

  // ---- Privacy ----
  {
    question: "Who can see my child's learning data?",
    answer:
      "Only you (the parent/guardian) and authorized educators can see your child's data. We never share data with third parties for advertising purposes.",
    category: "Privacy",
  },
  {
    question: "Can I delete my child's data?",
    answer:
      "Yes. You can request complete data deletion at any time from your account settings or by contacting support@aivolearning.com. We comply with FERPA, COPPA, and GDPR data deletion requirements.",
    category: "Privacy",
  },
];

const categories = [
  "All",
  "Pricing",
  "Getting Started",
  "AI Tutors",
  "IEP Support",
  "Technical",
  "Privacy",
] as const;

/* ------------------------------------------------------------------ */
/*  Accordion item                                                     */
/* ------------------------------------------------------------------ */

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-aivo-navy-100">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="text-lg font-medium text-aivo-navy-800">
          {question}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="ml-4 shrink-0"
        >
          <ChevronDown className="h-5 w-5 text-aivo-navy-400" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-aivo-navy-500 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export function FaqPageClient() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return faqs.filter((faq) => {
      const matchesCategory =
        activeCategory === "All" || faq.category === activeCategory;
      const matchesSearch =
        q === "" || faq.question.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  /* Build JSON-LD for all FAQs (unfiltered) */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl"
          >
            Frequently Asked Questions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto"
          >
            Everything you need to know about AIVO Learning. Can&apos;t find what
            you&apos;re looking for? Reach out to our support team.
          </motion.p>
        </div>
      </section>

      {/* Search + tabs + accordion */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-6">
          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative mb-8"
          >
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-aivo-navy-300" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions..."
              className="w-full rounded-xl border border-aivo-navy-200 bg-white py-3 pl-12 pr-4 text-aivo-navy-800 placeholder:text-aivo-navy-300 focus:border-aivo-purple-400 focus:outline-none focus:ring-2 focus:ring-aivo-purple-200 transition-colors"
            />
          </motion.div>

          {/* Category tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-10 flex flex-wrap gap-2"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  activeCategory === cat
                    ? "bg-aivo-purple-600 text-white"
                    : "bg-aivo-navy-50 text-aivo-navy-600 hover:bg-aivo-navy-100"
                )}
              >
                {cat}
              </button>
            ))}
          </motion.div>

          {/* FAQ list */}
          <div className="divide-y divide-aivo-navy-100 border-t border-aivo-navy-100">
            {filtered.length === 0 ? (
              <p className="py-12 text-center text-aivo-navy-400">
                No questions match your search. Try a different term or{" "}
                <Link
                  href="/contact"
                  className="text-aivo-purple-600 underline hover:text-aivo-purple-700"
                >
                  contact us
                </Link>
                .
              </p>
            ) : (
              filtered.map((faq) => (
                <FaqItem
                  key={faq.question}
                  question={faq.question}
                  answer={faq.answer}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-aivo-purple-600 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Still have questions?
          </h2>
          <p className="mt-4 text-lg text-aivo-purple-100">
            Our team is here to help. Reach out and we&apos;ll get back to you
            within 24 hours.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 font-semibold text-aivo-purple-600 shadow-sm transition-colors hover:bg-aivo-purple-50"
          >
            Contact us
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </section>
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Minus, ChevronDown } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SectionHeader } from "@/components/shared/section-header";
import { events } from "@/lib/analytics";
import { getVariant, EXPERIMENTS } from "@/lib/ab-testing";

interface PlanData {
  name: string;
  tagline: string;
  monthlyPrice: number | null;
  annualPrice: number | null;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  popular?: boolean;
}

const plans: PlanData[] = [
  {
    name: "Free",
    tagline: "For individual learners",
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      "1 student profile",
      "2 AI tutors (Newton + Shakespeare)",
      "Basic Brain Clone™",
      "30 min/day limit",
      "Community support",
    ],
    ctaLabel: "Get Started Free",
    ctaHref: "/get-started",
  },
  {
    name: "Pro",
    tagline: "For families",
    monthlyPrice: 19,
    annualPrice: 15.20,
    features: [
      "Up to 5 student profiles",
      "All 5 AI tutors",
      "Advanced Brain Clone™ with weekly insights",
      "Unlimited learning time",
      "Parent dashboard",
      "Priority email support",
      "Progress reports",
    ],
    ctaLabel: "Start 14-Day Free Trial",
    ctaHref: "/get-started?plan=pro",
    popular: true,
  },
  {
    name: "District",
    tagline: "For schools & districts",
    monthlyPrice: null,
    annualPrice: null,
    features: [
      "Unlimited students",
      "All 5 AI tutors + custom tutor config",
      "Full Brain Clone™ with IEP integration",
      "SSO/SAML",
      "Admin dashboard & analytics",
      "Dedicated success manager",
      "SLA & FERPA compliance",
      "API access",
    ],
    ctaLabel: "Book a Demo",
    ctaHref: "/demo",
  },
];

const featureMatrix = [
  { feature: "Student profiles", free: "1", pro: "Up to 5", district: "Unlimited" },
  { feature: "AI Tutors", free: "2", pro: "All 5", district: "All 5 + Custom" },
  { feature: "Brain Clone™", free: "Basic", pro: "Advanced", district: "Full + IEP" },
  { feature: "Daily learning time", free: "30 min", pro: "Unlimited", district: "Unlimited" },
  { feature: "Parent dashboard", free: "—", pro: "✓", district: "✓" },
  { feature: "Weekly insights", free: "—", pro: "✓", district: "✓" },
  { feature: "Progress reports", free: "—", pro: "✓", district: "✓" },
  { feature: "SSO/SAML", free: "—", pro: "—", district: "✓" },
  { feature: "IEP integration", free: "—", pro: "—", district: "✓" },
  { feature: "Admin analytics", free: "—", pro: "—", district: "✓" },
  { feature: "API access", free: "—", pro: "—", district: "✓" },
  { feature: "Support", free: "Community", pro: "Priority Email", district: "Dedicated Manager" },
];

const faqs = [
  {
    q: "Is there really a free plan?",
    a: "Yes! Our Free plan gives you 1 student profile, 2 AI tutors, and 30 minutes of learning per day. No credit card required.",
  },
  {
    q: "How does the 14-day free trial work?",
    a: "Start with full access to all Pro features for 14 days. Cancel anytime during the trial and you won't be charged. No credit card required to start.",
  },
  {
    q: "Can I switch plans at any time?",
    a: "Absolutely. Upgrade or downgrade at any time. If you upgrade mid-cycle, you'll be prorated. Downgrades take effect at your next billing date.",
  },
  {
    q: "Is my child's data safe?",
    a: "We are FERPA and COPPA compliant, and SOC 2 Type II certified. All student data is encrypted at rest and in transit. We never sell data to third parties.",
  },
  {
    q: "Do you offer school or district pricing?",
    a: "Yes! Our District plan is designed for schools and districts with custom pricing. Contact our sales team for volume pricing and implementation support.",
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-aivo-navy-100">
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) events.faqExpand(question);
        }}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="text-lg font-medium text-aivo-navy-800">{question}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="ml-4 shrink-0">
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

export function PricingPageClient() {
  const defaultCycle = getVariant(
    EXPERIMENTS.pricingDefault.id,
    [...EXPERIMENTS.pricingDefault.variants]
  );
  const [annual, setAnnual] = useState(defaultCycle === "annual");
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    events.pricingView(annual ? "annual" : "monthly");
  }, []);

  function handleToggle() {
    const next = !annual;
    setAnnual(next);
    events.pricingToggle(next ? "annual" : "monthly");
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl"
          >
            Simple, Transparent Pricing
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto"
          >
            Start free, upgrade when you&apos;re ready. No hidden fees.
          </motion.p>

          {/* Billing toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 flex items-center justify-center gap-3"
          >
            <span className={cn("text-sm font-medium", !annual ? "text-aivo-navy-800" : "text-aivo-navy-400")}>
              Monthly
            </span>
            <button
              onClick={handleToggle}
              className={cn(
                "relative inline-flex h-7 w-12 shrink-0 rounded-full border-2 border-transparent transition-colors",
                annual ? "bg-aivo-purple-600" : "bg-aivo-navy-200"
              )}
              role="switch"
              aria-checked={annual}
              aria-label="Toggle annual billing"
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow transition-transform",
                  annual ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
            <span className={cn("text-sm font-medium", annual ? "text-aivo-navy-800" : "text-aivo-navy-400")}>
              Annual
            </span>
            {annual && (
              <span className="ml-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                Save 20%
              </span>
            )}
          </motion.div>
        </div>
      </section>

      {/* Plan cards */}
      <section className="mx-auto max-w-7xl px-6 -mt-4 pb-20">
        <div className="grid gap-8 md:grid-cols-3 items-start">
          {plans.map((plan, i) => {
            const price = annual ? plan.annualPrice : plan.monthlyPrice;
            const isCustom = price === null;

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-white p-8 shadow-sm",
                  plan.popular
                    ? "ring-2 ring-aivo-purple-500 border-aivo-purple-500 scale-105 md:scale-110 z-10"
                    : "border-aivo-navy-100"
                )}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-aivo-purple-600 to-aivo-teal-500 px-4 py-1 text-xs font-semibold text-white">
                    MOST POPULAR
                  </span>
                )}

                <h3 className="text-xl font-bold text-aivo-navy-800">{plan.name}</h3>
                <p className="mt-1 text-sm text-aivo-navy-500">{plan.tagline}</p>

                <div className="mt-6 flex items-baseline">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`${plan.name}-${annual}`}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="text-4xl font-bold tracking-tight text-aivo-navy-800"
                    >
                      {isCustom ? "Custom" : price === 0 ? "$0" : `$${price}`}
                    </motion.span>
                  </AnimatePresence>
                  {!isCustom && price !== null && price > 0 && (
                    <span className="ml-1 text-sm text-aivo-navy-400">
                      /month{annual ? " billed annually" : ""}
                    </span>
                  )}
                  {!isCustom && price === 0 && (
                    <span className="ml-1 text-sm text-aivo-navy-400">/month</span>
                  )}
                </div>

                <ul className="mt-8 space-y-3 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-aivo-teal-600" />
                      <span className="text-sm text-aivo-navy-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.ctaHref}
                  className={cn(
                    "mt-8 block w-full rounded-lg px-4 py-3 text-center font-semibold transition-colors",
                    plan.popular
                      ? "bg-aivo-purple-600 text-white hover:bg-aivo-purple-700 text-base py-3.5"
                      : "bg-aivo-navy-50 text-aivo-navy-800 hover:bg-aivo-navy-100 text-sm"
                  )}
                >
                  {plan.ctaLabel}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Feature comparison table (expandable) */}
      <section className="bg-aivo-navy-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader title="Compare Plans" subtitle="See exactly what's included in each plan." />

          <div className="text-center mb-6">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="inline-flex items-center gap-2 text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
            >
              {showComparison ? "Hide comparison" : "Show full comparison"}
              <motion.span animate={{ rotate: showComparison ? 180 : 0 }}>
                <ChevronDown className="w-4 h-4" />
              </motion.span>
            </button>
          </div>

          <AnimatePresence>
            {showComparison && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden"
              >
                <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
                  <table className="w-full min-w-[600px] text-sm">
                    <thead>
                      <tr className="border-b border-aivo-navy-100">
                        <th className="py-4 px-6 text-left font-semibold text-aivo-navy-800">Feature</th>
                        <th className="py-4 px-6 text-center font-semibold text-aivo-navy-800">Free</th>
                        <th className="py-4 px-6 text-center font-semibold text-aivo-purple-600">Pro</th>
                        <th className="py-4 px-6 text-center font-semibold text-aivo-navy-800">District</th>
                      </tr>
                    </thead>
                    <tbody>
                      {featureMatrix.map((row, i) => (
                        <tr
                          key={row.feature}
                          className={cn("border-b border-aivo-navy-50", i % 2 === 0 ? "bg-white" : "bg-aivo-navy-50/50")}
                        >
                          <td className="py-3.5 px-6 font-medium text-aivo-navy-700">{row.feature}</td>
                          {(["free", "pro", "district"] as const).map((tier) => {
                            const value = row[tier];
                            return (
                              <td key={tier} className="py-3.5 px-6 text-center text-aivo-navy-600">
                                {value === "✓" ? (
                                  <Check className="mx-auto h-5 w-5 text-aivo-teal-600" />
                                ) : value === "—" ? (
                                  <Minus className="mx-auto h-5 w-5 text-aivo-navy-300" />
                                ) : (
                                  value
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6">
          <SectionHeader title="Frequently Asked Questions" subtitle="Everything you need to know about Aivo pricing." />
          <div className="divide-y divide-aivo-navy-100 border-t border-aivo-navy-100">
            {faqs.map((faq) => (
              <FaqItem key={faq.q} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-aivo-purple-600 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Still deciding? Talk to our team.
          </h2>
          <p className="mt-4 text-lg text-aivo-purple-100">
            We&apos;ll help you find the right plan for your needs.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/demo"
              className="inline-block rounded-lg bg-white px-8 py-3.5 font-semibold text-aivo-purple-600 shadow-sm transition-colors hover:bg-aivo-purple-50"
            >
              Book a Demo
            </Link>
            <Link
              href="/get-started"
              className="inline-block rounded-lg border-2 border-white px-8 py-3.5 font-semibold text-white transition-colors hover:bg-white/10"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

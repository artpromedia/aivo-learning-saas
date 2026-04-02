"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Minus, ChevronDown } from "lucide-react";
import Link from "next/link";
import { pricingPlans, pricingFeatureMatrix, pricingFaqs } from "@/content/pricing";
import { cn } from "@/lib/utils";
import { SectionHeader } from "@/components/shared/section-header";

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

export function PricingPageClient() {
  const [annual, setAnnual] = useState(true);

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "AIVO Learning",
            description:
              "AI-powered personalized learning platform with Brain Clone AI technology.",
            brand: { "@type": "Brand", name: "AIVO" },
            offers: pricingPlans.map((plan) => ({
              "@type": "Offer",
              name: plan.name,
              price: annual ? plan.yearlyPrice : plan.monthlyPrice,
              priceCurrency: "USD",
              priceValidUntil: "2027-12-31",
              availability: "https://schema.org/InStock",
            })),
          }),
        }}
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
            Simple, transparent pricing
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto"
          >
            Start free and scale as your family or school grows. No hidden fees,
            no surprises.
          </motion.p>

          {/* Billing toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 flex items-center justify-center gap-3"
          >
            <span
              className={cn(
                "text-sm font-medium",
                !annual ? "text-aivo-navy-800" : "text-aivo-navy-400"
              )}
            >
              Monthly
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className={cn(
                "relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-aivo-purple-500 focus-visible:ring-offset-2",
                annual ? "bg-aivo-purple-600" : "bg-aivo-navy-200"
              )}
              role="switch"
              aria-checked={annual}
              aria-label="Toggle annual billing"
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  annual ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
            <span
              className={cn(
                "text-sm font-medium",
                annual ? "text-aivo-navy-800" : "text-aivo-navy-400"
              )}
            >
              Annual
            </span>
            {annual && (
              <span className="ml-1 rounded-full bg-aivo-teal-50 px-2.5 py-0.5 text-xs font-semibold text-aivo-teal-700">
                Save up to 38%
              </span>
            )}
          </motion.div>
        </div>
      </section>

      {/* Plan cards */}
      <section className="mx-auto max-w-7xl px-6 -mt-4 pb-20">
        <div className="grid gap-8 md:grid-cols-3">
          {pricingPlans.map((plan, i) => {
            const price = annual ? plan.yearlyPrice : plan.monthlyPrice;
            const period = annual ? "/yr" : "/mo";

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-white p-8 shadow-sm",
                  plan.popular
                    ? "ring-2 ring-aivo-purple-500 border-aivo-purple-500"
                    : "border-aivo-navy-100"
                )}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-aivo-purple-600 px-4 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                )}

                <h3 className="text-xl font-bold text-aivo-navy-800">
                  {plan.name}
                </h3>
                <p className="mt-2 text-sm text-aivo-navy-500">
                  {plan.description}
                </p>

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
                      {price === 0 ? "Free" : `$${price}`}
                    </motion.span>
                  </AnimatePresence>
                  {price > 0 && (
                    <span className="ml-1 text-sm text-aivo-navy-400">
                      {period}
                    </span>
                  )}
                </div>

                <ul className="mt-8 space-y-3 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-aivo-teal-600" />
                      <span className="text-sm text-aivo-navy-600">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.name === "Premium" ? "/demo" : "/get-started"}
                  className={cn(
                    "mt-8 block w-full rounded-lg px-4 py-3 text-center text-sm font-semibold transition-colors",
                    plan.popular
                      ? "bg-aivo-purple-600 text-white hover:bg-aivo-purple-700"
                      : "bg-aivo-navy-50 text-aivo-navy-800 hover:bg-aivo-navy-100"
                  )}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Feature comparison matrix */}
      <section className="bg-aivo-navy-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader
            title="Compare Plans"
            subtitle="See exactly what's included in each plan."
          />

          <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-aivo-navy-100">
                  <th className="py-4 px-6 text-left font-semibold text-aivo-navy-800">
                    Feature
                  </th>
                  <th className="py-4 px-6 text-center font-semibold text-aivo-navy-800">
                    Free
                  </th>
                  <th className="py-4 px-6 text-center font-semibold text-aivo-purple-600">
                    Pro
                  </th>
                  <th className="py-4 px-6 text-center font-semibold text-aivo-navy-800">
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody>
                {pricingFeatureMatrix.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={cn(
                      "border-b border-aivo-navy-50",
                      i % 2 === 0 ? "bg-white" : "bg-aivo-navy-50/50"
                    )}
                  >
                    <td className="py-3.5 px-6 font-medium text-aivo-navy-700">
                      {row.feature}
                    </td>
                    {(["free", "pro", "premium"] as const).map((tier) => {
                      const value = row[tier];
                      return (
                        <td
                          key={tier}
                          className="py-3.5 px-6 text-center text-aivo-navy-600"
                        >
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
        </div>
      </section>

      {/* FAQ section */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6">
          <SectionHeader
            title="Frequently Asked Questions"
            subtitle="Everything you need to know about AIVO pricing."
          />

          <div className="divide-y divide-aivo-navy-100 border-t border-aivo-navy-100">
            {pricingFaqs.map((faq) => (
              <FaqItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
              />
            ))}
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
            Our team is happy to walk you through AIVO and find the right plan
            for your needs.
          </p>
          <Link
            href="/demo"
            className="mt-8 inline-block rounded-lg bg-white px-8 py-3.5 font-semibold text-aivo-purple-600 shadow-sm transition-colors hover:bg-aivo-purple-50"
          >
            Talk to Sales
          </Link>
        </div>
      </section>
    </>
  );
}

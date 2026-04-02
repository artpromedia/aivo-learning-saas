"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { audiences } from "@/content/audiences";
import { Icon } from "@/components/shared/icon-map";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function AudienceTabs() {
  const [activeTab, setActiveTab] = useState(0);
  const audience = audiences[activeTab];

  return (
    <section className="py-20 sm:py-28 bg-aivo-navy-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-aivo-navy-800 sm:text-4xl">
            Built for Everyone in Education
          </h2>
          <p className="mt-4 text-lg text-aivo-navy-400">
            Whether you are a parent, teacher, or district administrator, AIVO has the tools you need.
          </p>
        </div>

        {/* Tab buttons */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-xl bg-white p-1.5 shadow-sm border border-aivo-navy-100">
            {audiences.map((a, i) => (
              <button
                key={a.id}
                onClick={() => setActiveTab(i)}
                className={cn(
                  "px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200",
                  activeTab === i
                    ? "bg-aivo-purple-600 text-white shadow-sm"
                    : "text-aivo-navy-500 hover:text-aivo-navy-800 hover:bg-aivo-navy-50",
                )}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={audience.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Headline */}
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold text-aivo-navy-800 mb-2">
                {audience.headline}
              </h3>
              <p className="text-aivo-navy-400 max-w-2xl mx-auto">
                {audience.subheadline}
              </p>
            </div>

            {/* Benefits grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {audience.benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="rounded-xl bg-white p-6 border border-aivo-navy-100 shadow-sm"
                >
                  <div className="mb-3 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-aivo-purple-50 text-aivo-purple-600">
                    <Icon name={benefit.icon} size={20} />
                  </div>
                  <h4 className="font-semibold text-aivo-navy-800 mb-1">
                    {benefit.title}
                  </h4>
                  <p className="text-sm text-aivo-navy-400">{benefit.description}</p>
                </div>
              ))}
            </div>

            {/* Walkthrough */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {audience.walkthrough.map((step) => (
                <div key={step.step} className="text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-aivo-purple-600 text-white text-sm font-bold mb-4">
                    {step.step}
                  </div>
                  <h4 className="font-semibold text-aivo-navy-800 mb-2">
                    {step.title}
                  </h4>
                  <p className="text-sm text-aivo-navy-400">{step.description}</p>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div className="max-w-2xl mx-auto text-center bg-white rounded-2xl p-8 border border-aivo-navy-100 shadow-sm">
              <blockquote className="text-lg text-aivo-navy-600 italic mb-4">
                &ldquo;{audience.testimonial.quote}&rdquo;
              </blockquote>
              <p className="font-semibold text-aivo-navy-800">
                {audience.testimonial.name}
              </p>
              <p className="text-sm text-aivo-navy-400">
                {audience.testimonial.role}
              </p>
            </div>

            {/* CTA */}
            <div className="text-center mt-10">
              <Link
                href={audience.ctaHref}
                className="inline-flex items-center justify-center rounded-lg bg-aivo-purple-600 px-8 py-3 text-sm font-semibold text-white hover:bg-aivo-purple-700 transition-colors shadow-sm"
              >
                {audience.ctaLabel}
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { type Audience, audiences } from "@/content/audiences";
import { Icon } from "@/components/shared/icon-map";

interface AudiencePageProps {
  audience: Audience;
}

export function AudiencePage({ audience }: AudiencePageProps) {
  const otherAudiences = audiences.filter((a) => a.id !== audience.id);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-aivo-purple-50 to-white pt-20 pb-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-block rounded-full bg-aivo-purple-100 px-4 py-1.5 text-sm font-semibold text-aivo-purple-700"
          >
            For {audience.label}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl lg:text-6xl"
          >
            {audience.headline}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg text-aivo-navy-500 max-w-3xl mx-auto leading-relaxed"
          >
            {audience.subheadline}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link
              href={audience.ctaHref}
              className="mt-8 inline-block rounded-lg bg-aivo-purple-600 px-8 py-3.5 font-semibold text-white shadow-sm transition-colors hover:bg-aivo-purple-700"
            >
              {audience.ctaLabel}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Benefits grid */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold tracking-tight text-aivo-navy-800 sm:text-4xl">
              Why {audience.label} Love AIVO
            </h2>
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {audience.benefits.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
                className="rounded-2xl border border-aivo-navy-100 bg-white p-6 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-aivo-purple-50">
                  <Icon
                    name={benefit.icon}
                    className="text-aivo-purple-600"
                    size={24}
                  />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-aivo-navy-800">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-aivo-navy-500">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Walkthrough timeline */}
      <section className="bg-aivo-navy-50 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold tracking-tight text-aivo-navy-800 sm:text-4xl">
              How It Works
            </h2>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 hidden h-full w-0.5 bg-aivo-purple-200 md:block" />

            <div className="space-y-12">
              {audience.walkthrough.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: 0.15 * i }}
                  className="relative flex items-start gap-6"
                >
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-aivo-purple-600 text-lg font-bold text-white shadow-md">
                    {step.step}
                  </div>
                  <div className="pt-1">
                    <h3 className="text-xl font-semibold text-aivo-navy-800">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-aivo-navy-500 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="bg-gradient-to-br from-aivo-purple-600 to-aivo-purple-800 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
          >
            <svg
              className="mx-auto h-10 w-10 text-aivo-purple-300"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
            </svg>
            <blockquote className="mt-6 text-xl font-medium leading-relaxed text-white sm:text-2xl">
              &ldquo;{audience.testimonial.quote}&rdquo;
            </blockquote>
            <div className="mt-6">
              <p className="font-semibold text-white">
                {audience.testimonial.role}
              </p>
              <p className="text-sm text-aivo-purple-200">
                {audience.testimonial.location}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-aivo-navy-800 sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mt-4 text-lg text-aivo-navy-500">
              Join thousands of {audience.label.toLowerCase()} who are already
              using AIVO.
            </p>
            <Link
              href={audience.ctaHref}
              className="mt-8 inline-block rounded-lg bg-aivo-purple-600 px-8 py-3.5 font-semibold text-white shadow-sm transition-colors hover:bg-aivo-purple-700"
            >
              {audience.ctaLabel}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Cross-links */}
      <section className="border-t border-aivo-navy-100 bg-aivo-navy-50 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <h3 className="text-center text-lg font-semibold text-aivo-navy-600 mb-8">
            AIVO is also built for
          </h3>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            {otherAudiences.map((other) => (
              <Link
                key={other.id}
                href={`/for-${other.id}`}
                className="w-full sm:w-auto rounded-xl border border-aivo-navy-100 bg-white px-8 py-4 text-center font-medium text-aivo-navy-700 shadow-sm transition-all hover:border-aivo-purple-300 hover:shadow-md"
              >
                Are you a {other.label.toLowerCase().replace(/s$/, "")}?
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

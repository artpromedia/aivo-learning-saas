"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { events } from "@/lib/analytics";
import { AivoWalkthroughPlayer } from "@/components/walkthrough/aivo-walkthrough-player";

const featureCards = [
  {
    emoji: "\ud83e\udde0",
    title: "Brain Clone\u2122 Technology",
    description: "A unique AI model for every student",
  },
  {
    emoji: "\ud83d\udc68\u200d\ud83c\udfeb",
    title: "5 Expert AI Tutors",
    description: "Specialized in every subject area",
  },
  {
    emoji: "\ud83d\udcca",
    title: "Real-Time Analytics",
    description: "Parents & teachers always in the loop",
  },
];

export function WalkthroughShowcase() {
  return (
    <section
      id="product-walkthrough"
      className="py-20 sm:py-28 bg-gradient-to-b from-white to-aivo-navy-50/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-aivo-navy-800">
            See Aivo in Action — No Signup Required
          </h2>
          <p className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto">
            Watch how Aivo creates a personalized learning experience in under
            60 seconds.
          </p>
          <p className="mt-3 text-base text-aivo-navy-500">
            Want a personalized walkthrough?{" "}
            <Link
              href="/demo"
              onClick={() =>
                events.signupClick("walkthrough-request-demo-top")
              }
              className="font-semibold text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
            >
              Request a Demo &rarr;
            </Link>
          </p>
        </motion.div>

        {/* Player */}
        <motion.div
          className="max-w-[900px] mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <AivoWalkthroughPlayer autoplay={false} source="showcase" />
        </motion.div>

        {/* Feature callout cards */}
        <div className="grid sm:grid-cols-3 gap-6 mt-14 max-w-[900px] mx-auto">
          {featureCards.map((card, i) => (
            <motion.div
              key={card.title}
              className="bg-white rounded-xl p-6 shadow-sm border border-aivo-navy-100 text-center hover:-translate-y-1 hover:shadow-md transition-all duration-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 * i }}
            >
              <span className="text-3xl">{card.emoji}</span>
              <h3 className="mt-3 text-lg font-semibold text-aivo-navy-800">
                {card.title}
              </h3>
              <p className="mt-1 text-sm text-aivo-navy-500">
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Request a Demo CTA card */}
        <motion.div
          className="mt-14 max-w-[900px] mx-auto rounded-2xl p-8 sm:p-10 text-center"
          style={{ background: "var(--aivo-purple-gradient)" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-white">
            See how Aivo can transform your classroom
          </h3>
          <p className="mt-3 text-lg text-white/90 max-w-xl mx-auto">
            Get a personalized demo from our education specialists
          </p>
          <Link
            href="/demo"
            onClick={() =>
              events.signupClick("walkthrough-request-demo-bottom")
            }
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-white px-8 py-3.5 font-semibold text-aivo-purple-600 hover:bg-white/90 transition-colors shadow-sm"
          >
            Request a Demo
          </Link>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center mt-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-xl font-semibold text-aivo-navy-800 mb-6">
            Ready to Transform Learning?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/get-started"
              onClick={() => events.signupClick("walkthrough-showcase")}
              className="inline-flex items-center justify-center rounded-lg bg-aivo-purple-600 px-8 py-3.5 font-semibold text-white hover:bg-aivo-purple-700 transition-colors shadow-sm"
            >
              Start Free Trial
            </Link>
            <Link
              href="/demo"
              onClick={() => events.signupClick("walkthrough-showcase-demo")}
              className="inline-flex items-center justify-center rounded-lg border-2 border-aivo-purple-600 px-8 py-3.5 font-semibold text-aivo-purple-600 hover:bg-aivo-purple-50 transition-colors"
            >
              Book a Demo
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

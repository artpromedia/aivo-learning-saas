"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function CtaBand() {
  return (
    <section
      className="py-20 sm:py-28"
      style={{
        background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 50%, #4c1d95 100%)",
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Ready to Transform Learning?
        </motion.h2>
        <motion.p
          className="text-lg text-purple-200 mb-10 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          Join 150+ students already learning with AIVO. Start your free trial today, no credit card required.
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Link
            href="/get-started"
            className="inline-flex items-center justify-center rounded-lg bg-white text-aivo-purple-600 px-8 py-4 text-lg font-semibold hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Get Started Free
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center text-white font-semibold hover:text-purple-200 transition-colors"
          >
            Talk to Sales
            <span className="ml-2">→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

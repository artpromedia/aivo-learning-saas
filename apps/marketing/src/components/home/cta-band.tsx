"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { AppStoreButtons } from "@/components/shared/app-store-buttons";
import { useTranslations } from "@/lib/i18n";

export function CtaBand() {
  const messages = useTranslations();
  return (
    <section
      className="py-20 sm:py-28"
      style={{
        background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 50%, #4c1d95 100%)",
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {messages?.cta?.headline ?? "Ready to Transform Learning?"}
        </motion.h2>
        <motion.p
          className="text-xl text-purple-200 mb-10 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          {messages?.cta?.subheadline ?? "Join 150+ students already learning with AIVO. Start your free trial today \u2014 no credit card required."}
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
            {messages?.cta?.button ?? "Get Started Free"}
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center text-white font-semibold hover:text-purple-200 transition-colors"
          >
            {messages?.cta?.secondary ?? "Talk to Sales"}
            <span className="ml-2">→</span>
          </Link>
        </motion.div>
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <p className="text-sm text-purple-200 mb-3">{messages?.cta?.mobileNote ?? "Also available on mobile"}</p>
          <AppStoreButtons variant="light" className="justify-center" />
        </motion.div>
      </div>
    </section>
  );
}

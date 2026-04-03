"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/providers/i18n-provider";

const partners = [
  "Washington DC",
  "Chicago",
  "Minneapolis",
  "Dallas",
  "Atlanta",
  "Denver",
];

export function SocialProofBar() {
  const { t } = useI18n();

  return (
    <section className="py-12 bg-aivo-navy-50/50 border-y border-aivo-navy-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.p
          className="text-center text-sm font-medium text-aivo-navy-400 mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {t("socialProof", "badge")}
        </motion.p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {partners.map((partner) => (
            <motion.div
              key={partner}
              className="text-aivo-navy-300 hover:text-aivo-navy-600 transition-colors duration-300 font-semibold text-lg grayscale hover:grayscale-0"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              {partner}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

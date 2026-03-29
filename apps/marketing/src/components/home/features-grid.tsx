"use client";

import { motion } from "framer-motion";
import { features } from "@/content/features";
import { Icon } from "@/components/shared/icon-map";
import { SectionHeader } from "@/components/shared/section-header";
import { useTranslations } from "@/lib/i18n";

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function FeaturesGrid() {
  const messages = useTranslations();
  return (
    <section id="features" className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title={messages?.features?.title ?? "Everything Your Students Need to Succeed"}
          subtitle={messages?.features?.subtitle ?? "AIVO combines cutting-edge AI with proven educational science to create a learning experience that adapts to every student."}
        />

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="group rounded-2xl border border-aivo-navy-100 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-aivo-purple-50 text-aivo-purple-600 group-hover:bg-aivo-purple-100 transition-colors">
                <Icon name={feature.icon} size={24} />
              </div>
              <h3 className="text-2xl font-semibold text-aivo-navy-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-lg text-aivo-navy-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { SectionHeader } from "@/components/shared/section-header";
import { useI18n } from "@/providers/i18n-provider";

const tutors = [
  {
    name: "Nova",
    subjectKey: "novaSubject",
    emoji: "🌌",
    personalityKey: "novaPersonality",
    accent: "from-aivo-purple-500 to-aivo-purple-700",
    bg: "bg-aivo-purple-50",
    border: "border-aivo-purple-200",
  },
  {
    name: "Sage",
    subjectKey: "sageSubject",
    emoji: "📚",
    personalityKey: "sagePersonality",
    accent: "from-aivo-teal-500 to-aivo-teal-700",
    bg: "bg-aivo-teal-50",
    border: "border-aivo-teal-200",
  },
  {
    name: "Spark",
    subjectKey: "sparkSubject",
    emoji: "⚡",
    personalityKey: "sparkPersonality",
    accent: "from-amber-500 to-orange-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  {
    name: "Chrono",
    subjectKey: "chronoSubject",
    emoji: "⏳",
    personalityKey: "chronoPersonality",
    accent: "from-rose-500 to-red-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
  },
  {
    name: "Pixel",
    subjectKey: "pixelSubject",
    emoji: "💻",
    personalityKey: "pixelPersonality",
    accent: "from-emerald-500 to-green-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};

export function AiTutors() {
  const { t } = useI18n();

  return (
    <section id="ai-tutors" className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title={t("aiTutors", "title")}
          subtitle={t("aiTutors", "subtitle")}
        />

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {tutors.map((tutor) => (
            <motion.div
              key={tutor.name}
              variants={item}
              className={`group relative rounded-2xl border ${tutor.border} ${tutor.bg} p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg overflow-hidden`}
            >
              {/* Gradient accent bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${tutor.accent}`} />

              <div className="text-4xl mb-4">{tutor.emoji}</div>
              <h3 className="text-xl font-bold text-aivo-navy-800 mb-1">
                {tutor.name}
              </h3>
              <p className="text-sm font-medium text-aivo-navy-500 mb-3">
                {t("aiTutors", tutor.subjectKey)}
              </p>
              <p className="text-sm text-aivo-navy-400 leading-relaxed">
                {t("aiTutors", tutor.personalityKey)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

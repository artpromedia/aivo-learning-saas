"use client";

import { motion } from "framer-motion";
import { UserPlus, Brain, Rocket } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { useI18n } from "@/providers/i18n-provider";

const steps = [
  {
    icon: UserPlus,
    title: "Create Your Profile",
    description:
      "Complete a quick learning assessment and upload your IEP if you have one. AIVO builds a comprehensive understanding of how you learn best.",
    color: "bg-aivo-purple-50 text-aivo-purple-600",
  },
  {
    icon: Brain,
    title: "Meet Your Brain Clone",
    description:
      "Our AI creates a digital twin of your learning profile. It knows your strengths, identifies gaps, and personalizes every piece of content just for you.",
    color: "bg-aivo-teal-50 text-aivo-teal-600",
  },
  {
    icon: Rocket,
    title: "Learn & Grow",
    description:
      "Dive into adaptive lessons, chat with AI tutors, complete quests, and track your progress. Your Brain Clone evolves with you, getting smarter every session.",
    color: "bg-aivo-purple-50 text-aivo-purple-600",
  },
];

export function HowItWorks() {
  const { t } = useI18n();

  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-aivo-navy-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title={t("howItWorks.title")}
          subtitle={t("howItWorks.subtitle")}
        />

        <div className="relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden lg:block absolute top-24 left-[16.7%] right-[16.7%] h-0.5 bg-aivo-purple-200" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                className="relative text-center"
              >
                {/* Step number badge */}
                <div className="relative z-10 mx-auto mb-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${step.color} shadow-sm`}>
                    <step.icon size={28} />
                  </div>
                  <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-7 h-7 rounded-full bg-aivo-purple-600 text-white text-sm font-bold">
                    {index + 1}
                  </span>
                </div>

                {/* TODO: Individual step titles and descriptions need per-step translation keys in a future sprint */}
                <h3 className="text-xl font-semibold text-aivo-navy-800 mb-3">
                  {step.title}
                </h3>
                <p className="text-aivo-navy-400 leading-relaxed max-w-sm mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { AnimatedCounter } from "@/components/shared/animated-counter";
import { stats } from "@/content/stats";
import { useI18n } from "@/providers/i18n-provider";

const statKeys = ["students", "improvement", "hoursSaved", "tutors"] as const;

export function StatsBand() {
  const { t } = useI18n();

  return (
    <section className="py-16 bg-gradient-to-r from-aivo-teal-600 to-aivo-teal-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl sm:text-5xl font-extrabold text-white mb-2">
                <AnimatedCounter
                  target={stat.value}
                  suffix={stat.suffix}
                />
              </div>
              <p className="text-teal-100 text-sm sm:text-base font-medium">
                {t("statsBand", statKeys[i])}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

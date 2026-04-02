"use client";

import { AnimatedCounter } from "@/components/shared/animated-counter";
import { useI18n } from "@/providers/i18n-provider";

const statDefs = [
  { value: 150, suffix: "+", labelKey: "statsBand.students" },
  { value: 31, suffix: "%", labelKey: "statsBand.improvement" },
  { value: 6, suffix: "+", labelKey: "statsBand.hoursSaved" },
  { value: 5, suffix: "", labelKey: "statsBand.tutors" },
];

export function StatsBand() {
  const { t } = useI18n();

  return (
    <section className="py-16 bg-gradient-to-r from-aivo-teal-600 to-aivo-teal-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {statDefs.map((stat) => (
            <div key={stat.labelKey} className="text-center">
              <div className="text-4xl sm:text-5xl font-extrabold text-white mb-2">
                <AnimatedCounter
                  target={stat.value}
                  suffix={stat.suffix}
                />
              </div>
              <p className="text-teal-100 text-sm sm:text-base font-medium">
                {t(stat.labelKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

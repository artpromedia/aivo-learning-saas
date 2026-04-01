"use client";

import { AnimatedCounter } from "@/components/shared/animated-counter";

const stats = [
  { value: 500, suffix: "+", label: "Schools", trend: "↑ 120% YoY" },
  { value: 50000, suffix: "+", label: "Students", trend: "↑ 200% YoY" },
  { value: 2.5, suffix: "M+", label: "Lessons Delivered", trend: "↑ 150% YoY", isDecimal: true },
  { value: 4.9, suffix: "/5", label: "Average Rating", trend: "↑ Consistent", isDecimal: true },
];

export function StatsBand() {
  return (
    <section className="py-16 bg-gradient-to-r from-aivo-purple-600 via-aivo-purple-700 to-aivo-teal-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl sm:text-5xl font-extrabold text-white mb-2">
                {stat.isDecimal ? (
                  <span>
                    {stat.value}
                    {stat.suffix}
                  </span>
                ) : (
                  <AnimatedCounter
                    target={stat.value}
                    suffix={stat.suffix}
                  />
                )}
              </div>
              <p className="text-purple-100 text-sm sm:text-base font-medium">
                {stat.label}
              </p>
              <p className="text-purple-200/70 text-xs mt-1">{stat.trend}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

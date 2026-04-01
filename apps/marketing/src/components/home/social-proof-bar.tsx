"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const logos = [
  { name: "Springfield USD", color: "bg-purple-100 text-purple-700" },
  { name: "Lincoln Academy", color: "bg-teal-100 text-teal-700" },
  { name: "Maple Grove ISD", color: "bg-amber-100 text-amber-700" },
  { name: "Summit Charter", color: "bg-rose-100 text-rose-700" },
  { name: "Riverside Unified", color: "bg-indigo-100 text-indigo-700" },
  { name: "Oak Valley School", color: "bg-emerald-100 text-emerald-700" },
  { name: "Pinecrest Academy", color: "bg-orange-100 text-orange-700" },
  { name: "Harmony Schools", color: "bg-sky-100 text-sky-700" },
  { name: "Eagle Mountain ISD", color: "bg-violet-100 text-violet-700" },
  { name: "Cedar Hills SD", color: "bg-lime-100 text-lime-700" },
  { name: "Brookfield Prep", color: "bg-pink-100 text-pink-700" },
  { name: "Westlake Academy", color: "bg-cyan-100 text-cyan-700" },
];

export function SocialProofBar() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return (
    <section className="py-10 bg-aivo-navy-50/50 border-y border-aivo-navy-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.p
          className="text-center text-sm font-medium text-aivo-navy-500 mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Trusted by 500+ schools across 12 states
        </motion.p>
      </div>

      {reducedMotion ? (
        /* Static grid for reduced motion */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-testid="social-proof-static">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {logos.map((logo) => (
              <span
                key={logo.name}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-semibold",
                  logo.color
                )}
              >
                {logo.name}
              </span>
            ))}
          </div>
        </div>
      ) : (
        /* Infinite marquee */
        <div className="relative" data-testid="social-proof-marquee">
          <div className="flex animate-[marquee_40s_linear_infinite]">
            {/* Duplicate for seamless loop */}
            {[...logos, ...logos].map((logo, i) => (
              <span
                key={`${logo.name}-${i}`}
                className={cn(
                  "shrink-0 mx-3 rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap",
                  logo.color
                )}
              >
                {logo.name}
              </span>
            ))}
          </div>
          <style jsx>{`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}</style>
        </div>
      )}
    </section>
  );
}

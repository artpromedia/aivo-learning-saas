"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

const headlineWords = "AI-Powered Learning That Adapts to Every Student".split(" ");

export function Hero() {
  return (
    <section
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 40%, #0d95a8 80%, #14b8c8 100%)",
      }}
    >
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
        <motion.h1
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
        >
          {headlineWords.map((word, i) => (
            <motion.span
              key={i}
              className="inline-block mr-[0.3em]"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { type: "spring", damping: 12, stiffness: 100 },
                },
              }}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          className="mt-6 text-lg sm:text-xl text-white/90 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          No Learner Left Behind. Personalized education powered by Brain Clone AI
          technology that creates a unique learning profile for every student.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        >
          <Link
            href="/get-started"
            className={cn(
              "inline-flex items-center justify-center rounded-lg px-8 py-4",
              "bg-white text-aivo-purple-600 font-semibold text-lg",
              "hover:bg-white/90 transition-all duration-200",
              "shadow-lg hover:shadow-xl hover:-translate-y-0.5",
            )}
          >
            Get Started Free
          </Link>
          <Link
            href="/demo"
            className={cn(
              "inline-flex items-center justify-center rounded-lg px-8 py-4",
              "border-2 border-white text-white font-semibold text-lg",
              "hover:bg-white/10 transition-all duration-200",
            )}
          >
            Request a Demo
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

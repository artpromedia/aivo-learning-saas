"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CtaSceneProps {
  sceneElapsedMs: number;
  className?: string;
}

export function CtaScene({ sceneElapsedMs, className }: CtaSceneProps) {
  const showHeadline = sceneElapsedMs > 1000;
  const showSubtext = sceneElapsedMs > 2000;
  const showButtons = sceneElapsedMs > 3000;

  return (
    <div
      className={cn(
        "h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#7c3aed] via-[#5b21b6] to-[#0d95a8]",
        className
      )}
    >
      {showHeadline && (
        <motion.h3
          className="text-xl sm:text-2xl font-bold text-white text-center max-w-sm leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Every Student Deserves an AI That Gets Them
        </motion.h3>
      )}

      {showSubtext && (
        <motion.p
          className="mt-3 text-sm text-purple-200 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Join 500+ schools already using Aivo
        </motion.p>
      )}

      {showButtons && (
        <motion.div
          className="mt-6 flex flex-col sm:flex-row items-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/get-started"
            className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-purple-700 hover:bg-purple-50 transition-colors shadow-lg"
            data-testid="walkthrough-cta-primary"
          >
            Start Free Trial
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center justify-center rounded-lg border-2 border-white/60 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            data-testid="walkthrough-cta-secondary"
          >
            Book a Demo
          </Link>
        </motion.div>
      )}
    </div>
  );
}

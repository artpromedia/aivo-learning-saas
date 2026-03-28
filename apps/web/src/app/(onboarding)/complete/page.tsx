"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { PartyPopper, Rocket } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import { useLearnerStore } from "@/stores/learner.store";

function ConfettiPiece({ delay, x }: { delay: number; x: number }) {
  const colors = ["#7C3AED", "#7C4DFF", "#38B2AC", "#F59E0B", "#EF4444", "#10B981"];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return (
    <motion.div
      className="absolute w-2.5 h-2.5 rounded-sm"
      style={{ backgroundColor: color, left: `${x}%`, top: -10 }}
      initial={{ y: -20, opacity: 1, rotate: 0 }}
      animate={{
        y: [0, 600],
        opacity: [1, 1, 0],
        rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
        x: [0, (Math.random() - 0.5) * 200],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        delay: delay,
        ease: "easeOut",
      }}
    />
  );
}

export default function OnboardingCompletePage() {
  const router = useRouter();
  const t = useTranslations("onboarding");
  const activeLearner = useLearnerStore((s) => s.activeLearner);
  const [isCompleting, setIsCompleting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function completeOnboarding() {
      try {
        await apiFetch(API_ROUTES.ONBOARDING.COMPLETE, { method: "POST" });
      } catch (err) {
        setError(err instanceof Error ? err.message : t("failedToComplete"));
      } finally {
        setIsCompleting(false);
      }
    }

    completeOnboarding();
  }, []);

  const confettiPieces = Array.from({ length: 50 }).map((_, i) => ({
    delay: Math.random() * 0.8,
    x: Math.random() * 100,
  }));

  return (
    <div className="relative overflow-hidden min-h-[60vh] flex items-center justify-center">
      {/* Confetti */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {confettiPieces.map((piece, i) => (
          <ConfettiPiece key={i} delay={piece.delay} x={piece.x} />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
        className="text-center z-10 max-w-lg"
      >
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.5 }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#38B2AC] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#7C3AED]/30"
        >
          <PartyPopper className="text-white" size={48} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-3xl font-bold text-gray-900 dark:text-white mb-3"
        >
          {t("youreAllSet")}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="text-lg text-gray-500 dark:text-gray-400 mb-2"
        >
          {activeLearner?.name
            ? t("childJourneyReady", { name: activeLearner.name })
            : t("genericJourneyReady")}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="text-sm text-gray-400 dark:text-gray-500 mb-8"
        >
          {t("journeyReadyDescription")}
        </motion.p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button
            size="lg"
            onClick={() => router.push("/parent")}
            loading={isCompleting}
            rightIcon={<Rocket size={20} />}
            className="min-w-[200px]"
          >
            {t("goToDashboard")}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

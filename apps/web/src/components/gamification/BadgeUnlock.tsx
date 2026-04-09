"use client";

import React, { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Award, X } from "lucide-react";

export interface BadgeUnlockProps {
  visible: boolean;
  badgeName: string;
  badgeDescription?: string;
  badgeIcon?: React.ReactNode;
  onClose: () => void;
}

function BadgeUnlock({
  visible,
  badgeName,
  badgeDescription,
  badgeIcon,
  onClose,
}: BadgeUnlockProps) {
  const fireConfetti = useCallback(() => {
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ["#7C3AED", "#7C4DFF", "#38B2AC", "#FFD700"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ["#7C3AED", "#7C4DFF", "#38B2AC", "#FFD700"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  useEffect(() => {
    if (visible) {
      fireConfetti();
    }
  }, [visible, fireConfetti]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="relative z-10 flex flex-col items-center text-center max-w-sm w-full p-8 rounded-2xl bg-white dark:bg-[#2A1E45] shadow-2xl border border-[#E8DDF0] dark:border-[#3D2D5C]"
            initial={{ scale: 0.5, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 250, damping: 20 }}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1 rounded-md text-[#A89BB5] hover:text-[#7C3AED] transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-4"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A855F7] flex items-center justify-center shadow-lg shadow-purple-500/30">
                {badgeIcon || <Award size={44} className="text-white" />}
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-sm font-semibold text-[#7C3AED] uppercase tracking-wider mb-1"
            >
              Badge Unlocked!
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="text-xl font-extrabold text-[var(--aivo-text)] mb-2"
            >
              {badgeName}
            </motion.h2>

            {badgeDescription && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="text-sm text-[var(--aivo-text-secondary)] mb-4"
              >
                {badgeDescription}
              </motion.p>
            )}

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              onClick={onClose}
              className="px-6 py-2.5 rounded-2xl text-sm font-medium text-white bg-[#7C3AED] hover:bg-[#6B3FE8] transition-colors"
            >
              Awesome!
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { BadgeUnlock };

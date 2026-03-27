"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

export interface XPToastProps {
  visible: boolean;
  xpAmount: number;
  reason?: string;
  onDismiss?: () => void;
}

function XPToast({ visible, xpAmount, reason, onDismiss }: XPToastProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-6 right-6 z-50"
          onClick={onDismiss}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#7C4DFF] text-white shadow-2xl shadow-purple-500/25 cursor-pointer">
            <motion.div
              initial={{ rotate: -30, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 400 }}
            >
              <Sparkles size={22} fill="currentColor" />
            </motion.div>
            <div>
              <motion.p
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-lg font-bold leading-tight"
              >
                +{xpAmount} XP
              </motion.p>
              {reason && (
                <motion.p
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm text-white/80"
                >
                  {reason}
                </motion.p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { XPToast };

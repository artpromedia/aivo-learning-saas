"use client";

import React from "react";
import { motion } from "framer-motion";
import { Brain, Check, Plus, X } from "lucide-react";

export interface BrainProfileRevealProps {
  profileSummary: string;
  accommodations: string[];
  onApprove: () => void;
  onAddInsights: () => void;
  onDecline: () => void;
  loading?: "approve" | "insights" | "decline" | null;
  className?: string;
}

function BrainProfileReveal({
  profileSummary,
  accommodations,
  onApprove,
  onAddInsights,
  onDecline,
  loading = null,
  className = "",
}: BrainProfileRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`w-full max-w-lg mx-auto rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden ${className}`}
    >
      <div
        className="px-6 py-5 flex items-center gap-3"
        style={{
          background: "linear-gradient(135deg, #915ee3 0%, #8143e1 100%)",
        }}
      >
        <motion.div
          initial={{ rotate: -20, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        >
          <Brain className="text-white" size={32} />
        </motion.div>
        <div>
          <h2 className="text-lg font-bold text-white">Your Brain Profile</h2>
          <p className="text-sm text-white/80">
            Personalized learning insights
          </p>
        </div>
      </div>

      <div className="px-6 py-5 space-y-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            Summary
          </h3>
          <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
            {profileSummary}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.55 }}
        >
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Recommended Accommodations
          </h3>
          <ul className="space-y-1.5">
            {accommodations.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.08 }}
                className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-[#7C3AED] shrink-0" />
                {item}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-2"
      >
        <button
          onClick={onApprove}
          disabled={loading !== null}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading === "approve" ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Check size={16} />
          )}
          Approve
        </button>
        <button
          onClick={onAddInsights}
          disabled={loading !== null}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading === "insights" ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Plus size={16} />
          )}
          Add Insights
        </button>
        <button
          onClick={onDecline}
          disabled={loading !== null}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading === "decline" ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <X size={16} />
          )}
          Decline
        </button>
      </motion.div>
    </motion.div>
  );
}

export { BrainProfileReveal };

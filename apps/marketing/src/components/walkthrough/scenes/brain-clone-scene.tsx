"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BrainCloneSceneProps {
  sceneElapsedMs: number;
  className?: string;
}

export function BrainCloneScene({ sceneElapsedMs, className }: BrainCloneSceneProps) {
  const progress = Math.min(sceneElapsedMs / 5500, 1);
  const isReady = sceneElapsedMs > 5500;
  const showText = sceneElapsedMs > 500;
  const circumference = 2 * Math.PI * 52;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className={cn("flex flex-col items-center justify-center h-full bg-gradient-to-b from-[#1a1a2e] to-[#2d1b69] p-6", className)}>
      {/* Avatar with pulse rings */}
      <div className="relative">
        {/* Pulse rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-2 border-purple-400/30"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{
              scale: [1, 1.8, 2.2],
              opacity: [0.6, 0.2, 0],
            }}
            transition={{
              duration: 2.5,
              delay: i * 0.5,
              repeat: Infinity,
              ease: "easeOut",
            }}
            style={{
              width: 120,
              height: 120,
              top: "50%",
              left: "50%",
              marginTop: -60,
              marginLeft: -60,
            }}
          />
        ))}

        {/* Progress ring */}
        <svg width="120" height="120" className="relative z-10">
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="rgba(139, 92, 246, 0.2)"
            strokeWidth="4"
          />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 60 60)"
            className="transition-all duration-100"
          />
        </svg>

        {/* Avatar */}
        <motion.div
          className={cn(
            "absolute inset-0 m-auto w-[88px] h-[88px] rounded-full flex items-center justify-center text-2xl font-bold text-white z-20",
            isReady
              ? "bg-gradient-to-br from-purple-500 to-teal-400 shadow-[0_0_30px_rgba(139,92,246,0.6)]"
              : "bg-gradient-to-br from-purple-600 to-purple-800"
          )}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          AJ
        </motion.div>
      </div>

      {/* Text */}
      {showText && (
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-white text-lg font-medium">
            {isReady ? (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-teal-300"
              >
                Brain Clone™ Ready! ✓
              </motion.span>
            ) : (
              <span className="inline-flex items-center gap-1">
                Creating Alex&apos;s Brain Clone™
                <span className="animate-pulse">...</span>
              </span>
            )}
          </p>
          {!isReady && (
            <p className="text-purple-300 text-sm mt-2">
              {Math.round(progress * 100)}%
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}

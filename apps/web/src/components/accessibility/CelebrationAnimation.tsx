"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sparkles, Star, Heart } from "lucide-react";

export interface CelebrationAnimationProps {
  visible: boolean;
  message?: string;
  variant?: "stars" | "sparkles" | "hearts";
  onComplete?: () => void;
  className?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  delay: number;
  scale: number;
}

function CelebrationAnimation({
  visible,
  message = "Great job!",
  variant = "stars",
  onComplete,
  className = "",
}: CelebrationAnimationProps) {
  const prefersReducedMotion = useReducedMotion();
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (visible && !prefersReducedMotion) {
      const generated: Particle[] = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 0.5,
        scale: 0.5 + Math.random() * 0.8,
      }));
      setParticles(generated);
    } else {
      setParticles([]);
    }
  }, [visible, prefersReducedMotion]);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [visible, onComplete]);

  const IconComponent =
    variant === "sparkles" ? Sparkles : variant === "hearts" ? Heart : Star;

  const iconColor =
    variant === "hearts" ? "#EF4444" : "#7C3AED";

  if (prefersReducedMotion) {
    return (
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`flex flex-col items-center justify-center p-6 ${className}`}
            role="status"
            aria-live="polite"
          >
            <div className="w-16 h-16 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mb-3">
              <IconComponent size={28} style={{ color: iconColor }} />
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`relative flex flex-col items-center justify-center p-6 overflow-hidden ${className}`}
          role="status"
          aria-live="polite"
        >
          {/* Floating particles */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute pointer-events-none"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
              initial={{ opacity: 0, scale: 0, y: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0, particle.scale, particle.scale, 0],
                y: [0, -30, -60, -90],
              }}
              transition={{
                duration: 2,
                delay: particle.delay,
                ease: "easeOut",
              }}
            >
              <IconComponent
                size={16}
                style={{ color: iconColor }}
                fill="currentColor"
              />
            </motion.div>
          ))}

          {/* Main content */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#7C4DFF] flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30"
          >
            <IconComponent size={36} className="text-white" fill="currentColor" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl font-bold text-gray-900 dark:text-white"
          >
            {message}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { CelebrationAnimation };

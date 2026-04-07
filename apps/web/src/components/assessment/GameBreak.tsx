"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
}

const BUBBLE_COLORS = ["#7C3AED", "#A78BFA", "#2563EB", "#EC4899", "#F59E0B", "#10B981"];

/**
 * "Pop the Bubbles" game break — tap floating bubbles to pop them.
 */
export function GameBreak() {
  const prefersReducedMotion = useReducedMotion();
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const nextIdRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Spawn new bubbles periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setBubbles((prev) => {
        // Cap at 8 bubbles on screen
        if (prev.length >= 8) return prev;
        const id = nextIdRef.current++;
        return [
          ...prev,
          {
            id,
            x: 10 + Math.random() * 80,
            y: 100,
            size: 40 + Math.random() * 25,
            color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
            speed: 2 + Math.random() * 3,
          },
        ];
      });
    }, 600);

    return () => clearInterval(interval);
  }, []);

  // Animate bubbles upward and remove off-screen ones
  useEffect(() => {
    const frame = setInterval(() => {
      setBubbles((prev) =>
        prev
          .map((b) => ({ ...b, y: b.y - b.speed * 0.5 }))
          .filter((b) => b.y > -15),
      );
    }, 50);

    return () => clearInterval(frame);
  }, []);

  const popBubble = useCallback((id: number) => {
    setBubbles((prev) => prev.filter((b) => b.id !== id));
    setScore((s) => s + 1);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden bg-gradient-to-b from-sky-100 to-blue-50 dark:from-sky-900/30 dark:to-blue-900/20 select-none"
      role="application"
      aria-label="Pop the bubbles game"
    >
      {/* Score display */}
      <div className="absolute top-3 left-0 right-0 text-center z-10">
        <span
          className="inline-block px-3 py-1 bg-white/80 dark:bg-gray-800/80 rounded-full text-sm font-bold text-purple-700 dark:text-purple-300 shadow-sm"
          aria-live="polite"
        >
          Bubbles popped: {score}
        </span>
      </div>

      {/* Bubbles */}
      <AnimatePresence>
        {bubbles.map((bubble) => (
          <motion.button
            key={bubble.id}
            type="button"
            onClick={() => popBubble(bubble.id)}
            className="absolute rounded-full cursor-pointer border-0 p-0 focus:outline-none focus:ring-4 focus:ring-purple-300"
            style={{
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              width: bubble.size,
              height: bubble.size,
              background: `radial-gradient(circle at 35% 35%, ${bubble.color}88, ${bubble.color})`,
              boxShadow: `inset -2px -2px 6px rgba(0,0,0,0.15), inset 4px 4px 8px rgba(255,255,255,0.3)`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={
              prefersReducedMotion
                ? { scale: 1, opacity: 1 }
                : { scale: 1, opacity: 1, x: [0, 3, -3, 0] }
            }
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{
              scale: { duration: 0.2 },
              opacity: { duration: 0.15 },
              x: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            }}
            aria-label={`Pop bubble`}
          >
            {/* Bubble shine effect */}
            <span
              className="absolute top-1.5 left-2 w-2 h-2 bg-white/60 rounded-full"
              aria-hidden="true"
            />
          </motion.button>
        ))}
      </AnimatePresence>

      {/* Instruction */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
          Tap the bubbles to pop them!
        </p>
      </div>
    </div>
  );
}

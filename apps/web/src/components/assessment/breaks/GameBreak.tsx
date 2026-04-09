"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

type FunctioningLevel = "STANDARD" | "SUPPORTED" | "LOW_VERBAL" | "NON_VERBAL" | "PRE_SYMBOLIC";

interface GameBreakProps {
  durationSeconds: number;
  functioningLevel?: FunctioningLevel;
  soundEnabled?: boolean;
  onComplete: () => void;
}

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  emoji: string;
  color: string;
  speed: number;
}

interface PopEffect {
  id: number;
  x: number;
  y: number;
}

const STAR_EMOJIS = ["⭐", "🌟", "✨", "💫", "🎈", "🫧"];
const STAR_COLORS = ["#7C3AED", "#A78BFA", "#38B2AC", "#EC4899", "#F59E0B", "#10B981"];

function getSpeedMultiplier(level: FunctioningLevel): number {
  switch (level) {
    case "PRE_SYMBOLIC":
    case "NON_VERBAL":
      return 0.4;
    case "LOW_VERBAL":
      return 0.6;
    case "SUPPORTED":
      return 0.8;
    case "STANDARD":
    default:
      return 1.0;
  }
}

function getMinSize(level: FunctioningLevel): number {
  switch (level) {
    case "PRE_SYMBOLIC":
    case "NON_VERBAL":
      return 60;
    case "LOW_VERBAL":
    case "SUPPORTED":
      return 50;
    default:
      return 40;
  }
}

/**
 * Play a quick "pop" sound via Web Audio API.
 */
function playPopSound(audioCtx: AudioContext | null) {
  if (!audioCtx || audioCtx.state === "closed") return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.15);
  } catch {
    // Audio not available
  }
}

/**
 * "Catch the Stars" game break — tap floating stars/bubbles.
 * Speed and target size adapt to functioning level.
 */
export function GameBreak({
  durationSeconds,
  functioningLevel = "STANDARD",
  soundEnabled = true,
  onComplete,
}: GameBreakProps) {
  const prefersReducedMotion = useReducedMotion();
  const [stars, setStars] = useState<Star[]>([]);
  const [popEffects, setPopEffects] = useState<PopEffect[]>([]);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const nextIdRef = useRef(0);
  const popIdRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const speedMul = useMemo(() => getSpeedMultiplier(functioningLevel), [functioningLevel]);
  const minSize = useMemo(() => getMinSize(functioningLevel), [functioningLevel]);

  // Initialize audio context on first interaction
  const ensureAudio = useCallback(() => {
    if (!soundEnabled || audioCtxRef.current) return;
    try {
      audioCtxRef.current = new AudioContext();
    } catch {
      // Not available
    }
  }, [soundEnabled]);

  // Spawn stars
  useEffect(() => {
    if (finished) return;
    const interval = setInterval(() => {
      setStars((prev) => {
        if (prev.length >= 8) return prev;
        const id = nextIdRef.current++;
        return [
          ...prev,
          {
            id,
            x: 5 + Math.random() * 85,
            y: 105,
            size: minSize + Math.random() * 20,
            emoji: STAR_EMOJIS[Math.floor(Math.random() * STAR_EMOJIS.length)],
            color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
            speed: (1.5 + Math.random() * 2) * speedMul,
          },
        ];
      });
    }, 700);
    return () => clearInterval(interval);
  }, [finished, speedMul, minSize]);

  // Move stars upward and cull off-screen
  useEffect(() => {
    if (finished) return;
    const frame = setInterval(() => {
      setStars((prev) =>
        prev
          .map((s) => ({ ...s, y: s.y - s.speed * 0.4 }))
          .filter((s) => s.y > -15),
      );
    }, 40);
    return () => clearInterval(frame);
  }, [finished]);

  // End game when duration expires
  useEffect(() => {
    const timer = setTimeout(() => {
      setFinished(true);
    }, (durationSeconds - 2) * 1000);
    return () => clearTimeout(timer);
  }, [durationSeconds]);

  // Call onComplete when finished
  useEffect(() => {
    if (!finished) return;
    const t = setTimeout(onComplete, 2000);
    return () => clearTimeout(t);
  }, [finished, onComplete]);

  // Cleanup audio
  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const catchStar = useCallback(
    (id: number) => {
      ensureAudio();
      const star = stars.find((s) => s.id === id);
      if (!star) return;

      playPopSound(audioCtxRef.current);

      // Add pop particle effect
      const popId = popIdRef.current++;
      setPopEffects((prev) => [...prev, { id: popId, x: star.x, y: star.y }]);
      setTimeout(() => {
        setPopEffects((prev) => prev.filter((p) => p.id !== popId));
      }, 600);

      setStars((prev) => prev.filter((s) => s.id !== id));
      setScore((s) => s + 1);
    },
    [stars, ensureAudio],
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden bg-gradient-to-b from-indigo-50 to-sky-100 dark:from-indigo-900/30 dark:to-sky-900/20 select-none touch-none"
      role="application"
      aria-label="Catch the stars game"
    >
      {/* Score display */}
      <div className="absolute top-3 left-0 right-0 text-center z-10">
        <span
          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/80 dark:bg-[#2A1E45]/80 rounded-full text-sm font-bold text-purple-700 dark:text-purple-300 shadow-[var(--shadow-card)]"
          aria-live="polite"
        >
          <span aria-hidden="true">⭐</span> Stars caught: {score}
        </span>
      </div>

      {/* Stars */}
      <AnimatePresence>
        {!finished &&
          stars.map((star) => (
            <motion.button
              key={star.id}
              type="button"
              onClick={() => catchStar(star.id)}
              onTouchStart={(e) => {
                e.preventDefault();
                catchStar(star.id);
              }}
              className="absolute cursor-pointer border-0 p-0 bg-transparent focus:outline-none focus:ring-4 focus:ring-yellow-300 rounded-full"
              style={{
                left: `calc(${star.x}% - ${star.size / 2}px)`,
                top: `${star.y}%`,
                width: star.size,
                height: star.size,
                fontSize: star.size * 0.6,
                lineHeight: `${star.size}px`,
                textAlign: "center",
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={
                prefersReducedMotion
                  ? { scale: 1, opacity: 1 }
                  : { scale: 1, opacity: 1, x: [0, 4, -4, 0] }
              }
              exit={{ scale: 1.8, opacity: 0 }}
              transition={{
                scale: { duration: 0.2 },
                opacity: { duration: 0.15 },
                x: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
              }}
              aria-label="Catch this star"
            >
              {star.emoji}
            </motion.button>
          ))}
      </AnimatePresence>

      {/* Pop particle effects */}
      <AnimatePresence>
        {popEffects.map((pop) => (
          <motion.div
            key={pop.id}
            className="absolute pointer-events-none z-20"
            style={{ left: `${pop.x}%`, top: `${pop.y}%` }}
            initial={{ opacity: 1, scale: 0.5 }}
            animate={{ opacity: 0, scale: 2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {[0, 60, 120, 180, 240, 300].map((angle) => (
              <motion.span
                key={angle}
                className="absolute w-2 h-2 rounded-full"
                style={{ backgroundColor: STAR_COLORS[Math.floor(angle / 60)] }}
                initial={{ x: 0, y: 0 }}
                animate={{
                  x: Math.cos((angle * Math.PI) / 180) * 24,
                  y: Math.sin((angle * Math.PI) / 180) * 24,
                  opacity: 0,
                }}
                transition={{ duration: 0.4 }}
              />
            ))}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Instruction / End screen */}
      <div className="absolute bottom-4 left-0 right-0 text-center z-10">
        {finished ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            aria-live="assertive"
          >
            <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
              Amazing! You caught {score} stars!
            </p>
            <motion.span
              className="inline-block text-3xl mt-1"
              animate={prefersReducedMotion ? {} : { rotate: [0, -10, 10, 0], scale: [1, 1.3, 1] }}
              transition={{ duration: 0.5 }}
              aria-hidden="true"
            >
              🎉
            </motion.span>
          </motion.div>
        ) : (
          <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
            Tap the stars to catch them!
          </p>
        )}
      </div>
    </div>
  );
}

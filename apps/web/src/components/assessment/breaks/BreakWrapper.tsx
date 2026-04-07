"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { apiFetch } from "@/lib/api";
import { MusicBreak } from "./MusicBreak";
import { PuzzleBreak } from "./PuzzleBreak";
import { GameBreak } from "./GameBreak";

export type BreakType = "music" | "puzzle" | "game";
type FunctioningLevel = "STANDARD" | "SUPPORTED" | "LOW_VERBAL" | "NON_VERBAL" | "PRE_SYMBOLIC";

interface BreakWrapperProps {
  breakType: BreakType;
  learnerId: string;
  durationSeconds?: number;
  soundEnabled?: boolean;
  functioningLevel?: FunctioningLevel;
  onComplete: () => void;
}

const BREAK_LABELS: Record<BreakType, { title: string; emoji: string }> = {
  music: { title: "Music Break", emoji: "🎵" },
  puzzle: { title: "Puzzle Break", emoji: "🧩" },
  game: { title: "Star Catcher", emoji: "⭐" },
};

const BREAK_DURATIONS: Record<BreakType, number> = {
  music: 45,
  puzzle: 60,
  game: 35,
};

/**
 * Shared wrapper for all break activities. Handles:
 * - Animated "Time for a break!" intro (2s)
 * - Countdown timer
 * - "I'm Ready to Continue!" skip button
 * - XP award via POST /engagement/sel/break
 * - "+N XP!" outro toast
 */
export function BreakWrapper({
  breakType,
  learnerId,
  durationSeconds,
  soundEnabled = true,
  functioningLevel = "STANDARD",
  onComplete,
}: BreakWrapperProps) {
  const prefersReducedMotion = useReducedMotion();
  const duration = durationSeconds ?? BREAK_DURATIONS[breakType];
  const [phase, setPhase] = useState<"intro" | "activity" | "outro">("intro");
  const [secondsLeft, setSecondsLeft] = useState(duration);
  const [xpAwarded, setXpAwarded] = useState<number | null>(null);
  const completedRef = useRef(false);

  // Intro → activity after 2s
  useEffect(() => {
    if (phase !== "intro") return;
    const t = setTimeout(() => setPhase("activity"), 2000);
    return () => clearTimeout(t);
  }, [phase]);

  // Countdown during activity
  useEffect(() => {
    if (phase !== "activity") return;
    if (secondsLeft <= 0) {
      finishBreak();
      return;
    }
    const interval = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(interval);
  }, [phase, secondsLeft]);

  const finishBreak = useCallback(async () => {
    if (completedRef.current) return;
    completedRef.current = true;
    setPhase("outro");

    // Award XP
    try {
      const result = await apiFetch<{ xpAwarded: number }>(
        "/api/engagement/sel/break",
        {
          method: "POST",
          body: JSON.stringify({ learnerId, activityType: breakType }),
        },
      );
      setXpAwarded(result.xpAwarded);
    } catch {
      // Non-blocking
    }

    setTimeout(onComplete, 2500);
  }, [learnerId, breakType, onComplete]);

  const handleSkip = useCallback(() => {
    finishBreak();
  }, [finishBreak]);

  // Child activity completed on its own (puzzle all matched, etc.)
  const handleActivityComplete = useCallback(() => {
    finishBreak();
  }, [finishBreak]);

  const timerDisplay = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;
  const label = BREAK_LABELS[breakType];

  return (
    <Card>
      <CardBody>
        <AnimatePresence mode="wait">
          {/* === INTRO === */}
          {phase === "intro" && (
            <motion.div
              key="intro"
              className="text-center py-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
            >
              <motion.span
                className="inline-block text-5xl mb-4"
                animate={prefersReducedMotion ? {} : { rotate: [0, -12, 12, -12, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 0.7, delay: 0.2 }}
                aria-hidden="true"
              >
                🎉
              </motion.span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Time for a break!
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                {label.emoji} {label.title} — let&apos;s have some fun!
              </p>
              <div role="status" className="sr-only">
                Break time starting: {label.title}
              </div>
            </motion.div>
          )}

          {/* === ACTIVITY === */}
          {phase === "activity" && (
            <motion.div
              key="activity"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
            >
              {/* Header with timer */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span aria-hidden="true">{label.emoji}</span>
                  {label.title}
                </h2>
                <div
                  className="flex items-center gap-2"
                  role="timer"
                  aria-live="off"
                  aria-label={`${secondsLeft} seconds remaining`}
                >
                  <div
                    className="h-2 w-24 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={duration}
                    aria-valuenow={secondsLeft}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-[#7C3AED] to-[#38B2AC] rounded-full transition-all duration-1000 ease-linear"
                      style={{ width: `${(secondsLeft / duration) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-mono font-medium text-gray-600 dark:text-gray-300 tabular-nums min-w-[3ch]">
                    {timerDisplay}
                  </span>
                </div>
              </div>

              {/* Activity */}
              <div className="mb-5">
                {breakType === "music" && (
                  <MusicBreak
                    soundEnabled={soundEnabled}
                    durationSeconds={duration}
                    onComplete={handleActivityComplete}
                  />
                )}
                {breakType === "puzzle" && (
                  <PuzzleBreak
                    durationSeconds={duration}
                    functioningLevel={functioningLevel}
                    onComplete={handleActivityComplete}
                  />
                )}
                {breakType === "game" && (
                  <GameBreak
                    durationSeconds={duration}
                    functioningLevel={functioningLevel}
                    soundEnabled={soundEnabled}
                    onComplete={handleActivityComplete}
                  />
                )}
              </div>

              {/* Skip / Continue button */}
              <div className="text-center">
                <Button
                  onClick={handleSkip}
                  variant={secondsLeft <= 0 ? "primary" : "outline"}
                  size="lg"
                  aria-label="End break and return to assessment"
                >
                  {secondsLeft <= 0 ? "Continue!" : "I\u2019m Ready to Continue!"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* === OUTRO === */}
          {phase === "outro" && (
            <motion.div
              key="outro"
              className="text-center py-10"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
            >
              <motion.span
                className="inline-block text-5xl mb-3"
                animate={prefersReducedMotion ? {} : { scale: [1, 1.3, 1] }}
                transition={{ duration: 0.4 }}
                aria-hidden="true"
              >
                ⭐
              </motion.span>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                Great break!
              </h2>
              {xpAwarded !== null && (
                <motion.p
                  className="text-lg font-bold text-purple-600 dark:text-purple-400"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  +{xpAwarded} XP earned!
                </motion.p>
              )}
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                Returning to your assessment...
              </p>
              <div role="status" className="sr-only">
                Break complete.{xpAwarded ? ` ${xpAwarded} XP earned.` : ""} Returning to assessment.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardBody>
    </Card>
  );
}

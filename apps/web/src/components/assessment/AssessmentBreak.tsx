"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { MusicBreak } from "./MusicBreak";
import { PuzzleBreak } from "./PuzzleBreak";
import { GameBreak } from "./GameBreak";
import { apiFetch } from "@/lib/api";

export type EngagementBreakType = "music" | "puzzle" | "game";

interface AssessmentBreakProps {
  breakType: EngagementBreakType;
  learnerId: string;
  /** Duration in seconds for the break timer */
  durationSeconds?: number;
  /** Whether learner has sound enabled */
  soundEnabled?: boolean;
  /** Called when the break finishes (timer or skip) */
  onComplete: () => void;
}

const BREAK_TITLES: Record<EngagementBreakType, string> = {
  music: "Music Break",
  puzzle: "Puzzle Break",
  game: "Game Break",
};

const BREAK_ENGAGEMENT_TYPE: Record<EngagementBreakType, string> = {
  music: "music",
  puzzle: "puzzle",
  game: "game",
};

/**
 * Wrapper component that shows an animated intro, renders the appropriate
 * break activity, displays a countdown timer, and awards XP on completion.
 */
export function AssessmentBreak({
  breakType,
  learnerId,
  durationSeconds = 45,
  soundEnabled = true,
  onComplete,
}: AssessmentBreakProps) {
  const prefersReducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<"intro" | "activity" | "outro">("intro");
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const [xpAwarded, setXpAwarded] = useState<number | null>(null);

  // Intro phase: show for 2 seconds then transition to activity
  useEffect(() => {
    if (phase !== "intro") return;
    const timer = setTimeout(() => setPhase("activity"), 2000);
    return () => clearTimeout(timer);
  }, [phase]);

  // Countdown timer during activity phase
  useEffect(() => {
    if (phase !== "activity") return;
    if (secondsLeft <= 0) {
      completeBreak();
      return;
    }
    const interval = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, secondsLeft]);

  const completeBreak = useCallback(async () => {
    if (phase === "outro") return;
    setPhase("outro");

    // Award XP via engagement-svc
    try {
      const result = await apiFetch<{ xpAwarded: number }>(
        "/api/engagement/sel/break",
        {
          method: "POST",
          body: JSON.stringify({
            learnerId,
            activityType: BREAK_ENGAGEMENT_TYPE[breakType],
          }),
        },
      );
      setXpAwarded(result.xpAwarded);
    } catch {
      // Non-blocking — don't prevent returning to assessment
    }

    // Show outro for 2 seconds then call onComplete
    setTimeout(() => {
      onComplete();
    }, 2000);
  }, [phase, learnerId, breakType, onComplete]);

  const handleSkip = useCallback(() => {
    completeBreak();
  }, [completeBreak]);

  // Format seconds as M:SS
  const timerDisplay = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;

  return (
    <Card>
      <CardBody>
        <AnimatePresence mode="wait">
          {/* INTRO PHASE */}
          {phase === "intro" && (
            <motion.div
              key="intro"
              className="text-center py-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
            >
              <motion.p
                className="text-4xl mb-4"
                animate={prefersReducedMotion ? {} : { rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.6, delay: 0.3 }}
                aria-hidden="true"
              >
                🎉
              </motion.p>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Time for a break!
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                {BREAK_TITLES[breakType]} — let&apos;s have some fun!
              </p>
              <div role="status" className="sr-only">
                Break time: {BREAK_TITLES[breakType]}
              </div>
            </motion.div>
          )}

          {/* ACTIVITY PHASE */}
          {phase === "activity" && (
            <motion.div
              key="activity"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
            >
              {/* Timer */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {BREAK_TITLES[breakType]}
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
                    aria-valuemax={durationSeconds}
                    aria-valuenow={secondsLeft}
                  >
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#7C3AED] to-[#7C4DFF] rounded-full"
                      style={{ width: `${(secondsLeft / durationSeconds) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-mono font-medium text-gray-600 dark:text-gray-300 min-w-[3ch]">
                    {timerDisplay}
                  </span>
                </div>
              </div>

              {/* Activity content */}
              <div className="mb-6">
                {breakType === "music" && <MusicBreak soundEnabled={soundEnabled} />}
                {breakType === "puzzle" && <PuzzleBreak />}
                {breakType === "game" && <GameBreak />}
              </div>

              {/* Skip button */}
              <div className="text-center">
                <Button
                  onClick={handleSkip}
                  variant="outline"
                  size="md"
                  aria-label="End break early and return to assessment"
                >
                  I&apos;m Ready!
                </Button>
              </div>
            </motion.div>
          )}

          {/* OUTRO PHASE */}
          {phase === "outro" && (
            <motion.div
              key="outro"
              className="text-center py-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
            >
              <motion.p
                className="text-4xl mb-3"
                animate={prefersReducedMotion ? {} : { scale: [1, 1.2, 1] }}
                transition={{ duration: 0.4 }}
                aria-hidden="true"
              >
                ⭐
              </motion.p>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                Great break!
              </h2>
              {xpAwarded !== null && (
                <p className="text-purple-600 dark:text-purple-400 font-semibold">
                  +{xpAwarded} XP earned!
                </p>
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

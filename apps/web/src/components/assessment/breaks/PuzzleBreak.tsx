"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

type FunctioningLevel = "STANDARD" | "SUPPORTED" | "LOW_VERBAL" | "NON_VERBAL" | "PRE_SYMBOLIC";

interface PuzzleBreakProps {
  durationSeconds: number;
  functioningLevel?: FunctioningLevel;
  onComplete: () => void;
}

interface PuzzleCard {
  id: number;
  pairId: number;
  emoji: string;
  label: string;
  matched: boolean;
}

const ALL_CARD_SETS = [
  { emoji: "🌟", label: "star" },
  { emoji: "🎈", label: "balloon" },
  { emoji: "🦋", label: "butterfly" },
  { emoji: "🌈", label: "rainbow" },
  { emoji: "🐱", label: "cat" },
  { emoji: "🎵", label: "music note" },
  { emoji: "🚀", label: "rocket" },
  { emoji: "🌻", label: "sunflower" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getPairCount(level: FunctioningLevel): number {
  switch (level) {
    case "PRE_SYMBOLIC":
    case "NON_VERBAL":
      return 3;
    case "LOW_VERBAL":
    case "SUPPORTED":
      return 4;
    case "STANDARD":
    default:
      return 6;
  }
}

function getGridCols(pairCount: number): string {
  if (pairCount <= 3) return "grid-cols-3";
  if (pairCount <= 4) return "grid-cols-4";
  return "grid-cols-4";
}

/**
 * Enhanced memory card matching puzzle with card flip animation,
 * emoji icons, and functioning-level-based difficulty.
 */
export function PuzzleBreak({ durationSeconds, functioningLevel = "STANDARD", onComplete }: PuzzleBreakProps) {
  const prefersReducedMotion = useReducedMotion();
  const pairCount = getPairCount(functioningLevel);

  const cards = useMemo(() => {
    const selected = shuffle(ALL_CARD_SETS).slice(0, pairCount);
    const pairs: PuzzleCard[] = selected.flatMap((s, i) => [
      { id: i * 2, pairId: i, emoji: s.emoji, label: s.label, matched: false },
      { id: i * 2 + 1, pairId: i, emoji: s.emoji, label: s.label, matched: false },
    ]);
    return shuffle(pairs);
  }, [pairCount]);

  const [cardState, setCardState] = useState<PuzzleCard[]>(cards);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matchCount, setMatchCount] = useState(0);
  const [checking, setChecking] = useState(false);
  const [moves, setMoves] = useState(0);
  const allMatched = matchCount === pairCount;

  // Auto-complete: reveal remaining cards when time is nearly up or all matched
  useEffect(() => {
    if (allMatched) return;
    const autoRevealTimer = setTimeout(() => {
      // Reveal all unmatched cards
      setCardState((prev) => prev.map((c) => ({ ...c, matched: true })));
      setMatchCount(pairCount);
    }, (durationSeconds - 2) * 1000);
    return () => clearTimeout(autoRevealTimer);
  }, [allMatched, durationSeconds, pairCount]);

  // Notify parent when all matched
  useEffect(() => {
    if (allMatched) {
      const t = setTimeout(onComplete, 1200);
      return () => clearTimeout(t);
    }
  }, [allMatched, onComplete]);

  const handleSelect = useCallback(
    (id: number) => {
      if (checking || allMatched) return;
      const card = cardState.find((c) => c.id === id);
      if (!card || card.matched || flipped.includes(id)) return;

      const next = [...flipped, id];
      setFlipped(next);

      if (next.length === 2) {
        setChecking(true);
        setMoves((m) => m + 1);
        const [a, b] = next;
        const cardA = cardState.find((c) => c.id === a)!;
        const cardB = cardState.find((c) => c.id === b)!;

        if (cardA.pairId === cardB.pairId) {
          setTimeout(() => {
            setCardState((prev) =>
              prev.map((c) =>
                c.id === a || c.id === b ? { ...c, matched: true } : c,
              ),
            );
            setMatchCount((mc) => mc + 1);
            setFlipped([]);
            setChecking(false);
          }, 500);
        } else {
          setTimeout(() => {
            setFlipped([]);
            setChecking(false);
          }, 900);
        }
      }
    },
    [cardState, flipped, checking, allMatched],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, id: number) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleSelect(id);
      }
    },
    [handleSelect],
  );

  return (
    <div role="group" aria-label="Memory card matching puzzle">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
          Match the pairs! Tap two cards with the same icon.
        </p>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Moves: {moves}
        </span>
      </div>

      <div className="text-center text-xs text-gray-500 dark:text-gray-400 mb-3" aria-live="polite">
        {matchCount} of {pairCount} pairs matched
      </div>

      <div className={`grid ${getGridCols(pairCount)} gap-2 sm:gap-3 max-w-md mx-auto`}>
        {cardState.map((card) => {
          const isFlipped = flipped.includes(card.id) || card.matched;

          return (
            <div key={card.id} className="perspective-500 aspect-square">
              <motion.div
                className="relative w-full h-full cursor-pointer"
                style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.4,
                  ease: "easeInOut",
                }}
                role="button"
                tabIndex={card.matched ? -1 : 0}
                aria-label={
                  card.matched
                    ? `${card.label} — matched`
                    : isFlipped
                      ? `${card.label} — flipped`
                      : "Hidden card — press to flip"
                }
                onClick={() => handleSelect(card.id)}
                onKeyDown={(e) => handleKeyDown(e, card.id)}
              >
                {/* Card back (face-down) */}
                <div
                  className={`absolute inset-0 rounded-xl border-2 flex items-center justify-center backface-hidden
                    ${card.matched
                      ? "border-transparent"
                      : "border-purple-300 dark:border-purple-600 bg-gradient-to-br from-[#7C3AED] to-[#7C4DFF] shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                    }`}
                >
                  <span className="text-white text-2xl sm:text-3xl font-bold select-none" aria-hidden="true">
                    ?
                  </span>
                </div>

                {/* Card front (face-up) */}
                <div
                  className={`absolute inset-0 rounded-xl border-2 flex items-center justify-center backface-hidden
                    ${card.matched
                      ? "border-green-400 bg-green-50 dark:bg-green-900/20 shadow-green-200/50 dark:shadow-green-800/30 shadow-md"
                      : "border-purple-300 dark:border-purple-600 bg-white dark:bg-gray-800 shadow-md"
                    }`}
                  style={{ transform: "rotateY(180deg)" }}
                >
                  <motion.span
                    className="text-3xl sm:text-4xl select-none"
                    animate={
                      card.matched && !prefersReducedMotion
                        ? { scale: [1, 1.2, 1] }
                        : {}
                    }
                    transition={{ duration: 0.3 }}
                    aria-hidden="true"
                  >
                    {card.emoji}
                  </motion.span>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {allMatched && (
        <motion.div
          className="text-center mt-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          aria-live="assertive"
        >
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
            All matched in {moves} moves! Great job!
          </p>
          <motion.span
            className="inline-block text-3xl mt-1"
            animate={prefersReducedMotion ? {} : { rotate: [0, -15, 15, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5 }}
            aria-hidden="true"
          >
            🎉
          </motion.span>
        </motion.div>
      )}
    </div>
  );
}

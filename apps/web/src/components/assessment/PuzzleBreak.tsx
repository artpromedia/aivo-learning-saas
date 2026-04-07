"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface PuzzleBreakProps {
  onAllMatched?: () => void;
}

interface PuzzleCard {
  id: number;
  shape: string;
  color: string;
  matched: boolean;
}

const SHAPES = [
  { shape: "●", color: "#7C3AED" },
  { shape: "■", color: "#2563EB" },
  { shape: "▲", color: "#059669" },
  { shape: "◆", color: "#D97706" },
  { shape: "★", color: "#DC2626" },
  { shape: "⬟", color: "#7C3AED" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Pattern-matching puzzle break: match pairs of shapes.
 */
export function PuzzleBreak({ onAllMatched }: PuzzleBreakProps) {
  const prefersReducedMotion = useReducedMotion();

  const cards = useMemo(() => {
    const selected = SHAPES.slice(0, 4);
    const pairs: PuzzleCard[] = selected.flatMap((s, i) => [
      { id: i * 2, shape: s.shape, color: s.color, matched: false },
      { id: i * 2 + 1, shape: s.shape, color: s.color, matched: false },
    ]);
    return shuffle(pairs);
  }, []);

  const [cardState, setCardState] = useState<PuzzleCard[]>(cards);
  const [selected, setSelected] = useState<number[]>([]);
  const [matchCount, setMatchCount] = useState(0);
  const [checking, setChecking] = useState(false);

  const handleSelect = useCallback(
    (id: number) => {
      if (checking) return;
      const card = cardState.find((c) => c.id === id);
      if (!card || card.matched || selected.includes(id)) return;

      const next = [...selected, id];
      setSelected(next);

      if (next.length === 2) {
        setChecking(true);
        const [a, b] = next;
        const cardA = cardState.find((c) => c.id === a)!;
        const cardB = cardState.find((c) => c.id === b)!;

        if (cardA.shape === cardB.shape) {
          // Match found
          setTimeout(() => {
            setCardState((prev) =>
              prev.map((c) =>
                c.id === a || c.id === b ? { ...c, matched: true } : c,
              ),
            );
            const newCount = matchCount + 1;
            setMatchCount(newCount);
            setSelected([]);
            setChecking(false);
            if (newCount === 4 && onAllMatched) onAllMatched();
          }, 400);
        } else {
          // No match
          setTimeout(() => {
            setSelected([]);
            setChecking(false);
          }, 800);
        }
      }
    },
    [cardState, selected, checking, matchCount, onAllMatched],
  );

  return (
    <div role="group" aria-label="Shape matching puzzle">
      <p className="text-center text-sm font-medium text-purple-700 dark:text-purple-300 mb-4">
        Match the shapes! Tap two cards with the same shape.
      </p>

      <div className="text-center text-xs text-gray-500 dark:text-gray-400 mb-3">
        <span aria-live="polite">{matchCount} of 4 pairs matched</span>
      </div>

      <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">
        {cardState.map((card) => {
          const isRevealed = selected.includes(card.id) || card.matched;
          return (
            <motion.button
              key={card.id}
              type="button"
              onClick={() => handleSelect(card.id)}
              disabled={card.matched || checking}
              className={`aspect-square rounded-xl text-3xl font-bold flex items-center justify-center border-2 transition-colors focus:outline-none focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-700 ${
                card.matched
                  ? "border-green-400 bg-green-50 dark:bg-green-900/20"
                  : isRevealed
                    ? "border-purple-400 bg-purple-50 dark:bg-purple-900/20"
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-500 cursor-pointer"
              }`}
              animate={
                card.matched && !prefersReducedMotion
                  ? { scale: [1, 1.1, 1] }
                  : {}
              }
              transition={{ duration: 0.3 }}
              aria-label={
                card.matched
                  ? `${card.shape} - matched`
                  : isRevealed
                    ? `${card.shape} - revealed`
                    : "Hidden card"
              }
            >
              {isRevealed ? (
                <span style={{ color: card.color }} aria-hidden="true">
                  {card.shape}
                </span>
              ) : (
                <span className="text-gray-400 dark:text-gray-500" aria-hidden="true">
                  ?
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {matchCount === 4 && (
        <motion.p
          className="text-center text-lg font-bold text-green-600 dark:text-green-400 mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          aria-live="assertive"
        >
          All matched! Great job! 🎉
        </motion.p>
      )}
    </div>
  );
}

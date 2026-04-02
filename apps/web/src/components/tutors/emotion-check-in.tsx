"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { TutorAvatar } from "@/components/tutors/tutor-avatar";

export type EmotionZone = "calm" | "happy" | "worried" | "frustrated" | "sad";

interface EmotionCheckInProps {
  onComplete: (zone: EmotionZone) => void;
  learnerName?: string;
}

const EMOTIONS: {
  zone: EmotionZone;
  emoji: string;
  label: string;
  bg: string;
  border: string;
  borderHover: string;
  text: string;
  ring: string;
}[] = [
  {
    zone: "calm",
    emoji: "\u{1F60C}",
    label: "Calm",
    bg: "bg-emerald-100",
    border: "border-emerald-200",
    borderHover: "hover:border-emerald-400",
    text: "text-emerald-700",
    ring: "focus-visible:ring-emerald-500",
  },
  {
    zone: "happy",
    emoji: "\u{1F60A}",
    label: "Happy",
    bg: "bg-yellow-100",
    border: "border-yellow-200",
    borderHover: "hover:border-yellow-400",
    text: "text-yellow-700",
    ring: "focus-visible:ring-yellow-500",
  },
  {
    zone: "worried",
    emoji: "\u{1F61F}",
    label: "Worried",
    bg: "bg-blue-100",
    border: "border-blue-200",
    borderHover: "hover:border-blue-400",
    text: "text-blue-700",
    ring: "focus-visible:ring-blue-500",
  },
  {
    zone: "frustrated",
    emoji: "\u{1F624}",
    label: "Frustrated",
    bg: "bg-orange-100",
    border: "border-orange-200",
    borderHover: "hover:border-orange-400",
    text: "text-orange-700",
    ring: "focus-visible:ring-orange-500",
  },
  {
    zone: "sad",
    emoji: "\u{1F622}",
    label: "Sad",
    bg: "bg-purple-100",
    border: "border-purple-200",
    borderHover: "hover:border-purple-400",
    text: "text-purple-700",
    ring: "focus-visible:ring-purple-500",
  },
];

export function EmotionCheckIn({ onComplete, learnerName }: EmotionCheckInProps) {
  const [selected, setSelected] = useState<EmotionZone | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const liveRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const handleSelect = useCallback(
    (zone: EmotionZone) => {
      if (selected) return;
      setSelected(zone);
      if (liveRef.current) {
        liveRef.current.textContent = `You selected ${zone}. Starting your session with Harmony.`;
      }
      setTimeout(() => onComplete(zone), 600);
    },
    [selected, onComplete],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let next = focusedIndex;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        next = (focusedIndex + 1) % EMOTIONS.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        next = (focusedIndex - 1 + EMOTIONS.length) % EMOTIONS.length;
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleSelect(EMOTIONS[focusedIndex].zone);
        return;
      } else {
        return;
      }
      setFocusedIndex(next);
      cardsRef.current[next]?.focus();
    },
    [focusedIndex, handleSelect],
  );

  const greeting = learnerName
    ? `Hey ${learnerName}! How are you feeling right now?`
    : "Hey there! How are you feeling right now?";

  return (
    <div className="max-w-2xl mx-auto rounded-2xl bg-gradient-to-br from-violet-50 to-white border border-violet-100 p-8">
      {/* Avatar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-center mb-4"
      >
        <TutorAvatar persona="harmony" size="lg" />
      </motion.div>

      {/* Header */}
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0 }}
        className="text-2xl font-bold text-gray-800 text-center"
      >
        {greeting}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-sm text-gray-500 text-center mt-2"
      >
        There&apos;s no wrong answer &mdash; every feeling is welcome here{" "}
        <span aria-hidden="true">{"\u{1F331}"}</span>
      </motion.p>

      {/* Emotion cards */}
      <div
        role="radiogroup"
        aria-label="How are you feeling right now?"
        className="flex flex-wrap justify-center gap-4 mt-8"
        onKeyDown={handleKeyDown}
      >
        {EMOTIONS.map((emotion, i) => {
          const isSelected = selected === emotion.zone;
          const isOther = selected !== null && !isSelected;
          return (
            <motion.button
              key={emotion.zone}
              ref={(el) => { cardsRef.current[i] = el; }}
              role="radio"
              aria-checked={isSelected}
              aria-label={`${emotion.label} \u2014 select this if you're feeling ${emotion.label.toLowerCase()}`}
              tabIndex={focusedIndex === i ? 0 : -1}
              initial={{ opacity: 0, y: 12 }}
              animate={{
                opacity: isOther ? 0.4 : 1,
                y: 0,
                scale: isSelected ? 1.1 : isOther ? 0.95 : 1,
              }}
              transition={{
                delay: selected ? 0 : 0.2 + i * 0.08,
                duration: 0.3,
                ease: "easeOut",
              }}
              onClick={() => handleSelect(emotion.zone)}
              className={[
                "w-24 h-28 sm:w-28 sm:h-32 rounded-xl border-2 flex flex-col items-center justify-center gap-2 cursor-pointer transition-shadow duration-200",
                emotion.bg,
                emotion.border,
                emotion.borderHover,
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                emotion.ring,
                !selected && "hover:scale-105 hover:shadow-md",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span className="text-4xl" aria-hidden="true">
                {emotion.emoji}
              </span>
              <span className={`text-sm font-medium ${emotion.text}`}>
                {emotion.label}
              </span>
              {isSelected && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 text-lg"
                  aria-hidden="true"
                >
                  {"\u2728"}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Live region for screen readers */}
      <div ref={liveRef} aria-live="polite" className="sr-only" />
    </div>
  );
}

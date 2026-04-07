"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface MusicBreakProps {
  /** Whether sound is enabled for this learner */
  soundEnabled?: boolean;
}

const NOTE_EMOJIS = ["\u266A", "\u266B", "\u266C", "\u2669"];
const NOTE_COLORS = ["#7C3AED", "#A78BFA", "#C4B5FD", "#8B5CF6", "#6D28D9"];

/**
 * Calming music break with animated floating notes and Web Audio API melody.
 */
export function MusicBreak({ soundEnabled = true }: MusicBreakProps) {
  const prefersReducedMotion = useReducedMotion();
  const audioCtxRef = useRef<AudioContext | null>(null);
  const stopRef = useRef(false);

  const playMelody = useCallback(async () => {
    if (!soundEnabled) return;
    try {
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      // Pentatonic scale notes for a calming feel
      const notes = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 440.0, 392.0, 329.63, 293.66];
      const noteDuration = 0.8;

      for (let i = 0; i < notes.length; i++) {
        if (stopRef.current || ctx.state === "closed") break;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(notes[i], ctx.currentTime);

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.1);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + noteDuration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + noteDuration);

        await new Promise((r) => setTimeout(r, noteDuration * 700));
      }
    } catch {
      // Web Audio may not be available in all environments
    }
  }, [soundEnabled]);

  useEffect(() => {
    stopRef.current = false;
    playMelody();

    return () => {
      stopRef.current = true;
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [playMelody]);

  // Generate floating notes
  const floatingNotes = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    emoji: NOTE_EMOJIS[i % NOTE_EMOJIS.length],
    color: NOTE_COLORS[i % NOTE_COLORS.length],
    x: Math.random() * 80 + 10, // 10-90% horizontal
    delay: Math.random() * 3,
    duration: 3 + Math.random() * 3,
    size: 20 + Math.random() * 20,
  }));

  return (
    <div
      className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30"
      role="img"
      aria-label="Calming music playing with animated musical notes"
    >
      {/* Background pulse */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 bg-purple-200/30 dark:bg-purple-700/20 rounded-full"
          style={{ margin: "auto", width: "60%", height: "60%" }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Center icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="text-6xl select-none"
          animate={prefersReducedMotion ? {} : { scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        >
          🎵
        </motion.div>
      </div>

      {/* Floating notes */}
      {!prefersReducedMotion &&
        floatingNotes.map((note) => (
          <motion.span
            key={note.id}
            className="absolute select-none pointer-events-none"
            style={{
              left: `${note.x}%`,
              bottom: -30,
              fontSize: note.size,
              color: note.color,
            }}
            animate={{ y: [-30, -350], opacity: [0, 1, 1, 0], rotate: [0, 15, -15, 0] }}
            transition={{
              duration: note.duration,
              delay: note.delay,
              repeat: Infinity,
              ease: "easeOut",
            }}
            aria-hidden="true"
          >
            {note.emoji}
          </motion.span>
        ))}

      {/* Label */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
          {soundEnabled ? "Listen to the calming melody..." : "Relax and enjoy the music notes..."}
        </p>
      </div>
    </div>
  );
}

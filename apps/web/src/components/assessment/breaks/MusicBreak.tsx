"use client";

import React, { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface MusicBreakProps {
  soundEnabled?: boolean;
  durationSeconds: number;
  onComplete: () => void;
}

const NOTE_EMOJIS = ["\u266A", "\u266B", "\u266C", "\u2669"];
const NOTE_COLORS = ["#7C3AED", "#A78BFA", "#C4B5FD", "#8B5CF6", "#6D28D9", "#38B2AC"];
const EQ_BAR_COUNT = 7;

// C-major pentatonic in two octaves for a calming feel
const MELODY_FREQUENCIES = [
  261.63, 293.66, 329.63, 392.0, 440.0,
  523.25, 587.33, 659.25, 523.25, 440.0,
  392.0, 329.63, 293.66, 261.63,
];

/**
 * Enhanced calming music break with Web Audio API synthesizer,
 * animated equalizer bars, floating notes, and mute toggle.
 */
export function MusicBreak({ soundEnabled = true, durationSeconds, onComplete }: MusicBreakProps) {
  const prefersReducedMotion = useReducedMotion();
  const audioCtxRef = useRef<AudioContext | null>(null);
  const stopRef = useRef(false);
  const [muted, setMuted] = useState(!soundEnabled);
  const [eqLevels, setEqLevels] = useState<number[]>(Array(EQ_BAR_COUNT).fill(0.2));
  const gainNodeRef = useRef<GainNode | null>(null);

  // Looping melody that plays for the entire duration
  const playMelody = useCallback(async () => {
    try {
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(muted ? 0 : 0.12, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      const noteDuration = 1.0;
      let noteIndex = 0;

      while (!stopRef.current && ctx.state !== "closed") {
        const freq = MELODY_FREQUENCIES[noteIndex % MELODY_FREQUENCIES.length];

        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Soft envelope
        noteGain.gain.setValueAtTime(0, ctx.currentTime);
        noteGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.08);
        noteGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + noteDuration * 0.9);

        osc.connect(noteGain);
        noteGain.connect(masterGain);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + noteDuration);

        // Update equalizer visualization
        setEqLevels(
          Array.from({ length: EQ_BAR_COUNT }, () => 0.3 + Math.random() * 0.7),
        );

        noteIndex++;
        await new Promise((r) => setTimeout(r, noteDuration * 700));
      }
    } catch {
      // Web Audio may not be available
    }
  }, []); // no deps — we read muted via ref below

  // Start audio on mount
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

  // Sync mute state to gain node
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      gainNodeRef.current.gain.setValueAtTime(
        muted ? 0 : 0.12,
        audioCtxRef.current.currentTime,
      );
    }
  }, [muted]);

  // Gently animate EQ when not playing real audio
  useEffect(() => {
    const interval = setInterval(() => {
      setEqLevels((prev) =>
        prev.map((v) => Math.max(0.15, Math.min(1, v + (Math.random() - 0.5) * 0.3))),
      );
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const floatingNotes = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        emoji: NOTE_EMOJIS[i % NOTE_EMOJIS.length],
        color: NOTE_COLORS[i % NOTE_COLORS.length],
        x: 5 + Math.random() * 90,
        delay: Math.random() * 4,
        duration: 3 + Math.random() * 4,
        size: 18 + Math.random() * 22,
      })),
    [],
  );

  return (
    <div
      className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30"
      role="img"
      aria-label="Calming music playing with animated musical notes and equalizer"
    >
      {/* Background pulse rings */}
      {!prefersReducedMotion && (
        <>
          <motion.div
            className="absolute rounded-full border-2 border-purple-300/30 dark:border-purple-500/20"
            style={{ inset: "15%", margin: "auto" }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute rounded-full border-2 border-teal-300/20 dark:border-teal-500/15"
            style={{ inset: "25%", margin: "auto" }}
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.15, 0.3] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
        </>
      )}

      {/* "Now Playing" header */}
      <div className="absolute top-4 left-0 right-0 text-center z-10">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/70 dark:bg-gray-800/70 rounded-full shadow-sm text-sm font-semibold text-purple-700 dark:text-purple-300">
          <span aria-hidden="true">🎵</span>
          Now Playing: Calm Melody
        </span>
      </div>

      {/* Center equalizer bars */}
      <div className="absolute inset-0 flex items-center justify-center gap-1.5" aria-hidden="true">
        {eqLevels.map((level, i) => (
          <motion.div
            key={i}
            className="w-3 sm:w-4 rounded-full"
            style={{
              background: `linear-gradient(to top, #7C3AED, #38B2AC)`,
              opacity: 0.8,
            }}
            animate={{ height: prefersReducedMotion ? 32 : level * 64 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          />
        ))}
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
            animate={{
              y: [-30, -400],
              opacity: [0, 0.8, 0.8, 0],
              rotate: [0, 20, -20, 0],
            }}
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

      {/* Mute toggle */}
      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        className="absolute bottom-4 right-4 z-10 p-2 rounded-full bg-white/70 dark:bg-gray-800/70 shadow-sm hover:bg-white dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
        aria-label={muted ? "Unmute music" : "Mute music"}
      >
        <span className="text-lg" aria-hidden="true">{muted ? "🔇" : "🔊"}</span>
      </button>

      {/* Bottom label */}
      <div className="absolute bottom-4 left-0 right-12 text-center">
        <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
          {muted ? "Music muted — enjoy the visuals..." : "Relax and listen to the melody..."}
        </p>
      </div>
    </div>
  );
}

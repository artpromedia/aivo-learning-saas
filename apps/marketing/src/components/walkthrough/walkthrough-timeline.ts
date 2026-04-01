"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export interface SceneConfig {
  startMs: number;
  endMs: number;
}

export const SCENES: SceneConfig[] = [
  { startMs: 0, endMs: 7000 },       // Scene 1: Brain Clone
  { startMs: 7000, endMs: 15000 },    // Scene 2: Dashboard
  { startMs: 15000, endMs: 23000 },   // Scene 3: Tutor Chat
  { startMs: 23000, endMs: 30000 },   // Scene 4: Adaptation
  { startMs: 30000, endMs: 38000 },   // Scene 5: Reports
  { startMs: 38000, endMs: 45000 },   // Scene 6: CTA
];

export const TOTAL_DURATION_MS = 45000;

export interface WalkthroughState {
  currentScene: number;
  elapsedMs: number;
  isPlaying: boolean;
  sceneElapsedMs: number;
  progress: number;
}

export function useWalkthroughTimeline(options?: {
  autoplay?: boolean;
  onMilestone?: (percent: number) => void;
  onComplete?: () => void;
}) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(options?.autoplay ?? false);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const milestonesHit = useRef(new Set<number>());
  const hasStartedRef = useRef(false);

  const currentScene = SCENES.findIndex(
    (s) => elapsedMs >= s.startMs && elapsedMs < s.endMs
  );
  const activeScene = currentScene === -1 ? SCENES.length - 1 : currentScene;
  const sceneElapsedMs = elapsedMs - SCENES[activeScene].startMs;
  const progress = Math.min(elapsedMs / TOTAL_DURATION_MS, 1);

  const checkMilestones = useCallback(
    (ms: number) => {
      const pct = (ms / TOTAL_DURATION_MS) * 100;
      for (const milestone of [25, 50, 75]) {
        if (pct >= milestone && !milestonesHit.current.has(milestone)) {
          milestonesHit.current.add(milestone);
          options?.onMilestone?.(milestone);
        }
      }
    },
    [options]
  );

  const tick = useCallback(
    (time: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = time;
      }
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;

      setElapsedMs((prev) => {
        const next = Math.min(prev + delta, TOTAL_DURATION_MS);
        checkMilestones(next);
        if (next >= TOTAL_DURATION_MS) {
          setIsPlaying(false);
          options?.onComplete?.();
          return TOTAL_DURATION_MS;
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(tick);
    },
    [checkMilestones, options]
  );

  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = 0;
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, tick]);

  const play = useCallback(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
    }
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      if (elapsedMs >= TOTAL_DURATION_MS) {
        setElapsedMs(0);
        milestonesHit.current.clear();
      }
      play();
    }
  }, [isPlaying, pause, play, elapsedMs]);

  const seekTo = useCallback(
    (ms: number) => {
      const clamped = Math.max(0, Math.min(ms, TOTAL_DURATION_MS));
      setElapsedMs(clamped);
      milestonesHit.current.clear();
      for (const milestone of [25, 50, 75]) {
        if ((clamped / TOTAL_DURATION_MS) * 100 >= milestone) {
          milestonesHit.current.add(milestone);
        }
      }
    },
    []
  );

  const seekToScene = useCallback(
    (index: number) => {
      if (index >= 0 && index < SCENES.length) {
        seekTo(SCENES[index].startMs);
      }
    },
    [seekTo]
  );

  const replay = useCallback(() => {
    setElapsedMs(0);
    milestonesHit.current.clear();
    hasStartedRef.current = true;
    setIsPlaying(true);
  }, []);

  return {
    currentScene: activeScene,
    elapsedMs,
    isPlaying,
    sceneElapsedMs,
    progress,
    hasStarted: hasStartedRef.current,
    play,
    pause,
    togglePlayPause,
    seekTo,
    seekToScene,
    replay,
  };
}

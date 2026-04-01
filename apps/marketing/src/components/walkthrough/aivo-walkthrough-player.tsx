"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { events } from "@/lib/analytics";
import { useWalkthroughTimeline, SCENES, TOTAL_DURATION_MS } from "./walkthrough-timeline";
import { BrainCloneScene } from "./scenes/brain-clone-scene";
import { DashboardScene } from "./scenes/dashboard-scene";
import { TutorChatScene } from "./scenes/tutor-chat-scene";
import { AdaptationScene } from "./scenes/adaptation-scene";
import { ReportsScene } from "./scenes/reports-scene";
import { CtaScene } from "./scenes/cta-scene";

interface AivoWalkthroughPlayerProps {
  autoplay?: boolean;
  source?: string;
  onComplete?: () => void;
  className?: string;
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  );
}

function ReplayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}

export function AivoWalkthroughPlayer({
  autoplay = false,
  source = "unknown",
  onComplete,
  className,
}: AivoWalkthroughPlayerProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasTrackedStart = useRef(false);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.3 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const timeline = useWalkthroughTimeline({
    autoplay: autoplay && !reducedMotion,
    onMilestone: (percent) => {
      events.videoWalkthroughMilestone(source, percent);
    },
    onComplete: () => {
      const watchTimeMs = Date.now() - startTimeRef.current;
      events.videoWalkthroughCompleted(source, watchTimeMs);
      onComplete?.();
    },
  });

  useEffect(() => {
    if (timeline.isPlaying && !hasTrackedStart.current) {
      hasTrackedStart.current = true;
      startTimeRef.current = Date.now();
      events.videoWalkthroughStarted(source);
    }
  }, [timeline.isPlaying, source]);

  const sceneComponents = [
    BrainCloneScene,
    DashboardScene,
    TutorChatScene,
    AdaptationScene,
    ReportsScene,
    CtaScene,
  ];

  if (reducedMotion) {
    return (
      <div
        ref={containerRef}
        role="region"
        aria-label="Aivo product walkthrough"
        className={cn("relative rounded-xl overflow-hidden shadow-2xl border border-gray-800/20", className)}
      >
        <div className="aspect-video grid grid-cols-3 grid-rows-2 gap-1 bg-gray-900 p-1">
          {["Brain Clone™", "Dashboard", "AI Tutor Chat", "Adaptive Quiz", "Progress Reports", "Get Started"].map(
            (label) => (
              <div
                key={label}
                className="bg-gradient-to-br from-purple-900 to-teal-900 rounded flex items-center justify-center p-2"
              >
                <span className="text-white text-xs text-center font-medium">{label}</span>
              </div>
            )
          )}
        </div>
      </div>
    );
  }

  const ActiveScene = sceneComponents[timeline.currentScene];

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Aivo product walkthrough"
      className={cn("relative rounded-xl overflow-hidden shadow-2xl", className)}
    >
      {/* Laptop bezel */}
      <div className="bg-gray-900 rounded-xl border border-gray-700/50 overflow-hidden">
        {/* Screen bezel top */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/80">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          <div className="flex-1 mx-4 h-5 rounded bg-gray-700/50 flex items-center px-2">
            <span className="text-[10px] text-gray-400">app.aivolearning.com</span>
          </div>
        </div>

        {/* Scene container */}
        <div className="aspect-video relative bg-gray-900 overflow-hidden">
          {isInView && (
            <AnimatePresence mode="wait">
              <motion.div
                key={timeline.currentScene}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <ActiveScene sceneElapsedMs={timeline.sceneElapsedMs} />
              </motion.div>
            </AnimatePresence>
          )}

          {/* Play overlay when paused and not started */}
          {!timeline.isPlaying && timeline.elapsedMs === 0 && (
            <motion.button
              className="absolute inset-0 flex items-center justify-center bg-black/40 z-20 cursor-pointer"
              onClick={timeline.play}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              aria-label="Play walkthrough"
            >
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#7c3aed">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </motion.button>
          )}
        </div>

        {/* Control bar */}
        <div className="flex items-center gap-3 px-3 py-2 bg-gray-800/90">
          {/* Play/Pause */}
          <button
            onClick={timeline.togglePlayPause}
            className="text-white hover:text-purple-300 transition-colors"
            aria-label={timeline.isPlaying ? "Pause walkthrough" : "Play walkthrough"}
          >
            {timeline.isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>

          {/* Progress bar */}
          <div
            className="flex-1 h-1.5 bg-gray-700 rounded-full cursor-pointer relative group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              timeline.seekTo(pct * TOTAL_DURATION_MS);
            }}
          >
            <div
              className="absolute top-0 left-0 h-full bg-purple-500 rounded-full transition-all duration-100"
              style={{ width: `${timeline.progress * 100}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${timeline.progress * 100}% - 6px)` }}
            />
          </div>

          {/* Scene dots */}
          <div className="flex items-center gap-1">
            {SCENES.map((_, i) => (
              <button
                key={i}
                onClick={() => timeline.seekToScene(i)}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  i === timeline.currentScene
                    ? "bg-purple-400"
                    : i < timeline.currentScene
                      ? "bg-purple-700"
                      : "bg-gray-600"
                )}
                aria-label={`Go to scene ${i + 1}`}
              />
            ))}
          </div>

          {/* Replay */}
          <button
            onClick={timeline.replay}
            className="text-white hover:text-purple-300 transition-colors"
            aria-label="Replay walkthrough"
          >
            <ReplayIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

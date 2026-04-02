"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeader } from "@/components/shared/section-header";
import {
  TUTOR_ORDER,
  getTutorConfig,
  type TutorPersona,
  type TutorAvatarConfig,
} from "@/components/tutors/tutor-avatar-data";

/* ─── Constants ─────────────────────────────────────────────────── */

const AUTOPLAY_INTERVAL = 6000;
const TOTAL = TUTOR_ORDER.length;

/* ─── Helpers ───────────────────────────────────────────────────── */

function wrap(index: number): number {
  return ((index % TOTAL) + TOTAL) % TOTAL;
}

/* ─── Flanking Card ─────────────────────────────────────────────── */

function FlankingCard({
  config,
  side,
  onClick,
}: {
  config: TutorAvatarConfig;
  side: "left" | "right";
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className="relative hidden md:block w-48 lg:w-56 aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer shrink-0"
      initial={{ opacity: 0, x: side === "left" ? -40 : 40 }}
      animate={{ opacity: 0.7, x: 0, scale: 0.85 }}
      exit={{ opacity: 0, x: side === "left" ? -40 : 40 }}
      whileHover={{ opacity: 0.9, scale: 0.9 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Image
        src={config.avatarImage}
        alt={config.name}
        fill
        sizes="224px"
        className="object-cover"
      />
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t via-transparent to-transparent",
          config.tailwindGradientFrom.replace("from-", "from-") + "/60",
        )}
        style={{
          background: `linear-gradient(to top, ${config.primaryColor}99, transparent 60%)`,
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-white font-bold text-lg">{config.name}</p>
        <p className="text-white/80 text-xs">{config.subject}</p>
      </div>
    </motion.button>
  );
}

/* ─── Active Hero Panel ─────────────────────────────────────────── */

function ActivePanel({ config }: { config: TutorAvatarConfig }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      key={config.persona}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col md:flex-row items-center gap-8 lg:gap-14 w-full max-w-5xl mx-auto"
    >
      {/* Hero Image */}
      <div className="relative w-64 h-80 sm:w-72 sm:h-96 md:w-80 md:h-[28rem] shrink-0">
        {/* Radial glow */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 -z-10 rounded-full blur-3xl"
          style={{ backgroundColor: config.accentColor }}
          animate={
            !shouldReduceMotion
              ? { opacity: [0.25, 0.45, 0.25], scale: [0.95, 1.08, 0.95] }
              : {}
          }
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Floating image */}
        <motion.div
          className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl"
          animate={!shouldReduceMotion ? { y: [0, -8, 0] } : {}}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src={config.heroImage}
            alt={`${config.name} — AIVO's ${config.subject} Tutor`}
            fill
            priority
            sizes="(max-width: 768px) 288px, 320px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/5 pointer-events-none" />
        </motion.div>
      </div>

      {/* Text Content */}
      <div className="flex-1 text-center md:text-left">
        {/* Subject pill */}
        <span
          className={cn(
            "inline-block rounded-full px-4 py-1.5 text-sm font-semibold mb-4",
            config.tailwindBg,
            config.tailwindText,
          )}
        >
          {config.subject}
        </span>

        <h3 className="text-3xl sm:text-4xl font-bold text-aivo-navy-800">
          {config.name}
        </h3>

        <p
          className="mt-3 text-lg sm:text-xl italic"
          style={{ color: config.primaryColor }}
        >
          {config.tagline}
        </p>

        {/* Selling points */}
        <ul className="mt-6 space-y-3">
          {config.sellingPoints.map((point) => (
            <li key={point} className="flex items-start gap-3">
              <Check
                className="mt-0.5 h-5 w-5 shrink-0"
                style={{ color: config.primaryColor }}
              />
              <span className="text-sm text-aivo-navy-600">{point}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link
          href={`/tutors#${config.persona}`}
          className="mt-8 inline-block rounded-lg px-8 py-3 font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
          style={{ backgroundColor: config.primaryColor }}
        >
          Learn with {config.name}
        </Link>
      </div>
    </motion.div>
  );
}

/* ─── Dot Indicators ────────────────────────────────────────────── */

function DotIndicators({
  activeIndex,
  onSelect,
}: {
  activeIndex: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      {TUTOR_ORDER.map((persona, i) => {
        const config = getTutorConfig(persona);
        const isActive = i === activeIndex;
        return (
          <button
            key={persona}
            onClick={() => onSelect(i)}
            aria-label={`View ${config.name}`}
            className={cn(
              "rounded-full transition-all duration-300",
              isActive ? "w-8 h-3" : "w-3 h-3 hover:scale-125",
            )}
            style={{
              backgroundColor: isActive
                ? config.primaryColor
                : `${config.primaryColor}40`,
            }}
          />
        );
      })}
    </div>
  );
}

/* ─── Main Carousel ─────────────────────────────────────────────── */

export function TutorCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeConfig = getTutorConfig(TUTOR_ORDER[activeIndex]);
  const leftConfig = getTutorConfig(TUTOR_ORDER[wrap(activeIndex - 1)]);
  const rightConfig = getTutorConfig(TUTOR_ORDER[wrap(activeIndex + 1)]);

  const navigate = useCallback(
    (direction: 1 | -1) => {
      setActiveIndex((prev) => wrap(prev + direction));
    },
    [],
  );

  // Autoplay
  useEffect(() => {
    if (isPaused) return;
    intervalRef.current = setInterval(() => navigate(1), AUTOPLAY_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, navigate, activeIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") navigate(-1);
      if (e.key === "ArrowRight") navigate(1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate]);

  return (
    <section
      id="ai-tutors"
      className="relative py-20 sm:py-28 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {/* Animated radial background */}
      <motion.div
        className="absolute inset-0 -z-10"
        animate={{
          background: `radial-gradient(ellipse at center, ${activeConfig.accentColor}26 0%, white 70%)`,
        }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Meet Your AI Learning Team"
          subtitle="Seven specialized AI tutors, each with a unique personality and teaching style designed to make every subject engaging and fun."
        />

        {/* Carousel Layout */}
        <div
          className="relative flex items-center justify-center gap-4 lg:gap-8"
          role="region"
          aria-roledescription="carousel"
          aria-label="AI Tutors"
        >
          {/* Left arrow */}
          <button
            onClick={() => navigate(-1)}
            aria-label="Previous tutor"
            className="absolute left-0 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:shadow-lg md:static"
          >
            <ChevronLeft className="h-5 w-5 text-aivo-navy-600" />
          </button>

          {/* Left flanking card */}
          <AnimatePresence mode="popLayout">
            <FlankingCard
              key={`left-${leftConfig.persona}`}
              config={leftConfig}
              side="left"
              onClick={() => navigate(-1)}
            />
          </AnimatePresence>

          {/* Active hero panel */}
          <div
            className="flex-1 min-w-0"
            role="group"
            aria-roledescription="slide"
            aria-label={`${activeConfig.name} — ${activeConfig.subject}`}
          >
            <AnimatePresence mode="wait">
              <ActivePanel
                key={activeConfig.persona}
                config={activeConfig}
              />
            </AnimatePresence>
          </div>

          {/* Right flanking card */}
          <AnimatePresence mode="popLayout">
            <FlankingCard
              key={`right-${rightConfig.persona}`}
              config={rightConfig}
              side="right"
              onClick={() => navigate(1)}
            />
          </AnimatePresence>

          {/* Right arrow */}
          <button
            onClick={() => navigate(1)}
            aria-label="Next tutor"
            className="absolute right-0 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:shadow-lg md:static"
          >
            <ChevronRight className="h-5 w-5 text-aivo-navy-600" />
          </button>
        </div>

        {/* Dot indicators */}
        <DotIndicators
          activeIndex={activeIndex}
          onSelect={setActiveIndex}
        />
      </div>
    </section>
  );
}

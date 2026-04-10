"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeader } from "@/components/shared/section-header";
import { useI18n } from "@/providers/i18n-provider";
import {
  TUTOR_ORDER,
  getTutorConfig,
  type TutorPersona as _TutorPersona,
  type TutorAvatarConfig,
} from "@/components/tutors/tutor-avatar-data";

const AUTOPLAY_INTERVAL = 6000;
const TOTAL = TUTOR_ORDER.length;

function wrap(index: number): number {
  return ((index % TOTAL) + TOTAL) % TOTAL;
}

function FlankingCard({
  config,
  side,
  onClick,
  label,
}: {
  config: TutorAvatarConfig;
  side: "left" | "right";
  onClick: () => void;
  label: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      aria-label={label}
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
        <p className="text-white font-bold text-lg">{label}</p>
        <p className="text-white/80 text-xs">{config.subject}</p>
      </div>
    </motion.button>
  );
}

function ActivePanel({
  config,
  tutorName,
  tutorSubject,
  tutorTagline,
  sellingPoints,
  ctaText,
}: {
  config: TutorAvatarConfig;
  tutorName: string;
  tutorSubject: string;
  tutorTagline: string;
  sellingPoints: string[];
  ctaText: string;
}) {
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
      <div className="relative w-64 h-80 sm:w-72 sm:h-96 md:w-80 md:h-[28rem] shrink-0">
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
        <motion.div
          className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl"
          animate={!shouldReduceMotion ? { y: [0, -8, 0] } : {}}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src={config.heroImage}
            alt={`${tutorName} — AIVO's ${tutorSubject} Tutor`}
            fill
            priority
            sizes="(max-width: 768px) 288px, 320px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/5 pointer-events-none" />
        </motion.div>
      </div>

      <div className="flex-1 text-center md:text-left">
        <span
          className={cn(
            "inline-block rounded-full px-4 py-1.5 text-sm font-semibold mb-4",
            config.tailwindBg,
            config.tailwindText,
          )}
        >
          {tutorSubject}
        </span>

        <h3 className="text-3xl sm:text-4xl font-bold text-aivo-navy-800">
          {tutorName}
        </h3>

        <p
          className="mt-3 text-lg sm:text-xl italic"
          style={{ color: config.primaryColor }}
        >
          {tutorTagline}
        </p>

        <ul className="mt-6 space-y-3">
          {sellingPoints.map((point) => (
            <li key={point} className="flex items-start gap-3">
              <Check
                className="mt-0.5 h-5 w-5 shrink-0"
                style={{ color: config.primaryColor }}
              />
              <span className="text-sm text-aivo-navy-600">{point}</span>
            </li>
          ))}
        </ul>

        <Link
          href={`/tutors#${config.persona}`}
          className="mt-8 inline-block rounded-lg px-8 py-3 font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
          style={{ backgroundColor: config.primaryColor }}
        >
          {ctaText}
        </Link>
      </div>
    </motion.div>
  );
}

function DotIndicators({
  activeIndex,
  onSelect,
  getLabel,
}: {
  activeIndex: number;
  onSelect: (i: number) => void;
  getLabel: (persona: string) => string;
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
            aria-label={getLabel(persona)}
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

export function TutorCarousel() {
  const { t } = useI18n();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeConfig = getTutorConfig(TUTOR_ORDER[activeIndex]);
  const leftConfig = getTutorConfig(TUTOR_ORDER[wrap(activeIndex - 1)]);
  const rightConfig = getTutorConfig(TUTOR_ORDER[wrap(activeIndex + 1)]);

  const tt = (key: string) => t("aiTutors", key);

  const getTutorName = (persona: string) =>
    tt(`${persona}Name`) || getTutorConfig(persona as any).name;
  const getTutorSubject = (persona: string) =>
    tt(`${persona}Subject`) || getTutorConfig(persona as any).subject;
  const getTutorTagline = (persona: string) =>
    tt(`${persona}Tagline`) || getTutorConfig(persona as any).tagline;
  const getTutorPoints = (persona: string): string[] => {
    const cfg = getTutorConfig(persona as any);
    return [
      tt(`${persona}Point1`) || cfg.sellingPoints[0],
      tt(`${persona}Point2`) || cfg.sellingPoints[1],
      tt(`${persona}Point3`) || cfg.sellingPoints[2],
    ];
  };
  const getLearnWithText = (name: string) =>
    tt("learnWith").replace("{name}", name);
  const getViewLabel = (persona: string) => {
    const name = getTutorName(persona);
    return tt("viewTutor").replace("{name}", name);
  };

  const navigate = useCallback(
    (direction: 1 | -1) => {
      setActiveIndex((prev) => wrap(prev + direction));
    },
    [],
  );

  useEffect(() => {
    if (isPaused) return;
    intervalRef.current = setInterval(() => navigate(1), AUTOPLAY_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, navigate, activeIndex]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") navigate(-1);
      if (e.key === "ArrowRight") navigate(1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate]);

  const activeName = getTutorName(activeConfig.persona);

  return (
    <section
      id="ai-tutors"
      className="relative py-20 sm:py-28 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <motion.div
        className="absolute inset-0 -z-10"
        animate={{
          background: `radial-gradient(ellipse at center, ${activeConfig.accentColor}26 0%, white 70%)`,
        }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title={tt("title")}
          subtitle={tt("subtitle")}
        />

        <div
          className="relative flex items-center justify-center gap-4 lg:gap-8"
          role="region"
          aria-roledescription="carousel"
          aria-label={tt("carouselLabel")}
        >
          <button
            onClick={() => navigate(-1)}
            aria-label={tt("previousTutor")}
            className="absolute left-0 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:shadow-lg md:static"
          >
            <ChevronLeft className="h-5 w-5 text-aivo-navy-600" />
          </button>

          <AnimatePresence mode="popLayout">
            <FlankingCard
              key={`left-${leftConfig.persona}`}
              config={leftConfig}
              side="left"
              onClick={() => navigate(-1)}
              label={getTutorName(leftConfig.persona)}
            />
          </AnimatePresence>

          <div
            className="flex-1 min-w-0"
            role="group"
            aria-roledescription="slide"
            aria-label={`${activeName} — ${getTutorSubject(activeConfig.persona)}`}
          >
            <AnimatePresence mode="wait">
              <ActivePanel
                key={activeConfig.persona}
                config={activeConfig}
                tutorName={activeName}
                tutorSubject={getTutorSubject(activeConfig.persona)}
                tutorTagline={getTutorTagline(activeConfig.persona)}
                sellingPoints={getTutorPoints(activeConfig.persona)}
                ctaText={getLearnWithText(activeName)}
              />
            </AnimatePresence>
          </div>

          <AnimatePresence mode="popLayout">
            <FlankingCard
              key={`right-${rightConfig.persona}`}
              config={rightConfig}
              side="right"
              onClick={() => navigate(1)}
              label={getTutorName(rightConfig.persona)}
            />
          </AnimatePresence>

          <button
            onClick={() => navigate(1)}
            aria-label={tt("nextTutor")}
            className="absolute right-0 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:shadow-lg md:static"
          >
            <ChevronRight className="h-5 w-5 text-aivo-navy-600" />
          </button>
        </div>

        <DotIndicators
          activeIndex={activeIndex}
          onSelect={setActiveIndex}
          getLabel={getViewLabel}
        />
      </div>
    </section>
  );
}

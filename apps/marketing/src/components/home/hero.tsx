"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { events } from "@/lib/analytics";
import { useI18n } from "@/providers/i18n-provider";
import { DashboardMockup } from "./dashboard-mockup";
import { BrainCloneMockup } from "./brain-clone-mockup";
import { TutorsMockup } from "./tutors-mockup";
import { SLIDE_1_IMAGE, SLIDE_2_IMAGE, SLIDE_3_IMAGE, SLIDE_4_IMAGE, SLIDE_5_IMAGE, SLIDE_6_IMAGE } from "./hero-slides-data";

/* ─── Constants ─────────────────────────────────────────────────── */

const AUTOPLAY_MS = 6000;
const SLIDE_COUNT = 9;

function wrap(i: number): number {
  return ((i % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT;
}

/* ─── Types ─────────────────────────────────────────────────────── */

interface HeroSlide {
  id: string;
  heroImage: string;
  heroImageAlt: string;
  accentColor: string;
  glowColor: string;
  badge: string;
  headline: string;
  subheadline: string;
  features?: string[];
  cta: { label: string; href: string; event: string };
  ctaSecondary?: { label: string; href: string; event: string };
  visual?: ReactNode;
  visualPosition: "right" | "background";
}

/* ─── Animation Helpers ─────────────────────────────────────────── */

const wrapperVariants = {
  hidden: {},
  visible: {},
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

function stagger(y: number, duration: number, delay: number) {
  return {
    hidden: { opacity: 0, y },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration, delay, ease: "easeOut" as const },
    },
  };
}

function staggerScale(delay: number) {
  return {
    hidden: { opacity: 0, y: 12, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.3, delay, ease: "easeOut" as const },
    },
  };
}

/* ─── Flanking Preview ──────────────────────────────────────────── */

function FlankingPreview({
  slide,
  side,
  onClick,
}: Readonly<{
  slide: HeroSlide;
  side: "left" | "right";
  onClick: () => void;
}>) {
  const offsetX = side === "left" ? -40 : 40;
  return (
    <motion.button
      onClick={onClick}
      className="relative hidden md:block w-32 lg:w-40 aspect-3/4 rounded-xl overflow-hidden cursor-pointer shrink-0"
      initial={{ opacity: 0, x: offsetX }}
      animate={{ opacity: 0.6, x: 0, scale: 0.8 }}
      exit={{ opacity: 0, x: offsetX }}
      whileHover={{ opacity: 0.8, scale: 0.85 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      aria-label={`Go to: ${slide.badge}`}
    >
      {slide.heroImage ? (
        <Image
          src={slide.heroImage}
          alt=""
          fill
          sizes="160px"
          className="object-cover"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${slide.accentColor}, ${slide.glowColor})`,
          }}
        />
      )}
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-white text-xs font-medium truncate">
          {slide.badge}
        </p>
      </div>
    </motion.button>
  );
}

/* ─── Hero Backdrop ─────────────────────────────────────────────── */

function HeroBackdrop({
  slide,
  isFirstSlide,
  isRtl,
  reducedMotion,
}: Readonly<{
  slide: HeroSlide;
  isFirstSlide: boolean;
  isRtl: boolean;
  reducedMotion: boolean | null;
}>) {
  const isBackground = slide.visualPosition === "background";
  const showSubtleBg =
    slide.visualPosition === "right" && !!slide.heroImage;
  const glowAnim = reducedMotion
    ? {}
    : { opacity: [0.2, 0.4, 0.2], scale: [0.95, 1.08, 0.95] };
  const floatAnim = reducedMotion ? {} : { y: [0, -8, 0] };
  const gradientDir = isRtl ? "to left" : "to right";

  return (
    <>
      {/* Dynamic radial gradient */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: `radial-gradient(ellipse at 70% 50%, ${slide.accentColor}33 0%, #1a1a2e 70%)`,
        }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />

      {/* Background hero image (slides with visualPosition="background") */}
      <AnimatePresence mode="wait">
        {slide.heroImage && isBackground && (
          <motion.div
            key={`bg-${slide.id}`}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              aria-hidden="true"
              className="absolute top-1/2 right-[30%] -translate-y-1/2 w-125 h-125 rounded-full blur-3xl"
              style={{ backgroundColor: slide.glowColor }}
              animate={glowAnim}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute top-0 right-0 w-full md:w-[60%] h-full"
              animate={floatAnim}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Image
                src={slide.heroImage}
                alt={slide.heroImageAlt}
                fill
                priority={isFirstSlide}
                loading={isFirstSlide ? undefined : "lazy"}
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover object-center"
              />
            </motion.div>
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(${gradientDir}, #1a1a2e, #1a1a2ecc 50%, transparent)`,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle background for mockup slides */}
      {showSubtleBg && (
        <div className="absolute inset-0 opacity-10">
          <Image
            src={slide.heroImage}
            alt=""
            fill
            className="object-cover blur-md"
          />
        </div>
      )}

      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl"
          animate={{ backgroundColor: `${slide.glowColor}1a` }}
          transition={{ duration: 0.6 }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl"
          animate={{ backgroundColor: `${slide.accentColor}0d` }}
          transition={{ duration: 0.6 }}
        />
      </div>
    </>
  );
}

/* ─── Slide Text Content ────────────────────────────────────────── */

function SlideText({
  slide,
  isRtl,
  hasMockup,
  ctaPrimaryDelay,
  ctaSecondaryDelay,
}: Readonly<{
  slide: HeroSlide;
  isRtl: boolean;
  hasMockup: boolean;
  ctaPrimaryDelay: number;
  ctaSecondaryDelay: number;
}>) {
  return (
    <div
      className={cn(
        hasMockup ? "flex-1 text-center lg:text-start" : "max-w-3xl",
        isRtl && "lg:text-end",
      )}
    >
      <motion.span
        variants={stagger(12, 0.3, 0)}
        className="inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/90 mb-4"
        style={{
          backgroundColor: `${slide.accentColor}40`,
          border: `1px solid ${slide.accentColor}60`,
        }}
      >
        {slide.badge}
      </motion.span>

      <motion.h1
        variants={stagger(16, 0.4, 0.08)}
        className={cn(
          "text-4xl sm:text-5xl font-extrabold text-white leading-tight",
          !hasMockup && "lg:text-6xl",
        )}
      >
        {slide.headline}
      </motion.h1>

      <motion.p
        variants={stagger(12, 0.35, 0.16)}
        className={cn(
          "mt-6 text-lg sm:text-xl text-white/90",
          hasMockup ? "max-w-lg" : "max-w-2xl",
        )}
      >
        {slide.subheadline}
      </motion.p>

      {slide.features && (
        <ul className="mt-6 space-y-3">
          {slide.features.map((feat, featIdx) => (
            <motion.li
              key={feat}
              variants={stagger(10, 0.3, 0.24 + featIdx * 0.06)}
              className={cn(
                "flex items-start gap-3",
                isRtl && "flex-row-reverse",
              )}
            >
              <Check
                className="mt-0.5 h-5 w-5 shrink-0"
                style={{ color: slide.glowColor }}
              />
              <span className="text-sm text-white/80">{feat}</span>
            </motion.li>
          ))}
        </ul>
      )}

      <div
        className={cn(
          "mt-10 flex flex-col sm:flex-row items-center gap-4",
          "justify-center lg:justify-start",
          isRtl && "sm:flex-row-reverse",
        )}
      >
        <motion.div variants={staggerScale(ctaPrimaryDelay)}>
          <Link
            href={slide.cta.href}
            onClick={() => events.signupClick(slide.cta.event)}
            className={cn(
              "inline-flex items-center justify-center rounded-lg px-8 py-4",
              "bg-white text-aivo-purple-600 font-semibold text-lg",
              "hover:bg-white/90 transition-all duration-200",
              "shadow-lg hover:shadow-xl hover:-translate-y-0.5",
            )}
          >
            {slide.cta.label}
          </Link>
        </motion.div>

        {slide.ctaSecondary && (
          <motion.div variants={staggerScale(ctaSecondaryDelay)}>
            <Link
              href={slide.ctaSecondary.href}
              onClick={() =>
                events.signupClick(slide.ctaSecondary!.event)
              }
              className={cn(
                "inline-flex items-center justify-center rounded-lg px-8 py-4",
                "border-2 border-white text-white font-semibold text-lg",
                "hover:bg-white/10 transition-all duration-200",
              )}
            >
              {slide.ctaSecondary.label}
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ─── Dot Indicators ────────────────────────────────────────────── */

function DotIndicators({
  slides,
  current,
  isRtl,
  onGoTo,
}: Readonly<{
  slides: HeroSlide[];
  current: number;
  isRtl: boolean;
  onGoTo: (index: number) => void;
}>) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 mt-12 justify-center lg:justify-start",
        isRtl && "flex-row-reverse",
      )}
    >
      {slides.map((s, idx) => {
        const isActive = idx === current;
        return (
          <button
            key={s.id}
            onClick={() => onGoTo(idx)}
            aria-label={`Go to slide ${idx + 1}: ${s.badge}`}
            className="rounded-full transition-all duration-300 hover:scale-125"
            style={{
              width: isActive ? 32 : 12,
              height: 12,
              backgroundColor: isActive
                ? s.accentColor
                : `${s.accentColor}66`,
            }}
          />
        );
      })}
    </div>
  );
}

/* ─── Mobile Arrow Buttons ──────────────────────────────────────── */

function MobileArrows({
  isRtl,
  onPrev,
  onNext,
}: Readonly<{
  isRtl: boolean;
  onPrev: () => void;
  onNext: () => void;
}>) {
  const prevPos = isRtl ? "right-4" : "left-4";
  const nextPos = isRtl ? "left-4" : "right-4";
  const iconFlip = isRtl ? "rotate-180" : "";
  const base =
    "absolute top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors backdrop-blur-sm md:hidden";

  return (
    <>
      <button
        onClick={onPrev}
        aria-label="Previous slide"
        className={cn(base, prevPos)}
      >
        <ChevronLeft className={cn("h-6 w-6", iconFlip)} />
      </button>
      <button
        onClick={onNext}
        aria-label="Next slide"
        className={cn(base, nextPos)}
      >
        <ChevronRight className={cn("h-6 w-6", iconFlip)} />
      </button>
    </>
  );
}

/* ─── Main Hero Component ───────────────────────────────────────── */

export function Hero() {
  const { t, locale } = useI18n();
  const isRtl = locale === "ar";
  const shouldReduceMotion = useReducedMotion();

  const slides: HeroSlide[] = [
    {
      id: "ai-learning",
      heroImage: SLIDE_1_IMAGE.src,
      heroImageAlt: SLIDE_1_IMAGE.alt,
      accentColor: SLIDE_1_IMAGE.accentColor,
      glowColor: SLIDE_1_IMAGE.glowColor,
      badge: t("hero", "badge"),
      headline: t("hero", "headline"),
      subheadline: t("hero", "subheadline"),
      features: [
        t("hero", "feature1"),
        t("hero", "feature2"),
        t("hero", "feature3"),
      ],
      cta: {
        label: t("hero", "cta"),
        href: "/get-started",
        event: "hero-slide1",
      },
      ctaSecondary: {
        label: t("hero", "ctaSecondary"),
        href: "/demo",
        event: "hero-slide1-demo",
      },
      visualPosition: "background",
    },
    {
      id: "how-it-works",
      heroImage: SLIDE_2_IMAGE.src,
      heroImageAlt: SLIDE_2_IMAGE.alt,
      accentColor: SLIDE_2_IMAGE.accentColor,
      glowColor: SLIDE_2_IMAGE.glowColor,
      badge: t("hero", "slide2Badge"),
      headline: t("hero", "slide2Headline"),
      subheadline: t("hero", "slide2Subheadline"),
      features: [
        t("hero", "slide2Feature1"),
        t("hero", "slide2Feature2"),
        t("hero", "slide2Feature3"),
      ],
      cta: {
        label: t("hero", "slide2Cta"),
        href: "#how-it-works",
        event: "hero-slide2-how",
      },
      ctaSecondary: {
        label: t("hero", "slide2CtaSecondary"),
        href: "#product-walkthrough",
        event: "hero-slide2-walkthrough",
      },
      visualPosition: "background",
    },
    {
      id: "brain-clone",
      heroImage: "",
      heroImageAlt: "",
      accentColor: "#7C3AED",
      glowColor: "#C4B5FD",
      badge: t("hero", "slide3Badge"),
      headline: t("hero", "slide3Headline"),
      subheadline: t("hero", "slide3Subheadline"),
      cta: {
        label: t("hero", "slide3Cta"),
        href: "/get-started",
        event: "hero-slide3",
      },
      ctaSecondary: {
        label: t("hero", "slide3CtaSecondary"),
        href: "/demo",
        event: "hero-slide3-demo",
      },
      visual: <BrainCloneMockup />,
      visualPosition: "right",
    },
    {
      id: "tablet-learning",
      heroImage: SLIDE_3_IMAGE.src,
      heroImageAlt: SLIDE_3_IMAGE.alt,
      accentColor: SLIDE_3_IMAGE.accentColor,
      glowColor: SLIDE_3_IMAGE.glowColor,
      badge: t("hero", "slide6Badge"),
      headline: t("hero", "slide6Headline"),
      subheadline: t("hero", "slide6Subheadline"),
      features: [
        t("hero", "slide6Feature1"),
        t("hero", "slide6Feature2"),
        t("hero", "slide6Feature3"),
      ],
      cta: {
        label: t("hero", "slide6Cta"),
        href: "/get-started",
        event: "hero-slide6",
      },
      ctaSecondary: {
        label: t("hero", "slide6CtaSecondary"),
        href: "/demo",
        event: "hero-slide6-demo",
      },
      visualPosition: "background",
    },
    {
      id: "ai-tutors",
      heroImage: "",
      heroImageAlt: "",
      accentColor: "#14B8C8",
      glowColor: "#67E8F9",
      badge: t("hero", "slide4Badge"),
      headline: t("hero", "slide4Headline"),
      subheadline: t("hero", "slide4Subheadline"),
      cta: {
        label: t("hero", "slide4Cta"),
        href: "/tutors",
        event: "hero-slide4-tutors",
      },
      ctaSecondary: {
        label: t("hero", "slide4CtaSecondary"),
        href: "/demo",
        event: "hero-slide4-demo",
      },
      visual: <TutorsMockup />,
      visualPosition: "right",
    },
    {
      id: "family-learning",
      heroImage: SLIDE_4_IMAGE.src,
      heroImageAlt: SLIDE_4_IMAGE.alt,
      accentColor: SLIDE_4_IMAGE.accentColor,
      glowColor: SLIDE_4_IMAGE.glowColor,
      badge: t("hero", "slide7Badge"),
      headline: t("hero", "slide7Headline"),
      subheadline: t("hero", "slide7Subheadline"),
      features: [
        t("hero", "slide7Feature1"),
        t("hero", "slide7Feature2"),
        t("hero", "slide7Feature3"),
      ],
      cta: {
        label: t("hero", "slide7Cta"),
        href: "/get-started",
        event: "hero-slide7",
      },
      ctaSecondary: {
        label: t("hero", "slide7CtaSecondary"),
        href: "/pricing",
        event: "hero-slide7-pricing",
      },
      visualPosition: "background",
    },
    {
      id: "mobile-learning",
      heroImage: SLIDE_5_IMAGE.src,
      heroImageAlt: SLIDE_5_IMAGE.alt,
      accentColor: SLIDE_5_IMAGE.accentColor,
      glowColor: SLIDE_5_IMAGE.glowColor,
      badge: t("hero", "slide8Badge"),
      headline: t("hero", "slide8Headline"),
      subheadline: t("hero", "slide8Subheadline"),
      features: [
        t("hero", "slide8Feature1"),
        t("hero", "slide8Feature2"),
        t("hero", "slide8Feature3"),
      ],
      cta: {
        label: t("hero", "slide8Cta"),
        href: "/get-started",
        event: "hero-slide8",
      },
      ctaSecondary: {
        label: t("hero", "slide8CtaSecondary"),
        href: "/demo",
        event: "hero-slide8-demo",
      },
      visualPosition: "background",
    },
    {
      id: "parent-teacher",
      heroImage: SLIDE_6_IMAGE.src,
      heroImageAlt: SLIDE_6_IMAGE.alt,
      accentColor: SLIDE_6_IMAGE.accentColor,
      glowColor: SLIDE_6_IMAGE.glowColor,
      badge: t("hero", "slide9Badge"),
      headline: t("hero", "slide9Headline"),
      subheadline: t("hero", "slide9Subheadline"),
      features: [
        t("hero", "slide9Feature1"),
        t("hero", "slide9Feature2"),
        t("hero", "slide9Feature3"),
      ],
      cta: {
        label: t("hero", "slide9Cta"),
        href: "/get-started",
        event: "hero-slide9",
      },
      ctaSecondary: {
        label: t("hero", "slide9CtaSecondary"),
        href: "/demo",
        event: "hero-slide9-demo",
      },
      visualPosition: "background",
    },
    {
      id: "dashboard",
      heroImage: "",
      heroImageAlt: "",
      accentColor: "#1A1A2E",
      glowColor: "#7C3AED",
      badge: t("hero", "slide5Badge"),
      headline: t("hero", "slide5Headline"),
      subheadline: t("hero", "slide5Subheadline"),
      cta: {
        label: t("hero", "slide5Cta"),
        href: "/get-started",
        event: "hero-slide5-dashboard",
      },
      ctaSecondary: {
        label: t("hero", "slide5CtaSecondary"),
        href: "/case-studies",
        event: "hero-slide5-cases",
      },
      visual: <DashboardMockup />,
      visualPosition: "right",
    },
  ];

  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const slide = slides[current];
  const prevSlide = slides[wrap(current - 1)];
  const nextSlide = slides[wrap(current + 1)];
  const hasMockup = slide.visualPosition === "right" && !!slide.visual;

  const navigate = useCallback((direction: 1 | -1) => {
    setCurrent((prev) => wrap(prev + direction));
  }, []);

  const goTo = useCallback((index: number) => {
    setCurrent(index);
  }, []);

  /* Autoplay with pause-on-hover/focus */
  useEffect(() => {
    if (isPaused || shouldReduceMotion) return;
    intervalRef.current = setInterval(() => navigate(1), AUTOPLAY_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, shouldReduceMotion, navigate, current]);

  /* Keyboard navigation */
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") navigate(isRtl ? 1 : -1);
      if (e.key === "ArrowRight") navigate(isRtl ? -1 : 1);
    }
    globalThis.addEventListener("keydown", handler);
    return () => globalThis.removeEventListener("keydown", handler);
  }, [navigate, isRtl]);

  /* Compute stagger delays for CTAs (after optional features) */
  const featureCount = slide.features?.length ?? 0;
  const ctaPrimaryDelay =
    featureCount > 0 ? 0.24 + featureCount * 0.06 + 0.08 : 0.28;
  const ctaSecondaryDelay = ctaPrimaryDelay + 0.06;

  const mockupGlowAnim = shouldReduceMotion
    ? {}
    : { opacity: [0.15, 0.3, 0.15], scale: [0.95, 1.08, 0.95] };

  return (
    <section
      className="relative h-[90vh] min-h-150 overflow-hidden bg-aivo-navy-900"
      aria-roledescription="carousel"
      aria-label="Hero slideshow"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <HeroBackdrop
        slide={slide}
        isFirstSlide={current === 0}
        isRtl={isRtl}
        reducedMotion={shouldReduceMotion}
      />

      {/* ── Content ── */}
      <div className="relative z-10 flex items-center h-full">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={cn(
              "flex items-center gap-4 lg:gap-6",
              isRtl && "flex-row-reverse",
            )}
          >
            {/* Left flanking preview (desktop only) */}
            <AnimatePresence mode="popLayout">
              <FlankingPreview
                key={`left-${prevSlide.id}`}
                slide={prevSlide}
                side="left"
                onClick={() => navigate(-1)}
              />
            </AnimatePresence>

            {/* Main content area */}
            <div className="flex-1 min-w-0" aria-label={slide.headline}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.id}
                  variants={wrapperVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className={cn(
                    hasMockup &&
                      "flex flex-col lg:flex-row items-center gap-10 lg:gap-16",
                  )}
                >
                  <SlideText
                    slide={slide}
                    isRtl={isRtl}
                    hasMockup={hasMockup}
                    ctaPrimaryDelay={ctaPrimaryDelay}
                    ctaSecondaryDelay={ctaSecondaryDelay}
                  />

                  {/* Visual column (mockup slides 3-5) */}
                  {hasMockup && (
                    <motion.div
                      className="flex-1 w-full max-w-xl hidden md:block relative"
                      initial={{ opacity: 0, x: 60, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{
                        duration: 0.7,
                        delay: 0.2,
                        ease: "easeOut",
                      }}
                    >
                      <motion.div
                        aria-hidden="true"
                        className="absolute inset-0 -z-10 rounded-full blur-3xl"
                        style={{ backgroundColor: slide.glowColor }}
                        animate={mockupGlowAnim}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      {slide.visual}
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>

              <DotIndicators
                slides={slides}
                current={current}
                isRtl={isRtl}
                onGoTo={goTo}
              />
            </div>

            {/* Right flanking preview (desktop only) */}
            <AnimatePresence mode="popLayout">
              <FlankingPreview
                key={`right-${nextSlide.id}`}
                slide={nextSlide}
                side="right"
                onClick={() => navigate(1)}
              />
            </AnimatePresence>
          </div>
        </div>
      </div>

      <MobileArrows
        isRtl={isRtl}
        onPrev={() => navigate(-1)}
        onNext={() => navigate(1)}
      />

      {/* ── Progress Bar ── */}
      <div className="absolute bottom-0 left-0 right-0 h-1 z-20 bg-white/10">
        <div
          key={`progress-${current}`}
          aria-hidden="true"
          className="h-full origin-left"
          style={{
            backgroundColor: slide.accentColor,
            animation: `heroProgress ${AUTOPLAY_MS}ms linear forwards`,
            animationPlayState:
              isPaused || shouldReduceMotion ? "paused" : "running",
          }}
        />
      </div>

      <style>{`@keyframes heroProgress{from{transform:scaleX(0)}to{transform:scaleX(1)}}`}</style>
    </section>
  );
}

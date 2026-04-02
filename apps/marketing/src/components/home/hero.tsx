"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { events } from "@/lib/analytics";
import { useI18n } from "@/providers/i18n-provider";
import { DashboardMockup } from "./dashboard-mockup";
import { BrainCloneMockup } from "./brain-clone-mockup";
import { TutorsMockup } from "./tutors-mockup";

interface Slide {
  image: string;
  headline: string;
  subheadline: string;
  cta: { label: string; href: string; event: string };
  ctaSecondary?: { label: string; href: string; event: string };
  /** Optional component rendered beside the text (split layout) */
  visual?: ReactNode;
}

const AUTOPLAY_MS = 6000;

const fallbackGradients = [
  "linear-gradient(135deg, #7c3aed 0%, #5b21b6 40%, #0d95a8 80%, #14b8c8 100%)",
  "linear-gradient(135deg, #0d95a8 0%, #14b8c8 40%, #5b21b6 80%, #7c3aed 100%)",
  "linear-gradient(135deg, #7c3aed 0%, #1a1a2e 40%, #14b8c8 80%, #5b21b6 100%)",
  "linear-gradient(135deg, #1a1a2e 0%, #7c3aed 40%, #0d95a8 80%, #14b8c8 100%)",
  "linear-gradient(135deg, #1a1a2e 0%, #2d1b69 30%, #1a1a2e 70%, #0d3d47 100%)",
];

export function Hero() {
  const { t, locale } = useI18n();
  const isRtl = locale === "ar";

  const slides: Slide[] = [
    {
      image: "/hero/slide-1.png",
      headline: t("hero", "headline"),
      subheadline: t("hero", "subheadline"),
      cta: { label: t("hero", "cta"), href: "/get-started", event: "hero-slide1" },
      ctaSecondary: {
        label: t("hero", "ctaSecondary"),
        href: "/demo",
        event: "hero-slide1-demo",
      },
    },
    {
      image: "/hero/slide-2.png",
      headline: t("hero", "slide2Headline"),
      subheadline: t("hero", "slide2Subheadline"),
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
    },
    {
      image: "",
      headline: t("hero", "slide3Headline"),
      subheadline: t("hero", "slide3Subheadline"),
      cta: { label: t("hero", "slide3Cta"), href: "/get-started", event: "hero-slide3" },
      ctaSecondary: {
        label: t("hero", "slide3CtaSecondary"),
        href: "/demo",
        event: "hero-slide3-demo",
      },
      visual: <BrainCloneMockup />,
    },
    {
      image: "",
      headline: t("hero", "slide4Headline"),
      subheadline: t("hero", "slide4Subheadline"),
      cta: { label: t("hero", "slide4Cta"), href: "/tutors", event: "hero-slide4-tutors" },
      ctaSecondary: {
        label: t("hero", "slide4CtaSecondary"),
        href: "/demo",
        event: "hero-slide4-demo",
      },
      visual: <TutorsMockup />,
    },
    {
      image: "",
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
    },
  ];

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > current ? 1 : -1);
      setCurrent(index);
    },
    [current],
  );

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  // Autoplay
  useEffect(() => {
    const timer = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];
  const hasSplitLayout = !!slide.visual;

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <section className="relative h-[90vh] min-h-[600px] overflow-hidden bg-aivo-navy-900">
      {/* Background slides */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={current}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0"
        >
          {/* Fallback gradient (behind the photo) */}
          <div
            className="absolute inset-0"
            style={{ background: fallbackGradients[current % fallbackGradients.length] }}
          />
          {/* Photo background (on top of the gradient, shifted right) */}
          {slide.image && (
            <div
              className="absolute inset-0 bg-no-repeat"
              style={{ backgroundImage: `url(${slide.image})`, backgroundSize: '70%', backgroundPosition: '85% center' }}
            />
          )}
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/30" />
        </motion.div>
      </AnimatePresence>

      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={cn(
                hasSplitLayout
                  ? "flex flex-col lg:flex-row items-center gap-10 lg:gap-16"
                  : "text-center",
              )}
            >
              {/* Text column */}
              <div
                className={cn(
                  hasSplitLayout
                    ? "flex-1 text-center lg:text-start"
                    : "max-w-5xl mx-auto",
                )}
              >
                <h1
                  className={cn(
                    "text-4xl sm:text-5xl font-extrabold text-white leading-tight",
                    !hasSplitLayout && "lg:text-6xl",
                  )}
                >
                  {slide.headline}
                </h1>

                <p
                  className={cn(
                    "mt-6 text-lg sm:text-xl text-white/90",
                    hasSplitLayout ? "max-w-lg" : "max-w-3xl mx-auto",
                  )}
                >
                  {slide.subheadline}
                </p>

                <div
                  className={cn(
                    "mt-10 flex flex-col sm:flex-row items-center gap-4",
                    hasSplitLayout
                      ? "justify-center lg:justify-start"
                      : "justify-center",
                    isRtl && "flex-row-reverse",
                  )}
                >
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
                  {slide.ctaSecondary && (
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
                  )}
                </div>
              </div>

              {/* Visual column (slide 5 dashboard) */}
              {hasSplitLayout && (
                <motion.div
                  className="flex-1 w-full max-w-xl hidden md:block"
                  initial={{ opacity: 0, x: 60, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                >
                  {slide.visual}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation dots */}
          <div
            className={cn(
              "flex items-center gap-3 mt-12",
              hasSplitLayout
                ? "justify-center lg:justify-start"
                : "justify-center",
              isRtl && "flex-row-reverse",
            )}
          >
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={cn(
                  "h-2.5 rounded-full transition-all duration-300",
                  i === current
                    ? "w-8 bg-white"
                    : "w-2.5 bg-white/40 hover:bg-white/60",
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={() =>
          goTo((current - 1 + slides.length) % slides.length)
        }
        aria-label="Previous slide"
        className={cn(
          "absolute top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors backdrop-blur-sm",
          isRtl ? "right-4" : "left-4",
        )}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={isRtl ? "rtl-flip" : undefined}
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button
        onClick={() => goTo((current + 1) % slides.length)}
        aria-label="Next slide"
        className={cn(
          "absolute top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors backdrop-blur-sm",
          isRtl ? "left-4" : "right-4",
        )}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={isRtl ? "rtl-flip" : undefined}
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </section>
  );
}

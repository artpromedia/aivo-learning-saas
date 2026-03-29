"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { events } from "@/lib/analytics";

interface Slide {
  image: string;
  headline: string;
  subheadline: string;
  cta: { label: string; href: string; event: string };
  ctaSecondary?: { label: string; href: string; event: string };
}

const slides: Slide[] = [
  {
    image: "/hero/slide-1.jpg",
    headline: "AI-Powered Learning That Adapts to Every Student",
    subheadline:
      "No Learner Left Behind. Personalized education powered by Brain Clone AI technology that creates a unique learning profile for every student.",
    cta: { label: "Get Started Free", href: "/get-started", event: "hero" },
    ctaSecondary: {
      label: "Request a Demo",
      href: "/demo",
      event: "hero-demo",
    },
  },
  {
    image: "/hero/slide-2.jpg",
    headline: "Personalized Paths for Every Learner",
    subheadline:
      "Our AI adapts in real time, identifying strengths and gaps to create a custom curriculum that keeps students engaged and on track.",
    cta: {
      label: "See How It Works",
      href: "#how-it-works",
      event: "hero-how",
    },
  },
  {
    image: "/hero/slide-3.jpg",
    headline: "Trusted by Educators Worldwide",
    subheadline:
      "Teachers and districts across the country rely on AIVO to close learning gaps, boost engagement, and deliver measurable outcomes.",
    cta: {
      label: "Explore Features",
      href: "#features",
      event: "hero-features",
    },
    ctaSecondary: {
      label: "View Case Studies",
      href: "/case-studies",
      event: "hero-cases",
    },
  },
];

const AUTOPLAY_MS = 6000;

export function Hero() {
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
          {/* Placeholder gradient — replace with <Image> when photos are ready */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${slide.image})`,
            }}
          />
          {/* Fallback gradient (shows while image loads or if missing) */}
          <div
            className="absolute inset-0"
            style={{
              background:
                current === 0
                  ? "linear-gradient(135deg, #7c3aed 0%, #5b21b6 40%, #0d95a8 80%, #14b8c8 100%)"
                  : current === 1
                    ? "linear-gradient(135deg, #0d95a8 0%, #14b8c8 40%, #5b21b6 80%, #7c3aed 100%)"
                    : "linear-gradient(135deg, #5b21b6 0%, #7c3aed 40%, #14b8c8 80%, #0d95a8 100%)",
            }}
          />
          {/* Dark overlay for text readability */}
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
                {slide.headline}
              </h1>

              <p className="mt-6 text-lg sm:text-xl text-white/90 max-w-3xl mx-auto">
                {slide.subheadline}
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
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
            </motion.div>
          </AnimatePresence>

          {/* Navigation dots */}
          <div className="mt-12 flex items-center justify-center gap-3">
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
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors backdrop-blur-sm"
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
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button
        onClick={() => goTo((current + 1) % slides.length)}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors backdrop-blur-sm"
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
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </section>
  );
}

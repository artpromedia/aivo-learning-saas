"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { events } from "@/lib/analytics";
import { HeroBackground } from "./hero-background";

const slides = [
  {
    headline: "AI That Learns How Your Child Learns",
    subheadline:
      "Aivo creates a unique Brain Clone™ for every student — adapting lessons, pace, and style in real-time. Used by 500+ schools.",
  },
  {
    headline: "5 Expert AI Tutors, One Personalized Journey",
    subheadline:
      "From Newton for STEM to Shakespeare for Language Arts — every student gets specialized guidance tailored to their learning style.",
  },
  {
    headline: "Real-Time Insights for Parents & Teachers",
    subheadline:
      "Track progress, celebrate wins, and intervene early with dashboards that make data actionable. IEP integration included.",
  },
] as const;

const AUTOPLAY_MS = 6000;

export function Hero() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [isPaused, next]);

  const handleWatchClick = useCallback(() => {
    const el = document.getElementById("product-walkthrough");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const slide = slides[current];

  return (
    <section
      className="relative min-h-[90vh] flex items-center overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <HeroBackground />

      <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
                {slide.headline}
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-white/85 leading-relaxed max-w-2xl mx-auto">
                {slide.subheadline}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Slide indicators */}
          <div className="flex justify-center gap-2.5 mt-8" data-testid="hero-slide-dots">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  i === current
                    ? "w-8 bg-white"
                    : "w-2 bg-white/40 hover:bg-white/60",
                )}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          {/* CTAs */}
          <motion.div
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link
              href="/get-started"
              data-testid="hero-cta-primary"
              onClick={() => events.signupClick("hero-primary")}
              className={cn(
                "inline-flex items-center justify-center rounded-lg px-8 py-4",
                "bg-white text-aivo-purple-700 font-semibold text-lg",
                "hover:bg-white/90 transition-all duration-200",
                "shadow-lg hover:shadow-xl hover:-translate-y-0.5",
              )}
            >
              Start Free Trial
            </Link>
            <button
              data-testid="hero-cta-secondary"
              onClick={handleWatchClick}
              className={cn(
                "inline-flex items-center justify-center rounded-lg px-8 py-4",
                "border-2 border-white text-white font-semibold text-lg",
                "hover:bg-white/10 transition-all duration-200",
              )}
            >
              Watch How It Works
            </button>
          </motion.div>

          {/* Tertiary link */}
          <motion.div
            className="mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <Link
              href="/demo"
              data-testid="hero-cta-demo"
              onClick={() => events.signupClick("hero-demo")}
              className="text-white/80 hover:text-white text-sm font-medium transition-colors inline-flex items-center gap-1"
            >
              Book a Live Demo →
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.p
            className="mt-8 text-sm text-white/70 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            data-testid="hero-social-proof"
          >
            Trusted by 500+ schools · 50,000+ students · 4.9★ rating
          </motion.p>
        </div>
      </div>
    </section>
  );
}

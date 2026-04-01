"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { events } from "@/lib/analytics";
import { HeroBackground } from "./hero-background";
import { AivoWalkthroughPlayer } from "@/components/walkthrough/aivo-walkthrough-player";

export function Hero() {
  const handleWatchClick = useCallback(() => {
    const el = document.getElementById("product-walkthrough");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <HeroBackground />

      <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-5 gap-10 lg:gap-16 items-center">
          {/* Left column — 60% */}
          <div className="lg:col-span-3">
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              AI That Learns How Your Child Learns
            </motion.h1>

            <motion.p
              className="mt-6 text-lg sm:text-xl text-white/85 leading-relaxed max-w-xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              Aivo creates a unique Brain Clone™ for every student — adapting
              lessons, pace, and style in real-time. Used by 500+ schools.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="mt-8 flex flex-col sm:flex-row items-start gap-4"
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

          {/* Right column — 40% */}
          <motion.div
            className="lg:col-span-2 hidden md:block"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <AivoWalkthroughPlayer autoplay source="hero" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

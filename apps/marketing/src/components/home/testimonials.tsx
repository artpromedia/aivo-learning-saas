"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestimonialData {
  name: string;
  title: string;
  organization: string;
  quote: string;
  initials: string;
  color: string;
  rating: number;
}

const testimonialData: TestimonialData[] = [
  {
    name: "Sarah Chen",
    title: "5th Grade Teacher",
    organization: "Springfield USD",
    quote:
      "Aivo completely changed how I differentiate instruction. Each student gets exactly what they need, and I finally have time to focus on the kids who need me most. The AI tutors handle the rest beautifully.",
    initials: "SC",
    color: "bg-purple-100 text-purple-600",
    rating: 5,
  },
  {
    name: "Dr. James Rodriguez",
    title: "Principal",
    organization: "Lincoln Academy",
    quote:
      "The data insights from Aivo gave our leadership team visibility we never had before. We can track learning velocity across every classroom and make evidence-based decisions in real-time.",
    initials: "JR",
    color: "bg-teal-100 text-teal-600",
    rating: 5,
  },
  {
    name: "Michelle Park",
    title: "Parent",
    organization: "",
    quote:
      "My daughter went from struggling with math to actually enjoying it. Her confidence has skyrocketed, and her report card proves it — two grade levels up in just one semester with Aivo.",
    initials: "MP",
    color: "bg-amber-100 text-amber-600",
    rating: 5,
  },
  {
    name: "David Thompson",
    title: "IT Director",
    organization: "Maple Grove ISD",
    quote:
      "Deploying Aivo across our district was surprisingly smooth. SSO integration took 20 minutes, and their team handled the rest. Zero downtime, zero complaints from teachers.",
    initials: "DT",
    color: "bg-rose-100 text-rose-600",
    rating: 5,
  },
  {
    name: "Lisa Wang",
    title: "Special Ed Coordinator",
    organization: "Summit Charter",
    quote:
      "The IEP integration is a game-changer. Aivo automatically aligns content to each student's goals, and the progress tracking saves me hours of documentation every single week.",
    initials: "LW",
    color: "bg-indigo-100 text-indigo-600",
    rating: 5,
  },
  {
    name: "Robert Kim",
    title: "Superintendent",
    organization: "Riverside Unified",
    quote:
      "We piloted Aivo in 8 schools and saw a 31% improvement in reading scores for struggling students. The ROI was clear within the first semester. Now it's district-wide.",
    initials: "RK",
    color: "bg-emerald-100 text-emerald-600",
    rating: 5,
  },
];

const VISIBLE_CARDS = 3;
const AUTOPLAY_MS = 8000;

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg
          key={i}
          className="w-4 h-4 text-amber-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStart = useRef<number | null>(null);

  const totalPages = Math.ceil(testimonialData.length / VISIBLE_CARDS);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % totalPages);
  }, [totalPages]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + totalPages) % totalPages);
  }, [totalPages]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [isPaused, next]);

  const visibleTestimonials = testimonialData.slice(
    current * VISIBLE_CARDS,
    current * VISIBLE_CARDS + VISIBLE_CARDS
  );

  function handleTouchStart(e: React.TouchEvent) {
    touchStart.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStart.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(delta) > 50) {
      if (delta < 0) next();
      else prev();
    }
    touchStart.current = null;
  }

  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-aivo-navy-800 sm:text-4xl">
            What People Are Saying
          </h2>
        </div>

        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid gap-6 md:grid-cols-3"
            >
              {visibleTestimonials.map((t) => (
                <motion.div
                  key={t.name}
                  className="rounded-xl border border-aivo-navy-100 bg-white p-6 shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  {/* Quote mark */}
                  <svg
                    className="w-8 h-8 text-aivo-purple-200 mb-4"
                    fill="currentColor"
                    viewBox="0 0 32 32"
                  >
                    <path d="M10 8c-4.42 0-8 3.58-8 8s3.58 8 8 8c1.09 0 2.13-.22 3.07-.62C11.78 25.92 8.79 28 6 28H4v4h2c5.52 0 12-4.48 12-12v-4c0-4.42-3.58-8-8-8zm18 0c-4.42 0-8 3.58-8 8s3.58 8 8 8c1.09 0 2.13-.22 3.07-.62C29.78 25.92 26.79 28 24 28h-2v4h2c5.52 0 12-4.48 12-12v-4c0-4.42-3.58-8-8-8z" />
                  </svg>

                  <blockquote className="text-sm text-aivo-navy-700 leading-relaxed mb-4">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>

                  <StarRating count={t.rating} />

                  <div className="mt-4 flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                        t.color
                      )}
                    >
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-aivo-navy-800">
                        {t.name}
                      </p>
                      <p className="text-xs text-aivo-navy-400">
                        {t.title}
                        {t.organization && `, ${t.organization}`}
                      </p>
                    </div>
                    <span className="ml-auto text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      Verified ✓
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Navigation arrows */}
          <button
            onClick={prev}
            className="absolute -left-4 top-1/2 -translate-y-1/2 sm:-left-12 p-2 rounded-full bg-white border border-aivo-navy-100 text-aivo-navy-400 hover:text-aivo-navy-800 hover:border-aivo-navy-300 transition-colors shadow-sm"
            aria-label="Previous testimonials"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute -right-4 top-1/2 -translate-y-1/2 sm:-right-12 p-2 rounded-full bg-white border border-aivo-navy-100 text-aivo-navy-400 hover:text-aivo-navy-800 hover:border-aivo-navy-300 transition-colors shadow-sm"
            aria-label="Next testimonials"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all duration-300",
                current === i
                  ? "bg-aivo-purple-600 w-8"
                  : "bg-aivo-navy-200 hover:bg-aivo-navy-300"
              )}
              aria-label={`Go to testimonial page ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

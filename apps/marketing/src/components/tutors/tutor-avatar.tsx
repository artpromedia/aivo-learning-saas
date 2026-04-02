"use client";

import React, { useMemo, useRef } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface TutorAvatarProps {
  persona: "nova" | "sage" | "spark" | "chrono" | "pixel" | "harmony" | "echo";
  size: "sm" | "md" | "lg" | "xl" | "hero";
  className?: string;
  priority?: boolean;
  enableEffects?: boolean;
  enableParallax?: boolean;
}

const TUTOR_META = {
  nova: { name: "Nova", subject: "Mathematics", color: "#7C3AED" },
  sage: { name: "Sage", subject: "English Language Arts", color: "#0D9488" },
  spark: { name: "Spark", subject: "Science", color: "#F59E0B" },
  chrono: { name: "Chrono", subject: "History", color: "#E11D48" },
  pixel: { name: "Pixel", subject: "Coding", color: "#10B981" },
  harmony: { name: "Harmony", subject: "Social-Emotional Learning", color: "#8B5CF6" },
  echo: { name: "Echo", subject: "Speech & Language", color: "#F472B6" },
} as const;

const SIZE_MAP = {
  sm: 64,
  md: 128,
  lg: 256,
  xl: 384,
  hero: 512,
};

/**
 * Generates a tiny SVG data URL colored to the tutor's brand
 * used as a low-fidelity placeholder during image lazy loading.
 */
const getShimmerPlaceholder = (color: string) => {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const svg = `
    <svg width="20" height="20" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <rect width="20" height="20" fill="rgba(${r},${g},${b},0.2)" />
      <rect id="r" width="20" height="20" fill="rgba(${r},${g},${b},0.4)" x="-20" />
      <animate xlink:href="#r" attributeName="x" from="-20" to="20" dur="1.5s" repeatCount="indefinite" />
    </svg>`;
  return `data:image/svg+xml;base64,${typeof window === "undefined" ? Buffer.from(svg).toString("base64") : btoa(svg)}`;
};

export const TutorAvatar = ({
  persona,
  size,
  className,
  priority = false,
  enableEffects = true,
  enableParallax = false,
}: TutorAvatarProps) => {
  const meta = TUTOR_META[persona];
  const pixelSize = SIZE_MAP[size];
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax Logic
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const springConfig = { stiffness: 150, damping: 15 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const rotateY = useTransform(xSpring, [0, 1], [-5, 5]);
  const rotateX = useTransform(ySpring, [0, 1], [3, -3]);

  const blurDataURL = useMemo(
    () => getShimmerPlaceholder(meta.color),
    [meta.color],
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableParallax || shouldReduceMotion) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      x.set((e.clientX - rect.left) / rect.width);
      y.set((e.clientY - rect.top) / rect.height);
    }
  };

  const handleMouseLeave = () => {
    x.set(0.5);
    y.set(0.5);
  };

  // Visual variants based on size
  const isLarge = ["lg", "xl", "hero"].includes(size);
  const isHero = ["xl", "hero"].includes(size);
  const imagePath = `/assets/tutors/${persona}-avatar${isHero ? "-hero" : ""}.webp`;

  return (
    <div
      ref={containerRef}
      className={cn("relative group select-none", className)}
      style={{ width: pixelSize, height: pixelSize, perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Ambient glow */}
      {enableEffects && (
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 rounded-full opacity-30 blur-3xl"
          style={{
            backgroundColor: meta.color,
            filter: `blur(${size === "sm" || size === "md" ? "40px" : isHero ? "80px" : "60px"})`,
          }}
          animate={
            !shouldReduceMotion
              ? {
                  opacity: [0.3, 0.5, 0.3],
                  scale: [1, 1.1, 1],
                }
              : {}
          }
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Main image container */}
      <motion.div
        className={cn(
          "relative w-full h-full overflow-hidden border-2 border-white/10 transition-colors duration-500",
          !isLarge ? "rounded-full" : "rounded-2xl",
        )}
        style={{
          rotateX: enableParallax ? rotateX : 0,
          rotateY: enableParallax ? rotateY : 0,
          borderColor: `${meta.color}4D`,
          boxShadow: "inset 0 0 20px rgba(0,0,0,0.2)",
          willChange: "transform",
        }}
        animate={
          !shouldReduceMotion && enableEffects ? { y: [0, -6, 0] } : {}
        }
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{
          scale: 1.03,
          filter: "brightness(1.05)",
        }}
      >
        <Image
          src={imagePath}
          alt={`${meta.name} — AIVO's ${meta.subject} Tutor`}
          fill
          priority={priority}
          sizes={`${pixelSize}px`}
          className="object-cover"
          placeholder="blur"
          blurDataURL={blurDataURL}
        />

        {/* Subtle overlay to enhance depth */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10 pointer-events-none" />
      </motion.div>

      {/* Hover glow intensifier */}
      {enableEffects && (
        <motion.div
          className="absolute inset-0 -z-10 rounded-full opacity-0 group-hover:opacity-60 blur-2xl transition-opacity duration-300"
          style={{ backgroundColor: meta.color }}
        />
      )}
    </div>
  );
};

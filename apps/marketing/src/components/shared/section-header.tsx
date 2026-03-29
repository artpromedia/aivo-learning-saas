"use client";

import { motion } from "framer-motion";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  align?: "left" | "center";
}

export function SectionHeader({
  title,
  subtitle,
  className = "",
  align = "center",
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      className={`mb-12 ${align === "center" ? "text-center" : "text-left"} ${className}`}
    >
      <h2 className="text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-xl text-aivo-navy-400 max-w-3xl mx-auto leading-relaxed">{subtitle}</p>
      )}
    </motion.div>
  );
}

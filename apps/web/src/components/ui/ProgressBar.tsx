"use client";

import React, { useEffect, useState } from "react";

export interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  animated?: boolean;
  color?: "purple" | "teal" | "coral" | "sunny" | "rainbow";
}

const sizeClasses: Record<NonNullable<ProgressBarProps["size"]>, string> = {
  sm: "h-2",
  md: "h-3.5",
  lg: "h-5",
};

const colorGradients: Record<NonNullable<ProgressBarProps["color"]>, string> = {
  purple: "bg-gradient-to-r from-[#7C3AED] to-[#A855F7]",
  teal: "bg-gradient-to-r from-[#2DD4BF] to-[#38BDF8]",
  coral: "bg-gradient-to-r from-[#FF6B6B] to-[#FB923C]",
  sunny: "bg-gradient-to-r from-[#FBBF24] to-[#FB923C]",
  rainbow: "bg-gradient-to-r from-[#7C3AED] via-[#F472B6] to-[#FB923C]",
};

function ProgressBar({
  value,
  max = 100,
  showLabel = true,
  size = "md",
  className = "",
  animated = true,
  color = "purple",
}: ProgressBarProps) {
  const [displayWidth, setDisplayWidth] = useState(animated ? 0 : (value / max) * 100);
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  useEffect(() => {
    if (animated) {
      const timer = requestAnimationFrame(() => setDisplayWidth(percentage));
      return () => cancelAnimationFrame(timer);
    }
    setDisplayWidth(percentage);
  }, [percentage, animated]);

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-sm font-semibold text-[#6B5B7B] dark:text-[#B8A5D0]">
            Progress
          </span>
          <span className="text-sm font-bold text-[#7C3AED] dark:text-[#A855F7]">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div
        className={`w-full rounded-full bg-[#F0E6FF] dark:bg-[#3D2D5C] overflow-hidden ${sizeClasses[size]}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={`${sizeClasses[size]} rounded-full ${colorGradients[color]} transition-all duration-700 ease-out`}
          style={{ width: `${displayWidth}%` }}
        />
      </div>
    </div>
  );
}

export { ProgressBar };

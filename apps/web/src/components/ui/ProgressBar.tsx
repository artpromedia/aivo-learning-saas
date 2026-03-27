"use client";

import React, { useEffect, useState } from "react";

export interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  animated?: boolean;
}

const sizeClasses: Record<NonNullable<ProgressBarProps["size"]>, string> = {
  sm: "h-1.5",
  md: "h-3",
  lg: "h-5",
};

function ProgressBar({
  value,
  max = 100,
  showLabel = true,
  size = "md",
  className = "",
  animated = true,
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
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progress
          </span>
          <span className="text-sm font-semibold text-[#7C3AED] dark:text-[#7C4DFF]">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div
        className={`w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden ${sizeClasses[size]}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-[#7C3AED] to-[#7C4DFF] transition-all duration-700 ease-out`}
          style={{ width: `${displayWidth}%` }}
        />
      </div>
    </div>
  );
}

export { ProgressBar };

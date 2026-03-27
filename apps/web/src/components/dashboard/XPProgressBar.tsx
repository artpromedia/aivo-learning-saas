"use client";

import React from "react";
import { Star } from "lucide-react";

export interface XPProgressBarProps {
  currentXP: number;
  xpForNextLevel: number;
  level: number;
  className?: string;
}

function XPProgressBar({
  currentXP,
  xpForNextLevel,
  level,
  className = "",
}: XPProgressBarProps) {
  const percentage = Math.min((currentXP / xpForNextLevel) * 100, 100);
  const remaining = Math.max(xpForNextLevel - currentXP, 0);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#7C3AED] text-white">
            <Star size={14} fill="currentColor" />
          </div>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            Level {level}
          </span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {currentXP.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
        </span>
      </div>
      <div className="w-full h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#7C4DFF] transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
        {remaining.toLocaleString()} XP to Level {level + 1}
      </p>
    </div>
  );
}

export { XPProgressBar };

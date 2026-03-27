"use client";

import React from "react";
import { Flame } from "lucide-react";

export interface StreakWidgetProps {
  currentStreak: number;
  longestStreak?: number;
  className?: string;
}

function StreakWidget({
  currentStreak,
  longestStreak,
  className = "",
}: StreakWidgetProps) {
  const isActive = currentStreak > 0;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}
    >
      <div
        className={`flex items-center justify-center w-12 h-12 rounded-full ${
          isActive
            ? "bg-orange-100 dark:bg-orange-900/30"
            : "bg-gray-100 dark:bg-gray-800"
        }`}
      >
        <Flame
          size={24}
          className={isActive ? "text-orange-500" : "text-gray-400"}
          fill={isActive ? "currentColor" : "none"}
        />
      </div>
      <div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentStreak}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {currentStreak === 1 ? "day" : "days"}
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {isActive ? "Current streak" : "No active streak"}
          {longestStreak !== undefined && longestStreak > 0 && (
            <span className="ml-1.5">
              &middot; Best: {longestStreak}d
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

export { StreakWidget };

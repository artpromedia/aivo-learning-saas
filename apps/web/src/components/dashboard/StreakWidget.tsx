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
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-[#2A1E45] border border-[#E8DDF0] dark:border-[#3D2D5C] shadow-sm ${className}`}
    >
      <div
        className={`flex items-center justify-center w-12 h-12 rounded-full ${
          isActive
            ? "bg-orange-100 dark:bg-orange-900/30"
            : "bg-[#FFF5EB] dark:bg-[#2A1E45]"
        }`}
      >
        <Flame
          size={24}
          className={isActive ? "text-orange-500" : "text-[var(--aivo-text-muted)]"}
          fill={isActive ? "currentColor" : "none"}
        />
      </div>
      <div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-[var(--aivo-text)] ">
            {currentStreak}
          </span>
          <span className="text-sm text-[var(--aivo-text-secondary)] dark:text-[var(--aivo-text-muted)]">
            {currentStreak === 1 ? "day" : "days"}
          </span>
        </div>
        <p className="text-xs text-[var(--aivo-text-secondary)] dark:text-[var(--aivo-text-muted)]">
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

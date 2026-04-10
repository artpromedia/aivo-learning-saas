"use client";

import React from "react";
import { Check, X, SlidersHorizontal } from "lucide-react";
import { Badge } from "../ui/Badge";

export interface RecommendationCardProps {
  id: string;
  type: "course" | "practice" | "review" | "challenge";
  title: string;
  description: string;
  reason?: string;
  onApprove?: (id: string) => void;
  onDecline?: (id: string) => void;
  onAdjust?: (id: string) => void;
  loading?: "approve" | "decline" | "adjust" | null;
  className?: string;
}

const typeBadgeVariant: Record<RecommendationCardProps["type"], "default" | "success" | "warning" | "secondary"> = {
  course: "default",
  practice: "success",
  review: "warning",
  challenge: "secondary",
};

function RecommendationCard({
  id,
  type,
  title,
  description,
  reason,
  onApprove,
  onDecline,
  onAdjust,
  loading = null,
  className = "",
}: RecommendationCardProps) {
  const isLoading = loading !== null;

  return (
    <div
      className={`rounded-2xl bg-white dark:bg-[#2A1E45] border border-[#E8DDF0] dark:border-[#3D2D5C] shadow-[var(--shadow-card)] overflow-hidden ${className}`}
    >
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-base font-semibold text-[var(--aivo-text)] ">
            {title}
          </h3>
          <Badge variant={typeBadgeVariant[type]}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
        </div>
        <p className="text-sm text-[var(--aivo-text-secondary)] dark:text-[var(--aivo-text-muted)] leading-relaxed">
          {description}
        </p>
        {reason && (
          <p className="mt-2 text-xs text-[#7C3AED] dark:text-[#7C4DFF] font-medium">
            Why: {reason}
          </p>
        )}
      </div>

      <div className="px-5 py-3 border-t border-[#F0E6FF] dark:border-[#3D2D5C] flex items-center gap-2">
        <button
          onClick={() => onApprove?.(id)}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading === "approve" ? (
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Check size={14} />
          )}
          Approve
        </button>
        <button
          onClick={() => onAdjust?.(id)}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-sm font-medium text-[var(--aivo-text)] dark:text-[#A89BB5] bg-[#FFF5EB] dark:bg-[#2A1E45] hover:bg-[#F0E6FF] dark:hover:bg-[#3D2D5C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading === "adjust" ? (
            <span className="w-3.5 h-3.5 border-2 border-[#A89BB5]/30 border-t-[#A89BB5] rounded-full animate-spin" />
          ) : (
            <SlidersHorizontal size={14} />
          )}
          Adjust
        </button>
        <button
          onClick={() => onDecline?.(id)}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading === "decline" ? (
            <span className="w-3.5 h-3.5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
          ) : (
            <X size={14} />
          )}
          Decline
        </button>
      </div>
    </div>
  );
}

export { RecommendationCard };

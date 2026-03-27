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
      className={`rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden ${className}`}
    >
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <Badge variant={typeBadgeVariant[type]}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {description}
        </p>
        {reason && (
          <p className="mt-2 text-xs text-[#7C3AED] dark:text-[#7C4DFF] font-medium">
            Why: {reason}
          </p>
        )}
      </div>

      <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
        <button
          onClick={() => onApprove?.(id)}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading === "adjust" ? (
            <span className="w-3.5 h-3.5 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin" />
          ) : (
            <SlidersHorizontal size={14} />
          )}
          Adjust
        </button>
        <button
          onClick={() => onDecline?.(id)}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

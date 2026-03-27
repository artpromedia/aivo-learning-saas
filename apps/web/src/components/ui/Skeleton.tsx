"use client";

import React from "react";

export interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: "sm" | "md" | "lg" | "full" | "none";
}

const roundedClasses: Record<NonNullable<SkeletonProps["rounded"]>, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

function Skeleton({
  className = "",
  width,
  height,
  rounded = "md",
}: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${roundedClasses[rounded]} ${className}`}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
      aria-hidden="true"
    />
  );
}

function SkeletonText({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={14}
          className={i === lines - 1 ? "w-3/4" : "w-full"}
          rounded="sm"
        />
      ))}
    </div>
  );
}

function SkeletonAvatar({ size = 40, className = "" }: { size?: number; className?: string }) {
  return <Skeleton width={size} height={size} rounded="full" className={className} />;
}

export { Skeleton, SkeletonText, SkeletonAvatar };

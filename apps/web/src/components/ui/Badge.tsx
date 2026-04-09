"use client";

import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "secondary" | "coral" | "teal" | "sunny" | "sky" | "pink";
  children: React.ReactNode;
}

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-[#F0E6FF] text-[#7C3AED] dark:bg-[#3D2D5C] dark:text-[#C9A6FF]",
  success: "bg-[#D1FAE5] text-[#065F46] dark:bg-[#065F46]/30 dark:text-[#34D399]",
  warning: "bg-[#FEF3C7] text-[#92400E] dark:bg-[#92400E]/30 dark:text-[#FBBF24]",
  error: "bg-[#FFE0E0] text-[#991B1B] dark:bg-[#991B1B]/30 dark:text-[#F87171]",
  secondary: "bg-[#F3F0F7] text-[#6B5B7B] dark:bg-[#3D2D5C] dark:text-[#B8A5D0]",
  coral: "bg-[#FFE0E0] text-[#DC2626]",
  teal: "bg-[#CCFBF1] text-[#0D9488]",
  sunny: "bg-[#FEF3C7] text-[#B45309]",
  sky: "bg-[#E0F2FE] text-[#0369A1]",
  pink: "bg-[#FCE7F3] text-[#BE185D]",
};

function Badge({ variant = "default", children, className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 rounded-full
        text-xs font-bold whitespace-nowrap
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
}

export { Badge };

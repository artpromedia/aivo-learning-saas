"use client";

import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "fun";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white hover:from-[#6D28D9] hover:to-[#9333EA] active:from-[#5B21B6] active:to-[#7C3AED] shadow-[0_4px_14px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.4)]",
  secondary:
    "bg-[#F0E6FF] text-[#7C3AED] hover:bg-[#E0CCFF] active:bg-[#C9A6FF] dark:bg-[#3D2D5C] dark:text-[#C9A6FF] dark:hover:bg-[#4C3A6E]",
  outline:
    "border-2 border-[#7C3AED] text-[#7C3AED] bg-transparent hover:bg-[#F0E6FF] active:bg-[#E0CCFF]",
  ghost:
    "bg-transparent text-[#6B5B7B] hover:bg-[#F0E6FF] hover:text-[#7C3AED] active:bg-[#E0CCFF] dark:text-[#B8A5D0] dark:hover:bg-[#3D2D5C]",
  destructive:
    "bg-gradient-to-r from-[#F87171] to-[#FB923C] text-white hover:from-[#EF4444] hover:to-[#F97316] shadow-[0_4px_14px_rgba(248,113,113,0.3)]",
  fun:
    "bg-gradient-to-r from-[#7C3AED] via-[#F472B6] to-[#FB923C] text-white hover:from-[#6D28D9] hover:via-[#EC4899] hover:to-[#F97316] shadow-[0_4px_14px_rgba(244,114,182,0.3)]",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-4 py-2 text-sm rounded-2xl gap-1.5",
  md: "px-5 py-2.5 text-base rounded-2xl gap-2",
  lg: "px-8 py-3.5 text-lg rounded-2xl gap-2.5",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      className = "",
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center font-bold
          transition-all duration-200 ease-out
          transform hover:scale-[1.02] active:scale-[0.98]
          focus:outline-none focus-visible:ring-3 focus-visible:ring-[#7C3AED]/30 focus-visible:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <Loader2 className="animate-spin shrink-0" size={size === "sm" ? 14 : size === "lg" ? 20 : 16} />
        ) : leftIcon ? (
          <span className="shrink-0">{leftIcon}</span>
        ) : null}
        {children}
        {rightIcon && !loading && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button };

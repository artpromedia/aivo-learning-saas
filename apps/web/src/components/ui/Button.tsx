"use client";

import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-[#7C3AED] text-white hover:bg-[#6B3FE8] active:bg-[#5B2FD8] shadow-sm",
  secondary:
    "bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600",
  outline:
    "border border-[#7C3AED] text-[#7C3AED] bg-transparent hover:bg-[#7C3AED]/10 active:bg-[#7C3AED]/20",
  ghost:
    "bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800",
  destructive:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-sm rounded-md gap-1.5",
  md: "px-4 py-2 text-base rounded-lg gap-2",
  lg: "px-6 py-3 text-lg rounded-lg gap-2.5",
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
          inline-flex items-center justify-center font-medium
          transition-colors duration-150 ease-in-out
          focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] focus-visible:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
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

"use client";

import React from "react";

export interface LargeTouchTargetProps {
  children: React.ReactNode;
  as?: "button" | "a" | "div";
  minSize?: number;
  mode?: "LOW_VERBAL" | "DEFAULT";
  onClick?: React.MouseEventHandler;
  href?: string;
  className?: string;
  ariaLabel?: string;
}

function LargeTouchTarget({
  children,
  as: Component = "button",
  minSize = 80,
  mode = "LOW_VERBAL",
  onClick,
  href,
  className = "",
  ariaLabel,
}: LargeTouchTargetProps) {
  const isLowVerbal = mode === "LOW_VERBAL";
  const targetSize = isLowVerbal ? Math.max(minSize, 80) : Math.max(minSize, 44);

  const commonProps = {
    className: `
      relative inline-flex items-center justify-center
      rounded-2xl transition-all duration-150 ease-in-out
      focus:outline-none focus-visible:ring-4 focus-visible:ring-[#7C3AED]/40
      active:scale-95
      ${className}
    `,
    style: {
      minWidth: `${targetSize}px`,
      minHeight: `${targetSize}px`,
    },
    "aria-label": ariaLabel,
  };

  if (Component === "a") {
    return (
      <a href={href} {...commonProps}>
        {children}
      </a>
    );
  }

  return (
    <Component onClick={onClick} {...commonProps}>
      {children}
    </Component>
  );
}

export { LargeTouchTarget };

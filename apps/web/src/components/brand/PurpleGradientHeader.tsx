"use client";

import React from "react";

export interface PurpleGradientHeaderProps {
  children?: React.ReactNode;
  className?: string;
}

function PurpleGradientHeader({ children, className = "" }: PurpleGradientHeaderProps) {
  return (
    <div
      className={`w-full px-6 py-8 relative overflow-hidden ${className}`}
      style={{
        background: "linear-gradient(135deg, #7C3AED 0%, #A855F7 40%, #2DD4BF 100%)",
        borderRadius: "1.5rem",
      }}
    >
      <div className="absolute inset-0">
        <div className="absolute -top-4 -right-4 w-28 h-28 rounded-full bg-white/[0.07]" />
        <div className="absolute top-1/2 -translate-y-1/2 -right-6 w-20 h-20 rounded-full bg-white/[0.05]" />
        <div className="absolute -bottom-6 left-16 w-24 h-24 rounded-full bg-white/[0.06]" />
        <div className="absolute top-3 left-1/3 w-10 h-10 rounded-full bg-white/[0.04]" />
        <div className="absolute bottom-2 right-1/3 w-6 h-6 rounded-full bg-white/[0.08]" />
      </div>
      <div className="relative max-w-7xl mx-auto text-white">{children}</div>
    </div>
  );
}

export { PurpleGradientHeader };

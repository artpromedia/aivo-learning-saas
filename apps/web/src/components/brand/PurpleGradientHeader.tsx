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
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-2 right-8 w-20 h-20 rounded-full bg-white/20" />
        <div className="absolute bottom-4 left-12 w-14 h-14 rounded-full bg-white/15" />
        <div className="absolute top-6 left-1/3 w-8 h-8 rounded-full bg-white/10" />
      </div>
      <div className="relative max-w-7xl mx-auto text-white">{children}</div>
    </div>
  );
}

export { PurpleGradientHeader };

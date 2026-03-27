"use client";

import React from "react";

export interface PurpleGradientHeaderProps {
  children?: React.ReactNode;
  className?: string;
}

function PurpleGradientHeader({ children, className = "" }: PurpleGradientHeaderProps) {
  return (
    <div
      className={`w-full px-6 py-8 ${className}`}
      style={{
        background: "linear-gradient(135deg, #915ee3 0%, #8143e1 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto text-white">{children}</div>
    </div>
  );
}

export { PurpleGradientHeader };

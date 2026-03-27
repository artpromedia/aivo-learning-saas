"use client";

import React from "react";

export interface AivoLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap: Record<NonNullable<AivoLogoProps["size"]>, { width: number; height: number; fontSize: number }> = {
  sm: { width: 80, height: 28, fontSize: 20 },
  md: { width: 120, height: 40, fontSize: 30 },
  lg: { width: 160, height: 52, fontSize: 40 },
};

function AivoLogo({ size = "md", className = "" }: AivoLogoProps) {
  const { width, height, fontSize } = sizeMap[size];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="AIVO logo"
    >
      <defs>
        <linearGradient id="aivo-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="50%" stopColor="#7C4DFF" />
          <stop offset="100%" stopColor="#6B3FE8" />
        </linearGradient>
      </defs>
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fill="url(#aivo-gradient)"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="800"
        fontSize={fontSize}
        letterSpacing="-0.02em"
      >
        AIVO
      </text>
    </svg>
  );
}

export { AivoLogo };

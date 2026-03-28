"use client";

import React from "react";

export interface AivoLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap: Record<NonNullable<AivoLogoProps["size"]>, { width: number; height: number }> = {
  sm: { width: 80, height: 32 },
  md: { width: 120, height: 48 },
  lg: { width: 160, height: 64 },
};

function AivoLogo({ size = "md", className = "" }: AivoLogoProps) {
  const { width, height } = sizeMap[size];

  return (
    <img
      src="/logos/aivo-logo-horizontal-purple.svg"
      alt="AIVO Learning"
      width={width}
      height={height}
      className={className}
    />
  );
}

export { AivoLogo };

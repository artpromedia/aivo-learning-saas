"use client";

import React from "react";
import Image from "next/image";

export interface AivoLogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "purple" | "white";
  className?: string;
}

const sizeMap: Record<NonNullable<AivoLogoProps["size"]>, { height: number; iconSize: number }> = {
  sm: { height: 28, iconSize: 28 },
  md: { height: 36, iconSize: 36 },
  lg: { height: 48, iconSize: 44 },
};

let logoCounter = 0;

function AivoLogoMark({ size, variant = "purple" }: { size: number; variant?: "purple" | "white" }) {
  const [id] = React.useState(() => `aivo-logo-${++logoCounter}`);
  const isWhite = variant === "white";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${id}-gr`} x1="18.5" y1="10.29" x2="24.68" y2="24.46" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={isWhite ? "#ffffff" : "#35cbda"} />
          <stop offset="1" stopColor={isWhite ? "#ffffff" : "#1d95b1"} />
        </linearGradient>
        <linearGradient id={`${id}-gl`} x1="5.77" y1="10.16" x2="17.66" y2="28.24" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={isWhite ? "#ffffff" : "#9666e3"} />
          <stop offset="1" stopColor={isWhite ? "#ffffff" : "#8143e1"} />
        </linearGradient>
      </defs>
      <path
        d="M20.22,26.27h-3.57v-14.18c0-1.2.97-2.18,2.18-2.18h6.91c1.2,0,2.18.97,2.18,2.18v6.49c0,4.25-3.44,7.69-7.69,7.69Z"
        fill={`url(#${id}-gr)`}
      />
      <path
        d="M18.42,26.64l-2.39,5.36-2.55-5.73h-1.7c-4.25,0-7.69-3.44-7.69-7.69v-6.49c0-1.2.97-2.18,2.18-2.18h6.91c1.2,0,2.18.97,2.18,2.18v8.63l.67-1.59,2.42,5.77c.23.56.23,1.18-.02,1.73Z"
        fill={`url(#${id}-gl)`}
      />
      <path
        d="M20.23,4.23c0,2.33-1.89,4.23-4.23,4.23s-4.23-1.89-4.23-4.23S13.67,0,16,0s4.23,1.89,4.23,4.23Z"
        fill={isWhite ? "#ffffff" : "#915ee3"}
      />
    </svg>
  );
}

function AivoLogo({ size = "md", variant = "purple", className = "" }: AivoLogoProps) {
  const { height } = sizeMap[size];
  const isWhite = variant === "white";
  const src = isWhite
    ? "/logos/aivo-logo-horizontal-white.png"
    : "/logos/aivo-logo-horizontal-purple.png";

  return (
    <div className={`inline-flex items-center ${className}`}>
      <Image
        src={src}
        alt="Aivo Learning"
        width={Math.round(height * 2.48)}
        height={height}
        priority
        style={{ height, width: "auto", maxWidth: "none" }}
      />
    </div>
  );
}

export { AivoLogo, AivoLogoMark };

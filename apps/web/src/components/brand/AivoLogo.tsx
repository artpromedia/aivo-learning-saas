"use client";

import React from "react";

export interface AivoLogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "purple" | "white";
  className?: string;
}

const sizeMap: Record<NonNullable<AivoLogoProps["size"]>, { text: string; icon: number }> = {
  sm: { text: "text-xl", icon: 28 },
  md: { text: "text-2xl", icon: 36 },
  lg: { text: "text-3xl", icon: 44 },
};

function AivoLogoMark({ size, variant = "purple" }: { size: number; variant?: "purple" | "white" }) {
  const id = React.useId();
  const isWhite = variant === "white";

  return (
    <svg
      width={size}
      height={size}
      viewBox="400 40 1130 2160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${id}-gl`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isWhite ? "#ffffff" : "#9666e3"} />
          <stop offset="100%" stopColor={isWhite ? "#ffffff" : "#8143e1"} />
        </linearGradient>
        <linearGradient id={`${id}-gr`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isWhite ? "#ffffff" : "#35cbda"} />
          <stop offset="100%" stopColor={isWhite ? "#ffffff" : "#1d95b1"} />
        </linearGradient>
      </defs>
      <circle cx="956.67" cy="500" r="360" fill={isWhite ? "#ffffff" : "#915ee3"} />
      <path
        d="M500,1000 Q500,900 600,900 L850,900 Q935,900 935,1000 L935,2000 Q935,2100 850,2100 L600,2100 Q500,2100 500,2000 Z"
        fill={`url(#${id}-gl)`}
      />
      <path
        d="M980,1150 Q980,1050 1080,1050 L1330,1050 Q1430,1050 1430,1150 L1430,2000 Q1430,2100 1330,2100 L1080,2100 Q980,2100 980,2000 Z"
        fill={`url(#${id}-gr)`}
      />
    </svg>
  );
}

function AivoLogo({ size = "md", variant = "purple", className = "" }: AivoLogoProps) {
  const { text, icon } = sizeMap[size];
  const isWhite = variant === "white";

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <AivoLogoMark size={icon} variant={variant} />
      <span
        className={`${text} font-extrabold tracking-tight`}
        style={
          isWhite
            ? { color: "#ffffff", fontFamily: "var(--font-display)" }
            : {
                background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: "var(--font-display)",
              }
        }
      >
        AIVO
      </span>
    </div>
  );
}

export { AivoLogo, AivoLogoMark };

"use client";

import React from "react";

export interface AivoLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap: Record<NonNullable<AivoLogoProps["size"]>, { text: string; icon: number }> = {
  sm: { text: "text-xl", icon: 28 },
  md: { text: "text-2xl", icon: 36 },
  lg: { text: "text-3xl", icon: 44 },
};

function AivoLogo({ size = "md", className = "" }: AivoLogoProps) {
  const { text, icon } = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div
        className="rounded-2xl flex items-center justify-center"
        style={{
          width: icon,
          height: icon,
          background: "linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #2DD4BF 100%)",
        }}
      >
        <svg
          width={icon * 0.55}
          height={icon * 0.55}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
            fill="white"
            opacity="0.9"
          />
        </svg>
      </div>
      <span
        className={`${text} font-extrabold tracking-tight`}
        style={{
          background: "linear-gradient(135deg, #7C3AED, #A855F7)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontFamily: "var(--font-display)",
        }}
      >
        AIVO
      </span>
    </div>
  );
}

export { AivoLogo };

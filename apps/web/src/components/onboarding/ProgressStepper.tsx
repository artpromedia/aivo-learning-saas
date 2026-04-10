"use client";

import React from "react";
import { Check, Sparkles } from "lucide-react";

export interface ProgressStepperProps {
  totalSteps?: number;
  currentStep: number;
  labels?: string[];
  className?: string;
}

const stepColors = [
  { bg: "bg-[#7C3AED]", ring: "ring-[#7C3AED]/20" },
  { bg: "bg-[#F472B6]", ring: "ring-[#F472B6]/20" },
  { bg: "bg-[#2DD4BF]", ring: "ring-[#2DD4BF]/20" },
  { bg: "bg-[#FBBF24]", ring: "ring-[#FBBF24]/20" },
  { bg: "bg-[#38BDF8]", ring: "ring-[#38BDF8]/20" },
  { bg: "bg-[#FF6B6B]", ring: "ring-[#FF6B6B]/20" },
  { bg: "bg-[#34D399]", ring: "ring-[#34D399]/20" },
  { bg: "bg-[#FB923C]", ring: "ring-[#FB923C]/20" },
];

function ProgressStepper({
  totalSteps = 7,
  currentStep,
  labels,
  className = "",
}: ProgressStepperProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const step = i + 1;
          const isCompleted = step < currentStep;
          const isActive = step === currentStep;
          const isPending = step > currentStep;
          const colorSet = stepColors[i % stepColors.length];

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full
                    text-sm font-bold transition-all duration-300
                    ${isCompleted ? `${colorSet.bg} text-white shadow-md` : ""}
                    ${isActive ? `${colorSet.bg} text-white ring-4 ${colorSet.ring} shadow-lg scale-110` : ""}
                    ${isPending ? "bg-[#F0E6FF] text-[#A89BB5] dark:bg-[#3D2D5C] dark:text-[#7B6A94]" : ""}
                  `}
                >
                  {isCompleted ? <Check size={16} strokeWidth={3} /> : isActive ? <Sparkles size={16} /> : step}
                </div>
                {labels && labels[i] && (
                  <span
                    className={`text-xs text-center max-w-[80px] font-semibold ${
                      isActive
                        ? "text-[#7C3AED]"
                        : isCompleted
                          ? "text-[#2D1B4E] dark:text-[#F0E6FF]"
                          : "text-[#A89BB5] dark:text-[#7B6A94]"
                    }`}
                  >
                    {labels[i]}
                  </span>
                )}
              </div>
              {step < totalSteps && (
                <div
                  className={`flex-1 h-1 mx-2 rounded-full transition-colors duration-300 ${
                    step < currentStep
                      ? "bg-gradient-to-r from-[#7C3AED] to-[#A855F7]"
                      : "bg-[#F0E6FF] dark:bg-[#3D2D5C]"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export { ProgressStepper };

"use client";

import React from "react";
import { Check } from "lucide-react";

export interface ProgressStepperProps {
  totalSteps?: number;
  currentStep: number;
  labels?: string[];
  className?: string;
}

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

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`
                    flex items-center justify-center w-9 h-9 rounded-full
                    text-sm font-semibold transition-all duration-300
                    ${isCompleted ? "bg-[#7C3AED] text-white" : ""}
                    ${isActive ? "bg-[#7C3AED] text-white ring-4 ring-[#7C3AED]/20" : ""}
                    ${isPending ? "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400" : ""}
                  `}
                >
                  {isCompleted ? <Check size={16} strokeWidth={3} /> : step}
                </div>
                {labels && labels[i] && (
                  <span
                    className={`text-xs text-center max-w-[80px] ${
                      isActive
                        ? "font-semibold text-[#7C3AED]"
                        : isCompleted
                          ? "text-gray-700 dark:text-gray-300"
                          : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {labels[i]}
                  </span>
                )}
              </div>
              {step < totalSteps && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${
                    step < currentStep
                      ? "bg-[#7C3AED]"
                      : "bg-gray-200 dark:bg-gray-700"
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

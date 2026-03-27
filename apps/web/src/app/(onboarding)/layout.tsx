"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AivoLogo } from "@/components/brand/AivoLogo";
import { ProgressStepper } from "@/components/onboarding/ProgressStepper";

const ONBOARDING_STEPS = [
  { path: "/add-child", label: "Add Child" },
  { path: "/parent-assessment", label: "Assessment" },
  { path: "/iep-upload", label: "IEP Upload" },
  { path: "/baseline-assessment", label: "Baseline" },
  { path: "/brain-profile-reveal", label: "Brain Profile" },
  { path: "/complete", label: "Complete" },
];

function getCurrentStep(pathname: string): number {
  const index = ONBOARDING_STEPS.findIndex((step) =>
    pathname.includes(step.path),
  );
  return index >= 0 ? index + 1 : 1;
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const currentStep = getCurrentStep(pathname);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <AivoLogo size="sm" />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Step {currentStep} of {ONBOARDING_STEPS.length}
          </span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-6">
        <ProgressStepper
          totalSteps={ONBOARDING_STEPS.length}
          currentStep={currentStep}
          labels={ONBOARDING_STEPS.map((s) => s.label)}
          className="mb-8"
        />
      </div>

      <main className="max-w-3xl mx-auto px-6 pb-12">{children}</main>
    </div>
  );
}

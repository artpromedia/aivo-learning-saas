"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { AivoLogo } from "@/components/brand/AivoLogo";
import { ProgressStepper } from "@/components/onboarding/ProgressStepper";

const ONBOARDING_STEP_KEYS = [
  { path: "/add-child", labelKey: "addChild" },
  { path: "/parent-assessment", labelKey: "assessment" },
  { path: "/iep-upload", labelKey: "iepUpload" },
  { path: "/baseline-assessment", labelKey: "baseline" },
  { path: "/brain-profile-reveal", labelKey: "brainProfile" },
  { path: "/complete", labelKey: "complete" },
] as const;

function getCurrentStep(pathname: string): number {
  const index = ONBOARDING_STEP_KEYS.findIndex((step) =>
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
  const t = useTranslations("onboarding");
  const currentStep = getCurrentStep(pathname);

  return (
    <div className="min-h-screen bg-bubbles" style={{ backgroundColor: "var(--aivo-bg)" }}>
      <header className="px-6 py-4" style={{ backgroundColor: "var(--aivo-bg-card)", borderBottom: "1px solid var(--aivo-border)" }}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <AivoLogo size="sm" />
          <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ backgroundColor: "var(--aivo-purple-50)", color: "var(--aivo-purple-500)" }}>
            {t("stepProgress", { current: currentStep, total: ONBOARDING_STEP_KEYS.length })}
          </span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-6">
        <ProgressStepper
          totalSteps={ONBOARDING_STEP_KEYS.length}
          currentStep={currentStep}
          labels={ONBOARDING_STEP_KEYS.map((s) => t(s.labelKey))}
          className="mb-8"
        />
      </div>

      <main className="max-w-3xl mx-auto px-6 pb-12">{children}</main>
    </div>
  );
}

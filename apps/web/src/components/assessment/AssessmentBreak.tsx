"use client";

import React from "react";
import { BreakWrapper, type BreakType } from "./breaks/BreakWrapper";

export type EngagementBreakType = BreakType;

type FunctioningLevel = "STANDARD" | "SUPPORTED" | "LOW_VERBAL" | "NON_VERBAL" | "PRE_SYMBOLIC";

interface AssessmentBreakProps {
  breakType: EngagementBreakType;
  learnerId: string;
  durationSeconds?: number;
  soundEnabled?: boolean;
  functioningLevel?: FunctioningLevel;
  onComplete: () => void;
}

/**
 * Entry point for assessment engagement breaks.
 * Delegates to BreakWrapper which handles intro/activity/outro phases,
 * timer, XP awarding, and renders the appropriate break component.
 */
export function AssessmentBreak({
  breakType,
  learnerId,
  durationSeconds,
  soundEnabled = true,
  functioningLevel = "STANDARD",
  onComplete,
}: AssessmentBreakProps) {
  return (
    <BreakWrapper
      breakType={breakType}
      learnerId={learnerId}
      durationSeconds={durationSeconds}
      soundEnabled={soundEnabled}
      functioningLevel={functioningLevel}
      onComplete={onComplete}
    />
  );
}

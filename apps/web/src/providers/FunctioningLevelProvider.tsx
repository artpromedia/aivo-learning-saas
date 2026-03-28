"use client";

import { createContext, useContext, useMemo } from "react";
import { useLearnerStore, type Learner } from "@/stores/learner.store";

type FunctioningLevel = Learner["functioningLevel"];

interface FunctioningLevelConfig {
  /** Current functioning level */
  level: FunctioningLevel;
  /** Whether to reduce motion / animations */
  reduceAnimations: boolean;
  /** Font size scale factor */
  fontScale: number;
  /** Whether to use simplified UI */
  simplifiedUi: boolean;
  /** Maximum number of choices shown at once */
  maxChoices: number;
  /** Whether audio cues are enabled */
  audioCues: boolean;
  /** Whether picture-based communication support is enabled */
  pictureSupport?: boolean;
  /** Whether a communication partner assists the learner */
  partnerAssisted?: boolean;
  /** Whether the session is adult-directed (learner does not interact with text) */
  adultDirected?: boolean;
}

const defaults: Record<FunctioningLevel, FunctioningLevelConfig> = {
  STANDARD: {
    level: "STANDARD",
    reduceAnimations: false,
    fontScale: 1.0,
    simplifiedUi: false,
    maxChoices: 4,
    audioCues: true,
  },
  SUPPORTED: {
    level: "SUPPORTED",
    reduceAnimations: false,
    fontScale: 1.15,
    simplifiedUi: false,
    maxChoices: 3,
    audioCues: true,
  },
  LOW_VERBAL: {
    level: "LOW_VERBAL",
    reduceAnimations: true,
    fontScale: 1.3,
    simplifiedUi: true,
    maxChoices: 2,
    audioCues: true,
    pictureSupport: true,
  },
  NON_VERBAL: {
    level: "NON_VERBAL",
    reduceAnimations: true,
    fontScale: 1.3,
    simplifiedUi: true,
    maxChoices: 1,
    audioCues: true,
    pictureSupport: true,
    partnerAssisted: true,
  },
  PRE_SYMBOLIC: {
    level: "PRE_SYMBOLIC",
    reduceAnimations: true,
    fontScale: 1.0,
    simplifiedUi: true,
    maxChoices: 0,
    audioCues: true,
    adultDirected: true,
  },
};

const FunctioningLevelContext = createContext<FunctioningLevelConfig>(
  defaults.STANDARD,
);

export function useFunctioningLevel() {
  return useContext(FunctioningLevelContext);
}

export function FunctioningLevelProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const activeLearner = useLearnerStore((s) => s.activeLearner);

  const config = useMemo<FunctioningLevelConfig>(() => {
    const level = activeLearner?.functioningLevel ?? "STANDARD";
    const base = defaults[level];

    // Apply learner-specific preference overrides
    if (activeLearner?.preferences) {
      return {
        ...base,
        reduceAnimations:
          activeLearner.preferences.reduceAnimations ?? base.reduceAnimations,
        audioCues:
          activeLearner.preferences.soundEnabled ?? base.audioCues,
      };
    }

    return base;
  }, [activeLearner]);

  return (
    <FunctioningLevelContext.Provider value={config}>
      {children}
    </FunctioningLevelContext.Provider>
  );
}

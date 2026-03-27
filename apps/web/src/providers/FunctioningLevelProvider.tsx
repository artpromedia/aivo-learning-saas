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
}

const defaults: Record<FunctioningLevel, FunctioningLevelConfig> = {
  level1: {
    level: "level1",
    reduceAnimations: false,
    fontScale: 1,
    simplifiedUi: false,
    maxChoices: 4,
    audioCues: true,
  },
  level2: {
    level: "level2",
    reduceAnimations: false,
    fontScale: 1.15,
    simplifiedUi: false,
    maxChoices: 3,
    audioCues: true,
  },
  level3: {
    level: "level3",
    reduceAnimations: true,
    fontScale: 1.3,
    simplifiedUi: true,
    maxChoices: 2,
    audioCues: true,
  },
};

const FunctioningLevelContext = createContext<FunctioningLevelConfig>(
  defaults.level1,
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
    const level = activeLearner?.functioningLevel ?? "level1";
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

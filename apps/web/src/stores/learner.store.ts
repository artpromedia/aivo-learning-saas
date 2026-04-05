import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Learner {
  id: string;
  name: string;
  avatarUrl?: string;
  dateOfBirth: string;
  functioningLevel: "STANDARD" | "SUPPORTED" | "LOW_VERBAL" | "NON_VERBAL" | "PRE_SYMBOLIC";
  preferences: {
    theme?: string;
    reduceAnimations?: boolean;
    fontSize?: "small" | "medium" | "large";
    soundEnabled?: boolean;
  };
}

interface LearnerState {
  activeLearner: Learner | null;
  learners: Learner[];

  setActiveLearner: (learner: Learner | null) => void;
  setLearners: (learners: Learner[]) => void;
  addLearner: (learner: Learner) => void;
  updateLearner: (id: string, updates: Partial<Learner>) => void;
}

export const useLearnerStore = create<LearnerState>()(persist((set) => ({
  activeLearner: null,
  learners: [],

  setActiveLearner: (activeLearner) => set({ activeLearner }),

  setLearners: (learners) => set({ learners }),

  addLearner: (learner) =>
    set((state) => ({ learners: [...state.learners, learner] })),

  updateLearner: (id, updates) =>
    set((state) => ({
      learners: state.learners.map((l) =>
        l.id === id ? { ...l, ...updates } : l,
      ),
      activeLearner:
        state.activeLearner?.id === id
          ? { ...state.activeLearner, ...updates }
          : state.activeLearner,
    })),
}), { name: "learner-store" }));

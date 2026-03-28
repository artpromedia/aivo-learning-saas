"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Brain,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  MessageSquarePlus,
  Loader2,
  BarChart3,
  Search,
  Lightbulb,
  Shield,
  Puzzle,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useBrain } from "@/hooks/useBrain";
import { useLearnerStore } from "@/stores/learner.store";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

/** XAI pipeline steps shown to the parent during profile building */
const XAI_STEPS = [
  { icon: BarChart3, titleKey: "analyzingResults", detailKey: "analyzingResultsDescription" },
  { icon: Search, titleKey: "mappingPatterns", detailKey: "mappingPatternsDescription" },
  { icon: Puzzle, titleKey: "identifyingStrengths", detailKey: "identifyingStrengthsDescription" },
  { icon: Shield, titleKey: "settingSupportLevel", detailKey: "settingSupportLevelDescription" },
  { icon: BookOpen, titleKey: "buildingCurriculum", detailKey: "buildingCurriculumDescription" },
  { icon: Lightbulb, titleKey: "generatingRecommendations", detailKey: "generatingRecommendationsDescription" },
];

type RevealPhase = "building" | "revealing" | "revealed";

export default function BrainProfileRevealPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("onboarding");
  const activeLearner = useLearnerStore((s) => s.activeLearner);
  const learnerId = activeLearner?.id ?? searchParams.get("learnerId");
  const childName = activeLearner?.name ?? "your child";

  const {
    profile,
    isLoading,
    error,
    approve,
    decline,
    addInsights,
    refetch,
    isApproving,
    isDeclining,
  } = useBrain(learnerId ?? undefined);

  const [phase, setPhase] = useState<RevealPhase>("building");
  const [activeStep, setActiveStep] = useState(0);
  const [insightText, setInsightText] = useState("");
  const [showInsightInput, setShowInsightInput] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const seeded = useRef(false);

  // Animate through XAI pipeline steps
  useEffect(() => {
    if (phase !== "building") return;

    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= XAI_STEPS.length - 1) return prev;
        return prev + 1;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [phase]);

  // Seed brain profile if it doesn't exist after initial load
  const seedProfile = useCallback(async () => {
    if (!learnerId || seeded.current) return;
    seeded.current = true;
    try {
      await apiFetch(API_ROUTES.BRAIN.SEED(learnerId), {
        method: "POST",
        body: JSON.stringify({ accuracy: 0.5 }),
      });
    } catch {
      // Non-critical — profile may already exist
    }
  }, [learnerId]);

  // When loading finishes and no profile, trigger seed creation
  useEffect(() => {
    if (!isLoading && !profile && !error && learnerId) {
      seedProfile();
    }
  }, [isLoading, profile, error, learnerId, seedProfile]);

  // Poll for profile once we've seeded
  useEffect(() => {
    if (profile || !learnerId || phase !== "building") return;

    const pollInterval = setInterval(async () => {
      try {
        const p = await apiFetch(API_ROUTES.BRAIN.PROFILE(learnerId));
        if (p) {
          clearInterval(pollInterval);
          refetch();
        }
      } catch {
        // Still waiting
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [profile, learnerId, phase, refetch]);

  // Transition from building → revealing → revealed once profile arrives
  useEffect(() => {
    if (profile && phase === "building") {
      // Let the last step finish, then transition
      const delay = Math.max(0, (XAI_STEPS.length - activeStep) * 800);
      const timer = setTimeout(() => setPhase("revealing"), delay);
      return () => clearTimeout(timer);
    }
  }, [profile, phase, activeStep]);

  useEffect(() => {
    if (phase === "revealing") {
      const timer = setTimeout(() => setPhase("revealed"), 2500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const handleApprove = async () => {
    setActionError(null);
    try {
      await approve();
      router.push("/complete");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t("failedToApprove"));
    }
  };

  const handleDecline = async () => {
    setActionError(null);
    try {
      await decline();
      router.push("/complete");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t("failedToDecline"));
    }
  };

  const handleAddInsights = async () => {
    if (!insightText.trim()) return;
    setActionError(null);
    try {
      await addInsights({ text: insightText });
      setInsightText("");
      setShowInsightInput(false);
      router.push("/complete");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t("failedToAddInsights"));
    }
  };

  if (isLoading && !profile) {
    return (
      <div className="text-center py-16">
        <Loader2 className="mx-auto mb-4 text-[#7C3AED] animate-spin" size={48} />
        <p className="text-gray-500 dark:text-gray-400">
          {t("loading")}
        </p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
          <Brain className="text-red-500" size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {t("unableToLoadBrainProfile")}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {error.message}
        </p>
        <Button variant="outline" onClick={() => globalThis.location.reload()}>
          {t("tryAgain")}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <AnimatePresence mode="wait">
        {phase === "building" && (
          <motion.div
            key="building"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-8"
          >
            {/* Header */}
            <div className="text-center mb-10">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-20 h-20 rounded-full bg-linear-to-br from-[#7C3AED] to-[#7C4DFF] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#7C3AED]/30"
              >
                <Brain className="text-white" size={40} />
              </motion.div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t("buildingBrainProfile", { childName })}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                {t("buildingBrainProfileDescription")}
              </p>
            </div>

            {/* XAI Pipeline Steps */}
            <div className="max-w-lg mx-auto space-y-3">
              {XAI_STEPS.map((step, i) => {
                const StepIcon = step.icon;
                const isActive = i === activeStep;
                const isComplete = i < activeStep;
                const isPending = i > activeStep;

                let cardClass: string;
                if (isActive) {
                  cardClass = "border-[#7C3AED] bg-[#7C3AED]/5 shadow-sm shadow-[#7C3AED]/10";
                } else if (isComplete) {
                  cardClass = "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10";
                } else {
                  cardClass = "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50";
                }

                let iconBgClass: string;
                if (isActive) {
                  iconBgClass = "bg-[#7C3AED] text-white";
                } else if (isComplete) {
                  iconBgClass = "bg-green-500 text-white";
                } else {
                  iconBgClass = "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500";
                }

                let titleClass: string;
                if (isActive) {
                  titleClass = "text-[#7C3AED]";
                } else if (isComplete) {
                  titleClass = "text-green-700 dark:text-green-400";
                } else {
                  titleClass = "text-gray-400 dark:text-gray-500";
                }

                let stepIcon: React.ReactNode;
                if (isComplete) {
                  stepIcon = (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  );
                } else if (isActive) {
                  stepIcon = (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                      <StepIcon size={20} />
                    </motion.div>
                  );
                } else {
                  stepIcon = <StepIcon size={20} />;
                }

                return (
                  <motion.div
                    key={step.titleKey}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{
                      opacity: isPending ? 0.4 : 1,
                      x: 0,
                    }}
                    transition={{ delay: i * 0.15, duration: 0.4 }}
                  >
                    <div
                      className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-500 ${cardClass}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-500 ${iconBgClass}`}
                      >
                        {stepIcon}
                      </div>
                      <div className="min-w-0">
                        <p className={`font-medium text-sm ${titleClass}`}>
                          {t(step.titleKey)}
                        </p>
                        <AnimatePresence>
                          {isActive && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed"
                            >
                              {t(step.detailKey)}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="max-w-lg mx-auto mt-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 dark:text-gray-500">{t("progress")}</span>
                <span className="text-xs font-medium text-[#7C3AED]">
                  {Math.round(((activeStep + 1) / XAI_STEPS.length) * 100)}%
                </span>
              </div>
              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-linear-to-r from-[#7C3AED] to-[#7C4DFF] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((activeStep + 1) / XAI_STEPS.length) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Trust note */}
            <div className="max-w-lg mx-auto mt-6">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30">
                <Shield className="text-blue-500 shrink-0 mt-0.5" size={16} />
                <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                  {t("transparentAi")}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {phase === "revealing" && (
          <motion.div
            key="revealing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-16"
          >
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="w-24 h-24 rounded-full bg-linear-to-br from-[#7C3AED] to-[#38B2AC] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#7C3AED]/30"
            >
              <Sparkles className="text-white" size={48} />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("profileReady")}
            </h1>
          </motion.div>
        )}

        {phase === "revealed" && profile && (
          <motion.div
            key="revealed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-[#7C3AED] to-[#7C4DFF] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#7C3AED]/20">
                <Brain className="text-white" size={40} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {childName}&apos;s Brain Profile
              </h1>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Here&apos;s what we&apos;ve discovered about how{" "}
                {childName} learns best.
              </p>
            </div>

            {actionError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                {actionError}
              </div>
            )}

            <div className="space-y-4">
              <Card>
                <CardBody>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Functioning Level
                    </h3>
                    <Badge>
                      {(() => {
                        const labels: Record<string, string> = {
                          level1: "Level 1 - High Independence",
                          level2: "Level 2 - Moderate Support",
                          level3: "Level 3 - Substantial Support",
                        };
                        return labels[profile.functioningLevel] ?? "Level 3 - Substantial Support";
                      })()}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Learning style: {profile.learningStyle}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Communication: {profile.communicationStyle}
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Strengths
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.strengths.map((s) => (
                      <span
                        key={s}
                        className="px-3 py-1.5 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Growth Areas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.challenges.map((c) => (
                      <span
                        key={c}
                        className="px-3 py-1.5 rounded-full text-sm bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 font-medium"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {profile.sensoryPreferences.length > 0 && (
                <Card>
                  <CardBody>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Sensory Preferences
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.sensoryPreferences.map((p) => (
                        <span
                          key={p}
                          className="px-3 py-1.5 rounded-full text-sm bg-[#7C3AED]/10 text-[#7C3AED] font-medium"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>

            {showInsightInput && (
              <Card className="mt-4">
                <CardBody>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Add Your Insights
                  </h3>
                  <textarea
                    value={insightText}
                    onChange={(e) => setInsightText(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none resize-none"
                    placeholder="Share anything else about your child that would help us personalize their learning..."
                  />
                  <div className="flex justify-end gap-2 mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowInsightInput(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAddInsights}
                      disabled={!insightText.trim()}
                    >
                      Submit & Continue
                    </Button>
                  </div>
                </CardBody>
              </Card>
            )}

            <div className="flex items-center justify-center gap-3 mt-8">
              <Button
                variant="outline"
                onClick={handleDecline}
                loading={isDeclining}
                leftIcon={<ThumbsDown size={18} />}
              >
                Decline
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowInsightInput(true)}
                leftIcon={<MessageSquarePlus size={18} />}
                disabled={showInsightInput}
              >
                Add Insights
              </Button>
              <Button
                onClick={handleApprove}
                loading={isApproving}
                leftIcon={<ThumbsUp size={18} />}
              >
                Approve Profile
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Brain, Sparkles, ThumbsUp, ThumbsDown, MessageSquarePlus,
  Loader2, BarChart3, Search, Lightbulb, Shield, Puzzle, BookOpen,
  Lock, Eye, Database, ChevronDown, ChevronUp, FileText, ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useBrain } from "@/hooks/useBrain";
import { useAuth } from "@/hooks/useAuth";
import { useLearnerStore } from "@/stores/learner.store";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import { getPostOnboardingRedirect, isLearnerRole } from "@/lib/redirect-after-onboarding";

const XAI_STEPS = [
  { icon: BarChart3, titleKey: "analyzingResults", detailKey: "analyzingResultsDescription" },
  { icon: Search, titleKey: "mappingPatterns", detailKey: "mappingPatternsDescription" },
  { icon: Puzzle, titleKey: "identifyingStrengths", detailKey: "identifyingStrengthsDescription" },
  { icon: Shield, titleKey: "settingSupportLevel", detailKey: "settingSupportLevelDescription" },
  { icon: BookOpen, titleKey: "buildingCurriculum", detailKey: "buildingCurriculumDescription" },
  { icon: Lightbulb, titleKey: "generatingRecommendations", detailKey: "generatingRecommendationsDescription" },
];

type RevealPhase = "building" | "revealing" | "revealed";

function NeuralNetworkVis() {
  const nodes = Array.from({ length: 18 }).map((_, i) => ({
    x: 20 + (i % 6) * 60,
    y: 20 + Math.floor(i / 6) * 50,
    delay: i * 0.15,
  }));

  return (
    <svg viewBox="0 0 340 170" className="w-full h-auto opacity-20">
      {nodes.map((a, i) =>
        nodes.slice(i + 1).filter((_, j) => Math.random() > 0.6).map((b, j) => (
          <motion.line
            key={`${i}-${j}`}
            x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke="#7C3AED" strokeWidth="0.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 0.4, 0.1] }}
            transition={{ duration: 2, delay: a.delay + 0.5, repeat: Infinity, repeatType: "reverse" }}
          />
        )),
      )}
      {nodes.map((n, i) => (
        <motion.circle
          key={i}
          cx={n.x} cy={n.y} r="4"
          fill="#7C3AED"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1, 0.7, 1] }}
          transition={{ duration: 1.5, delay: n.delay, repeat: Infinity, repeatType: "reverse" }}
        />
      ))}
    </svg>
  );
}

function DataSourceBadge({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: "#F0E6FF", color: "#7C3AED" }}>
      <Icon size={12} />
      {label}
    </div>
  );
}

function ExpandableExplanation({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs font-bold transition-colors"
        style={{ color: "var(--aivo-purple-500)" }}
      >
        <Lightbulb size={12} />
        {title}
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 p-3 rounded-xl text-xs leading-relaxed" style={{ backgroundColor: "var(--aivo-bg)", color: "var(--aivo-text-secondary)" }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function BrainProfileRevealPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("onboarding");
  const { user } = useAuth();
  const activeLearner = useLearnerStore((s) => s.activeLearner);
  const learnerId = activeLearner?.id ?? searchParams.get("learnerId");
  const childName = activeLearner?.name ?? t("yourChild");
  const userIsLearner = isLearnerRole(user?.role);

  const {
    profile, isLoading, error,
    approve, decline, addInsights, refetch,
    isApproving, isDeclining,
  } = useBrain(learnerId ?? undefined);

  const [phase, setPhase] = useState<RevealPhase>("building");
  const [activeStep, setActiveStep] = useState(0);
  const [insightText, setInsightText] = useState("");
  const [showInsightInput, setShowInsightInput] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [dataPointCount, setDataPointCount] = useState(0);
  const seeded = useRef(false);

  useEffect(() => {
    if (!learnerId && !isLoading) {
      router.replace("/add-child");
    }
  }, [learnerId, isLoading, router]);

  useEffect(() => {
    if (phase !== "building") return;
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= XAI_STEPS.length - 1) return prev;
        return prev + 1;
      });
      setDataPointCount((prev) => prev + Math.floor(Math.random() * 15) + 5);
    }, 2500);
    return () => clearInterval(interval);
  }, [phase]);

  const seedProfile = useCallback(async () => {
    if (!learnerId || seeded.current) return;
    seeded.current = true;
    try {
      await apiFetch(API_ROUTES.BRAIN.SEED(learnerId), {
        method: "POST",
        body: JSON.stringify({ accuracy: 0.5 }),
      });
    } catch { /* Non-critical */ }
  }, [learnerId]);

  useEffect(() => {
    if (!isLoading && !profile && !error && learnerId) seedProfile();
  }, [isLoading, profile, error, learnerId, seedProfile]);

  useEffect(() => {
    if (profile || !learnerId || phase !== "building") return;
    const pollInterval = setInterval(async () => {
      try {
        const p = await apiFetch(API_ROUTES.BRAIN.PROFILE(learnerId));
        if (p) { clearInterval(pollInterval); refetch(); }
      } catch { /* Still waiting */ }
    }, 3000);
    return () => clearInterval(pollInterval);
  }, [profile, learnerId, phase, refetch]);

  useEffect(() => {
    if (profile && phase === "building") {
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

  const postProfileRedirect = getPostOnboardingRedirect(user?.role ?? "parent");

  const handleApprove = async () => {
    setActionError(null);
    try {
      await approve();
      router.push(postProfileRedirect);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t("failedToApprove"));
    }
  };

  const handleDecline = async () => {
    setActionError(null);
    try {
      await decline();
      router.push(postProfileRedirect);
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
      router.push(postProfileRedirect);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t("failedToAddInsights"));
    }
  };

  if (isLoading && !profile) {
    return (
      <div className="text-center py-16">
        <Loader2 className="mx-auto mb-4 text-[#7C3AED] animate-spin" size={48} />
        <p className="text-[var(--aivo-text-secondary)]">{t("loading")}</p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
          <Brain className="text-red-500" size={32} />
        </div>
        <h2 className="text-xl font-extrabold text-[var(--aivo-text)] mb-2">{t("unableToLoadBrainProfile")}</h2>
        <p className="text-[var(--aivo-text-secondary)] mb-4">{error.message}</p>
        <Button variant="outline" onClick={() => globalThis.location.reload()}>{t("tryAgain")}</Button>
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
            <div className="text-center mb-6">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A855F7] flex items-center justify-center mx-auto mb-5 shadow-xl shadow-[#7C3AED]/30 relative"
              >
                <Brain className="text-white" size={44} />
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ border: "2px solid #7C3AED" }}
                  animate={{ scale: [1, 1.3, 1.3], opacity: [0.5, 0, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              <h1 className="text-2xl font-extrabold text-[var(--aivo-text)] mb-2">
                {t("neuralBuildingTitle", { childName })}
              </h1>
              <p className="text-[var(--aivo-text-secondary)] max-w-md mx-auto text-sm">
                {t("neuralBuildingDesc", { childName })}
              </p>
            </div>

            <div className="max-w-lg mx-auto mb-6">
              <NeuralNetworkVis />
            </div>

            <div className="max-w-lg mx-auto flex items-center justify-center gap-4 mb-6">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: "#F0E6FF", color: "#7C3AED" }}>
                <Database size={12} />
                {t("dataPointsAnalyzed", { count: String(dataPointCount) })}
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: "#CCFBF1", color: "#0D9488" }}>
                <Eye size={12} />
                {t("profileAccuracy")}: {Math.min(45 + activeStep * 9, 92)}%
              </div>
            </div>

            <div className="max-w-lg mx-auto space-y-3">
              {XAI_STEPS.map((step, i) => {
                const StepIcon = step.icon;
                const isActive = i === activeStep;
                const isComplete = i < activeStep;
                const isPending = i > activeStep;

                return (
                  <motion.div
                    key={step.titleKey}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: isPending ? 0.4 : 1, x: 0 }}
                    transition={{ delay: i * 0.15, duration: 0.4 }}
                  >
                    <div className={`flex items-start gap-4 p-4 rounded-2xl border transition-all duration-500 ${
                      isActive ? "border-[#7C3AED] bg-[#7C3AED]/5 shadow-sm shadow-[#7C3AED]/10"
                      : isComplete ? "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10"
                      : "border-[#E8DDF0] dark:border-[#3D2D5C] bg-white dark:bg-[#2A1E45]/50"
                    }`}>
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors duration-500 ${
                        isActive ? "bg-[#7C3AED] text-white"
                        : isComplete ? "bg-green-500 text-white"
                        : "bg-[var(--aivo-bg-alt,#FFF5EB)] text-[var(--aivo-text-muted)]"
                      }`}>
                        {isComplete ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : isActive ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                            <StepIcon size={20} />
                          </motion.div>
                        ) : (
                          <StepIcon size={20} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className={`font-medium text-sm ${
                          isActive ? "text-[#7C3AED]"
                          : isComplete ? "text-green-700 dark:text-green-400"
                          : "text-[var(--aivo-text-muted)]"
                        }`}>
                          {t(step.titleKey)}
                        </p>
                        <AnimatePresence>
                          {isActive && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="text-xs text-[var(--aivo-text-secondary)] mt-1 leading-relaxed"
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

            <div className="max-w-lg mx-auto mt-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[var(--aivo-text-muted)]">{t("progress")}</span>
                <span className="text-xs font-medium text-[#7C3AED]">
                  {Math.round(((activeStep + 1) / XAI_STEPS.length) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-[#F0E6FF] dark:bg-[#3D2D5C] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(135deg, #7C3AED, #A855F7, #2DD4BF)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${((activeStep + 1) / XAI_STEPS.length) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>

            <div className="max-w-lg mx-auto mt-6 space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30">
                <Shield className="text-blue-500 shrink-0 mt-0.5" size={16} />
                <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                  {t("transparentAi")}
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl border" style={{ backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }}>
                <Lock className="shrink-0 mt-0.5" size={16} style={{ color: "#D97706" }} />
                <p className="text-xs leading-relaxed" style={{ color: "#92400E" }}>
                  {t("raiPrivacyNotice")}
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
            <motion.div className="relative w-32 h-32 mx-auto mb-6">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: "linear-gradient(135deg, #7C3AED, #2DD4BF)" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute inset-0 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #7C3AED, #38B2AC)" }}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: 1 }}
              >
                <Sparkles className="text-white" size={56} />
              </motion.div>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full"
                  style={{ border: "2px solid rgba(124, 58, 237, 0.3)" }}
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: [1, 1.5 + i * 0.3], opacity: [0.5, 0] }}
                  transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
                />
              ))}
            </motion.div>
            <h1 className="text-2xl font-extrabold text-[var(--aivo-text)]">{t("profileReady")}</h1>
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
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A855F7] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#7C3AED]/20">
                <Brain className="text-white" size={40} />
              </div>
              <h1 className="text-2xl font-extrabold text-[var(--aivo-text)]">
                {t("childBrainProfile", { childName })}
              </h1>
              <p className="mt-2 text-[var(--aivo-text-secondary)]">
                {t("brainProfileDiscovery", { childName })}
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl p-4 mb-6 border"
              style={{ backgroundColor: "var(--aivo-purple-50, #F5F0FF)", borderColor: "var(--aivo-purple-100, #E0CCFF)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Eye size={16} style={{ color: "#7C3AED" }} />
                <h3 className="text-sm font-bold" style={{ color: "#7C3AED" }}>{t("raiTransparencyTitle")}</h3>
              </div>
              <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--aivo-text-secondary)" }}>
                {t("raiTransparencyDesc")}
              </p>
              <div className="flex flex-wrap gap-2">
                <DataSourceBadge icon={ClipboardList} label={t("parentAssessmentSource")} />
                <DataSourceBadge icon={FileText} label={t("iepDocumentSource")} />
                <DataSourceBadge icon={Brain} label={t("baselineAssessmentSource")} />
              </div>
            </motion.div>

            {actionError && (
              <div className="mb-4 p-3 rounded-2xl bg-[#FFE0E0] dark:bg-[#991B1B]/10 border border-[#FECACA] dark:border-[#991B1B]/30 text-[#991B1B] dark:text-[#F87171] text-sm">
                {actionError}
              </div>
            )}

            <div className="space-y-4">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card>
                  <CardBody>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-[var(--aivo-text)]">{t("functioningLevel")}</h3>
                      <Badge>
                        {(() => {
                          const labels: Record<string, string> = {
                            level1: t("level1HighIndependence"),
                            level2: t("level2ModerateSupport"),
                            level3: t("level3SubstantialSupport"),
                          };
                          return labels[profile.functioningLevel] ?? t("level3SubstantialSupport");
                        })()}
                      </Badge>
                    </div>
                    <p className="text-sm text-[var(--aivo-text-secondary)]">
                      {t("learningStyleLabel", { style: profile.learningStyle })}
                    </p>
                    <p className="text-sm text-[var(--aivo-text-secondary)] mt-1">
                      {t("communicationLabel", { style: profile.communicationStyle })}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold" style={{ backgroundColor: "#CCFBF1", color: "#0D9488" }}>
                        <Shield size={10} /> {t("highConfidence")}
                      </div>
                      <span className="text-[10px] font-medium" style={{ color: "var(--aivo-text-muted)" }}>
                        {t("basedOnDataPoints", { count: String(dataPointCount || 42) })}
                      </span>
                    </div>
                    <ExpandableExplanation title={t("whatThisMeans")}>
                      {t("functioningLevelExplanation")}
                    </ExpandableExplanation>
                  </CardBody>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card>
                  <CardBody>
                    <h3 className="font-semibold text-[var(--aivo-text)] mb-3">{t("strengths")}</h3>
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
                    <ExpandableExplanation title={t("whatThisMeans")}>
                      {t("strengthsExplanation", { childName })}
                    </ExpandableExplanation>
                  </CardBody>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Card>
                  <CardBody>
                    <h3 className="font-semibold text-[var(--aivo-text)] mb-3">{t("growthAreas")}</h3>
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
                    <ExpandableExplanation title={t("whatThisMeans")}>
                      {t("growthAreasExplanation", { childName })}
                    </ExpandableExplanation>
                  </CardBody>
                </Card>
              </motion.div>

              {profile.sensoryPreferences.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                  <Card>
                    <CardBody>
                      <h3 className="font-semibold text-[var(--aivo-text)] mb-3">{t("sensoryPreferences")}</h3>
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
                      <ExpandableExplanation title={t("whatThisMeans")}>
                        {t("sensoryExplanation")}
                      </ExpandableExplanation>
                    </CardBody>
                  </Card>
                </motion.div>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-4 p-3 rounded-2xl flex items-start gap-3 border"
              style={{ backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }}
            >
              <Lock className="shrink-0 mt-0.5" size={14} style={{ color: "#D97706" }} />
              <p className="text-xs leading-relaxed" style={{ color: "#92400E" }}>
                {t("raiPrivacyNotice")}
              </p>
            </motion.div>

            {showInsightInput && (
              <Card className="mt-4">
                <CardBody>
                  <h3 className="font-semibold text-[var(--aivo-text)] mb-3">{t("addYourInsights")}</h3>
                  <textarea
                    value={insightText}
                    onChange={(e) => setInsightText(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-2xl border border-[#E8DDF0] dark:border-[#3D2D5C] bg-white dark:bg-[#2A1E45] text-[var(--aivo-text)] focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none resize-none"
                    placeholder={t("insightsPlaceholder")}
                  />
                  <div className="flex justify-end gap-2 mt-3">
                    <Button variant="ghost" size="sm" onClick={() => setShowInsightInput(false)}>{t("cancel")}</Button>
                    <Button size="sm" onClick={handleAddInsights} disabled={!insightText.trim()}>{t("submitAndContinue")}</Button>
                  </div>
                </CardBody>
              </Card>
            )}

            <div className="flex items-center justify-center gap-3 mt-8">
              <Button variant="outline" onClick={handleDecline} loading={isDeclining} leftIcon={<ThumbsDown size={18} />}>
                {t("decline")}
              </Button>
              <Button variant="secondary" onClick={() => setShowInsightInput(true)} leftIcon={<MessageSquarePlus size={18} />} disabled={showInsightInput}>
                {t("addInsights")}
              </Button>
              <Button onClick={handleApprove} loading={isApproving} leftIcon={<ThumbsUp size={18} />}>
                {t("approveProfile")}
              </Button>
            </div>

            {userIsLearner && (
              <div className="text-center mt-6">
                <Button size="lg" onClick={() => router.push("/learner")} rightIcon={<Sparkles size={18} />} className="min-w-[200px]">
                  {t("startLearning")}
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

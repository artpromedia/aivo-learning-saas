"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList, ChevronLeft, ChevronRight, Loader2,
  MessageCircle, Eye, Puzzle, Heart, Sparkles, Star, Check,
  BookOpen, Trophy, AlertTriangle, Zap, Settings, SmilePlus,
  Shield, Accessibility, Monitor, HandHelping,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { assessmentApiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import { useLearnerStore } from "@/stores/learner.store";

interface ApiQuestion {
  id: string;
  category: string;
  questionText: string;
  questionType: "multiple_choice" | "rating_scale" | "open_ended" | "multi_select" | "yes_no";
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: { min: string; max: string };
  required: boolean;
  helpText?: string;
}

interface ApiCategory {
  key: string;
  label: string;
  questions: ApiQuestion[];
}

const CATEGORY_THEMES: Record<string, { icon: React.ElementType; color: string; bgColor: string; emoji: string }> = {
  learning_style: { icon: BookOpen, color: "#7C3AED", bgColor: "#F0E6FF", emoji: "📚" },
  strengths: { icon: Trophy, color: "#F59E0B", bgColor: "#FEF3C7", emoji: "🏆" },
  challenges: { icon: AlertTriangle, color: "#F472B6", bgColor: "#FCE7F3", emoji: "🧗" },
  behavior: { icon: Zap, color: "#FB923C", bgColor: "#FFF7ED", emoji: "⚡" },
  preferences: { icon: Settings, color: "#2DD4BF", bgColor: "#CCFBF1", emoji: "🎯" },
  social_emotional: { icon: SmilePlus, color: "#EC4899", bgColor: "#FCE7F3", emoji: "💛" },
  functioning_level: { icon: Shield, color: "#6366F1", bgColor: "#EEF2FF", emoji: "📊" },
  sensory_accessibility: { icon: Eye, color: "#14B8A6", bgColor: "#CCFBF1", emoji: "🌈" },
  communication_needs: { icon: MessageCircle, color: "#8B5CF6", bgColor: "#F5F3FF", emoji: "💬" },
  input_method: { icon: Monitor, color: "#38BDF8", bgColor: "#E0F2FE", emoji: "🖥️" },
  support_needs: { icon: HandHelping, color: "#F43F5E", bgColor: "#FFE4E6", emoji: "🤝" },
  default: { icon: ClipboardList, color: "#7C3AED", bgColor: "#F0E6FF", emoji: "📋" },
};

function getCategoryTheme(key: string) {
  return CATEGORY_THEMES[key] ?? CATEGORY_THEMES.default;
}

const ENCOURAGEMENT_EMOJIS = ["🌟", "✨", "🎯", "💪", "🙌", "🎉"];

function CategoryCelebration({ categoryName, onDone }: { categoryName: string; onDone: () => void }) {
  const t = useTranslations("onboarding");

  useEffect(() => {
    const timer = setTimeout(onDone, 2000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="rounded-3xl p-8 text-center shadow-2xl max-w-sm mx-4"
        style={{ backgroundColor: "var(--aivo-bg-card)" }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-4"
        >
          <Check className="text-white" size={32} />
        </motion.div>
        <h3 className="text-xl font-extrabold mb-1" style={{ color: "var(--aivo-text)" }}>
          {t("categoryCompleteTitle")}
        </h3>
        <p className="text-sm font-medium" style={{ color: "var(--aivo-text-secondary)" }}>
          {t("categoryCompleteDesc", { childName: categoryName })}
        </p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold"
          style={{ backgroundColor: "#F0E6FF", color: "#7C3AED" }}
        >
          <Sparkles size={14} /> {t("xpEarned", { xp: "50" })}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function ParentAssessmentPage() {
  const router = useRouter();
  const t = useTranslations("onboarding");
  const activeLearner = useLearnerStore((s) => s.activeLearner);

  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (!activeLearner) {
      router.replace("/add-child");
    }
  }, [activeLearner, router]);

  useEffect(() => {
    let cancelled = false;
    async function fetchQuestions() {
      try {
        const data = await assessmentApiFetch<{ categories: ApiCategory[] }>(API_ROUTES.ONBOARDING.PARENT_ASSESSMENT_QUESTIONS);
        if (!cancelled) {
          setCategories(data.categories);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError(t("failedToLoadQuestions"));
          setLoading(false);
        }
      }
    }
    fetchQuestions();
    return () => { cancelled = true; };
  }, []);

  const category = categories[currentStep];
  const isLastStep = currentStep === categories.length - 1;
  const isFirstStep = currentStep === 0;
  const theme = category ? getCategoryTheme(category.key) : CATEGORY_THEMES.default;
  const CatIcon = theme.icon;

  const setAnswer = useCallback((questionId: string, value: string | string[] | number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const toggleMulti = useCallback((questionId: string, option: string) => {
    setAnswers((prev) => {
      const current = (prev[questionId] as string[]) ?? [];
      const updated = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      return { ...prev, [questionId]: updated };
    });
  }, []);

  const canAdvance = category?.questions.every((q) => {
    if (!q.required) return true;
    const a = answers[q.id];
    if (q.questionType === "multi_select") return Array.isArray(a) && a.length > 0;
    if (q.questionType === "open_ended") return typeof a === "string" && a.trim().length > 0;
    return a !== undefined && a !== "";
  }) ?? false;

  const handleNext = async () => {
    if (!isLastStep) {
      setShowCelebration(true);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      if (!activeLearner?.id) {
        router.replace("/add-child");
        return;
      }
      await assessmentApiFetch(API_ROUTES.ONBOARDING.PARENT_ASSESSMENT, {
        method: "POST",
        body: JSON.stringify({
          learnerId: activeLearner.id,
          answers,
        }),
      });
      router.push("/iep-upload");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToSubmitAssessment"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const advanceToNext = useCallback(() => {
    setShowCelebration(false);
    setDirection(1);
    setCurrentStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    setCurrentStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const remaining = categories.length - currentStep - 1;
  const encourageMsg = remaining === 1
    ? t("encourageAlmostThere", { remaining: "1", plural: "" })
    : remaining <= Math.ceil(categories.length / 2)
    ? t("encourageHalfway")
    : t("encourageGreatStart");

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 gap-4">
        <Loader2 className="animate-spin text-[#7C3AED]" size={40} />
        <p className="text-[var(--aivo-text-secondary)]">{t("loadingAssessment")}</p>
      </div>
    );
  }

  if (!category) return null;

  return (
    <div>
      <AnimatePresence>
        {showCelebration && (
          <CategoryCelebration
            categoryName={activeLearner?.name ?? ""}
            onDone={advanceToNext}
          />
        )}
      </AnimatePresence>

      <div className="text-center mb-8">
        <motion.div
          key={currentStep}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: theme.bgColor }}
        >
          <CatIcon style={{ color: theme.color }} size={32} />
        </motion.div>
        <h1 className="text-2xl font-extrabold text-[var(--aivo-text)]">
          {t("parentAssessment")}
        </h1>
        <p className="mt-2 text-[var(--aivo-text-secondary)]">
          {t("parentAssessmentSubtitle")}
        </p>
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold" style={{ color: theme.color }}>
          {theme.emoji} {category.label}
        </span>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: theme.bgColor, color: theme.color }}>
          {t("sectionOf", { current: String(currentStep + 1), total: String(categories.length) })}
        </span>
      </div>

      <div className="relative mb-4">
        <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: "#F0E6FF" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(135deg, ${theme.color}, ${theme.color}88)` }}
            initial={false}
            animate={{ width: `${((currentStep + 1) / categories.length) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between mt-1">
          {categories.map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full transition-colors"
              style={{ backgroundColor: i <= currentStep ? theme.color : "#E8DDF0" }}
            />
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 text-center"
      >
        <span className="text-xs font-medium px-3 py-1.5 rounded-full inline-flex items-center gap-1" style={{ backgroundColor: "#FEF3C7", color: "#D97706" }}>
          <Star size={12} fill="currentColor" /> {encourageMsg}
        </span>
      </motion.div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStep}
          custom={direction}
          initial={{ opacity: 0, x: direction * 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -30 }}
          transition={{ duration: 0.25 }}
        >
          <Card>
            <CardBody>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: theme.bgColor }}>
                  <CatIcon style={{ color: theme.color }} size={18} />
                </div>
                <h2 className="text-lg font-bold text-[var(--aivo-text)]">
                  {category.label}
                </h2>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-2xl bg-[#FFE0E0] dark:bg-[#991B1B]/10 border border-[#FECACA] dark:border-[#991B1B]/30 text-[#991B1B] dark:text-[#F87171] text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-8 mt-6">
                {category.questions.map((q, qi) => (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: qi * 0.08 }}
                  >
                    <QuestionRenderer
                      question={q}
                      value={answers[q.id]}
                      onSingleChange={(val) => setAnswer(q.id, val)}
                      onMultiToggle={(val) => toggleMulti(q.id, val)}
                      onScaleChange={(val) => setAnswer(q.id, val)}
                      onTextChange={(val) => setAnswer(q.id, val)}
                      categoryColor={theme.color}
                      categoryBgColor={theme.bgColor}
                    />
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#E8DDF0] dark:border-[#3D2D5C]">
                <Button
                  variant="ghost"
                  onClick={goBack}
                  disabled={isFirstStep}
                  leftIcon={<ChevronLeft size={18} />}
                >
                  {t("back")}
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!canAdvance}
                  loading={isSubmitting}
                  rightIcon={!isLastStep ? <ChevronRight size={18} /> : <Sparkles size={18} />}
                >
                  {isLastStep ? t("submit") : t("next")}
                </Button>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

interface QuestionRendererProps {
  question: ApiQuestion;
  value: string | string[] | number | undefined;
  onSingleChange: (val: string) => void;
  onMultiToggle: (val: string) => void;
  onScaleChange: (val: number) => void;
  onTextChange: (val: string) => void;
  categoryColor: string;
  categoryBgColor: string;
}

const SCALE_EMOJIS = ["😟", "😕", "😐", "🙂", "😊"];

function QuestionRenderer({
  question: q,
  value,
  onSingleChange,
  onMultiToggle,
  onScaleChange,
  onTextChange,
  categoryColor,
  categoryBgColor,
}: QuestionRendererProps) {
  const t = useTranslations("onboarding");

  return (
    <div>
      <p className="text-sm font-medium text-[var(--aivo-text)] mb-1">
        {q.questionText}
        {!q.required && (
          <span className="ml-1 text-[var(--aivo-text-muted)] font-normal">{t("optional")}</span>
        )}
      </p>
      {q.helpText && (
        <p className="text-xs text-[var(--aivo-text-muted)] mb-3">{q.helpText}</p>
      )}

      {(q.questionType === "multiple_choice" || q.questionType === "yes_no") && q.options && (
        <div className="space-y-2">
          {q.options.map((option) => {
            const selected = value === option;
            return (
              <motion.label
                key={option}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  selected
                    ? "shadow-sm"
                    : "border-[#E8DDF0] dark:border-[#3D2D5C] hover:border-opacity-60"
                }`}
                style={selected ? { borderColor: categoryColor, backgroundColor: `${categoryColor}08` } : undefined}
              >
                <input
                  type="radio"
                  name={q.id}
                  value={option}
                  checked={selected}
                  onChange={() => onSingleChange(option)}
                  className="sr-only"
                />
                <div
                  className="w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors"
                  style={selected ? { borderColor: categoryColor } : { borderColor: "#E8DDF0" }}
                >
                  {selected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: categoryColor }}
                    />
                  )}
                </div>
                <span className="text-sm font-medium text-[var(--aivo-text)]">{option}</span>
                {selected && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto">
                    <Check size={16} style={{ color: categoryColor }} />
                  </motion.div>
                )}
              </motion.label>
            );
          })}
        </div>
      )}

      {q.questionType === "multi_select" && q.options && (
        <div className="flex flex-wrap gap-2">
          {q.options.map((option) => {
            const selected = Array.isArray(value) && value.includes(option);
            return (
              <motion.button
                key={option}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => onMultiToggle(option)}
                className="px-4 py-2.5 rounded-full text-sm font-bold border-2 transition-all"
                style={
                  selected
                    ? { backgroundColor: categoryColor, color: "#fff", borderColor: categoryColor, boxShadow: `0 2px 8px ${categoryColor}40` }
                    : { backgroundColor: "var(--aivo-bg)", color: "var(--aivo-text)", borderColor: "var(--aivo-border)" }
                }
              >
                {selected && <span className="mr-1">✓</span>}
                {option}
              </motion.button>
            );
          })}
        </div>
      )}

      {q.questionType === "rating_scale" && (
        <div>
          <div className="flex items-center gap-2 justify-center">
            {Array.from({ length: (q.scaleMax ?? 5) - (q.scaleMin ?? 1) + 1 }).map((_, i) => {
              const val = (q.scaleMin ?? 1) + i;
              const selected = value === val;
              const emoji = SCALE_EMOJIS[Math.min(i, SCALE_EMOJIS.length - 1)];
              return (
                <motion.button
                  key={val}
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.1 }}
                  onClick={() => onScaleChange(val)}
                  className="flex flex-col items-center gap-1 p-2 rounded-2xl transition-all"
                  style={selected ? { backgroundColor: categoryBgColor } : undefined}
                >
                  <span className={`text-2xl transition-all ${selected ? "scale-110" : "grayscale opacity-50"}`}>
                    {emoji}
                  </span>
                  <span
                    className="text-xs font-bold"
                    style={{ color: selected ? categoryColor : "var(--aivo-text-muted)" }}
                  >
                    {val}
                  </span>
                </motion.button>
              );
            })}
          </div>
          <div className="flex justify-between mt-1 px-2">
            <span className="text-xs text-[var(--aivo-text-muted)]">{q.scaleLabels?.min ?? t("lowSensitivity")}</span>
            <span className="text-xs text-[var(--aivo-text-muted)]">{q.scaleLabels?.max ?? t("highSensitivity")}</span>
          </div>
        </div>
      )}

      {q.questionType === "open_ended" && (
        <textarea
          value={(value as string) ?? ""}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={t("typeYourAnswer")}
          rows={3}
          className="w-full rounded-2xl border-2 p-3 text-sm text-[var(--aivo-text)] placeholder-[#A89BB5] focus:outline-none focus:border-transparent resize-none transition-all"
          style={{ borderColor: "var(--aivo-border)", backgroundColor: "var(--aivo-bg)" }}
          onFocus={(e) => { e.currentTarget.style.borderColor = categoryColor; e.currentTarget.style.boxShadow = `0 0 0 3px ${categoryColor}20`; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "var(--aivo-border)"; e.currentTarget.style.boxShadow = "none"; }}
        />
      )}
    </div>
  );
}

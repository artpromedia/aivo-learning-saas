"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ClipboardList, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { assessmentApiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import { useLearnerStore } from "@/stores/learner.store";

// ─── Types (match API response) ─────────────────────────────────────────────
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

// ─── Page Component ─────────────────────────────────────────────────────────
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

  useEffect(() => {
    if (!activeLearner) {
      router.replace("/add-child");
    }
  }, [activeLearner, router]);

  // Fetch questions from API
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
          setError("Failed to load assessment questions");
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
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 gap-4">
        <Loader2 className="animate-spin text-[#7C3AED]" size={40} />
        <p className="text-[var(--aivo-text-secondary)]">{t("loadingAssessment") ?? "Loading assessment..."}</p>
      </div>
    );
  }

  if (!category) return null;

  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mx-auto mb-4">
          <ClipboardList className="text-[#7C3AED]" size={32} />
        </div>
        <h1 className="text-2xl font-extrabold text-[var(--aivo-text)]">
          {t("parentAssessment")}
        </h1>
        <p className="mt-2 text-[var(--aivo-text-secondary)]">
          {t("parentAssessmentSubtitle")}
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-between mb-2 text-xs text-[var(--aivo-text-secondary)]">
        <span>{category.label}</span>
        <span>{currentStep + 1} / {categories.length}</span>
      </div>
      <ProgressBar
        value={currentStep + 1}
        max={categories.length}
        className="mb-6"
        showLabel={false}
        size="sm"
      />

      <Card>
        <CardBody>
          <h2 className="text-lg font-bold text-[var(--aivo-text)] mb-1">
            {category.label}
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-[#FFE0E0] dark:bg-[#991B1B]/10 border border-[#FECACA] dark:border-[#991B1B]/30 text-[#991B1B] dark:text-[#F87171] text-sm">
              {error}
            </div>
          )}

          <div className="space-y-8 mt-6">
            {category.questions.map((q) => (
              <QuestionRenderer
                key={q.id}
                question={q}
                value={answers[q.id]}
                onSingleChange={(val) => setAnswer(q.id, val)}
                onMultiToggle={(val) => toggleMulti(q.id, val)}
                onScaleChange={(val) => setAnswer(q.id, val)}
                onTextChange={(val) => setAnswer(q.id, val)}
              />
            ))}
          </div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#E8DDF0] dark:border-[#3D2D5C]">
            <Button
              variant="ghost"
              onClick={() => {
                setCurrentStep((s) => s - 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={isFirstStep}
              leftIcon={<ChevronLeft size={18} />}
            >
              {t("back")}
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canAdvance}
              loading={isSubmitting}
              rightIcon={!isLastStep ? <ChevronRight size={18} /> : undefined}
            >
              {isLastStep ? t("submit") : t("next")}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

// ─── Question Renderer ──────────────────────────────────────────────────────
interface QuestionRendererProps {
  question: ApiQuestion;
  value: string | string[] | number | undefined;
  onSingleChange: (val: string) => void;
  onMultiToggle: (val: string) => void;
  onScaleChange: (val: number) => void;
  onTextChange: (val: string) => void;
}

function QuestionRenderer({
  question: q,
  value,
  onSingleChange,
  onMultiToggle,
  onScaleChange,
  onTextChange,
}: QuestionRendererProps) {
  return (
    <div>
      <p className="text-sm font-medium text-[var(--aivo-text)] mb-1">
        {q.questionText}
        {!q.required && (
          <span className="ml-1 text-[var(--aivo-text-muted)] font-normal">(optional)</span>
        )}
      </p>
      {q.helpText && (
        <p className="text-xs text-[var(--aivo-text-muted)] mb-3">{q.helpText}</p>
      )}

      {/* Multiple Choice / Yes-No */}
      {(q.questionType === "multiple_choice" || q.questionType === "yes_no") && q.options && (
        <div className="space-y-2">
          {q.options.map((option) => (
            <label
              key={option}
              className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-colors ${
                value === option
                  ? "border-[#7C3AED] bg-[#7C3AED]/5"
                  : "border-[#E8DDF0] dark:border-[#3D2D5C] hover:border-[#E8DDF0] dark:hover:border-[#3D2D5C]"
              }`}
            >
              <input
                type="radio"
                name={q.id}
                value={option}
                checked={value === option}
                onChange={() => onSingleChange(option)}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                  value === option
                    ? "border-[#7C3AED]"
                    : "border-[#E8DDF0] dark:border-[#3D2D5C]"
                }`}
              >
                {value === option && (
                  <div className="w-2 h-2 rounded-full bg-[#7C3AED]" />
                )}
              </div>
              <span className="text-sm text-[var(--aivo-text)]">{option}</span>
            </label>
          ))}
        </div>
      )}

      {/* Multi Select */}
      {q.questionType === "multi_select" && q.options && (
        <div className="flex flex-wrap gap-2">
          {q.options.map((option) => {
            const selected = Array.isArray(value) && value.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => onMultiToggle(option)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  selected
                    ? "bg-[#7C3AED] text-white border-[#7C3AED]"
                    : "bg-white dark:bg-[#2A1E45] text-[var(--aivo-text)] border-[#E8DDF0] dark:border-[#3D2D5C] hover:border-[#7C3AED]"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      {/* Rating Scale */}
      {q.questionType === "rating_scale" && (
        <div className="flex items-center gap-4">
          <span className="text-xs text-[var(--aivo-text-muted)] min-w-15 text-right">
            {q.scaleLabels?.min ?? "Low"}
          </span>
          <div className="flex gap-2 flex-1 justify-center">
            {Array.from({ length: (q.scaleMax ?? 5) - (q.scaleMin ?? 1) + 1 }).map((_, i) => {
              const val = (q.scaleMin ?? 1) + i;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => onScaleChange(val)}
                  className={`w-10 h-10 rounded-full font-semibold text-sm transition-colors ${
                    value === val
                      ? "bg-[#7C3AED] text-white"
                      : "bg-[var(--aivo-bg-alt,#FFF5EB)] text-[var(--aivo-text-secondary)] hover:bg-[#F0E6FF] dark:hover:bg-[#3D2D5C]"
                  }`}
                >
                  {val}
                </button>
              );
            })}
          </div>
          <span className="text-xs text-[var(--aivo-text-muted)] min-w-15">
            {q.scaleLabels?.max ?? "High"}
          </span>
        </div>
      )}

      {/* Open-Ended Text */}
      {q.questionType === "open_ended" && (
        <textarea
          value={(value as string) ?? ""}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Type your answer here..."
          rows={3}
          className="w-full rounded-2xl border border-[#E8DDF0] dark:border-[#3D2D5C] bg-white dark:bg-[#2A1E45] p-3 text-sm text-[var(--aivo-text)] placeholder-[#A89BB5] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent resize-none"
        />
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Brain, ChevronRight, Loader2, Rocket, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { apiFetch, assessmentApiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import { useLearnerStore } from "@/stores/learner.store";
import { useAuth } from "@/hooks/useAuth";
import { isLearnerRole } from "@/lib/redirect-after-onboarding";
import { AssessmentBreak, type EngagementBreakType } from "@/components/assessment/AssessmentBreak";

interface BaselineQuestion {
  id: string;
  type: "multiple_choice" | "drag_drop" | "fill_blank" | "matching";
  subject: string;
  prompt: string;
  options?: string[];
  imageUrl?: string;
  difficulty: number;
}

interface BreakConfig {
  frequencyQuestions: number;
  preferredTypes: EngagementBreakType[];
  adaptiveBreaks?: boolean;
}

interface AnswerResult {
  correct: boolean;
  feedback: string;
  nextQuestion?: BaselineQuestion;
  progress: number;
  isComplete: boolean;
  breakConfig?: BreakConfig;
  shouldBreak?: boolean;
  suggestedBreakType?: EngagementBreakType;
  consecutiveWrong?: number;
}

export default function BaselineAssessmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("onboarding");
  const { user } = useAuth();
  const activeLearner = useLearnerStore((s) => s.activeLearner);
  const learnerId = activeLearner?.id ?? searchParams.get("learnerId");
  const userIsLearner = isLearnerRole(user?.role);

  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState<BaselineQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Break state
  const [showBreak, setShowBreak] = useState(false);
  const [breakType, setBreakType] = useState<EngagementBreakType>("music");
  const [breakConfig, setBreakConfig] = useState<BreakConfig>({
    frequencyQuestions: 8,
    preferredTypes: ["music", "puzzle", "game"],
  });
  const breakRotationRef = useRef(0);
  const pendingNextQuestion = useRef<BaselineQuestion | null>(null);

  const pickBreakType = useCallback((): EngagementBreakType => {
    const types = breakConfig.preferredTypes;
    const idx = breakRotationRef.current % types.length;
    breakRotationRef.current += 1;
    return types[idx];
  }, [breakConfig.preferredTypes]);

  useEffect(() => {
    if (!learnerId) return;

    async function startBaseline() {
      try {
        const data = await apiFetch<{
          question: BaselineQuestion;
          progress: number;
          breakConfig?: BreakConfig;
        }>(
          API_ROUTES.ONBOARDING.BASELINE_START(learnerId!),
          { method: "POST" },
        );
        setQuestion(data.question);
        setProgress(data.progress);
        if (data.breakConfig && data.breakConfig.frequencyQuestions > 0) {
          setBreakConfig(data.breakConfig);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t("failedToStartAssessment"));
      } finally {
        setLoading(false);
      }
    }

    startBaseline();
  }, [learnerId]);

  const handleAnswer = async () => {
    if (!learnerId || !question || selectedAnswer === null) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const result = await apiFetch<AnswerResult>(
        API_ROUTES.ONBOARDING.BASELINE_ANSWER(learnerId),
        {
          method: "POST",
          body: JSON.stringify({
            questionId: question.id,
            answer: selectedAnswer,
          }),
        },
      );

      setFeedback({ correct: result.correct, text: result.feedback });
      setProgress(result.progress);
      const newCount = questionsAnswered + 1;
      setQuestionsAnswered(newCount);

      // Update breakConfig if returned by the server
      if (result.breakConfig && result.breakConfig.frequencyQuestions > 0) {
        setBreakConfig(result.breakConfig);
      }

      // Brief delay to show feedback, then advance (or trigger break)
      setTimeout(() => {
        setFeedback(null);
        setSelectedAnswer(null);

        if (result.isComplete) {
          handleComplete();
        } else if (result.shouldBreak && result.nextQuestion) {
          // Server says it's time for a break — stash next question
          pendingNextQuestion.current = result.nextQuestion;
          // Use server-suggested type for adaptive breaks, otherwise rotate
          setBreakType(result.suggestedBreakType ?? pickBreakType());
          setShowBreak(true);
        } else if (result.nextQuestion) {
          setQuestion(result.nextQuestion);
        }
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToSubmitAnswer"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (!learnerId) return;
    try {
      await apiFetch(API_ROUTES.ONBOARDING.BASELINE_COMPLETE(learnerId), {
        method: "POST",
      });
      setIsComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToCompleteAssessment"));
    }
  };

  const handleBreakComplete = useCallback(() => {
    setShowBreak(false);
    if (pendingNextQuestion.current) {
      setQuestion(pendingNextQuestion.current);
      pendingNextQuestion.current = null;
    }
  }, []);

  if (loading) {
    return (
      <div className="text-center py-16">
        <Loader2 className="mx-auto mb-4 text-[#7C3AED] animate-spin" size={48} />
        <p className="text-[var(--aivo-text-secondary)]">
          {t("preparingAssessment")}
        </p>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4" aria-hidden="true">🎉</div>
        <h1 className="text-2xl font-extrabold text-[var(--aivo-text)] mb-2">
          Assessment Complete!
        </h1>
        <p className="text-[var(--aivo-text-secondary)] mb-8 max-w-md mx-auto">
          Great job{activeLearner?.name ? `, ${activeLearner.name}` : ""}! We&apos;ve gathered
          everything we need to build a personalized learning profile.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-[#FFE0E0] dark:bg-[#991B1B]/10 border border-[#FECACA] dark:border-[#991B1B]/30 text-[#991B1B] dark:text-[#F87171] text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {userIsLearner ? (
            <>
              <Button
                size="lg"
                onClick={() => router.push("/learner")}
                rightIcon={<Rocket size={18} />}
                className="min-w-[200px]"
              >
                Go to My Dashboard
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/brain-profile-reveal")}
                rightIcon={<Eye size={18} />}
              >
                View Brain Profile
              </Button>
            </>
          ) : (
            <>
              <Button
                size="lg"
                onClick={() => router.push("/brain-profile-reveal")}
                rightIcon={<Eye size={18} />}
                className="min-w-[200px]"
              >
                View Brain Profile
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/learner")}
                rightIcon={<Rocket size={18} />}
              >
                Go to Learner Dashboard
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mx-auto mb-4">
          <Brain className="text-[#7C3AED]" size={32} />
        </div>
        <h1 className="text-2xl font-extrabold text-[var(--aivo-text)]">
          {t("baselineAssessment")}
        </h1>
        <p className="mt-2 text-[var(--aivo-text-secondary)]">
          {t("baselineDescription", { name: activeLearner?.name ?? "" })}
        </p>
      </div>

      <ProgressBar value={progress} max={100} className="mb-6" size="sm" />

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-[var(--aivo-text-secondary)]">
          {t("questionsAnswered", { count: questionsAnswered })}
        </span>
        {question && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#7C3AED]/10 text-[#7C3AED]">
            {question.subject}
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-2xl bg-[#FFE0E0] dark:bg-[#991B1B]/10 border border-[#FECACA] dark:border-[#991B1B]/30 text-[#991B1B] dark:text-[#F87171] text-sm">
          {error}
        </div>
      )}

      {showBreak && learnerId && (
        <AssessmentBreak
          breakType={breakType}
          learnerId={learnerId}
          soundEnabled={activeLearner?.preferences?.soundEnabled ?? true}
          functioningLevel={activeLearner?.functioningLevel ?? "STANDARD"}
          onComplete={handleBreakComplete}
        />
      )}

      {!showBreak && question && (
        <Card>
          <CardBody>
            {question.imageUrl && (
              <div className="mb-4 rounded-2xl overflow-hidden bg-[var(--aivo-bg-alt,#FFF5EB)]">
                <img
                  src={question.imageUrl}
                  alt="Question visual"
                  className="w-full h-48 object-contain"
                />
              </div>
            )}

            <p className="text-lg font-medium text-[var(--aivo-text)] mb-6">
              {question.prompt}
            </p>

            {feedback && (
              <div
                className={`mb-4 p-3 rounded-2xl text-sm font-medium ${
                  feedback.correct
                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                    : "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800"
                }`}
              >
                {feedback.text}
              </div>
            )}

            {question.type === "multiple_choice" && question.options && (
              <div className="space-y-3">
                {question.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    disabled={!!feedback}
                    onClick={() => setSelectedAnswer(option)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                      selectedAnswer === option
                        ? "border-[#7C3AED] bg-[#7C3AED]/5 shadow-[var(--shadow-card)]"
                        : "border-[#E8DDF0] dark:border-[#3D2D5C] hover:border-[#E8DDF0] dark:hover:border-[#3D2D5C]"
                    } ${feedback ? "opacity-75 cursor-not-allowed" : ""}`}
                  >
                    <span className="text-sm font-medium text-[var(--aivo-text)]">
                      {option}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {question.type === "fill_blank" && (
              <input
                type="text"
                value={selectedAnswer ?? ""}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                disabled={!!feedback}
                className="w-full px-4 py-3 rounded-2xl border border-[#E8DDF0] dark:border-[#3D2D5C] bg-white dark:bg-[#2A1E45] text-[var(--aivo-text)] focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none text-lg"
                placeholder={t("typeAnswer")}
              />
            )}

            <div className="mt-8 flex justify-end">
              <Button
                onClick={handleAnswer}
                disabled={selectedAnswer === null || !!feedback}
                loading={isSubmitting}
                rightIcon={<ChevronRight size={18} />}
                size="lg"
              >
                {t("submitAnswer")}
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

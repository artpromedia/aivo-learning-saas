"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight, Loader2, Trophy, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import { useLearningSession, type InteractionResult, type SessionSummary } from "@/hooks/useLearningSession";
import { useLearnerStore } from "@/stores/learner.store";

interface SessionQuestion {
  id: string;
  type: "multiple_choice" | "fill_blank" | "drag_drop" | "matching";
  prompt: string;
  options?: string[];
  imageUrl?: string;
}

interface SessionStart {
  sessionId: string;
  question: SessionQuestion;
  totalQuestions: number;
}

export default function LearnSessionPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("dashboard");
  const sessionId = params.sessionId as string;
  const activeLearner = useLearnerStore((s) => s.activeLearner);
  const {
    session,
    isInteracting,
    isCompleting,
    error: sessionError,
    interact,
    completeSession,
  } = useLearningSession();

  const [question, setQuestion] = useState<SessionQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string } | null>(null);
  const [progress, setProgress] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    async function loadSession() {
      try {
        const data = await apiFetch<SessionStart>(
          API_ROUTES.SESSION.GET(sessionId),
        );
        setQuestion(data.question);
        setTotalQuestions(data.totalQuestions);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("failedToLoadSession"));
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, [sessionId]);

  const handleSubmit = async () => {
    if (!question || selectedAnswer === null) return;

    try {
      const result = await apiFetch<InteractionResult>(
        API_ROUTES.SESSION.INTERACT(sessionId),
        {
          method: "POST",
          body: JSON.stringify({
            questionId: question.id,
            response: selectedAnswer,
          }),
        },
      );

      setFeedback({ correct: result.correct, text: result.feedback });
      setQuestionsAnswered((q) => q + 1);
      setProgress(
        totalQuestions > 0
          ? ((questionsAnswered + 1) / totalQuestions) * 100
          : 0,
      );

      setTimeout(() => {
        setFeedback(null);
        setSelectedAnswer(null);

        if (result.nextQuestion) {
          setQuestion(result.nextQuestion as SessionQuestion);
        } else {
          handleComplete();
        }
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToSubmitAnswer"));
    }
  };

  const handleComplete = async () => {
    try {
      const result = await apiFetch<SessionSummary>(
        API_ROUTES.SESSION.COMPLETE(sessionId),
        { method: "POST" },
      );
      setSummary(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToCompleteSession"));
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton height={12} className="w-full rounded-full" />
        <Skeleton height={300} className="w-full rounded-3xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">{error}</p>
        <Button variant="outline" onClick={() => router.push("/learner")}>
          {t("backToHome")}
        </Button>
      </div>
    );
  }

  if (summary) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A855F7] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#7C3AED]/30">
          <Trophy className="text-white" size={40} />
        </div>
        <h1 className="text-2xl font-extrabold text-[var(--aivo-text)] mb-2">
          {t("sessionComplete")}
        </h1>
        <p className="text-[var(--aivo-text-secondary)] mb-6">
          {t("greatWork", { name: activeLearner?.name ?? "learner" })}
        </p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardBody className="text-center py-4">
              <p className="text-2xl font-extrabold text-[#7C3AED]">
                +{summary.totalXp}
              </p>
              <p className="text-xs text-[var(--aivo-text-secondary)]">{t("xpEarned")}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center py-4">
              <p className="text-2xl font-extrabold text-[#38B2AC]">
                {summary.accuracy}%
              </p>
              <p className="text-xs text-[var(--aivo-text-secondary)]">{t("accuracy")}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center py-4">
              <p className="text-2xl font-extrabold text-orange-500">
                {Math.round(summary.duration / 60)}m
              </p>
              <p className="text-xs text-[var(--aivo-text-secondary)]">{t("duration")}</p>
            </CardBody>
          </Card>
        </div>

        {summary.badgesEarned.length > 0 && (
          <Card className="mb-6">
            <CardBody>
              <p className="text-sm font-medium text-[var(--aivo-text)] mb-2">
                {t("badgesEarnedLabel")}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {summary.badgesEarned.map((badge) => (
                  <span
                    key={badge}
                    className="px-3 py-1.5 rounded-full text-sm bg-[#7C3AED]/10 text-[#7C3AED] font-medium"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        <Button onClick={() => router.push("/learner")} size="lg">
          {t("backToHome")}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setShowExitModal(true)}
          className="p-2 rounded-3xl text-[var(--aivo-text-muted)] hover:text-[var(--aivo-text-secondary)] hover:bg-[#FFF5EB] dark:hover:bg-[#2A1E45] transition-colors"
        >
          <X size={20} />
        </button>
        <div className="flex-1">
          <ProgressBar value={progress} max={100} size="sm" showLabel={false} />
        </div>
        <span className="text-sm text-[var(--aivo-text-secondary)] whitespace-nowrap">
          {questionsAnswered}/{totalQuestions}
        </span>
      </div>

      {question && (
        <Card>
          <CardBody>
            {question.imageUrl && (
              <div className="mb-4 rounded-3xl overflow-hidden bg-[var(--aivo-bg-alt,#FFF5EB)]">
                <img
                  src={question.imageUrl}
                  alt={t("questionVisual")}
                  className="w-full h-48 object-contain"
                />
              </div>
            )}

            <p className="text-lg font-medium text-[var(--aivo-text)] mb-6">
              {question.prompt}
            </p>

            {feedback && (
              <div
                className={`mb-4 p-3 rounded-3xl text-sm font-medium ${
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
                    className={`w-full text-left p-4 rounded-3xl border-2 transition-all ${
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
                className="w-full px-4 py-3 rounded-3xl border border-[#E8DDF0] dark:border-[#3D2D5C] bg-white dark:bg-[#2A1E45] text-[var(--aivo-text)] focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none text-lg"
                placeholder={t("typeYourAnswer")}
              />
            )}

            <div className="mt-8 flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={selectedAnswer === null || !!feedback}
                loading={isInteracting}
                rightIcon={<ChevronRight size={18} />}
                size="lg"
              >
                {t("submitAnswer")}
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      <Modal
        open={showExitModal}
        onClose={() => setShowExitModal(false)}
        title={t("leaveSession")}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowExitModal(false)}>
              {t("stay")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => router.push("/learner")}
            >
              {t("leave")}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-[var(--aivo-text-secondary)]">
          {t("leaveSessionDescription")}
        </p>
      </Modal>
    </div>
  );
}

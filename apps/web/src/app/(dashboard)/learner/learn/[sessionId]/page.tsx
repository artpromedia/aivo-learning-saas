"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight, Loader2, Trophy, X } from "lucide-react";
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
          `/api/sessions/${sessionId}`,
        );
        setQuestion(data.question);
        setTotalQuestions(data.totalQuestions);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load session");
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
      setError(err instanceof Error ? err.message : "Failed to submit answer");
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
      setError(err instanceof Error ? err.message : "Failed to complete session");
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton height={12} className="w-full rounded-full" />
        <Skeleton height={300} className="w-full rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">{error}</p>
        <Button variant="outline" onClick={() => router.push("/learner")}>
          Back to Home
        </Button>
      </div>
    );
  }

  if (summary) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#7C4DFF] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#7C3AED]/30">
          <Trophy className="text-white" size={40} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Session Complete!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Great work, {activeLearner?.name ?? "learner"}!
        </p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardBody className="text-center py-4">
              <p className="text-2xl font-bold text-[#7C3AED]">
                +{summary.totalXp}
              </p>
              <p className="text-xs text-gray-500">XP Earned</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center py-4">
              <p className="text-2xl font-bold text-[#38B2AC]">
                {summary.accuracy}%
              </p>
              <p className="text-xs text-gray-500">Accuracy</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center py-4">
              <p className="text-2xl font-bold text-orange-500">
                {Math.round(summary.duration / 60)}m
              </p>
              <p className="text-xs text-gray-500">Duration</p>
            </CardBody>
          </Card>
        </div>

        {summary.badgesEarned.length > 0 && (
          <Card className="mb-6">
            <CardBody>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Badges Earned
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
          Back to Home
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
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X size={20} />
        </button>
        <div className="flex-1">
          <ProgressBar value={progress} max={100} size="sm" showLabel={false} />
        </div>
        <span className="text-sm text-gray-500 whitespace-nowrap">
          {questionsAnswered}/{totalQuestions}
        </span>
      </div>

      {question && (
        <Card>
          <CardBody>
            {question.imageUrl && (
              <div className="mb-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={question.imageUrl}
                  alt="Question visual"
                  className="w-full h-48 object-contain"
                />
              </div>
            )}

            <p className="text-lg font-medium text-gray-900 dark:text-white mb-6">
              {question.prompt}
            </p>

            {feedback && (
              <div
                className={`mb-4 p-3 rounded-lg text-sm font-medium ${
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
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedAnswer === option
                        ? "border-[#7C3AED] bg-[#7C3AED]/5 shadow-sm"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    } ${feedback ? "opacity-75 cursor-not-allowed" : ""}`}
                  >
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none text-lg"
                placeholder="Type your answer..."
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
                Submit
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      <Modal
        open={showExitModal}
        onClose={() => setShowExitModal(false)}
        title="Leave Session?"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowExitModal(false)}>
              Stay
            </Button>
            <Button
              variant="destructive"
              onClick={() => router.push("/learner")}
            >
              Leave
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Your progress in this session will be saved, but you won&apos;t earn
          completion XP. Are you sure you want to leave?
        </p>
      </Modal>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Brain, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { apiFetch, assessmentApiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import { useLearnerStore } from "@/stores/learner.store";

interface BaselineQuestion {
  id: string;
  type: "multiple_choice" | "drag_drop" | "fill_blank" | "matching";
  subject: string;
  prompt: string;
  options?: string[];
  imageUrl?: string;
  difficulty: number;
}

interface AnswerResult {
  correct: boolean;
  feedback: string;
  nextQuestion?: BaselineQuestion;
  progress: number;
  isComplete: boolean;
}

export default function BaselineAssessmentPage() {
  const router = useRouter();
  const activeLearner = useLearnerStore((s) => s.activeLearner);

  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState<BaselineQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  useEffect(() => {
    if (!activeLearner?.id) return;

    async function startBaseline() {
      try {
        const data = await assessmentApiFetch<{ question: BaselineQuestion; progress: number }>(
          API_ROUTES.ONBOARDING.BASELINE_START(activeLearner!.id),
          { method: "POST" },
        );
        setQuestion(data.question);
        setProgress(data.progress);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to start assessment");
      } finally {
        setLoading(false);
      }
    }

    startBaseline();
  }, [activeLearner]);

  const handleAnswer = async () => {
    if (!activeLearner?.id || !question || selectedAnswer === null) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const result = await assessmentApiFetch<AnswerResult>(
        API_ROUTES.ONBOARDING.BASELINE_ANSWER(activeLearner.id),
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
      setQuestionsAnswered((q) => q + 1);

      // Brief delay to show feedback, then advance
      setTimeout(() => {
        setFeedback(null);
        setSelectedAnswer(null);

        if (result.isComplete) {
          handleComplete();
        } else if (result.nextQuestion) {
          setQuestion(result.nextQuestion);
        }
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit answer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (!activeLearner?.id) return;
    try {
      await assessmentApiFetch(API_ROUTES.ONBOARDING.BASELINE_COMPLETE(activeLearner.id), {
        method: "POST",
      });
      router.push("/brain-profile-reveal");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete assessment");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <Loader2 className="mx-auto mb-4 text-[#7C3AED] animate-spin" size={48} />
        <p className="text-gray-500 dark:text-gray-400">
          Preparing personalized assessment...
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mx-auto mb-4">
          <Brain className="text-[#7C3AED]" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Baseline Assessment
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          This adaptive assessment helps us understand{" "}
          {activeLearner?.name ? `${activeLearner.name}'s` : "your child's"}{" "}
          current skill levels. There are no wrong answers.
        </p>
      </div>

      <ProgressBar value={progress} max={100} className="mb-6" size="sm" />

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Questions answered: {questionsAnswered}
        </span>
        {question && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#7C3AED]/10 text-[#7C3AED]">
            {question.subject}
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

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
                onClick={handleAnswer}
                disabled={selectedAnswer === null || !!feedback}
                loading={isSubmitting}
                rightIcon={<ChevronRight size={18} />}
                size="lg"
              >
                Submit Answer
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

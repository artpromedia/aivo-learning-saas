"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { assessmentApiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import { useLearnerStore } from "@/stores/learner.store";

interface Question {
  id: string;
  text: string;
  type: "single" | "multi" | "scale";
  options?: string[];
  min?: number;
  max?: number;
}

const ASSESSMENT_STEPS: { title: string; description: string; questions: Question[] }[] = [
  {
    title: "Communication",
    description: "Tell us about your child's communication style.",
    questions: [
      {
        id: "comm_verbal",
        text: "How does your child primarily communicate?",
        type: "single",
        options: ["Verbal speech", "Sign language", "AAC device", "Gestures and pointing", "Combination of methods"],
      },
      {
        id: "comm_complexity",
        text: "What is your child's typical sentence complexity?",
        type: "single",
        options: ["Single words", "2-3 word phrases", "Simple sentences", "Complex sentences", "Varies by context"],
      },
    ],
  },
  {
    title: "Sensory Preferences",
    description: "Help us understand your child's sensory needs.",
    questions: [
      {
        id: "sensory_visual",
        text: "How does your child respond to visual stimuli (bright lights, colors)?",
        type: "scale",
        min: 1,
        max: 5,
      },
      {
        id: "sensory_audio",
        text: "How does your child respond to sounds and noise?",
        type: "scale",
        min: 1,
        max: 5,
      },
      {
        id: "sensory_preferences",
        text: "Which sensory accommodations help your child? (Select all that apply)",
        type: "multi",
        options: ["Dim lighting", "Noise-canceling headphones", "Fidget tools", "Weighted blanket", "Visual schedules", "Quiet space"],
      },
    ],
  },
  {
    title: "Learning Style",
    description: "Help us understand how your child learns best.",
    questions: [
      {
        id: "learn_style",
        text: "How does your child learn best?",
        type: "single",
        options: ["Visual (pictures, videos)", "Auditory (listening, songs)", "Kinesthetic (hands-on, movement)", "Reading/writing", "Combination"],
      },
      {
        id: "learn_attention",
        text: "How long can your child typically focus on a single activity?",
        type: "single",
        options: ["Less than 5 minutes", "5-10 minutes", "10-20 minutes", "20-30 minutes", "30+ minutes"],
      },
    ],
  },
  {
    title: "Interests & Motivators",
    description: "What motivates and engages your child?",
    questions: [
      {
        id: "interests",
        text: "What topics is your child most interested in? (Select all that apply)",
        type: "multi",
        options: ["Animals", "Space & science", "Art & music", "Numbers & math", "Stories & reading", "Vehicles", "Nature", "Technology", "Sports"],
      },
      {
        id: "motivators",
        text: "What motivates your child most?",
        type: "single",
        options: ["Praise and encouragement", "Earning rewards/tokens", "Completing collections", "Competition/challenges", "Free choice time"],
      },
    ],
  },
];

export default function ParentAssessmentPage() {
  const router = useRouter();
  const activeLearner = useLearnerStore((s) => s.activeLearner);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const step = ASSESSMENT_STEPS[currentStep];
  const isLastStep = currentStep === ASSESSMENT_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const setAnswer = (questionId: string, value: string | string[] | number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const toggleMulti = (questionId: string, option: string) => {
    const current = (answers[questionId] as string[]) ?? [];
    const updated = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option];
    setAnswer(questionId, updated);
  };

  const canAdvance = step.questions.every((q) => {
    const a = answers[q.id];
    if (q.type === "multi") return Array.isArray(a) && a.length > 0;
    return a !== undefined && a !== "";
  });

  const handleNext = async () => {
    if (!isLastStep) {
      setCurrentStep((s) => s + 1);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await assessmentApiFetch(API_ROUTES.ONBOARDING.PARENT_ASSESSMENT, {
        method: "POST",
        body: JSON.stringify({
          learnerId: activeLearner?.id,
          answers,
        }),
      });
      router.push("/iep-upload");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit assessment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mx-auto mb-4">
          <ClipboardList className="text-[#7C3AED]" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Parent Assessment
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Help us understand your child so we can personalize their experience.
        </p>
      </div>

      <ProgressBar
        value={currentStep + 1}
        max={ASSESSMENT_STEPS.length}
        className="mb-6"
        showLabel={false}
        size="sm"
      />

      <Card>
        <CardBody>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {step.title}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {step.description}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-8">
            {step.questions.map((q) => (
              <div key={q.id}>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {q.text}
                </p>

                {q.type === "single" && q.options && (
                  <div className="space-y-2">
                    {q.options.map((option) => (
                      <label
                        key={option}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          answers[q.id] === option
                            ? "border-[#7C3AED] bg-[#7C3AED]/5"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={option}
                          checked={answers[q.id] === option}
                          onChange={() => setAnswer(q.id, option)}
                          className="sr-only"
                        />
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            answers[q.id] === option
                              ? "border-[#7C3AED]"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        >
                          {answers[q.id] === option && (
                            <div className="w-2 h-2 rounded-full bg-[#7C3AED]" />
                          )}
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {q.type === "multi" && q.options && (
                  <div className="flex flex-wrap gap-2">
                    {q.options.map((option) => {
                      const selected = ((answers[q.id] as string[]) ?? []).includes(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleMulti(q.id, option)}
                          className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                            selected
                              ? "bg-[#7C3AED] text-white border-[#7C3AED]"
                              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-[#7C3AED]"
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                )}

                {q.type === "scale" && (
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400">Low sensitivity</span>
                    <div className="flex gap-2 flex-1 justify-center">
                      {Array.from({ length: (q.max ?? 5) - (q.min ?? 1) + 1 }).map((_, i) => {
                        const val = (q.min ?? 1) + i;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setAnswer(q.id, val)}
                            className={`w-10 h-10 rounded-full font-semibold text-sm transition-colors ${
                              answers[q.id] === val
                                ? "bg-[#7C3AED] text-white"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                            }`}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-xs text-gray-400">High sensitivity</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              onClick={() => setCurrentStep((s) => s - 1)}
              disabled={isFirstStep}
              leftIcon={<ChevronLeft size={18} />}
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canAdvance}
              loading={isSubmitting}
              rightIcon={!isLastStep ? <ChevronRight size={18} /> : undefined}
            >
              {isLastStep ? "Submit" : "Next"}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ClipboardList, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { assessmentApiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import { useLearnerStore } from "@/stores/learner.store";

interface Question {
  id: string;
  textKey: string;
  type: "single" | "multi" | "scale";
  optionKeys?: string[];
  options?: string[];
  min?: number;
  max?: number;
}

interface AssessmentStep {
  titleKey: string;
  descriptionKey: string;
  questions: Question[];
}

const ASSESSMENT_STEPS: AssessmentStep[] = [
  {
    titleKey: "communication",
    descriptionKey: "communicationSubtitle",
    questions: [
      {
        id: "comm_verbal",
        textKey: "howCommunicates",
        type: "single",
        optionKeys: ["verbalSpeech", "signLanguage", "aacDevice", "gesturesPointing", "combinationMethods"],
        options: ["Verbal speech", "Sign language", "AAC device", "Gestures and pointing", "Combination of methods"],
      },
      {
        id: "comm_complexity",
        textKey: "sentenceComplexity",
        type: "single",
        optionKeys: ["singleWords", "twoThreeWordPhrases", "simpleSentences", "complexSentences", "variesByContext"],
        options: ["Single words", "2-3 word phrases", "Simple sentences", "Complex sentences", "Varies by context"],
      },
    ],
  },
  {
    titleKey: "sensoryPreferences",
    descriptionKey: "sensorySubtitle",
    questions: [
      {
        id: "sensory_visual",
        textKey: "visualStimuli",
        type: "scale",
        min: 1,
        max: 5,
      },
      {
        id: "sensory_audio",
        textKey: "soundsNoise",
        type: "scale",
        min: 1,
        max: 5,
      },
      {
        id: "sensory_preferences",
        textKey: "sensoryAccommodations",
        type: "multi",
        optionKeys: ["dimLighting", "noiseCanceling", "fidgetTools", "weightedBlanket", "visualSchedules", "quietSpace"],
        options: ["Dim lighting", "Noise-canceling headphones", "Fidget tools", "Weighted blanket", "Visual schedules", "Quiet space"],
      },
    ],
  },
  {
    titleKey: "learningStyle",
    descriptionKey: "learningStyleSubtitle",
    questions: [
      {
        id: "learn_style",
        textKey: "howLearnsBest",
        type: "single",
        optionKeys: ["visualLearning", "auditoryLearning", "kinestheticLearning", "readingWriting", "combinationLearning"],
        options: ["Visual (pictures, videos)", "Auditory (listening, songs)", "Kinesthetic (hands-on, movement)", "Reading/writing", "Combination"],
      },
      {
        id: "learn_attention",
        textKey: "focusDuration",
        type: "single",
        optionKeys: ["lessThan5Min", "fiveToTenMin", "tenToTwentyMin", "twentyToThirtyMin", "thirtyPlusMin"],
        options: ["Less than 5 minutes", "5-10 minutes", "10-20 minutes", "20-30 minutes", "30+ minutes"],
      },
    ],
  },
  {
    titleKey: "interestsMotivators",
    descriptionKey: "interestsSubtitle",
    questions: [
      {
        id: "interests",
        textKey: "topicInterests",
        type: "multi",
        optionKeys: ["animals", "spaceScience", "artMusic", "numbersMath", "storiesReading", "vehicles", "nature", "technology", "sports"],
        options: ["Animals", "Space & science", "Art & music", "Numbers & math", "Stories & reading", "Vehicles", "Nature", "Technology", "Sports"],
      },
      {
        id: "motivators",
        textKey: "motivationStyle",
        type: "single",
        optionKeys: ["praiseEncouragement", "earningRewards", "completingCollections", "competitionChallenges", "freeChoiceTime"],
        options: ["Praise and encouragement", "Earning rewards/tokens", "Completing collections", "Competition/challenges", "Free choice time"],
      },
    ],
  },
];

export default function ParentAssessmentPage() {
  const router = useRouter();
  const t = useTranslations("onboarding");
  const activeLearner = useLearnerStore((s) => s.activeLearner);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeLearner) {
      router.replace("/add-child");
    }
  }, [activeLearner, router]);

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
      if (!activeLearner?.id) {
        router.replace("/add-child");
        return;
      }
      await assessmentApiFetch(API_ROUTES.ONBOARDING.PARENT_ASSESSMENT, {
        method: "POST",
        body: JSON.stringify({
          learnerId: activeLearner?.id,
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

  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mx-auto mb-4">
          <ClipboardList className="text-[#7C3AED]" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("parentAssessment")}
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          {t("parentAssessmentSubtitle")}
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
            {t(step.titleKey)}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {t(step.descriptionKey)}
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
                  {t(q.textKey)}
                </p>

                {q.type === "single" && q.options && q.optionKeys && (
                  <div className="space-y-2">
                    {q.options.map((option, idx) => (
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
                          {t(q.optionKeys![idx])}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {q.type === "multi" && q.options && q.optionKeys && (
                  <div className="flex flex-wrap gap-2">
                    {q.options.map((option, idx) => {
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
                          {t(q.optionKeys![idx])}
                        </button>
                      );
                    })}
                  </div>
                )}

                {q.type === "scale" && (
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400">{t("lowSensitivity")}</span>
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
                    <span className="text-xs text-gray-400">{t("highSensitivity")}</span>
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

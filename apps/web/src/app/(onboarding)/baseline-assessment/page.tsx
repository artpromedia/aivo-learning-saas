"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ChevronRight, Loader2, Rocket, Eye, Zap, Star, Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
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

const SUBJECT_THEMES: Record<string, { color: string; bgColor: string; emoji: string }> = {
  math: { color: "#7C3AED", bgColor: "#F0E6FF", emoji: "🔢" },
  reading: { color: "#F472B6", bgColor: "#FCE7F3", emoji: "📖" },
  science: { color: "#2DD4BF", bgColor: "#CCFBF1", emoji: "🔬" },
  writing: { color: "#F59E0B", bgColor: "#FEF3C7", emoji: "✏️" },
  default: { color: "#7C3AED", bgColor: "#F0E6FF", emoji: "🧠" },
};

function getSubjectTheme(subject: string) {
  const lower = subject.toLowerCase();
  if (lower.includes("math")) return SUBJECT_THEMES.math;
  if (lower.includes("read") || lower.includes("ela") || lower.includes("english")) return SUBJECT_THEMES.reading;
  if (lower.includes("sci")) return SUBJECT_THEMES.science;
  if (lower.includes("writ")) return SUBJECT_THEMES.writing;
  return SUBJECT_THEMES.default;
}

const ENCOURAGEMENTS = ["🌟", "⚡", "🎯", "💫", "✨", "🔥"];

function MiniConfetti() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 1.5 }}
      className="absolute inset-0 pointer-events-none overflow-hidden"
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: ["#7C3AED", "#2DD4BF", "#F59E0B", "#F472B6", "#10B981", "#EF4444"][i % 6],
            left: `${50 + (Math.random() - 0.5) * 60}%`,
            top: "50%",
          }}
          initial={{ scale: 0 }}
          animate={{
            scale: [0, 1, 0],
            y: [0, -80 - Math.random() * 60],
            x: [(Math.random() - 0.5) * 100],
            rotate: [0, 360],
          }}
          transition={{ duration: 0.8 + Math.random() * 0.4, delay: i * 0.03 }}
        />
      ))}
    </motion.div>
  );
}

function StreakBadge({ count }: { count: number }) {
  const t = useTranslations("onboarding");
  if (count < 2) return null;
  return (
    <motion.div
      initial={{ scale: 0, y: -10 }}
      animate={{ scale: 1, y: 0 }}
      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
      style={{ background: "linear-gradient(135deg, #F59E0B, #F97316)", color: "#fff" }}
    >
      <Zap size={12} fill="currentColor" /> {t("streakCount", { count: String(count) })}
    </motion.div>
  );
}

function XpPopup({ xp }: { xp: number }) {
  const t = useTranslations("onboarding");
  return (
    <motion.div
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: [0, 1, 1, 0], y: -40 }}
      transition={{ duration: 1.2 }}
      className="absolute top-0 right-4 text-sm font-extrabold z-20"
      style={{ color: "#7C3AED" }}
    >
      {t("xpReward", { xp: String(xp) })}
    </motion.div>
  );
}

function DifficultyStars({ level }: { level: number }) {
  const maxStars = 5;
  const filled = Math.min(level, maxStars);
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: maxStars }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={i < filled ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}
          fill={i < filled ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
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
  const [streak, setStreak] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [showXpPopup, setShowXpPopup] = useState(false);
  const [lastXpGain, setLastXpGain] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

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
    if (!learnerId) {
      router.replace("/add-child");
      return;
    }
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

      if (result.correct) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        const xpGain = 10 + (newStreak >= 3 ? 5 : 0) + (question.difficulty >= 3 ? 5 : 0);
        setLastXpGain(xpGain);
        setTotalXp((prev) => prev + xpGain);
        setShowXpPopup(true);
        setShowConfetti(true);
        setTimeout(() => { setShowXpPopup(false); setShowConfetti(false); }, 1500);
      } else {
        setStreak(0);
      }

      if (result.breakConfig && result.breakConfig.frequencyQuestions > 0) {
        setBreakConfig(result.breakConfig);
      }

      setTimeout(() => {
        setFeedback(null);
        setSelectedAnswer(null);

        if (result.isComplete) {
          handleComplete();
        } else if (result.shouldBreak && result.nextQuestion) {
          pendingNextQuestion.current = result.nextQuestion;
          setBreakType(result.suggestedBreakType ?? pickBreakType());
          setShowBreak(true);
        } else if (result.nextQuestion) {
          setQuestion(result.nextQuestion);
        }
      }, 1800);
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
        <p className="text-[var(--aivo-text-secondary)]">{t("preparingAssessment")}</p>
      </div>
    );
  }

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-yellow-400/30"
        >
          <Trophy className="text-white" size={40} />
        </motion.div>
        <h1 className="text-3xl font-extrabold text-[var(--aivo-text)] mb-2">
          {t("assessmentComplete")}
        </h1>
        <p className="text-[var(--aivo-text-secondary)] mb-4 max-w-md mx-auto">
          {t("greatJob", { name: activeLearner?.name ? `, ${activeLearner.name}` : "" })}
        </p>

        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="rounded-2xl px-4 py-2 text-center" style={{ backgroundColor: "#F0E6FF" }}>
            <div className="text-2xl font-extrabold" style={{ color: "#7C3AED" }}>{questionsAnswered}</div>
            <div className="text-xs font-bold" style={{ color: "#7C3AED" }}>{t("questionsComplete", { count: "" })}</div>
          </div>
          <div className="rounded-2xl px-4 py-2 text-center" style={{ backgroundColor: "#FEF3C7" }}>
            <div className="text-2xl font-extrabold" style={{ color: "#F59E0B" }}>{totalXp}</div>
            <div className="text-xs font-bold" style={{ color: "#F59E0B" }}>{t("xp")}</div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-[#FFE0E0] dark:bg-[#991B1B]/10 border border-[#FECACA] dark:border-[#991B1B]/30 text-[#991B1B] dark:text-[#F87171] text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {userIsLearner ? (
            <>
              <Button size="lg" onClick={() => router.push("/learner")} rightIcon={<Rocket size={18} />} className="min-w-[200px]">
                {t("goToMyDashboard")}
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push("/brain-profile-reveal")} rightIcon={<Eye size={18} />}>
                {t("viewBrainProfile")}
              </Button>
            </>
          ) : (
            <>
              <Button size="lg" onClick={() => router.push("/brain-profile-reveal")} rightIcon={<Eye size={18} />} className="min-w-[200px]">
                {t("viewBrainProfile")}
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push("/learner")} rightIcon={<Rocket size={18} />}>
                {t("goToLearnerDashboard")}
              </Button>
            </>
          )}
        </div>
      </motion.div>
    );
  }

  const subjectTheme = question ? getSubjectTheme(question.subject) : SUBJECT_THEMES.default;

  return (
    <div>
      <div className="text-center mb-6">
        <motion.div
          key={question?.subject}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: subjectTheme.bgColor }}
        >
          <Brain style={{ color: subjectTheme.color }} size={32} />
        </motion.div>
        <h1 className="text-2xl font-extrabold text-[var(--aivo-text)]">
          {t("baselineAssessment")}
        </h1>
        <p className="mt-1 text-sm text-[var(--aivo-text-secondary)]">
          {t("baselineDescription", { name: activeLearner?.name ?? "" })}
        </p>
      </div>

      <div className="relative mb-4">
        <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: "#F0E6FF" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(135deg, ${subjectTheme.color}, ${subjectTheme.color}88)` }}
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        {[25, 50, 75].map((milestone) => (
          <div
            key={milestone}
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[8px]"
            style={{
              left: `${milestone}%`,
              transform: "translate(-50%, -50%)",
              backgroundColor: progress >= milestone ? subjectTheme.color : "#E8DDF0",
              color: progress >= milestone ? "#fff" : "transparent",
            }}
          >
            {progress >= milestone ? "★" : ""}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold" style={{ color: "var(--aivo-text-secondary)" }}>
            {t("questionsAnswered", { count: questionsAnswered })}
          </span>
          <StreakBadge count={streak} />
        </div>
        {question && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: subjectTheme.bgColor, color: subjectTheme.color }}>
              {subjectTheme.emoji} {question.subject}
            </span>
            <DifficultyStars level={question.difficulty} />
          </div>
        )}
      </div>

      {totalXp > 0 && (
        <div className="flex items-center justify-end gap-1 mb-3">
          <Zap size={14} className="text-yellow-500" fill="currentColor" />
          <span className="text-sm font-extrabold" style={{ color: "#F59E0B" }}>{totalXp} {t("xp")}</span>
        </div>
      )}

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
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="relative"
          >
            {showConfetti && <MiniConfetti />}
            {showXpPopup && <XpPopup xp={lastXpGain} />}

            <Card>
              <CardBody>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: subjectTheme.bgColor }}>
                    {subjectTheme.emoji}
                  </div>
                  <DifficultyStars level={question.difficulty} />
                </div>

                {question.imageUrl && (
                  <div className="mb-4 rounded-2xl overflow-hidden" style={{ backgroundColor: subjectTheme.bgColor }}>
                    <img
                      src={question.imageUrl}
                      alt={t("questionVisual")}
                      className="w-full h-48 object-contain"
                    />
                  </div>
                )}

                <p className="text-lg font-bold text-[var(--aivo-text)] mb-6">
                  {question.prompt}
                </p>

                <AnimatePresence>
                  {feedback && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`mb-4 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 ${
                        feedback.correct
                          ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-2 border-green-200 dark:border-green-800"
                          : "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-2 border-orange-200 dark:border-orange-800"
                      }`}
                    >
                      <span className="text-2xl">{feedback.correct ? "🎉" : "💪"}</span>
                      <span>{feedback.text}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {question.type === "multiple_choice" && question.options && (
                  <div className="space-y-3">
                    {question.options.map((option, oi) => {
                      const selected = selectedAnswer === option;
                      return (
                        <motion.button
                          key={option}
                          type="button"
                          disabled={!!feedback}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: oi * 0.05 }}
                          whileTap={!feedback ? { scale: 0.98 } : undefined}
                          onClick={() => setSelectedAnswer(option)}
                          className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                            feedback ? "opacity-75 cursor-not-allowed" : "cursor-pointer"
                          }`}
                          style={
                            selected
                              ? { borderColor: subjectTheme.color, backgroundColor: `${subjectTheme.color}08`, boxShadow: `0 2px 12px ${subjectTheme.color}20` }
                              : { borderColor: "var(--aivo-border)" }
                          }
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0"
                              style={
                                selected
                                  ? { backgroundColor: subjectTheme.color, color: "#fff" }
                                  : { backgroundColor: subjectTheme.bgColor, color: subjectTheme.color }
                              }
                            >
                              {String.fromCharCode(65 + oi)}
                            </span>
                            <span className="text-sm font-medium text-[var(--aivo-text)]">{option}</span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {question.type === "fill_blank" && (
                  <input
                    type="text"
                    value={selectedAnswer ?? ""}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    disabled={!!feedback}
                    className="w-full px-4 py-3 rounded-2xl border-2 text-lg font-medium focus:outline-none transition-all"
                    style={{ borderColor: "var(--aivo-border)", backgroundColor: "var(--aivo-bg)", color: "var(--aivo-text)" }}
                    placeholder={t("typeAnswer")}
                    onFocus={(e) => { e.currentTarget.style.borderColor = subjectTheme.color; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "var(--aivo-border)"; }}
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
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

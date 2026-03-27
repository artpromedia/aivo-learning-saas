"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, ThumbsUp, ThumbsDown, MessageSquarePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useBrain } from "@/hooks/useBrain";
import { useLearnerStore } from "@/stores/learner.store";

type RevealPhase = "intro" | "revealing" | "revealed";

export default function BrainProfileRevealPage() {
  const router = useRouter();
  const activeLearner = useLearnerStore((s) => s.activeLearner);
  const {
    profile,
    isLoading,
    error,
    approve,
    decline,
    addInsights,
    isApproving,
    isDeclining,
  } = useBrain(activeLearner?.id);

  const [phase, setPhase] = useState<RevealPhase>("intro");
  const [insightText, setInsightText] = useState("");
  const [showInsightInput, setShowInsightInput] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (profile && phase === "intro") {
      const timer = setTimeout(() => setPhase("revealing"), 1500);
      return () => clearTimeout(timer);
    }
  }, [profile, phase]);

  useEffect(() => {
    if (phase === "revealing") {
      const timer = setTimeout(() => setPhase("revealed"), 2500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const handleApprove = async () => {
    setActionError(null);
    try {
      await approve();
      router.push("/complete");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to approve");
    }
  };

  const handleDecline = async () => {
    setActionError(null);
    try {
      await decline();
      router.push("/complete");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to decline");
    }
  };

  const handleAddInsights = async () => {
    if (!insightText.trim()) return;
    setActionError(null);
    try {
      await addInsights({ text: insightText });
      setInsightText("");
      setShowInsightInput(false);
      router.push("/complete");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to add insights");
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <Loader2 className="mx-auto mb-4 text-[#7C3AED] animate-spin" size={48} />
        <p className="text-gray-500 dark:text-gray-400">
          Building {activeLearner?.name ? `${activeLearner.name}'s` : "your child's"} brain profile...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
          <Brain className="text-red-500" size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Unable to load brain profile
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {error.message}
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-16"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#7C4DFF] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#7C3AED]/30"
            >
              <Brain className="text-white" size={48} />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Analyzing learning profile...
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Our AI is building a personalized brain profile for{" "}
              {activeLearner?.name ?? "your child"}.
            </p>
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
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#38B2AC] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#7C3AED]/30"
            >
              <Sparkles className="text-white" size={48} />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Profile ready!
            </h1>
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
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#7C4DFF] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#7C3AED]/20">
                <Brain className="text-white" size={40} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {activeLearner?.name ? `${activeLearner.name}'s` : "Your Child's"}{" "}
                Brain Profile
              </h1>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Here&apos;s what we&apos;ve discovered about how{" "}
                {activeLearner?.name ?? "your child"} learns best.
              </p>
            </div>

            {actionError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                {actionError}
              </div>
            )}

            <div className="space-y-4">
              <Card>
                <CardBody>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Functioning Level
                    </h3>
                    <Badge>
                      {profile.functioningLevel === "level1"
                        ? "Level 1 - High Independence"
                        : profile.functioningLevel === "level2"
                          ? "Level 2 - Moderate Support"
                          : "Level 3 - Substantial Support"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Learning style: {profile.learningStyle}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Communication: {profile.communicationStyle}
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Strengths
                  </h3>
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
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Growth Areas
                  </h3>
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
                </CardBody>
              </Card>

              {profile.sensoryPreferences.length > 0 && (
                <Card>
                  <CardBody>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Sensory Preferences
                    </h3>
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
                  </CardBody>
                </Card>
              )}
            </div>

            {showInsightInput && (
              <Card className="mt-4">
                <CardBody>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Add Your Insights
                  </h3>
                  <textarea
                    value={insightText}
                    onChange={(e) => setInsightText(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none resize-none"
                    placeholder="Share anything else about your child that would help us personalize their learning..."
                  />
                  <div className="flex justify-end gap-2 mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowInsightInput(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAddInsights}
                      disabled={!insightText.trim()}
                    >
                      Submit & Continue
                    </Button>
                  </div>
                </CardBody>
              </Card>
            )}

            <div className="flex items-center justify-center gap-3 mt-8">
              <Button
                variant="outline"
                onClick={handleDecline}
                loading={isDeclining}
                leftIcon={<ThumbsDown size={18} />}
              >
                Decline
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowInsightInput(true)}
                leftIcon={<MessageSquarePlus size={18} />}
                disabled={showInsightInput}
              >
                Add Insights
              </Button>
              <Button
                onClick={handleApprove}
                loading={isApproving}
                leftIcon={<ThumbsUp size={18} />}
              >
                Approve Profile
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

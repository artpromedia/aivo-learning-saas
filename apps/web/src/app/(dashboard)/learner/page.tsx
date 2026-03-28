"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  BookOpen,
  Bot,
  Compass,
  Flame,
  Trophy,
  Loader2,
  ChevronRight,
  Clock,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { apiFetch } from "@/lib/api";
import { useLearnerStore } from "@/stores/learner.store";
import { useEngagement } from "@/hooks/useEngagement";

interface LearningActivity {
  id: string;
  title: string;
  subject: string;
  type: "lesson" | "quest" | "practice" | "homework";
  estimatedMinutes: number;
  difficulty: "easy" | "medium" | "hard";
  thumbnailUrl?: string;
  progress: number;
}

export default function LearnerHomePage() {
  const t = useTranslations("dashboard");
  const activeLearner = useLearnerStore((s) => s.activeLearner);
  const { xp, streak, level, isLoading: engLoading } = useEngagement(activeLearner?.id);

  const [activities, setActivities] = useState<LearningActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeLearner?.id) return;

    async function fetchActivities() {
      try {
        const data = await apiFetch<LearningActivity[]>(
          `/api/learners/${activeLearner!.id}/recommended-activities`,
        );
        setActivities(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("failedToLoadActivities"));
      } finally {
        setLoading(false);
      }
    }

    fetchActivities();
  }, [activeLearner]);

  const typeIcons: Record<string, React.ReactNode> = {
    lesson: <BookOpen size={18} />,
    quest: <Compass size={18} />,
    practice: <Sparkles size={18} />,
    homework: <BookOpen size={18} />,
  };

  const difficultyColors: Record<string, string> = {
    easy: "success",
    medium: "warning",
    hard: "error",
  };

  return (
    <div>
      <PurpleGradientHeader className="rounded-xl mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {t("heyName", { name: activeLearner?.name ?? "Learner" })}
            </h1>
            <p className="mt-1 text-white/80">
              {t("readyToLearn")}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="flex items-center gap-1">
                <Trophy size={16} />
                <span className="font-bold">{xp?.totalXp ?? 0}</span>
              </div>
              <span className="text-xs text-white/70">{t("xp")}</span>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1">
                <Flame size={16} />
                <span className="font-bold">{streak?.currentStreak ?? 0}</span>
              </div>
              <span className="text-xs text-white/70">{t("streak")}</span>
            </div>
          </div>
        </div>
      </PurpleGradientHeader>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <Link href="/learner/quests">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardBody className="flex flex-col items-center justify-center text-center py-5">
              <Compass className="text-[#7C3AED] mb-1" size={24} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("questsLabel")}
              </span>
            </CardBody>
          </Card>
        </Link>
        <Link href="/learner/tutors">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardBody className="flex flex-col items-center justify-center text-center py-5">
              <Bot className="text-[#7C3AED] mb-1" size={24} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("tutors")}
              </span>
            </CardBody>
          </Card>
        </Link>
        <Link href="/learner/homework">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardBody className="flex flex-col items-center justify-center text-center py-5">
              <BookOpen className="text-[#7C3AED] mb-1" size={24} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("homework")}
              </span>
            </CardBody>
          </Card>
        </Link>
      </div>

      {/* Today's Activities */}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {t("todaysLearningPath")}
      </h2>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={120} className="w-full rounded-lg" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <Sparkles className="mx-auto mb-3 text-[#7C3AED]" size={40} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t("allCaughtUp")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {t("noActivitiesScheduled")}
            </p>
            <Link href="/learner/quests">
              <Button>{t("exploreQuests")}</Button>
            </Link>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <Link
              key={activity.id}
              href={
                activity.type === "quest"
                  ? "/learner/quests"
                  : `/learner/learn/${activity.id}`
              }
            >
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardBody>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center shrink-0 text-[#7C3AED]">
                      {typeIcons[activity.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {activity.title}
                        </h3>
                        <Badge variant="secondary">{activity.subject}</Badge>
                        <Badge
                          variant={
                            difficultyColors[activity.difficulty] as
                              | "success"
                              | "warning"
                              | "error"
                          }
                        >
                          {activity.difficulty}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {activity.estimatedMinutes} min
                        </span>
                        <span className="capitalize">{activity.type}</span>
                      </div>
                      {activity.progress > 0 && (
                        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#7C3AED] to-[#7C4DFF] rounded-full"
                            style={{ width: `${activity.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <ChevronRight
                      className="text-gray-400 group-hover:text-[#7C3AED] transition-colors shrink-0 mt-2"
                      size={20}
                    />
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

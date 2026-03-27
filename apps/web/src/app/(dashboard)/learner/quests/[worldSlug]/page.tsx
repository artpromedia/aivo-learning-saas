"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Compass,
  Loader2,
  RefreshCw,
  Lock,
  CheckCircle,
  Play,
  Star,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { apiFetch } from "@/lib/api";
import { useLearnerStore } from "@/stores/learner.store";

interface QuestChapter {
  id: string;
  order: number;
  title: string;
  description: string;
  status: "locked" | "available" | "in_progress" | "completed";
  xpReward: number;
  lessonsCount: number;
  completedLessons: number;
}

interface QuestWorldDetail {
  id: string;
  slug: string;
  name: string;
  description: string;
  theme: string;
  chapters: QuestChapter[];
}

export default function QuestWorldPage() {
  const params = useParams();
  const worldSlug = params.worldSlug as string;
  const activeLearner = useLearnerStore((s) => s.activeLearner);

  const [world, setWorld] = useState<QuestWorldDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeLearner?.id) return;

    async function fetchWorld() {
      try {
        const data = await apiFetch<QuestWorldDetail>(
          `/api/learners/${activeLearner!.id}/quests/${worldSlug}`,
        );
        setWorld(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load quest world",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchWorld();
  }, [activeLearner, worldSlug]);

  const statusConfig: Record<
    string,
    { icon: React.ReactNode; badge: string; variant: "default" | "success" | "warning" | "secondary" }
  > = {
    locked: {
      icon: <Lock size={20} className="text-gray-400" />,
      badge: "Locked",
      variant: "secondary",
    },
    available: {
      icon: <Play size={20} className="text-[#7C3AED]" />,
      badge: "Ready",
      variant: "default",
    },
    in_progress: {
      icon: <Play size={20} className="text-orange-500" />,
      badge: "In Progress",
      variant: "warning",
    },
    completed: {
      icon: <CheckCircle size={20} className="text-green-500" />,
      badge: "Complete",
      variant: "success",
    },
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={80} className="w-full rounded-xl" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} height={100} className="w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">{error}</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          leftIcon={<RefreshCw size={16} />}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/learner/quests"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-4"
      >
        <ArrowLeft size={16} />
        Back to Quest Worlds
      </Link>

      <PurpleGradientHeader className="rounded-xl mb-8">
        <div className="flex items-center gap-3">
          <Compass size={32} />
          <div>
            <h1 className="text-2xl font-bold">{world?.name}</h1>
            <p className="text-white/80 text-sm">{world?.description}</p>
          </div>
        </div>
      </PurpleGradientHeader>

      {/* Chapter Path */}
      <div className="relative">
        {/* Vertical line connecting chapters */}
        <div className="absolute left-[27px] top-8 bottom-8 w-0.5 bg-gray-200 dark:bg-gray-700" />

        <div className="space-y-4">
          {world?.chapters.map((chapter) => {
            const config = statusConfig[chapter.status];
            const progress =
              chapter.lessonsCount > 0
                ? (chapter.completedLessons / chapter.lessonsCount) * 100
                : 0;
            const isPlayable =
              chapter.status === "available" ||
              chapter.status === "in_progress";

            const content = (
              <Card
                className={`relative ${
                  isPlayable
                    ? "hover:shadow-lg transition-shadow cursor-pointer"
                    : chapter.status === "locked"
                      ? "opacity-50"
                      : ""
                }`}
              >
                <CardBody className="flex items-start gap-4">
                  <div className="relative z-10 w-14 h-14 rounded-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0">
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-semibold text-gray-400 uppercase">
                        Chapter {chapter.order}
                      </span>
                      <Badge variant={config.variant}>{config.badge}</Badge>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {chapter.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {chapter.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        {chapter.completedLessons}/{chapter.lessonsCount} lessons
                      </span>
                      <span className="flex items-center gap-1 text-[#7C3AED]">
                        <Star size={12} />
                        {chapter.xpReward} XP
                      </span>
                    </div>
                    {chapter.status !== "locked" && (
                      <div className="mt-2 w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#7C3AED] to-[#7C4DFF] rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            );

            if (isPlayable) {
              return (
                <Link
                  key={chapter.id}
                  href={`/learner/learn/${chapter.id}`}
                >
                  {content}
                </Link>
              );
            }

            return <div key={chapter.id}>{content}</div>;
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Brain, BookOpen, Trophy, ChevronRight, Loader2 } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton, SkeletonAvatar } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface LearnerSummary {
  id: string;
  name: string;
  avatarUrl?: string;
  functioningLevel: "level1" | "level2" | "level3";
  currentStreak: number;
  totalXp: number;
  level: number;
  lastActiveAt: string;
  todayProgress: number;
}

export default function ParentDashboardPage() {
  const { user } = useAuth();
  const [learners, setLearners] = useState<LearnerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLearners() {
      try {
        const data = await apiFetch<LearnerSummary[]>(API_ROUTES.LEARNER.LIST);
        setLearners(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load learners");
      } finally {
        setLoading(false);
      }
    }

    fetchLearners();
  }, []);

  const levelLabel = (fl: string) => {
    switch (fl) {
      case "level1":
        return "Level 1";
      case "level2":
        return "Level 2";
      case "level3":
        return "Level 3";
      default:
        return fl;
    }
  };

  return (
    <div>
      <PurpleGradientHeader className="rounded-xl mb-8">
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.name?.split(" ")[0] ?? "Parent"}
        </h1>
        <p className="mt-1 text-white/80">
          Here&apos;s how your children are doing today.
        </p>
      </PurpleGradientHeader>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Your Children
        </h2>
        <Link href="/add-child">
          <Button size="sm" leftIcon={<Plus size={16} />}>
            Add Child
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardBody className="flex items-center gap-4">
                <SkeletonAvatar size={56} />
                <div className="flex-1 space-y-2">
                  <Skeleton height={18} className="w-32" />
                  <Skeleton height={14} className="w-48" />
                  <Skeleton height={14} className="w-24" />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : learners.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mx-auto mb-4">
              <Plus className="text-[#7C3AED]" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No children added yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Add your first child to start their personalized learning journey.
            </p>
            <Link href="/add-child">
              <Button leftIcon={<Plus size={18} />}>Add Your First Child</Button>
            </Link>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {learners.map((learner) => (
            <Link key={learner.id} href={`/parent/${learner.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardBody>
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#7C4DFF] flex items-center justify-center text-white text-xl font-bold shrink-0">
                      {learner.avatarUrl ? (
                        <img
                          src={learner.avatarUrl}
                          alt={learner.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        learner.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {learner.name}
                        </h3>
                        <Badge variant="default">{levelLabel(learner.functioningLevel)}</Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mt-3">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-[#7C3AED]">
                            <Trophy size={14} />
                            <span className="text-sm font-bold">{learner.totalXp}</span>
                          </div>
                          <span className="text-xs text-gray-500">XP</span>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-orange-500">
                            <span className="text-sm">🔥</span>
                            <span className="text-sm font-bold">{learner.currentStreak}</span>
                          </div>
                          <span className="text-xs text-gray-500">Streak</span>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-[#38B2AC]">
                            <BookOpen size={14} />
                            <span className="text-sm font-bold">Lv.{learner.level}</span>
                          </div>
                          <span className="text-xs text-gray-500">Level</span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Today&apos;s progress</span>
                          <span>{learner.todayProgress}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#7C3AED] to-[#7C4DFF] rounded-full transition-all"
                            style={{ width: `${learner.todayProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <ChevronRight
                      className="text-gray-400 group-hover:text-[#7C3AED] transition-colors shrink-0 mt-1"
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

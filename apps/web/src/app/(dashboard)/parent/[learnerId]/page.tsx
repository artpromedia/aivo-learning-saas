"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Brain,
  Lightbulb,
  BookOpen,
  GraduationCap,
  Bot,
  TrendingUp,
  Trophy,
  Flame,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { useEngagement } from "@/hooks/useEngagement";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface LearnerDetail {
  id: string;
  name: string;
  avatarUrl?: string;
  functioningLevel: "STANDARD" | "SUPPORTED" | "LOW_VERBAL" | "NON_VERBAL" | "PRE_SYMBOLIC";
  dateOfBirth: string;
  enrolledGrade?: string;
}

interface ProgressData {
  overallMastery: number;
  sessionsThisWeek: number;
  averageAccuracy: number;
  recentSubjects: { name: string; mastery: number }[];
}

export default function ChildDashboardPage() {
  const params = useParams();
  const learnerId = params.learnerId as string;

  const [learner, setLearner] = useState<LearnerDetail | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { xp, streak, level, isLoading: engagementLoading } = useEngagement(learnerId);

  useEffect(() => {
    async function fetchData() {
      try {
        const [learnerRes, progressData] = await Promise.all([
          apiFetch<{ learner: LearnerDetail }>(API_ROUTES.LEARNER.DETAIL(learnerId)),
          apiFetch<ProgressData>(API_ROUTES.LEARNER.PROGRESS(learnerId)).catch(() => null),
        ]);
        setLearner(learnerRes.learner);
        setProgress(progressData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [learnerId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={120} className="w-full rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
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
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  const quickLinks = [
    { href: `/parent/${learnerId}/brain`, label: "Brain Profile", icon: <Brain size={20} />, color: "text-[#7C3AED]" },
    { href: `/parent/${learnerId}/recommendations`, label: "Recommendations", icon: <Lightbulb size={20} />, color: "text-amber-500" },
    { href: `/parent/${learnerId}/gradebook`, label: "Gradebook", icon: <GraduationCap size={20} />, color: "text-[#38B2AC]" },
    { href: `/parent/${learnerId}/tutors`, label: "Tutors", icon: <Bot size={20} />, color: "text-blue-500" },
  ];

  return (
    <div>
      <Link
        href="/parent"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-4"
      >
        <ArrowLeft size={16} />
        Back to all children
      </Link>

      <PurpleGradientHeader className="rounded-xl mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
            {learner?.avatarUrl ? (
              <img
                src={learner.avatarUrl}
                alt={learner.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              learner?.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{learner?.name}</h1>
            <p className="text-white/80 text-sm">
              {learner?.enrolledGrade ?? "Grade not set"} &middot;{" "}
              {learner?.functioningLevel === "STANDARD"
                ? "Standard"
                : learner?.functioningLevel === "SUPPORTED"
                  ? "Supported"
                  : learner?.functioningLevel === "LOW_VERBAL"
                    ? "Low Verbal"
                    : learner?.functioningLevel === "NON_VERBAL"
                      ? "Non-Verbal"
                      : "Pre-Symbolic"}
            </p>
          </div>
        </div>
      </PurpleGradientHeader>

      {/* Stats cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardBody className="text-center">
            <Trophy className="mx-auto mb-2 text-[#7C3AED]" size={24} />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {xp?.totalXp ?? "--"}
            </p>
            <p className="text-xs text-gray-500">Total XP</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <Flame className="mx-auto mb-2 text-orange-500" size={24} />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {streak?.currentStreak ?? "--"}
            </p>
            <p className="text-xs text-gray-500">Day Streak</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <TrendingUp className="mx-auto mb-2 text-[#38B2AC]" size={24} />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {progress?.averageAccuracy ?? "--"}%
            </p>
            <p className="text-xs text-gray-500">Accuracy</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <BookOpen className="mx-auto mb-2 text-blue-500" size={24} />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {progress?.sessionsThisWeek ?? "--"}
            </p>
            <p className="text-xs text-gray-500">Sessions This Week</p>
          </CardBody>
        </Card>
      </div>

      {/* Quick links */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-8">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardBody className="flex flex-col items-center justify-center text-center py-6">
                <div className={`mb-2 ${link.color}`}>{link.icon}</div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {link.label}
                </span>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      {/* Subject mastery */}
      {progress?.recentSubjects && progress.recentSubjects.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Subject Mastery
            </h3>
          </CardHeader>
          <CardBody className="space-y-4">
            {progress.recentSubjects.map((subject) => (
              <div key={subject.name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {subject.name}
                  </span>
                  <span className="text-sm font-semibold text-[#7C3AED]">
                    {subject.mastery}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#7C3AED] to-[#7C4DFF] rounded-full transition-all duration-700"
                    style={{ width: `${subject.mastery}%` }}
                  />
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Swords, Loader2, RefreshCw, Users, Clock, Trophy, Zap } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { apiFetch } from "@/lib/api";
import { useLearnerStore } from "@/stores/learner.store";

interface Challenge {
  id: string;
  title: string;
  subject: string;
  type: "1v1" | "team" | "global";
  status: "open" | "in_progress" | "completed";
  participants: number;
  maxParticipants: number;
  startsAt: string;
  duration: number;
  xpReward: number;
  difficulty: "easy" | "medium" | "hard";
}

export default function ChallengesPage() {
  const t = useTranslations("dashboard");
  const activeLearner = useLearnerStore((s) => s.activeLearner);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeLearner?.id) return;

    async function fetchChallenges() {
      try {
        const data = await apiFetch<Challenge[]>(
          `/api/learners/${activeLearner!.id}/challenges`,
        );
        setChallenges(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("failedToLoadChallenges"));
      } finally {
        setLoading(false);
      }
    }

    fetchChallenges();
  }, [activeLearner]);

  const handleJoin = async (challengeId: string) => {
    if (!activeLearner?.id) return;
    setJoiningId(challengeId);
    try {
      await apiFetch(
        `/api/learners/${activeLearner.id}/challenges/${challengeId}/join`,
        { method: "POST" },
      );
      setChallenges((prev) =>
        prev.map((c) =>
          c.id === challengeId
            ? { ...c, status: "in_progress" as const, participants: c.participants + 1 }
            : c,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToJoinChallenge"));
    } finally {
      setJoiningId(null);
    }
  };

  const typeLabels: Record<string, string> = {
    "1v1": t("oneVsOne"),
    team: t("teamBattle"),
    global: t("global"),
  };

  const difficultyVariant: Record<string, "success" | "warning" | "error"> = {
    easy: "success",
    medium: "warning",
    hard: "error",
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={80} className="w-full rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={180} className="w-full rounded-lg" />
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

  const openChallenges = challenges.filter((c) => c.status === "open");
  const activeChallenges = challenges.filter((c) => c.status === "in_progress");
  const completedChallenges = challenges.filter((c) => c.status === "completed");

  return (
    <div>
      <PurpleGradientHeader className="rounded-xl mb-8">
        <div className="flex items-center gap-3">
          <Swords size={32} />
          <div>
            <h1 className="text-2xl font-bold">{t("challenges")}</h1>
            <p className="text-white/80 text-sm">
              {t("challengesDescription")}
            </p>
          </div>
        </div>
      </PurpleGradientHeader>

      {challenges.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <Swords className="mx-auto mb-3 text-gray-400" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No challenges available
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Check back soon for new multiplayer challenges.
            </p>
          </CardBody>
        </Card>
      ) : (
        <>
          {activeChallenges.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Active Challenges
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {activeChallenges.map((c) => (
                  <Card key={c.id} className="border-[#7C3AED] border-2">
                    <CardBody>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {c.title}
                        </h3>
                        <Badge variant="warning">In Progress</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          {c.participants}/{c.maxParticipants}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {c.duration}min
                        </span>
                        <Badge variant={difficultyVariant[c.difficulty]}>
                          {c.difficulty}
                        </Badge>
                      </div>
                      <Button size="sm" className="w-full">
                        Continue
                      </Button>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {openChallenges.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Open Challenges ({openChallenges.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {openChallenges.map((c) => (
                  <Card key={c.id} className="hover:shadow-md transition-shadow">
                    <CardBody>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {c.title}
                        </h3>
                        <Badge variant="secondary">{typeLabels[c.type]}</Badge>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        {c.subject}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          {c.participants}/{c.maxParticipants}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {c.duration}min
                        </span>
                        <span className="flex items-center gap-1 text-[#7C3AED]">
                          <Zap size={12} />
                          +{c.xpReward} XP
                        </span>
                        <Badge variant={difficultyVariant[c.difficulty]}>
                          {c.difficulty}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        className="w-full"
                        loading={joiningId === c.id}
                        onClick={() => handleJoin(c.id)}
                      >
                        Join Challenge
                      </Button>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {completedChallenges.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Completed
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {completedChallenges.map((c) => (
                  <Card key={c.id} className="opacity-75">
                    <CardBody className="flex items-center gap-3">
                      <Trophy className="text-yellow-500 shrink-0" size={20} />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {c.title}
                        </h3>
                        <span className="text-xs text-gray-500">{c.subject}</span>
                      </div>
                      <Badge variant="success">+{c.xpReward} XP</Badge>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

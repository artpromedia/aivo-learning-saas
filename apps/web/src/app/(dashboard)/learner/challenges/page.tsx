"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Swords, RefreshCw, Users, Clock, Trophy, Zap } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, BackLink, ExpandableCard, EmptyState, AnimatedCard } from "@/components/ui/PageDesign";
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
        const data = await apiFetch<Challenge[]>(`/api/learners/${activeLearner!.id}/challenges`);
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
      await apiFetch(`/api/learners/${activeLearner.id}/challenges/${challengeId}/join`, { method: "POST" });
      setChallenges((prev) =>
        prev.map((c) => c.id === challengeId ? { ...c, status: "in_progress" as const, participants: c.participants + 1 } : c)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToJoinChallenge"));
    } finally {
      setJoiningId(null);
    }
  };

  const typeLabels: Record<string, string> = { "1v1": t("oneVsOne"), team: t("teamBattle"), global: t("global") };
  const difficultyVariant: Record<string, "success" | "warning" | "error"> = { easy: "success", medium: "warning", hard: "error" };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={80} className="w-full rounded-3xl" />
        <div className="grid gap-4 sm:grid-cols-2">{[1, 2, 3, 4].map((i) => (<Skeleton key={i} height={180} className="w-full rounded-3xl" />))}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()} leftIcon={<RefreshCw size={16} />}>Retry</Button>
      </div>
    );
  }

  const openChallenges = challenges.filter((c) => c.status === "open");
  const activeChallenges = challenges.filter((c) => c.status === "in_progress");
  const completedChallenges = challenges.filter((c) => c.status === "completed");

  return (
    <PageWrapper>
      <BackLink href="/learner">{t("backToHome", { defaultValue: "Back to Home" })}</BackLink>

      <PurpleGradientHeader className="rounded-3xl mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
            <Swords size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{t("challenges")}</h1>
            <p className="text-white/80 text-sm">Compete with friends and earn bonus XP!</p>
          </div>
        </div>
      </PurpleGradientHeader>

      {challenges.length === 0 ? (
        <EmptyState
          icon={<Swords size={32} />}
          title="No challenges available"
          description="Check back soon for new multiplayer challenges."
          delay={200}
        />
      ) : (
        <>
          {activeChallenges.length > 0 && (
            <ExpandableCard
              icon={<Swords size={16} />}
              title="Active Challenges"
              subtitle="Challenges you're currently competing in"
              gradient="linear-gradient(135deg, #7C3AED, #A855F7)"
              delay={200}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {activeChallenges.map((c) => (
                  <div key={c.id} className="p-4 rounded-3xl border-2" style={{ borderColor: "#7C3AED", backgroundColor: "var(--aivo-bg)" }}>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-bold" style={{ color: "var(--aivo-text)" }}>{c.title}</h3>
                      <Badge variant="warning">In Progress</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs mb-3" style={{ color: "var(--aivo-text-secondary)" }}>
                      <span className="flex items-center gap-1"><Users size={12} /> {c.participants}/{c.maxParticipants}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {c.duration}min</span>
                      <Badge variant={difficultyVariant[c.difficulty]}>{c.difficulty}</Badge>
                    </div>
                    <Button size="sm" className="w-full">Continue</Button>
                  </div>
                ))}
              </div>
            </ExpandableCard>
          )}

          {openChallenges.length > 0 && (
            <div className={activeChallenges.length > 0 ? "mt-6" : ""}>
              <ExpandableCard
                icon={<Zap size={16} />}
                title={`Open Challenges (${openChallenges.length})`}
                subtitle="Join a challenge and compete!"
                gradient="linear-gradient(135deg, #2DD4BF, #14B8A6)"
                delay={300}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  {openChallenges.map((c, idx) => (
                    <AnimatedCard key={c.id} delay={400 + idx * 80}>
                      <div className="p-4 rounded-3xl" style={{ backgroundColor: "var(--aivo-bg)", border: "1px solid var(--aivo-border)" }}>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-bold" style={{ color: "var(--aivo-text)" }}>{c.title}</h3>
                          <Badge variant="secondary">{typeLabels[c.type]}</Badge>
                        </div>
                        <p className="text-sm mb-3" style={{ color: "var(--aivo-text-secondary)" }}>{c.subject}</p>
                        <div className="flex items-center gap-3 text-xs mb-4" style={{ color: "var(--aivo-text-secondary)" }}>
                          <span className="flex items-center gap-1"><Users size={12} /> {c.participants}/{c.maxParticipants}</span>
                          <span className="flex items-center gap-1"><Clock size={12} /> {c.duration}min</span>
                          <span className="flex items-center gap-1" style={{ color: "#7C3AED" }}><Zap size={12} /> +{c.xpReward} XP</span>
                          <Badge variant={difficultyVariant[c.difficulty]}>{c.difficulty}</Badge>
                        </div>
                        <Button size="sm" className="w-full" loading={joiningId === c.id} onClick={() => handleJoin(c.id)}>Join Challenge</Button>
                      </div>
                    </AnimatedCard>
                  ))}
                </div>
              </ExpandableCard>
            </div>
          )}

          {completedChallenges.length > 0 && (
            <div className="mt-6">
              <ExpandableCard
                icon={<Trophy size={16} />}
                title="Completed"
                subtitle="Your finished challenges"
                gradient="linear-gradient(135deg, #FBBF24, #F59E0B)"
                delay={400}
                defaultExpanded={false}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  {completedChallenges.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl opacity-75" style={{ backgroundColor: "var(--aivo-bg)", border: "1px solid var(--aivo-border)" }}>
                      <Trophy className="text-yellow-500 shrink-0" size={20} />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate" style={{ color: "var(--aivo-text)" }}>{c.title}</h3>
                        <span className="text-xs" style={{ color: "var(--aivo-text-secondary)" }}>{c.subject}</span>
                      </div>
                      <Badge variant="success">+{c.xpReward} XP</Badge>
                    </div>
                  ))}
                </div>
              </ExpandableCard>
            </div>
          )}
        </>
      )}
    </PageWrapper>
  );
}

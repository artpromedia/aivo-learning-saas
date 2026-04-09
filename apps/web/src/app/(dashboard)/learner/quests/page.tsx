"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Compass, RefreshCw, Lock, Star, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, BackLink, EmptyState, AnimatedCard } from "@/components/ui/PageDesign";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import { useLearnerStore } from "@/stores/learner.store";

interface QuestWorld {
  id: string;
  slug: string;
  name: string;
  description: string;
  theme: string;
  color: string;
  iconUrl?: string;
  totalChapters: number;
  completedChapters: number;
  isLocked: boolean;
  requiredLevel: number;
  xpReward: number;
}

const WORLD_GRADIENTS = [
  "linear-gradient(135deg, #7C3AED, #6366F1)",
  "linear-gradient(135deg, #2DD4BF, #06B6D4)",
  "linear-gradient(135deg, #FB923C, #EF4444)",
  "linear-gradient(135deg, #10B981, #059669)",
  "linear-gradient(135deg, #F472B6, #E11D48)",
];

export default function QuestsPage() {
  const t = useTranslations("dashboard");
  const activeLearner = useLearnerStore((s) => s.activeLearner);
  const [worlds, setWorlds] = useState<QuestWorld[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeLearner?.id) return;

    async function fetchWorlds() {
      try {
        const data = await apiFetch<QuestWorld[]>(
          API_ROUTES.QUEST.WORLDS(activeLearner!.id),
        );
        setWorlds(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("failedToLoadQuests"));
      } finally {
        setLoading(false);
      }
    }

    fetchWorlds();
  }, [activeLearner]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={80} className="w-full rounded-3xl" />
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={180} className="w-full rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()} leftIcon={<RefreshCw size={16} />}>
          {t("retry")}
        </Button>
      </div>
    );
  }

  return (
    <PageWrapper>
      <BackLink href="/learner">{t("backToHome")}</BackLink>

      <PurpleGradientHeader className="rounded-3xl mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
            <Compass size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{t("questWorlds")}</h1>
            <p className="text-white/80 text-sm">Explore worlds and complete quests to earn XP!</p>
          </div>
        </div>
      </PurpleGradientHeader>

      {worlds.length === 0 ? (
        <EmptyState
          icon={<Compass size={32} />}
          title={t("noQuestsAvailable")}
          description={t("questsWillBeUnlocked")}
          delay={200}
        />
      ) : (
        <div className="space-y-4">
          {worlds.map((world, idx) => {
            const progress = world.totalChapters > 0 ? (world.completedChapters / world.totalChapters) * 100 : 0;
            const gradient = WORLD_GRADIENTS[idx % WORLD_GRADIENTS.length];

            return (
              <AnimatedCard key={world.id} delay={200 + idx * 100}>
                {world.isLocked ? (
                  <Card className="opacity-60">
                    <CardBody>
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-3xl flex items-center justify-center shrink-0 text-white" style={{ background: gradient }}>
                          <Lock size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold" style={{ color: "var(--aivo-text)" }}>{world.name}</h3>
                          <p className="text-sm" style={{ color: "var(--aivo-text-secondary)" }}>
                            {t("requiresLevel", { level: world.requiredLevel })}
                          </p>
                        </div>
                        <Badge variant="secondary">{t("locked")}</Badge>
                      </div>
                    </CardBody>
                  </Card>
                ) : (
                  <Link href={`/learner/quests/${world.slug}`}>
                    <Card className="hover:shadow-[var(--shadow-hover)] transition-all cursor-pointer group overflow-hidden hover:scale-[1.01]">
                      <div className="h-2" style={{ background: gradient }} />
                      <CardBody>
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-3xl flex items-center justify-center shrink-0 shadow-lg text-white" style={{ background: gradient }}>
                            {world.iconUrl ? (
                              <img src={world.iconUrl} alt={world.name} className="w-9 h-9" />
                            ) : (
                              <Compass size={24} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold" style={{ color: "var(--aivo-text)" }}>{world.name}</h3>
                              <Badge>{world.theme}</Badge>
                            </div>
                            <p className="text-sm mb-3" style={{ color: "var(--aivo-text-secondary)" }}>{world.description}</p>
                            <div className="flex items-center justify-between text-xs mb-1" style={{ color: "var(--aivo-text-secondary)" }}>
                              <span>{world.completedChapters}/{world.totalChapters} {t("chapters")}</span>
                              <span className="flex items-center gap-1" style={{ color: "#7C3AED" }}>
                                <Star size={12} />
                                {world.xpReward} XP
                              </span>
                            </div>
                            <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--aivo-purple-50)" }}>
                              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: gradient }} />
                            </div>
                          </div>
                          <ChevronRight className="shrink-0 mt-2 transition-all group-hover:translate-x-1" size={20} style={{ color: "var(--aivo-text-muted)" }} />
                        </div>
                      </CardBody>
                    </Card>
                  </Link>
                )}
              </AnimatedCard>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
}

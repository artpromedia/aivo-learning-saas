"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Compass, Loader2, RefreshCw, Lock, Star, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
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
  "from-purple-500 to-indigo-600",
  "from-teal-500 to-cyan-600",
  "from-orange-500 to-red-600",
  "from-green-500 to-emerald-600",
  "from-pink-500 to-rose-600",
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
        <Skeleton height={80} className="w-full rounded-xl" />
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={180} className="w-full rounded-xl" />
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
          {t("retry")}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <PurpleGradientHeader className="rounded-xl mb-8">
        <div className="flex items-center gap-3">
          <Compass size={32} />
          <div>
            <h1 className="text-2xl font-bold">{t("questWorlds")}</h1>
            <p className="text-white/80 text-sm">
              {t("questWorldsDescription")}
            </p>
          </div>
        </div>
      </PurpleGradientHeader>

      {worlds.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <Compass className="mx-auto mb-3 text-gray-400" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t("noQuestsAvailable")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t("questsWillBeUnlocked")}
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-6">
          {worlds.map((world, idx) => {
            const progress =
              world.totalChapters > 0
                ? (world.completedChapters / world.totalChapters) * 100
                : 0;

            return (
              <div key={world.id}>
                {world.isLocked ? (
                  <Card className="opacity-60">
                    <CardBody>
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${WORLD_GRADIENTS[idx % WORLD_GRADIENTS.length]} flex items-center justify-center shrink-0`}
                        >
                          <Lock className="text-white" size={28} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {world.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t("requiresLevel", { level: world.requiredLevel })}
                          </p>
                        </div>
                        <Badge variant="secondary">{t("locked")}</Badge>
                      </div>
                    </CardBody>
                  </Card>
                ) : (
                  <Link href={`/learner/quests/${world.slug}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer group overflow-hidden">
                      <div
                        className={`h-2 bg-gradient-to-r ${WORLD_GRADIENTS[idx % WORLD_GRADIENTS.length]}`}
                      />
                      <CardBody>
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${WORLD_GRADIENTS[idx % WORLD_GRADIENTS.length]} flex items-center justify-center shrink-0 shadow-lg`}
                          >
                            {world.iconUrl ? (
                              <img
                                src={world.iconUrl}
                                alt={world.name}
                                className="w-10 h-10"
                              />
                            ) : (
                              <Compass className="text-white" size={28} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {world.name}
                              </h3>
                              <Badge>{world.theme}</Badge>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                              {world.description}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                              <span>
                                {world.completedChapters}/{world.totalChapters}{" "}
                                chapters
                              </span>
                              <span className="flex items-center gap-1 text-[#7C3AED]">
                                <Star size={12} />
                                {world.xpReward} XP
                              </span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full bg-gradient-to-r ${WORLD_GRADIENTS[idx % WORLD_GRADIENTS.length]} transition-all duration-700`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                          <ChevronRight
                            className="text-gray-400 group-hover:text-[#7C3AED] transition-colors shrink-0 mt-2"
                            size={20}
                          />
                        </div>
                      </CardBody>
                    </Card>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

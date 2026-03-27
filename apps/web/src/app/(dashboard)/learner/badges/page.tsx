"use client";

import React from "react";
import { Trophy, Loader2, RefreshCw } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { useEngagement, type BadgeData } from "@/hooks/useEngagement";
import { useLearnerStore } from "@/stores/learner.store";

const CATEGORY_ICONS: Record<string, string> = {
  streak: "fire",
  mastery: "star",
  social: "users",
  exploration: "compass",
  achievement: "trophy",
};

export default function BadgesPage() {
  const activeLearner = useLearnerStore((s) => s.activeLearner);
  const { badges, isLoading, error } = useEngagement(activeLearner?.id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton height={80} className="w-full rounded-xl" />
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} height={180} className="w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">{error.message}</p>
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

  const categories = Array.from(new Set(badges.map((b) => b.category)));

  return (
    <div>
      <PurpleGradientHeader className="rounded-xl mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy size={32} />
            <div>
              <h1 className="text-2xl font-bold">Badge Collection</h1>
              <p className="text-white/80 text-sm">
                {badges.length} badge{badges.length !== 1 ? "s" : ""} earned so
                far. Keep learning to unlock more!
              </p>
            </div>
          </div>
        </div>
      </PurpleGradientHeader>

      {badges.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <Trophy className="mx-auto mb-3 text-gray-400" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No badges yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Complete lessons, maintain streaks, and explore to earn badges.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-8">
          {categories.map((category) => {
            const categoryBadges = badges.filter(
              (b) => b.category === category,
            );
            return (
              <div key={category}>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 capitalize">
                  {category} ({categoryBadges.length})
                </h2>
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                  {categoryBadges.map((badge) => (
                    <Card
                      key={badge.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardBody className="text-center py-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#7C4DFF] flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#7C3AED]/20 overflow-hidden">
                          {badge.iconUrl ? (
                            <img
                              src={badge.iconUrl}
                              alt={badge.name}
                              className="w-10 h-10"
                            />
                          ) : (
                            <Trophy className="text-white" size={24} />
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                          {badge.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                          {badge.description}
                        </p>
                        <p className="text-xs text-[#7C3AED] font-medium">
                          Earned{" "}
                          {new Date(badge.earnedAt).toLocaleDateString()}
                        </p>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

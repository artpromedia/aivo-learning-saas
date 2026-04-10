"use client";

import React from "react";
import { Trophy, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, BackLink, ExpandableCard, EmptyState, AnimatedCard } from "@/components/ui/PageDesign";
import { useEngagement } from "@/hooks/useEngagement";
import { useLearnerStore } from "@/stores/learner.store";

const CATEGORY_GRADIENTS: Record<string, string> = {
  streak: "linear-gradient(135deg, #FB923C, #F97316)",
  mastery: "linear-gradient(135deg, #FBBF24, #F59E0B)",
  social: "linear-gradient(135deg, #2DD4BF, #14B8A6)",
  exploration: "linear-gradient(135deg, #3B82F6, #2563EB)",
  achievement: "linear-gradient(135deg, #7C3AED, #A855F7)",
};

export default function BadgesPage() {
  const t = useTranslations("dashboard");
  const activeLearner = useLearnerStore((s) => s.activeLearner);
  const { badges, isLoading, error } = useEngagement(activeLearner?.id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton height={80} className="w-full rounded-3xl" />
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} height={180} className="w-full rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">{error.message}</p>
        <Button variant="outline" onClick={() => window.location.reload()} leftIcon={<RefreshCw size={16} />}>
          {t("retry")}
        </Button>
      </div>
    );
  }

  const categories = Array.from(new Set(badges.map((b) => b.category)));

  return (
    <PageWrapper>
      <BackLink href="/learner">{t("backToHome", { defaultValue: "Back to Home" })}</BackLink>

      <PurpleGradientHeader className="rounded-3xl mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
            <Trophy size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{t("badgeCollection")}</h1>
            <p className="text-white/80 text-sm">
              {t("badgesEarned", { count: badges.length })}
            </p>
          </div>
        </div>
      </PurpleGradientHeader>

      {badges.length === 0 ? (
        <EmptyState
          icon={<Trophy size={32} />}
          title={t("noBadgesYet")}
          description={t("earnBadgesDescription")}
          delay={200}
        />
      ) : (
        <div className="space-y-6">
          {categories.map((category, catIdx) => {
            const categoryBadges = badges.filter((b) => b.category === category);
            const gradient = CATEGORY_GRADIENTS[category] ?? CATEGORY_GRADIENTS.achievement;

            return (
              <ExpandableCard
                key={category}
                icon={<Trophy size={16} />}
                title={t("badgeCategoryTitle", { category: category.charAt(0).toUpperCase() + category.slice(1) })}
                subtitle={t("badgeCategoryCount", { count: categoryBadges.length })}
                gradient={gradient}
                delay={200 + catIdx * 100}
              >
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                  {categoryBadges.map((badge, idx) => (
                    <AnimatedCard key={badge.id} delay={300 + catIdx * 100 + idx * 60}>
                      <Card className="hover:shadow-[var(--shadow-card)] transition-all hover:scale-[1.03]">
                        <CardBody className="text-center py-5">
                          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#7C3AED]/20 overflow-hidden text-white" style={{ background: gradient }}>
                            {badge.iconUrl ? (
                              <img src={badge.iconUrl} alt={badge.name} className="w-9 h-9" />
                            ) : (
                              <Trophy size={22} />
                            )}
                          </div>
                          <h3 className="font-bold text-sm mb-0.5" style={{ color: "var(--aivo-text)" }}>{badge.name}</h3>
                          <p className="text-xs line-clamp-2 mb-1.5" style={{ color: "var(--aivo-text-secondary)" }}>{badge.description}</p>
                          <p className="text-xs font-medium" style={{ color: "#7C3AED" }}>
                            {t("badgeEarnedDate", { date: new Date(badge.earnedAt).toLocaleDateString() })}
                          </p>
                        </CardBody>
                      </Card>
                    </AnimatedCard>
                  ))}
                </div>
              </ExpandableCard>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
}

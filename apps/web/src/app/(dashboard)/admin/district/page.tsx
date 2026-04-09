"use client";

import React, { useEffect, useState } from "react";
import { Users, Brain, Target, FileText, Bot } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, StatCard, ExpandableCard, AnimatedCard } from "@/components/ui/PageDesign";
import { useAuthStore } from "@/stores/auth.store";
import { apiFetch } from "@/lib/api";

interface DistrictOverview {
  totalLearners: number;
  activeBrains: number;
  avgMasteryPercent: number;
  iepCoveragePercent: number;
  activeTutors: number;
  functioningLevelDistribution: {
    level1: number;
    level2: number;
    level3: number;
  };
}

export default function DistrictOverviewPage() {
  const t = useTranslations("dashboard");
  const { user } = useAuthStore();
  const [data, setData] = useState<DistrictOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOverview() {
      try {
        const res = await apiFetch<DistrictOverview>("/api/admin/analytics/overview");
        setData(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("failedToLoadOverview"));
      } finally {
        setLoading(false);
      }
    }
    fetchOverview();
  }, []);

  const totalLevels = data?.functioningLevelDistribution
    ? data.functioningLevelDistribution.level1 +
      data.functioningLevelDistribution.level2 +
      data.functioningLevelDistribution.level3
    : 0;

  function levelPercent(count: number) {
    return totalLevels > 0 ? Math.round((count / totalLevels) * 100) : 0;
  }

  return (
    <PageWrapper>
      <PurpleGradientHeader className="rounded-3xl mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
            <Brain size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{t("districtDashboard")}</h1>
            <p className="mt-0.5 text-white/80 text-sm">
              {t("adminWelcomeBack", { name: user?.name?.split(" ")[0] ?? "Admin" })}
            </p>
          </div>
        </div>
      </PurpleGradientHeader>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-[#FFE0E0] dark:bg-[#991B1B]/10 border border-[#FECACA] dark:border-[#991B1B]/30 text-[#991B1B] dark:text-[#F87171]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardBody className="flex items-center gap-4">
                <Skeleton width={48} height={48} rounded="lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton height={14} className="w-24" />
                  <Skeleton height={24} className="w-16" />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : data ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard icon={<Users size={18} />} label={t("totalLearners")} value={data.totalLearners ?? 0} color="#7C3AED" delay={100} />
            <StatCard icon={<Brain size={18} />} label={t("activeBrains")} value={data.activeBrains ?? 0} color="#A855F7" delay={200} />
            <StatCard icon={<Target size={18} />} label={t("avgMastery")} value={`${data.avgMasteryPercent ?? 0}%`} color="#10B981" delay={300} />
            <StatCard icon={<FileText size={18} />} label={t("iepCoverage")} value={`${data.iepCoveragePercent ?? 0}%`} color="#3B82F6" delay={400} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ExpandableCard
              icon={<Target size={16} />}
              title={t("functioningLevelDist")}
              subtitle="Distribution of learners across functioning levels"
              gradient="linear-gradient(135deg, #7C3AED, #A855F7)"
              delay={500}
              infoText="This chart shows how learners are distributed across the three functioning levels in your district."
            >
              <div className="space-y-4">
                {[
                  { label: t("level1"), count: data.functioningLevelDistribution?.level1 ?? 0, color: "#7C3AED" },
                  { label: t("level2"), count: data.functioningLevelDistribution?.level2 ?? 0, color: "#8B5CF6" },
                  { label: t("level3"), count: data.functioningLevelDistribution?.level3 ?? 0, color: "#A78BFA" },
                ].map((level) => (
                  <div key={level.label}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span style={{ color: "var(--aivo-text)" }}>{level.label}</span>
                      <span className="font-medium" style={{ color: "var(--aivo-text)" }}>
                        {level.count} ({levelPercent(level.count)}%)
                      </span>
                    </div>
                    <div className="w-full h-4 bg-[#F0E6FF] dark:bg-[#3D2D5C] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${levelPercent(level.count)}%`,
                          backgroundColor: level.color,
                          animation: "aivo-bar-grow 0.8s ease-out forwards",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ExpandableCard>

            <AnimatedCard delay={600}>
              <Card className="h-full">
                <CardBody className="flex flex-col items-center justify-center text-center py-8">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 text-white" style={{ background: "linear-gradient(135deg, #7C3AED, #A855F7)" }}>
                    <Bot size={32} />
                  </div>
                  <p className="text-sm" style={{ color: "var(--aivo-text-secondary)" }}>{t("activeTutors")}</p>
                  <p className="text-4xl font-bold mt-1" style={{ color: "var(--aivo-text)" }}>
                    {data.activeTutors}
                  </p>
                  <p className="text-sm mt-2" style={{ color: "var(--aivo-text-secondary)" }}>
                    {t("activeTutorsDesc")}
                  </p>
                </CardBody>
              </Card>
            </AnimatedCard>
          </div>
        </>
      ) : null}
    </PageWrapper>
  );
}

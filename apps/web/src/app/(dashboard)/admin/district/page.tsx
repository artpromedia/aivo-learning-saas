"use client";

import React, { useEffect, useState } from "react";
import { Users, Brain, Target, FileText, Bot } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
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
        setError(err instanceof Error ? err.message : "Failed to load overview");
      } finally {
        setLoading(false);
      }
    }
    fetchOverview();
  }, []);

  const statCards = data
    ? [
        { label: "Total Learners", value: data.totalLearners, icon: <Users size={24} /> },
        { label: "Active Brains", value: data.activeBrains, icon: <Brain size={24} /> },
        { label: "Avg Mastery", value: `${data.avgMasteryPercent}%`, icon: <Target size={24} /> },
        { label: "IEP Coverage", value: `${data.iepCoveragePercent}%`, icon: <FileText size={24} /> },
      ]
    : [];

  const totalLevels = data
    ? data.functioningLevelDistribution.level1 +
      data.functioningLevelDistribution.level2 +
      data.functioningLevelDistribution.level3
    : 0;

  function levelPercent(count: number) {
    return totalLevels > 0 ? Math.round((count / totalLevels) * 100) : 0;
  }

  return (
    <div>
      <PurpleGradientHeader className="rounded-xl mb-8">
        <h1 className="text-2xl font-bold">District Dashboard</h1>
        <p className="mt-1 text-white/80">
          Welcome back, {user?.name?.split(" ")[0] ?? "Admin"}. Here is your district at a glance.
        </p>
      </PurpleGradientHeader>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {statCards.map((stat) => (
              <Card key={stat.label}>
                <CardBody className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center text-[#7C3AED]">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardBody>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Functioning Level Distribution
                </h2>
                <div className="space-y-4">
                  {[
                    { label: "Level 1", count: data.functioningLevelDistribution.level1, color: "#7C3AED" },
                    { label: "Level 2", count: data.functioningLevelDistribution.level2, color: "#8B5CF6" },
                    { label: "Level 3", count: data.functioningLevelDistribution.level3, color: "#A78BFA" },
                  ].map((level) => (
                    <div key={level.label}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-300">{level.label}</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {level.count} ({levelPercent(level.count)}%)
                        </span>
                      </div>
                      <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${levelPercent(level.count)}%`,
                            backgroundColor: level.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="flex flex-col items-center justify-center text-center py-8">
                <div className="w-16 h-16 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mb-4">
                  <Bot className="text-[#7C3AED]" size={32} />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Tutors</p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white mt-1">
                  {data.activeTutors}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  AI tutors currently assigned across the district
                </p>
              </CardBody>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}

"use client";

import React from "react";
import { BarChart3, TrendingUp, Users, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, ExpandableCard, StatCard, AnimatedCard } from "@/components/ui/PageDesign";

export default function TeacherReportsPage() {
  const t = useTranslations("teacher");

  const mockReports = [
    { id: "r1", title: t("reportWeeklyMastery"), description: t("reportWeeklyMasteryDesc"), date: t("generatedWeekly"), type: "mastery" },
    { id: "r2", title: t("reportAtRiskAlerts"), description: t("reportAtRiskAlertsDesc"), date: t("updatedDaily"), type: "alert" },
    { id: "r3", title: t("reportSessionEngagement"), description: t("reportSessionEngagementDesc"), date: t("generatedWeekly"), type: "engagement" },
    { id: "r4", title: t("reportIepProgress"), description: t("reportIepProgressDesc"), date: t("generatedMonthly"), type: "iep" },
  ];

  return (
    <PageWrapper>
      <PurpleGradientHeader className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
            <BarChart3 size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{t("reportsTitle")}</h1>
            <p className="text-white/80 text-sm">{t("reportsSubtitle")}</p>
          </div>
        </div>
      </PurpleGradientHeader>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard icon={<BarChart3 size={18} />} label={t("reportsLabel")} value={mockReports.length} color="#7C3AED" delay={100} />
        <StatCard icon={<TrendingUp size={18} />} label={t("avgMasteryLabel")} value="70%" color="#10B981" delay={200} />
        <StatCard icon={<Users size={18} />} label={t("learnersLabel")} value={46} color="#3B82F6" delay={300} />
        <StatCard icon={<AlertTriangle size={18} />} label={t("atRiskLabel")} value={7} color="#F59E0B" delay={400} />
      </div>

      <ExpandableCard
        icon={<BarChart3 size={16} />}
        title={t("availableReports")}
        subtitle={t("availableReportsDesc")}
        gradient="linear-gradient(135deg, #2DD4BF, #14B8A6)"
        delay={500}
        infoText={t("availableReportsInfo")}
      >
        <div className="space-y-3">
          {mockReports.map((report, idx) => (
            <AnimatedCard key={report.id} delay={600 + idx * 80}>
              <div className="flex items-center gap-4 p-4 rounded-xl cursor-pointer hover:scale-[1.01] transition-all" style={{ backgroundColor: "var(--aivo-bg)", border: "1px solid var(--aivo-border)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{
                  background: report.type === "alert"
                    ? "linear-gradient(135deg, #F59E0B, #D97706)"
                    : report.type === "mastery"
                    ? "linear-gradient(135deg, #7C3AED, #A855F7)"
                    : report.type === "engagement"
                    ? "linear-gradient(135deg, #3B82F6, #2563EB)"
                    : "linear-gradient(135deg, #10B981, #059669)",
                }}>
                  {report.type === "alert" ? <AlertTriangle size={18} /> : <BarChart3 size={18} />}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm" style={{ color: "var(--aivo-text)" }}>{report.title}</h3>
                  <p className="text-xs mt-0.5" style={{ color: "var(--aivo-text-secondary)" }}>{report.description}</p>
                  <span className="text-[10px] mt-1 inline-block" style={{ color: "var(--aivo-text-muted)" }}>{report.date}</span>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </ExpandableCard>
    </PageWrapper>
  );
}

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { UserPlus, Trash2, Users, X, School, Target } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, BackLink, ExpandableCard, EmptyState, AnimatedCard } from "@/components/ui/PageDesign";
import { apiFetch } from "@/lib/api";

interface Learner {
  id: string;
  name: string;
  functioningLevel: string;
  enrolledGrade: string;
}

interface ClassroomDetail {
  id: string;
  name: string;
  teacherName: string;
  gradeBand: string;
  learners: Learner[];
  functioningLevelBreakdown: {
    level1: number;
    level2: number;
    level3: number;
  };
}

export default function ClassroomDetailPage() {
  const t = useTranslations("districtAdmin");
  const params = useParams();
  const classroomId = params.id as string;

  const [data, setData] = useState<ClassroomDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddLearner, setShowAddLearner] = useState(false);
  const [learnerName, setLearnerName] = useState("");
  const [learnerLevel, setLearnerLevel] = useState("level1");
  const [learnerGrade, setLearnerGrade] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchClassroom = useCallback(async () => {
    try {
      const res = await apiFetch<ClassroomDetail>(
        `/api/admin/classrooms/${classroomId}/analytics`
      );
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToLoadClassroom"));
    } finally {
      setLoading(false);
    }
  }, [classroomId]);

  useEffect(() => {
    fetchClassroom();
  }, [fetchClassroom]);

  async function handleAddLearner(e: React.FormEvent) {
    e.preventDefault();
    if (!learnerName.trim() || !learnerGrade.trim()) return;

    setAdding(true);
    setAddError(null);

    try {
      await apiFetch(`/api/admin/classrooms/${classroomId}/learners`, {
        method: "POST",
        body: JSON.stringify({
          name: learnerName.trim(),
          functioningLevel: learnerLevel,
          enrolledGrade: learnerGrade.trim(),
        }),
      });
      setLearnerName("");
      setLearnerGrade("");
      setLearnerLevel("level1");
      setShowAddLearner(false);
      await fetchClassroom();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : t("failedToAddLearner"));
    } finally {
      setAdding(false);
    }
  }

  async function handleRemoveLearner(learnerId: string) {
    setRemovingId(learnerId);
    try {
      await apiFetch(`/api/admin/classrooms/${classroomId}/learners/${learnerId}`, {
        method: "DELETE",
      });
      await fetchClassroom();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToRemoveLearner"));
    } finally {
      setRemovingId(null);
    }
  }

  const totalLevels = data?.functioningLevelBreakdown
    ? data.functioningLevelBreakdown.level1 +
      data.functioningLevelBreakdown.level2 +
      data.functioningLevelBreakdown.level3
    : 0;

  function levelPercent(count: number) {
    return totalLevels > 0 ? Math.round((count / totalLevels) * 100) : 0;
  }

  const levelLabel = (fl: string) => {
    switch (fl) {
      case "level1": return t("level1");
      case "level2": return t("level2");
      case "level3": return t("level3");
      default: return fl;
    }
  };

  const levelVariant = (fl: string): "default" | "success" | "warning" => {
    switch (fl) {
      case "level1": return "default";
      case "level2": return "success";
      case "level3": return "warning";
      default: return "default";
    }
  };

  return (
    <PageWrapper>
      <BackLink href="/admin/district/classrooms">{t("backToClassrooms")}</BackLink>

      {loading ? (
        <>
          <div className="mb-8">
            <Skeleton height={120} className="w-full rounded-3xl" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={56} className="w-full rounded-3xl" />
            ))}
          </div>
        </>
      ) : error ? (
        <div className="p-4 rounded-3xl bg-[#FFE0E0] dark:bg-[#991B1B]/10 border border-[#FECACA] dark:border-[#991B1B]/30 text-[#991B1B] dark:text-[#F87171]">
          {error}
        </div>
      ) : data ? (
        <>
          <PurpleGradientHeader className="rounded-3xl mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
                <School size={22} />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold">{data.name}</h1>
                <div className="flex flex-wrap items-center gap-4 mt-1 text-white/80 text-sm">
                  <span>{t("teacherLabel", { name: data.teacherName })}</span>
                  <span>{t("gradeBandValue", { band: data.gradeBand })}</span>
                  <span>{t("learnersCount", { count: data.learners.length })}</span>
                </div>
              </div>
            </div>
          </PurpleGradientHeader>

          <div className="grid gap-6 lg:grid-cols-3 mb-8">
            <ExpandableCard
              icon={<Target size={16} />}
              title={t("functioningLevelBreakdown")}
              subtitle={t("distributionAcrossLevels")}
              gradient="linear-gradient(135deg, #7C3AED, #A855F7)"
              delay={100}
            >
              <div className="space-y-4">
                {[
                  { label: t("level1"), count: data.functioningLevelBreakdown?.level1 ?? 0, color: "#7C3AED" },
                  { label: t("level2"), count: data.functioningLevelBreakdown?.level2 ?? 0, color: "#8B5CF6" },
                  { label: t("level3"), count: data.functioningLevelBreakdown?.level3 ?? 0, color: "#A78BFA" },
                ].map((level) => (
                  <div key={level.label}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span style={{ color: "var(--aivo-text)" }}>{level.label}</span>
                      <span className="font-medium" style={{ color: "var(--aivo-text)" }}>
                        {level.count} ({levelPercent(level.count)}%)
                      </span>
                    </div>
                    <div className="w-full h-3 bg-[#F0E6FF] dark:bg-[#3D2D5C] rounded-full overflow-hidden">
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

            <div className="lg:col-span-2">
              <ExpandableCard
                icon={<Users size={16} />}
                title={t("learnerRoster")}
                subtitle={t("learnersEnrolled", { count: data.learners.length })}
                gradient="linear-gradient(135deg, #3B82F6, #2563EB)"
                delay={200}
              >
                <div className="flex justify-end mb-4">
                  <Button
                    size="sm"
                    leftIcon={<UserPlus size={16} />}
                    onClick={() => {
                      setShowAddLearner(!showAddLearner);
                      setAddError(null);
                    }}
                  >
                    {t("addLearner")}
                  </Button>
                </div>

                {showAddLearner && (
                  <div className="mb-4 p-4 border border-[#E8DDF0] dark:border-[#3D2D5C] rounded-3xl">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold" style={{ color: "var(--aivo-text)" }}>{t("addALearner")}</h3>
                      <button onClick={() => setShowAddLearner(false)} className="text-[#A89BB5] hover:text-[#7C3AED]">
                        <X size={16} />
                      </button>
                    </div>
                    <form onSubmit={handleAddLearner} className="space-y-3">
                      <input
                        type="text"
                        value={learnerName}
                        onChange={(e) => setLearnerName(e.target.value)}
                        placeholder={t("learnerNamePlaceholder")}
                        required
                        className="w-full px-3 py-2 text-sm border border-[#E8DDF0] dark:border-[#3D2D5C] rounded-3xl bg-white dark:bg-[#2A1E45] text-[var(--aivo-text)] placeholder-[#A89BB5] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
                      />
                      <div className="flex gap-3">
                        <select
                          value={learnerLevel}
                          onChange={(e) => setLearnerLevel(e.target.value)}
                          className="flex-1 px-3 py-2 text-sm border border-[#E8DDF0] dark:border-[#3D2D5C] rounded-3xl bg-white dark:bg-[#2A1E45] text-[var(--aivo-text)] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
                        >
                          <option value="level1">{t("level1")}</option>
                          <option value="level2">{t("level2")}</option>
                          <option value="level3">{t("level3")}</option>
                        </select>
                        <input
                          type="text"
                          value={learnerGrade}
                          onChange={(e) => setLearnerGrade(e.target.value)}
                          placeholder={t("enrolledGradePlaceholder")}
                          required
                          className="flex-1 px-3 py-2 text-sm border border-[#E8DDF0] dark:border-[#3D2D5C] rounded-3xl bg-white dark:bg-[#2A1E45] text-[var(--aivo-text)] placeholder-[#A89BB5] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" type="button" onClick={() => setShowAddLearner(false)}>{t("cancel")}</Button>
                        <Button type="submit" size="sm" loading={adding}>{t("add")}</Button>
                      </div>
                      {addError && <p className="text-sm text-red-600 dark:text-red-400">{addError}</p>}
                    </form>
                  </div>
                )}

                {data.learners.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: "var(--aivo-purple-50)", color: "var(--aivo-purple-500)" }}>
                      <Users size={24} />
                    </div>
                    <p style={{ color: "var(--aivo-text-secondary)" }}>{t("noLearnersInClassroom")}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#E8DDF0] dark:border-[#3D2D5C]">
                          <th className="text-left py-2 px-3 font-medium" style={{ color: "var(--aivo-text-secondary)" }}>{t("nameHeader")}</th>
                          <th className="text-left py-2 px-3 font-medium" style={{ color: "var(--aivo-text-secondary)" }}>{t("functioningLevelHeader")}</th>
                          <th className="text-left py-2 px-3 font-medium" style={{ color: "var(--aivo-text-secondary)" }}>{t("enrolledGradeHeader")}</th>
                          <th className="text-right py-2 px-3 font-medium" style={{ color: "var(--aivo-text-secondary)" }}>{t("actionsHeader")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.learners.map((learner) => (
                          <tr key={learner.id} className="border-b border-[#F0E6FF] dark:border-[#3D2D5C] last:border-0">
                            <td className="py-3 px-3 font-medium" style={{ color: "var(--aivo-text)" }}>{learner.name}</td>
                            <td className="py-3 px-3">
                              <Badge variant={levelVariant(learner.functioningLevel)}>
                                {levelLabel(learner.functioningLevel)}
                              </Badge>
                            </td>
                            <td className="py-3 px-3" style={{ color: "var(--aivo-text)" }}>{learner.enrolledGrade}</td>
                            <td className="py-3 px-3 text-right">
                              <Button
                                variant="destructive"
                                size="sm"
                                loading={removingId === learner.id}
                                leftIcon={<Trash2 size={14} />}
                                onClick={() => handleRemoveLearner(learner.id)}
                              >
                                {t("remove")}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </ExpandableCard>
            </div>
          </div>
        </>
      ) : null}
    </PageWrapper>
  );
}

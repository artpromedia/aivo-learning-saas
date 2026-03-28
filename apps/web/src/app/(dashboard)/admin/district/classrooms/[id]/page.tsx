"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, UserPlus, Trash2, Users, X } from "lucide-react";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
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
      setError(err instanceof Error ? err.message : "Failed to load classroom");
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
      setAddError(err instanceof Error ? err.message : "Failed to add learner");
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
      setError(err instanceof Error ? err.message : "Failed to remove learner");
    } finally {
      setRemovingId(null);
    }
  }

  const totalLevels = data
    ? data.functioningLevelBreakdown.level1 +
      data.functioningLevelBreakdown.level2 +
      data.functioningLevelBreakdown.level3
    : 0;

  function levelPercent(count: number) {
    return totalLevels > 0 ? Math.round((count / totalLevels) * 100) : 0;
  }

  const levelLabel = (fl: string) => {
    switch (fl) {
      case "level1": return "Level 1";
      case "level2": return "Level 2";
      case "level3": return "Level 3";
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
    <div>
      <div className="mb-4">
        <Link
          href="/admin/district/classrooms"
          className="inline-flex items-center gap-1 text-sm text-[#7C3AED] hover:underline"
        >
          <ArrowLeft size={16} />
          Back to Classrooms
        </Link>
      </div>

      {loading ? (
        <>
          <div className="mb-8">
            <Skeleton height={120} className="w-full" rounded="lg" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={56} className="w-full" rounded="lg" />
            ))}
          </div>
        </>
      ) : error ? (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
          {error}
        </div>
      ) : data ? (
        <>
          <PurpleGradientHeader className="rounded-xl mb-8">
            <h1 className="text-2xl font-bold">{data.name}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-white/80">
              <span>Teacher: {data.teacherName}</span>
              <span>Grade Band: {data.gradeBand}</span>
              <span>{data.learners.length} Learners</span>
            </div>
          </PurpleGradientHeader>

          <div className="grid gap-6 lg:grid-cols-3 mb-8">
            <Card className="lg:col-span-1">
              <CardBody>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Functioning Level Breakdown
                </h2>
                <div className="space-y-4">
                  {[
                    { label: "Level 1", count: data.functioningLevelBreakdown.level1, color: "#7C3AED" },
                    { label: "Level 2", count: data.functioningLevelBreakdown.level2, color: "#8B5CF6" },
                    { label: "Level 3", count: data.functioningLevelBreakdown.level3, color: "#A78BFA" },
                  ].map((level) => (
                    <div key={level.label}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-300">{level.label}</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {level.count} ({levelPercent(level.count)}%)
                        </span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
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

            <Card className="lg:col-span-2">
              <CardBody>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Learner Roster
                  </h2>
                  <Button
                    size="sm"
                    leftIcon={<UserPlus size={16} />}
                    onClick={() => {
                      setShowAddLearner(!showAddLearner);
                      setAddError(null);
                    }}
                  >
                    Add Learner
                  </Button>
                </div>

                {showAddLearner && (
                  <div className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Add a Learner
                      </h3>
                      <button
                        onClick={() => setShowAddLearner(false)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <form onSubmit={handleAddLearner} className="space-y-3">
                      <input
                        type="text"
                        value={learnerName}
                        onChange={(e) => setLearnerName(e.target.value)}
                        placeholder="Learner name"
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
                      />
                      <div className="flex gap-3">
                        <select
                          value={learnerLevel}
                          onChange={(e) => setLearnerLevel(e.target.value)}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
                        >
                          <option value="level1">Level 1</option>
                          <option value="level2">Level 2</option>
                          <option value="level3">Level 3</option>
                        </select>
                        <input
                          type="text"
                          value={learnerGrade}
                          onChange={(e) => setLearnerGrade(e.target.value)}
                          placeholder="Enrolled grade"
                          required
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          onClick={() => setShowAddLearner(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" size="sm" loading={adding}>
                          Add
                        </Button>
                      </div>
                      {addError && (
                        <p className="text-sm text-red-600 dark:text-red-400">{addError}</p>
                      )}
                    </form>
                  </div>
                )}

                {data.learners.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mx-auto mb-3">
                      <Users className="text-[#7C3AED]" size={24} />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">
                      No learners in this classroom yet.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
                            Name
                          </th>
                          <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
                            Functioning Level
                          </th>
                          <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
                            Enrolled Grade
                          </th>
                          <th className="text-right py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.learners.map((learner) => (
                          <tr
                            key={learner.id}
                            className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                          >
                            <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">
                              {learner.name}
                            </td>
                            <td className="py-3 px-3">
                              <Badge variant={levelVariant(learner.functioningLevel)}>
                                {levelLabel(learner.functioningLevel)}
                              </Badge>
                            </td>
                            <td className="py-3 px-3 text-gray-700 dark:text-gray-300">
                              {learner.enrolledGrade}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <Button
                                variant="destructive"
                                size="sm"
                                loading={removingId === learner.id}
                                leftIcon={<Trash2 size={14} />}
                                onClick={() => handleRemoveLearner(learner.id)}
                              >
                                Remove
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}

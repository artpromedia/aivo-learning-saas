"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, GraduationCap, Loader2, RefreshCw } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface SubjectMastery {
  subject: string;
  currentMastery: number;
  trend: "up" | "down" | "stable";
  history: { date: string; mastery: number }[];
}

interface GradebookData {
  subjects: SubjectMastery[];
  overallMastery: number;
  totalSessions: number;
}

const SUBJECT_COLORS = [
  "#7C3AED",
  "#38B2AC",
  "#F59E0B",
  "#EF4444",
  "#3B82F6",
  "#10B981",
  "#EC4899",
  "#8B5CF6",
];

export default function GradebookPage() {
  const params = useParams();
  const learnerId = params.learnerId as string;

  const [data, setData] = useState<GradebookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGradebook() {
      try {
        const result = await apiFetch<GradebookData>(
          API_ROUTES.GRADEBOOK.MASTERY(learnerId),
        );
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load gradebook");
      } finally {
        setLoading(false);
      }
    }

    fetchGradebook();
  }, [learnerId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={80} className="w-full rounded-xl" />
        <Skeleton height={300} className="w-full rounded-lg" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={100} className="w-full rounded-lg" />
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
          Retry
        </Button>
      </div>
    );
  }

  const chartSubjects = selectedSubject
    ? data?.subjects.filter((s) => s.subject === selectedSubject)
    : data?.subjects;

  const allDates = new Set<string>();
  data?.subjects.forEach((s) => s.history.forEach((h) => allDates.add(h.date)));
  const sortedDates = Array.from(allDates).sort();

  const chartData = sortedDates.map((date) => {
    const entry: Record<string, string | number> = { date };
    (chartSubjects ?? []).forEach((subject) => {
      const point = subject.history.find((h) => h.date === date);
      if (point) entry[subject.subject] = point.mastery;
    });
    return entry;
  });

  return (
    <div>
      <Link
        href={`/parent/${learnerId}`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-4"
      >
        <ArrowLeft size={16} />
        Back to dashboard
      </Link>

      <PurpleGradientHeader className="rounded-xl mb-8">
        <div className="flex items-center gap-3">
          <GraduationCap size={32} />
          <div>
            <h1 className="text-2xl font-bold">Gradebook</h1>
            <p className="text-white/80 text-sm">
              Track mastery progress across all subjects.
            </p>
          </div>
        </div>
      </PurpleGradientHeader>

      <div className="grid gap-4 grid-cols-2 mb-8">
        <Card>
          <CardBody className="text-center">
            <p className="text-3xl font-bold text-[#7C3AED]">
              {data?.overallMastery ?? 0}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Overall Mastery</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-3xl font-bold text-[#38B2AC]">
              {data?.totalSessions ?? 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total Sessions</p>
          </CardBody>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedSubject(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedSubject === null
              ? "bg-[#7C3AED] text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          All Subjects
        </button>
        {data?.subjects.map((s) => (
          <button
            key={s.subject}
            onClick={() => setSelectedSubject(s.subject)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedSubject === s.subject
                ? "bg-[#7C3AED] text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {s.subject}
          </button>
        ))}
      </div>

      <Card className="mb-8">
        <CardHeader>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Mastery Over Time
          </h3>
        </CardHeader>
        <CardBody>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v: string) =>
                    new Date(v).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                  }}
                />
                <Legend />
                {(chartSubjects ?? []).map((subject, idx) => (
                  <Line
                    key={subject.subject}
                    type="monotone"
                    dataKey={subject.subject}
                    stroke={SUBJECT_COLORS[idx % SUBJECT_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No mastery data available yet. Complete some lessons to see progress.
            </div>
          )}
        </CardBody>
      </Card>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Subject Breakdown
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {data?.subjects.map((subject, idx) => (
          <Card key={subject.subject}>
            <CardBody>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        SUBJECT_COLORS[idx % SUBJECT_COLORS.length],
                    }}
                  />
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {subject.subject}
                  </h4>
                </div>
                <Badge
                  variant={
                    subject.trend === "up"
                      ? "success"
                      : subject.trend === "down"
                        ? "error"
                        : "secondary"
                  }
                >
                  {subject.trend === "up"
                    ? "Improving"
                    : subject.trend === "down"
                      ? "Needs Focus"
                      : "Stable"}
                </Badge>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {subject.currentMastery}%
                </span>
                <span className="text-sm text-gray-500 mb-0.5">mastery</span>
              </div>
              <div className="mt-2 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${subject.currentMastery}%`,
                    backgroundColor:
                      SUBJECT_COLORS[idx % SUBJECT_COLORS.length],
                  }}
                />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}

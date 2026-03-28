"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  ChevronRight,
  AlertTriangle,
  GraduationCap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { useAuthStore } from "@/stores/auth.store";
import { apiFetch } from "@/lib/api";

interface ClassroomSummary {
  id: string;
  name: string;
  gradeBand: string;
  learnerCount: number;
  avgMasteryPct: number;
  atRiskCount: number;
}

export default function TeacherDashboardPage() {
  const t = useTranslations("dashboard");
  const { user } = useAuthStore();
  const [classrooms, setClassrooms] = useState<ClassroomSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClassrooms() {
      try {
        const data = await apiFetch<ClassroomSummary[]>(
          "/api/teacher/classrooms",
        );
        setClassrooms(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : t("failedToLoadClassrooms"),
        );
      } finally {
        setLoading(false);
      }
    }

    fetchClassrooms();
  }, []);

  return (
    <div>
      <PurpleGradientHeader className="rounded-xl mb-8">
        <h1 className="text-2xl font-bold">{t("myClassrooms")}</h1>
        <p className="mt-1 text-white/80">
          {t("teacherWelcomeBack", { name: user?.name?.split(" ")[0] ?? "Teacher" })}
        </p>
      </PurpleGradientHeader>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardBody className="space-y-3">
                <Skeleton height={20} className="w-40" />
                <Skeleton height={14} className="w-24" />
                <div className="flex gap-4 mt-4">
                  <Skeleton height={40} className="w-20" />
                  <Skeleton height={40} className="w-20" />
                  <Skeleton height={40} className="w-20" />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : classrooms.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="text-[#7C3AED]" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t("noClassroomsYet")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t("noClassroomsDescription")}
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classrooms.map((classroom) => (
            <Link
              key={classroom.id}
              href={`/teacher/classrooms/${classroom.id}`}
            >
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group h-full">
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {classroom.name}
                      </h3>
                      <Badge variant="secondary" className="mt-1">
                        {classroom.gradeBand}
                      </Badge>
                    </div>
                    <ChevronRight
                      className="text-gray-400 group-hover:text-[#7C3AED] transition-colors shrink-0"
                      size={20}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-5">
                    <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center justify-center gap-1 text-[#7C3AED]">
                        <Users size={14} />
                        <span className="text-sm font-bold">
                          {classroom.learnerCount}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{t("learners")}</span>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center justify-center gap-1 text-green-600">
                        <GraduationCap size={14} />
                        <span className="text-sm font-bold">
                          {Math.round(classroom.avgMasteryPct)}%
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{t("avgMastery")}</span>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center justify-center gap-1 text-amber-600">
                        <AlertTriangle size={14} />
                        <span className="text-sm font-bold">
                          {classroom.atRiskCount}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{t("atRisk")}</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

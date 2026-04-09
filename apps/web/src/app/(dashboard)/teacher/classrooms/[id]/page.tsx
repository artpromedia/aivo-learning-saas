"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowUpDown,
  ChevronRight,
  ArrowLeft,
  Users,
  AlertTriangle,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface Learner {
  id: string;
  name: string;
  masteryPct: number;
  lastActiveAt: string;
  atRisk: boolean;
  functioningLevel: string;
}

interface ClassroomDetail {
  id: string;
  name: string;
  gradeBand: string;
  learners: Learner[];
}

type SortField = "name" | "masteryPct" | "lastActiveAt";
type SortDir = "asc" | "desc";

export default function ClassroomViewPage() {
  const t = useTranslations("teacher");
  const params = useParams();
  const classroomId = params.id as string;

  const [classroom, setClassroom] = useState<ClassroomDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  useEffect(() => {
    async function fetchClassroom() {
      try {
        const data = await apiFetch<ClassroomDetail>(
          API_ROUTES.TEACHER.CLASSROOM_DETAIL(classroomId),
        );
        setClassroom(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : t("failedToLoadClassroom"),
        );
      } finally {
        setLoading(false);
      }
    }

    fetchClassroom();
  }, [classroomId]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sortedLearners = useMemo(() => {
    if (!classroom) return [];
    return [...classroom.learners].sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") {
        cmp = a.name.localeCompare(b.name);
      } else if (sortField === "masteryPct") {
        cmp = a.masteryPct - b.masteryPct;
      } else if (sortField === "lastActiveAt") {
        cmp =
          new Date(a.lastActiveAt).getTime() -
          new Date(b.lastActiveAt).getTime();
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [classroom, sortField, sortDir]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const SortButton = ({
    field,
    label,
  }: {
    field: SortField;
    label: string;
  }) => (
    <button
      onClick={() => toggleSort(field)}
      className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[var(--aivo-text-secondary)] hover:text-[#7C3AED] transition-colors"
    >
      {label}
      <ArrowUpDown
        size={12}
        className={sortField === field ? "text-[#7C3AED]" : "opacity-40"}
      />
    </button>
  );

  if (loading) {
    return (
      <div>
        <Skeleton height={120} className="w-full rounded-2xl mb-8" />
        <div className="space-y-3 px-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} height={56} className="w-full" rounded="lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 rounded-2xl bg-[#FFE0E0] dark:bg-[#991B1B]/10 border border-[#FECACA] dark:border-[#991B1B]/30 text-[#991B1B] dark:text-[#F87171]">
          {error}
        </div>
      </div>
    );
  }

  if (!classroom) return null;

  return (
    <div>
      <PurpleGradientHeader className="rounded-2xl mb-8">
        <Link
          href="/teacher"
          className="inline-flex items-center gap-1 text-white/80 hover:text-white text-sm mb-3 transition-colors"
        >
          <ArrowLeft size={16} />
          {t("backToClassrooms")}
        </Link>
        <h1 className="text-2xl font-extrabold">{classroom.name}</h1>
        <div className="flex items-center gap-3 mt-2">
          <Badge variant="default" className="bg-white/20 text-white">
            {classroom.gradeBand}
          </Badge>
          <span className="text-white/80 text-sm flex items-center gap-1">
            <Users size={14} />
            {classroom.learners.length} learner
            {classroom.learners.length !== 1 ? "s" : ""}
          </span>
        </div>
      </PurpleGradientHeader>

      <Card>
        {/* Table header */}
        <div className="hidden sm:grid grid-cols-[1fr_120px_120px_100px_32px] gap-4 px-6 py-3 border-b border-[#E8DDF0] dark:border-[#3D2D5C]">
          <SortButton field="name" label={t("learner")} />
          <SortButton field="masteryPct" label={t("mastery")} />
          <SortButton field="lastActiveAt" label={t("lastActive")} />
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--aivo-text-secondary)]">
            {t("status")}
          </span>
          <span />
        </div>

        {/* Rows */}
        {sortedLearners.length === 0 ? (
          <CardBody className="text-center py-12 text-[var(--aivo-text-secondary)]">
            {t("noLearnersInClassroom")}
          </CardBody>
        ) : (
          sortedLearners.map((learner) => (
            <Link
              key={learner.id}
              href={`/teacher/learners/${learner.id}`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px_120px_100px_32px] gap-2 sm:gap-4 px-6 py-4 border-b border-[#F0E6FF] dark:border-[#3D2D5C] hover:bg-[var(--aivo-bg)] dark:hover:bg-[#2A1E45]/50 transition-colors cursor-pointer group items-center">
                <div>
                  <span className="font-medium text-[var(--aivo-text)]">
                    {learner.name}
                  </span>
                  <span className="sm:hidden text-xs text-[var(--aivo-text-secondary)] ml-2">
                    {learner.functioningLevel}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-[#F0E6FF] dark:bg-[#3D2D5C] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7]"
                      style={{ width: `${learner.masteryPct}%` }}
                    />
                  </div>
                  <span className="text-sm text-[var(--aivo-text)] font-medium">
                    {Math.round(learner.masteryPct)}%
                  </span>
                </div>

                <span className="text-sm text-[var(--aivo-text-secondary)]">
                  {formatDate(learner.lastActiveAt)}
                </span>

                <div>
                  {learner.atRisk ? (
                    <Badge variant="warning">
                      <AlertTriangle size={10} className="mr-1" />
                      {t("atRisk")}
                    </Badge>
                  ) : (
                    <Badge variant="success">{t("onTrack")}</Badge>
                  )}
                </div>

                <ChevronRight
                  className="text-[var(--aivo-text-muted)] group-hover:text-[#7C3AED] transition-colors shrink-0 hidden sm:block"
                  size={18}
                />
              </div>
            </Link>
          ))
        )}
      </Card>
    </div>
  );
}

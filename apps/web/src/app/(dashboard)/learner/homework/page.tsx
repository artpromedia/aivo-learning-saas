"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  BookOpen, Upload, Loader2, Clock, ChevronRight, FileText, Lock, Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, BackLink, ExpandableCard, EmptyState, AnimatedCard } from "@/components/ui/PageDesign";
import { apiFetch } from "@/lib/api";
import { useLearnerStore } from "@/stores/learner.store";

interface HomeworkAssignment {
  id: string;
  subject: string;
  status: string;
  homeworkMode: string;
  createdAt: string;
  adaptedProblems: unknown[];
  extractedText?: string;
}

interface UploadResponse {
  assignment?: HomeworkAssignment;
  locked?: boolean;
  requiredSku?: string;
}

export default function HomeworkPage() {
  const t = useTranslations("dashboard");
  const activeLearner = useLearnerStore((s) => s.activeLearner);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [assignments, setAssignments] = useState<HomeworkAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [lockedInfo, setLockedInfo] = useState<{ locked: boolean; requiredSku: string } | null>(null);

  useEffect(() => {
    if (!activeLearner?.id) return;

    async function fetchAssignments() {
      try {
        const data = await apiFetch<{ assignments: HomeworkAssignment[] }>(
          `/api/tutors/homework/learner/${activeLearner!.id}`,
        );
        setAssignments(data.assignments);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("failedToLoadHomework"));
      } finally {
        setLoading(false);
      }
    }

    fetchAssignments();
  }, [activeLearner]);

  const handleUpload = async (file: File) => {
    if (!activeLearner?.id) return;
    setUploading(true);
    setError(null);
    setLockedInfo(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("learnerId", activeLearner.id);
      const res = await fetch(`/api/tutors/homework/upload`, { method: "POST", credentials: "include", body: formData });
      const data: UploadResponse = await res.json();
      if (data.locked) { setLockedInfo({ locked: true, requiredSku: data.requiredSku ?? "" }); return; }
      if (!res.ok) throw new Error(t("uploadFailed"));
      if (data.assignment) setAssignments((prev) => [data.assignment!, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorUploadFailed"));
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleUpload(f);
  };

  const activeAssignments = assignments.filter((a) => a.status === "READY" || a.status === "IN_PROGRESS");
  const completedAssignments = assignments.filter((a) => a.status === "COMPLETED");

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={80} className="w-full rounded-3xl" />
        <Skeleton height={180} className="w-full rounded-3xl" />
        <div className="space-y-3">{[1, 2, 3].map((i) => (<Skeleton key={i} height={80} className="w-full rounded-3xl" />))}</div>
      </div>
    );
  }

  return (
    <PageWrapper>
      <BackLink href="/learner">{t("backToHome", { defaultValue: "Back to Home" })}</BackLink>

      <PurpleGradientHeader className="rounded-3xl mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
            <BookOpen size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{t("homework")}</h1>
            <p className="text-white/80 text-sm">{t("homeworkSubtitle")}</p>
          </div>
        </div>
      </PurpleGradientHeader>

      {error && (
        <div className="mb-4 p-3 rounded-3xl bg-[#FFE0E0] dark:bg-[#991B1B]/10 border border-[#FECACA] dark:border-[#991B1B]/30 text-[#991B1B] dark:text-[#F87171] text-sm">{error}</div>
      )}

      {lockedInfo && (
        <AnimatedCard delay={100}>
          <Card className="mb-6 border-2 border-[#FBBF24] dark:border-[#FBBF24]/50">
            <CardBody className="flex items-center gap-4 py-6">
              <div className="w-12 h-12 rounded-full bg-[#FEF3C7] dark:bg-[#92400E]/30 flex items-center justify-center shrink-0">
                <Lock className="text-[#D97706]" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold" style={{ color: "var(--aivo-text)" }}>{t("tutorSubscriptionRequired")}</h3>
                <p className="text-sm" style={{ color: "var(--aivo-text-secondary)" }}>{t("subscribeToUnlockHomework")}</p>
              </div>
              <Link href="/learner/tutors">
                <Button size="sm" leftIcon={<Sparkles size={16} />}>{t("homeworkSubscribe")}</Button>
              </Link>
            </CardBody>
          </Card>
        </AnimatedCard>
      )}

      <AnimatedCard delay={200}>
        <Card className="mb-8">
          <CardBody>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-[#7C3AED] bg-[#7C3AED]/5"
                  : "border-[#E8DDF0] dark:border-[#3D2D5C] hover:border-[#7C3AED] hover:bg-[var(--aivo-bg)] dark:hover:bg-[#2A1E45]/50"
              }`}
            >
              {uploading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="text-[#7C3AED] animate-spin mb-3" size={32} />
                  <p className="text-sm" style={{ color: "var(--aivo-text-secondary)" }}>{t("homeworkProcessing")}</p>
                  <p className="text-xs mt-1" style={{ color: "var(--aivo-text-muted)" }}>{t("homeworkProcessingDetails")}</p>
                </div>
              ) : (
                <>
                  <Upload className={`mx-auto mb-3 ${isDragging ? "text-[#7C3AED]" : "text-[#A89BB5]"}`} size={36} />
                  <p className="text-base font-medium mb-1" style={{ color: "var(--aivo-text)" }}>{t("dragDropHomework")}</p>
                  <p className="text-sm" style={{ color: "var(--aivo-text-secondary)" }}>{t("clickToBrowse")}</p>
                </>
              )}
              <input ref={fileInputRef} type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
            </div>
          </CardBody>
        </Card>
      </AnimatedCard>

      {activeAssignments.length > 0 && (
        <ExpandableCard
          icon={<FileText size={16} />}
          title={t("inProgressCount", { count: activeAssignments.length })}
          subtitle={t("homeworkInProgressSubtitle")}
          gradient="linear-gradient(135deg, #7C3AED, #A855F7)"
          delay={300}
        >
          <div className="space-y-3">
            {activeAssignments.map((assignment) => (
              <Link key={assignment.id} href={`/learner/homework/${assignment.id}`}>
                <div className="flex items-center gap-4 p-3 rounded-xl transition-all cursor-pointer hover:scale-[1.01] group"
                  style={{ backgroundColor: "var(--aivo-bg)", border: "1px solid var(--aivo-border)" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white" style={{ background: "linear-gradient(135deg, #7C3AED, #A855F7)" }}>
                    <FileText size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate" style={{ color: "var(--aivo-text)" }}>
                      {assignment.subject.charAt(0).toUpperCase() + assignment.subject.slice(1)} {t("homework")}
                    </h3>
                    <div className="flex items-center gap-2 text-xs" style={{ color: "var(--aivo-text-secondary)" }}>
                      <Badge variant="secondary">{assignment.subject}</Badge>
                      <Badge variant="secondary">{assignment.homeworkMode}</Badge>
                      <span>{t("homeworkProblemsCount", { count: (assignment.adaptedProblems as unknown[])?.length ?? 0 })}</span>
                    </div>
                  </div>
                  <Badge variant={assignment.status === "IN_PROGRESS" ? "warning" : "default"}>
                    {assignment.status === "IN_PROGRESS" ? t("homeworkActive") : t("homeworkReady")}
                  </Badge>
                  <ChevronRight className="transition-all group-hover:translate-x-1 shrink-0" size={18} style={{ color: "var(--aivo-text-muted)" }} />
                </div>
              </Link>
            ))}
          </div>
        </ExpandableCard>
      )}

      {completedAssignments.length > 0 && (
        <div className="mt-6">
          <ExpandableCard
            icon={<BookOpen size={16} />}
            title={t("completedCount", { count: completedAssignments.length })}
            subtitle={t("homeworkCompletedSubtitle")}
            gradient="linear-gradient(135deg, #10B981, #059669)"
            delay={400}
            defaultExpanded={false}
          >
            <div className="space-y-3">
              {completedAssignments.map((assignment) => (
                <Link key={assignment.id} href={`/learner/homework/${assignment.id}`}>
                  <div className="flex items-center gap-4 p-3 rounded-xl opacity-75 transition-all cursor-pointer hover:scale-[1.01]"
                    style={{ backgroundColor: "var(--aivo-bg)", border: "1px solid var(--aivo-border)" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--aivo-purple-50)" }}>
                      <FileText size={18} style={{ color: "var(--aivo-text-muted)" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate" style={{ color: "var(--aivo-text)" }}>
                        {assignment.subject.charAt(0).toUpperCase() + assignment.subject.slice(1)} {t("homework")}
                      </h3>
                      <div className="flex items-center gap-2 text-xs" style={{ color: "var(--aivo-text-secondary)" }}>
                        <Badge variant="secondary">{assignment.subject}</Badge>
                        <span className="flex items-center gap-1"><Clock size={12} /> {new Date(assignment.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Badge variant="success">{t("homeworkDone")}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          </ExpandableCard>
        </div>
      )}

      {assignments.length === 0 && !lockedInfo && (
        <EmptyState
          icon={<BookOpen size={32} />}
          title={t("noActiveHomework")}
          description={t("uploadFirstHomework")}
          delay={300}
        />
      )}
    </PageWrapper>
  );
}

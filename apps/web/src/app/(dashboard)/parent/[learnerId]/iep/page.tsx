"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import {
  FileText, Upload, Loader2, RefreshCw, Trash2, Download, CheckCircle2, Target, Shield,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, BackLink, ExpandableCard, StatCard, EmptyState, AnimatedCard } from "@/components/ui/PageDesign";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface IepGoal {
  id: string;
  area: string;
  description: string;
  targetDate: string;
  progress: number;
  status: "on_track" | "at_risk" | "met";
}

interface IepDocument {
  id: string;
  fileName: string;
  uploadedAt: string;
  fileSize: number;
}

interface IepData {
  goals: IepGoal[];
  documents: IepDocument[];
  accommodations: string[];
  nextReviewDate: string | null;
}

export default function IepPage() {
  const params = useParams();
  const learnerId = params.learnerId as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("dashboard");

  const [data, setData] = useState<IepData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchIep() {
      try {
        const result = await apiFetch<IepData>(API_ROUTES.IEP.GET(learnerId));
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("failedToLoadIep"));
      } finally {
        setLoading(false);
      }
    }

    fetchIep();
  }, [learnerId]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const isMock = document.cookie.includes("user_role=");
      if (isMock) {
        await new Promise((r) => setTimeout(r, 2000));
        setData((prev) => prev ? {
          ...prev,
          documents: [...prev.documents, { id: `doc-${Date.now()}`, fileName: file.name, uploadedAt: new Date().toISOString(), fileSize: file.size }],
        } : null);
      } else {
        const formData = new FormData();
        formData.append("file", file);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
        await fetch(`${baseUrl}${API_ROUTES.IEP.UPLOAD_DOCUMENT(learnerId)}`, { method: "POST", credentials: "include", body: formData });
        const result = await apiFetch<IepData>(API_ROUTES.IEP.GET(learnerId));
        setData(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("uploadFailed"));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    setDeletingId(docId);
    try {
      await apiFetch(API_ROUTES.IEP.DELETE_DOCUMENT(learnerId, docId), { method: "DELETE" });
      setData((prev) => prev ? { ...prev, documents: prev.documents.filter((d) => d.id !== docId) } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("deleteFailed"));
    } finally {
      setDeletingId(null);
    }
  };

  const statusColors: Record<string, string> = { on_track: "success", at_risk: "warning", met: "default" };
  const statusLabels: Record<string, string> = { on_track: t("onTrack"), at_risk: t("atRiskStatus"), met: t("metStatus") };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={80} className="w-full rounded-2xl" />
        <div className="space-y-4">{[1, 2, 3].map((i) => (<Skeleton key={i} height={120} className="w-full rounded-2xl" />))}</div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()} leftIcon={<RefreshCw size={16} />}>{t("retry")}</Button>
      </div>
    );
  }

  const metGoals = data?.goals.filter((g) => g.status === "met").length ?? 0;
  const totalGoals = data?.goals.length ?? 0;

  return (
    <PageWrapper>
      <BackLink href={`/parent/${learnerId}`}>{t("backToDashboard")}</BackLink>

      <PurpleGradientHeader className="rounded-2xl mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
            <FileText size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{t("iepGoalsDocuments")}</h1>
            <p className="text-white/80 text-sm">
              Track your child&apos;s individualized education goals and store important documents
              {data?.nextReviewDate && <span> &middot; Next review: {new Date(data.nextReviewDate).toLocaleDateString()}</span>}
            </p>
          </div>
        </div>
      </PurpleGradientHeader>

      <div className="grid gap-3 grid-cols-3 mb-8">
        <StatCard icon={<Target size={18} />} label="Total Goals" value={totalGoals} color="#7C3AED" delay={100} />
        <StatCard icon={<CheckCircle2 size={18} />} label="Goals Met" value={metGoals} color="#10B981" delay={200} />
        <StatCard icon={<FileText size={18} />} label="Documents" value={data?.documents.length ?? 0} color="#3B82F6" delay={300} />
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-2xl bg-[#FFE0E0] dark:bg-[#991B1B]/10 border border-[#FECACA] dark:border-[#991B1B]/30 text-[#991B1B] dark:text-[#F87171] text-sm">{error}</div>
      )}

      <ExpandableCard
        icon={<Target size={16} />}
        title={t("iepGoals")}
        subtitle="Track progress on individualized education plan goals"
        gradient="linear-gradient(135deg, #7C3AED, #A855F7)"
        delay={400}
        infoText="IEP (Individualized Education Plan) goals are specific objectives set by your child's education team. Each goal has a target date and progress tracker. Green means on track, yellow means needs attention."
      >
        {data?.goals && data.goals.length > 0 ? (
          <div className="space-y-4">
            {data.goals.map((goal) => (
              <div key={goal.id} className="p-4 rounded-2xl" style={{ backgroundColor: "var(--aivo-bg)", border: "1px solid var(--aivo-border)" }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#7C3AED" }}>{goal.area}</span>
                      <Badge variant={statusColors[goal.status] as "success" | "warning" | "default"}>{statusLabels[goal.status]}</Badge>
                    </div>
                    <p className="text-sm" style={{ color: "var(--aivo-text)" }}>{goal.description}</p>
                  </div>
                  {goal.status === "met" && <CheckCircle2 className="text-green-500 shrink-0" size={24} />}
                </div>
                <ProgressBar value={goal.progress} max={100} size="sm" showLabel />
                <p className="text-xs mt-2" style={{ color: "var(--aivo-text-muted)" }}>{t("target")} {new Date(goal.targetDate).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="mx-auto mb-3" size={40} style={{ color: "var(--aivo-text-muted)" }} />
            <p style={{ color: "var(--aivo-text-secondary)" }}>{t("noIepGoalsDesc")}</p>
          </div>
        )}
      </ExpandableCard>

      {data?.accommodations && data.accommodations.length > 0 && (
        <div className="mt-6">
          <ExpandableCard
            icon={<Shield size={16} />}
            title={t("accommodations")}
            subtitle="Active learning accommodations for your child"
            gradient="linear-gradient(135deg, #2DD4BF, #14B8A6)"
            delay={500}
            infoText="Accommodations are adjustments made to how your child learns. These don't change what they learn, but how they access the material — like extra time, visual aids, or simplified instructions."
          >
            <div className="flex flex-wrap gap-2">
              {data.accommodations.map((acc, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full text-sm font-medium" style={{ backgroundColor: "rgba(124,58,237,0.1)", color: "#7C3AED" }}>{acc}</span>
              ))}
            </div>
          </ExpandableCard>
        </div>
      )}

      <div className="mt-6">
        <ExpandableCard
          icon={<FileText size={16} />}
          title={t("documents")}
          subtitle="Upload and manage IEP documents securely"
          gradient="linear-gradient(135deg, #3B82F6, #2563EB)"
          delay={600}
          infoText="Keep your child's IEP documents organized in one place. Upload PDF files of evaluations, meeting notes, or official IEP documents."
        >
          <div className="flex justify-end mb-4">
            <Button size="sm" leftIcon={<Upload size={16} />} loading={uploading} onClick={() => fileInputRef.current?.click()}>
              {t("uploadDocument")}
            </Button>
            <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
          </div>

          {data?.documents && data.documents.length > 0 ? (
            <div className="space-y-3">
              {data.documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-4 p-3 rounded-xl" style={{ backgroundColor: "var(--aivo-bg)", border: "1px solid var(--aivo-border)" }}>
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(124,58,237,0.1)" }}>
                    <FileText size={20} style={{ color: "#7C3AED" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--aivo-text)" }}>{doc.fileName}</p>
                    <p className="text-xs" style={{ color: "var(--aivo-text-secondary)" }}>
                      Uploaded {new Date(doc.uploadedAt).toLocaleDateString()} &middot; {(doc.fileSize / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-2xl transition-colors hover:bg-[var(--aivo-purple-50)]" style={{ color: "var(--aivo-text-muted)" }} title="Download"><Download size={16} /></button>
                    <button onClick={() => handleDelete(doc.id)} disabled={deletingId === doc.id} className="p-2 rounded-2xl transition-colors hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50" style={{ color: "var(--aivo-text-muted)" }} title="Delete">
                      {deletingId === doc.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Upload className="mx-auto mb-3" size={40} style={{ color: "var(--aivo-text-muted)" }} />
              <p style={{ color: "var(--aivo-text-secondary)" }}>{t("noDocuments")}</p>
            </div>
          )}
        </ExpandableCard>
      </div>
    </PageWrapper>
  );
}

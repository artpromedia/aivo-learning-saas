"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  RefreshCw, CheckCircle, XCircle, AlertTriangle, User, GraduationCap, BookOpen,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, BackLink, ExpandableCard, StatCard, AnimatedCard } from "@/components/ui/PageDesign";
import { apiFetch } from "@/lib/api";

interface SyncLogDetail {
  id: string;
  entityType: string;
  entityId?: string;
  sisId: string;
  action: "ADDED" | "UPDATED" | "DEACTIVATED" | "ERROR";
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  error?: string;
  createdAt: string;
}

interface SyncLogFull {
  id: string;
  syncType: string;
  status: string;
  studentsAdded: number;
  studentsUpdated: number;
  studentsDeleted: number;
  teachersAdded: number;
  teachersUpdated: number;
  sectionsAdded: number;
  errors: Array<{ item: string; error: string }>;
  startedAt: string;
  completedAt?: string;
  details: SyncLogDetail[];
}

export default function SyncDetailsPage() {
  const t = useTranslations("districtAdmin");
  const searchParams = useSearchParams();
  const syncLogId = searchParams.get("id");

  const [syncLog, setSyncLog] = useState<SyncLogFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!syncLogId) return;
    try {
      const result = await apiFetch<SyncLogFull>(`/api/integrations/sync-logs/${syncLogId}`);
      setSyncLog(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToLoadSyncDetails"));
    } finally {
      setLoading(false);
    }
  }, [syncLogId]);

  useEffect(() => { fetchDetails(); }, [fetchDetails]);

  async function handleRetryItem(detailId: string) {
    setRetrying(detailId);
    try {
      await apiFetch(`/api/integrations/sync-logs/${syncLogId}/retry/${detailId}`, { method: "POST" });
      await fetchDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("retryFailed"));
    } finally {
      setRetrying(null);
    }
  }

  async function handleRetryAllFailed() {
    setRetrying("all");
    try {
      await apiFetch(`/api/integrations/sync-logs/${syncLogId}/retry-all`, { method: "POST" });
      await fetchDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("retryAllFailed"));
    } finally {
      setRetrying(null);
    }
  }

  const entityIcon = (type: string) => {
    switch (type) {
      case "student": return <GraduationCap size={16} className="text-blue-500" />;
      case "teacher": return <User size={16} className="text-green-500" />;
      case "section": return <BookOpen size={16} className="text-purple-500" />;
      default: return <User size={16} className="text-[#A89BB5]" />;
    }
  };

  const actionBadge = (action: string) => {
    switch (action) {
      case "ADDED": return <Badge variant="success">{t("added")}</Badge>;
      case "UPDATED": return <Badge variant="warning">{t("updated")}</Badge>;
      case "DEACTIVATED": return <Badge variant="secondary">{t("deactivated")}</Badge>;
      case "ERROR": return <Badge variant="error">{t("error")}</Badge>;
      default: return <Badge>{action}</Badge>;
    }
  };

  if (!syncLogId) {
    return (
      <PageWrapper>
        <div className="text-center py-16">
          <p style={{ color: "var(--aivo-text-secondary)" }}>{t("noSyncLogId")}</p>
          <Link href="/admin/district/integrations" className="text-[#7C3AED] mt-2 inline-block">
            {t("backToIntegrations")}
          </Link>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <BackLink href="/admin/district/integrations">{t("backToIntegrations")}</BackLink>

      <PurpleGradientHeader className="rounded-3xl mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
            <RefreshCw size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{t("syncTitle")}</h1>
            <p className="mt-0.5 text-white/80 text-sm">{t("syncSubtitle")}</p>
          </div>
        </div>
      </PurpleGradientHeader>

      {error && (
        <div className="mb-6 p-4 rounded-3xl bg-[#FFE0E0] dark:bg-[#991B1B]/10 border border-[#FECACA] dark:border-[#991B1B]/30 text-[#991B1B] dark:text-[#F87171]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <Skeleton height={120} className="w-full rounded-3xl" />
          <Skeleton height={200} className="w-full rounded-3xl" />
        </div>
      ) : syncLog ? (
        <div className="space-y-6">
          <AnimatedCard delay={100}>
            <Card>
              <CardBody>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider" style={{ color: "var(--aivo-text-secondary)" }}>{t("typeLabel")}</p>
                    <p className="text-lg font-bold" style={{ color: "var(--aivo-text)" }}>{syncLog.syncType}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider" style={{ color: "var(--aivo-text-secondary)" }}>{t("statusLabel")}</p>
                    <Badge variant={syncLog.status === "COMPLETED" ? "success" : "error"}>{syncLog.status}</Badge>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider" style={{ color: "var(--aivo-text-secondary)" }}>{t("startedLabel")}</p>
                    <p className="text-sm" style={{ color: "var(--aivo-text)" }}>{new Date(syncLog.startedAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider" style={{ color: "var(--aivo-text-secondary)" }}>{t("durationLabel")}</p>
                    <p className="text-sm" style={{ color: "var(--aivo-text)" }}>
                      {syncLog.completedAt
                        ? t("durationSeconds", { seconds: Math.round((new Date(syncLog.completedAt).getTime() - new Date(syncLog.startedAt).getTime()) / 1000) })
                        : t("inProgressDuration")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-4 pt-4 border-t border-[#E8DDF0] dark:border-[#3D2D5C]">
                  <div className="text-center">
                    <p className="text-2xl font-extrabold text-green-600">{syncLog.studentsAdded}</p>
                    <p className="text-xs" style={{ color: "var(--aivo-text-secondary)" }}>{t("studentsAdded")}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-extrabold text-blue-600">{syncLog.studentsUpdated}</p>
                    <p className="text-xs" style={{ color: "var(--aivo-text-secondary)" }}>{t("studentsUpdated")}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-extrabold text-[#D97706]">{syncLog.studentsDeleted}</p>
                    <p className="text-xs" style={{ color: "var(--aivo-text-secondary)" }}>{t("studentsDeactivated")}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-extrabold text-green-600">{syncLog.teachersAdded}</p>
                    <p className="text-xs" style={{ color: "var(--aivo-text-secondary)" }}>{t("teachersAddedLabel")}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-extrabold text-purple-600">{syncLog.sectionsAdded}</p>
                    <p className="text-xs" style={{ color: "var(--aivo-text-secondary)" }}>{t("sections")}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-extrabold text-red-600">{syncLog.errors?.length ?? 0}</p>
                    <p className="text-xs" style={{ color: "var(--aivo-text-secondary)" }}>{t("errors")}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </AnimatedCard>

          {syncLog.errors && syncLog.errors.length > 0 && (
            <ExpandableCard
              icon={<AlertTriangle size={16} />}
              title={t("syncErrors", { count: syncLog.errors.length })}
              subtitle={t("syncErrorsSubtitle")}
              gradient="linear-gradient(135deg, #EF4444, #DC2626)"
              delay={200}
              infoText={t("syncErrorsInfo")}
            >
              <div className="flex justify-end mb-4">
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<RefreshCw size={14} />}
                  loading={retrying === "all"}
                  onClick={handleRetryAllFailed}
                >
                  {t("retryAllFailedButton")}
                </Button>
              </div>
              <div className="space-y-2">
                {syncLog.errors.map((err, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border border-[#FECACA] dark:border-[#991B1B]/30 rounded-3xl bg-red-50/50 dark:bg-red-900/10">
                    <div className="flex items-center gap-3">
                      <XCircle size={16} className="text-red-500 shrink-0" />
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--aivo-text)" }}>{err.item}</p>
                        <p className="text-xs text-red-600 dark:text-red-400">{err.error}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ExpandableCard>
          )}

          {syncLog.details && syncLog.details.length > 0 && (
            <ExpandableCard
              icon={<BookOpen size={16} />}
              title={t("changeLog", { count: syncLog.details.length })}
              subtitle={t("changeLogSubtitle")}
              gradient="linear-gradient(135deg, #7C3AED, #A855F7)"
              delay={300}
              defaultExpanded={false}
            >
              <div className="space-y-2">
                {syncLog.details.map((detail) => (
                  <div key={detail.id} className="flex items-center gap-4 p-3 border border-[#E8DDF0] dark:border-[#3D2D5C] rounded-3xl">
                    {entityIcon(detail.entityType)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium" style={{ color: "var(--aivo-text)" }}>{detail.entityType}</span>
                        {actionBadge(detail.action)}
                        <span className="text-xs text-[#A89BB5]">{t("sisLabel", { id: detail.sisId })}</span>
                      </div>
                      {detail.error && <p className="text-xs text-red-500 mt-1">{detail.error}</p>}
                    </div>
                    {detail.action === "ERROR" && (
                      <Button size="sm" variant="ghost" leftIcon={<RefreshCw size={12} />} loading={retrying === detail.id} onClick={() => handleRetryItem(detail.id)}>
                        {t("retry")}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ExpandableCard>
          )}
        </div>
      ) : null}
    </PageWrapper>
  );
}

"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Settings,
  Loader2,
  RefreshCw,
  Shield,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, BackLink, ExpandableCard, AnimatedCard } from "@/components/ui/PageDesign";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import { LanguageSelect } from "@/components/ui/LanguageSelect";
import { PinSection } from "./pin-section";

interface LearnerSettings {
  privacyLevel: "standard" | "strict";
  shareWithCollaborators: boolean;
  allowAnalytics: boolean;
  dataRetentionMonths: number;
}

interface ExportHistoryEntry {
  id: string;
  status: "processing" | "ready" | "failed" | "expired";
  createdAt: string;
  downloadUrl?: string;
  expiresAt?: string;
}

interface SubscriptionStatus {
  status: "ACTIVE" | "GRACE_PERIOD" | "CANCELLED" | "EXPIRED";
  gracePeriodEndsAt?: string;
  subscriptionId?: string;
}

export default function LearnerSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const learnerId = params.learnerId as string;
  const t = useTranslations("settings");
  const td = useTranslations("dashboard");

  const [settings, setSettings] = useState<LearnerSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Brain data export states
  const [brainExportLoading, setBrainExportLoading] = useState(false);
  const [brainExportStatus, setBrainExportStatus] = useState<
    "idle" | "processing" | "ready" | "error"
  >("idle");
  const [brainExportDownloadUrl, setBrainExportDownloadUrl] = useState<string | null>(null);
  const [brainExportExpiresAt, setBrainExportExpiresAt] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Delete all data states
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [deletingAllData, setDeletingAllData] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deletePasswordVisible, setDeletePasswordVisible] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");

  // Export history
  const [exportHistory, setExportHistory] = useState<ExportHistoryEntry[]>([]);

  // Subscription / reactivation state
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [reactivating, setReactivating] = useState(false);

  // Language preference
  const [parentLanguage, setParentLanguage] = useState("");
  const [savingLanguage, setSavingLanguage] = useState(false);

  // Learner name for confirmation
  const [learnerName, setLearnerName] = useState("");
  const [hasPinSet, setHasPinSet] = useState(false);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const pollExportStatus = useCallback(() => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const result = await apiFetch<{
          status: "processing" | "ready" | "error";
          downloadUrl?: string;
          expiresAt?: string;
          error?: string;
        }>(`${API_ROUTES.FAMILY.EXPORT_STATUS(learnerId)}`);

        if (result.status === "ready" && result.downloadUrl) {
          setBrainExportStatus("ready");
          setBrainExportDownloadUrl(result.downloadUrl);
          setBrainExportExpiresAt(result.expiresAt ?? null);
          setBrainExportLoading(false);
          stopPolling();
        } else if (result.status === "error") {
          setBrainExportStatus("error");
          setBrainExportLoading(false);
          setError(result.error ?? t("exportFailed"));
          stopPolling();
        }
      } catch {
        setBrainExportStatus("error");
        setBrainExportLoading(false);
        setError(t("failedToCheckExportStatus"));
        stopPolling();
      }
    }, 3000);
  }, [learnerId, stopPolling]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const handleBrainExport = async () => {
    setBrainExportLoading(true);
    setBrainExportStatus("processing");
    setBrainExportDownloadUrl(null);
    setBrainExportExpiresAt(null);
    setError(null);
    try {
      await apiFetch(`${API_ROUTES.FAMILY.EXPORT(learnerId)}`, {
        method: "POST",
      });
      pollExportStatus();
    } catch (err) {
      setBrainExportStatus("error");
      setBrainExportLoading(false);
      setError(err instanceof Error ? err.message : t("failedToStartExport"));
    }
  };

  const handleDeleteAllData = async () => {
    if (!deletePassword || deleteConfirmName !== learnerName) return;
    setDeletingAllData(true);
    setError(null);
    try {
      await apiFetch(`${API_ROUTES.FAMILY.DELETE_ALL_DATA(learnerId)}`, {
        method: "POST",
        body: JSON.stringify({ password: deletePassword }),
      });
      setShowDeleteAllModal(false);
      router.push("/parent?message=All+learner+data+has+been+deleted+successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToDeleteData"));
      setDeletingAllData(false);
    }
  };

  const handleReactivate = async () => {
    if (!subscriptionStatus?.subscriptionId) return;
    setReactivating(true);
    setError(null);
    try {
      await apiFetch(`${API_ROUTES.BILLING.REACTIVATE(subscriptionStatus.subscriptionId)}`, {
        method: "POST",
      });
      setSubscriptionStatus({ ...subscriptionStatus, status: "ACTIVE", gracePeriodEndsAt: undefined });
      setSuccessMsg(t("reactivateSuccess"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToReactivate"));
    } finally {
      setReactivating(false);
    }
  };

  const handleLanguageChange = async (locale: string) => {
    setSavingLanguage(true);
    setError(null);
    try {
      document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000`;
      await apiFetch(API_ROUTES.USER.UPDATE_PREFERENCES, {
        method: "PATCH",
        body: JSON.stringify({ preferredLanguage: locale }),
      });
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToUpdateLanguage"));
      setSavingLanguage(false);
    }
  };

  useEffect(() => {
    // Read current locale from cookie
    const localeCookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("NEXT_LOCALE="))
      ?.split("=")[1];
    if (localeCookie) setParentLanguage(localeCookie);
  }, []);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const [settingsResult, historyResult, subResult, learnerResult] = await Promise.allSettled([
          apiFetch<LearnerSettings>(`/api/learners/${learnerId}/settings`),
          apiFetch<{ exports: ExportHistoryEntry[] }>(`/api/family/learners/${learnerId}/export/history`),
          apiFetch<SubscriptionStatus>(`/api/billing/subscription/status`),
          apiFetch<{ name: string; pinSetAt?: string }>(`/api/learners/${learnerId}`),
        ]);

        if (settingsResult.status === "fulfilled") {
          setSettings(settingsResult.value);
        } else {
          setError(t("failedToLoadSettings"));
        }

        if (historyResult.status === "fulfilled") {
          setExportHistory(historyResult.value.exports ?? []);
        }

        if (subResult.status === "fulfilled") {
          setSubscriptionStatus(subResult.value);
        }

        if (learnerResult.status === "fulfilled") {
          setLearnerName(learnerResult.value.name ?? "");
          setHasPinSet(!!learnerResult.value.pinSetAt);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : t("failedToLoadSettings"),
        );
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, [learnerId]);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await apiFetch(`/api/learners/${learnerId}/settings`, {
        method: "PUT",
        body: JSON.stringify(settings),
      });
      setSuccessMsg(t("settingsSaved"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToSaveSettings"));
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    try {
      const blob = await fetch(
        `/api/learners/${learnerId}/data-export`,
        { credentials: "include" },
      ).then((r) => r.blob());

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `learner-${learnerId}-data.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("exportFailed"));
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiFetch(`/api/learners/${learnerId}`, { method: "DELETE" });
      router.push("/parent");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("failedToDeleteAccount"),
      );
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={80} className="w-full rounded-3xl" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={100} className="w-full rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">{error}</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          leftIcon={<RefreshCw size={16} />}
        >
          {td("retry")}
        </Button>
      </div>
    );
  }

  return (
    <PageWrapper>
      <BackLink href={`/parent/${learnerId}`}>{td("backToDashboard")}</BackLink>

      <PurpleGradientHeader className="rounded-3xl mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
            <Settings size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{t("title")}</h1>
            <p className="text-white/80 text-sm">
              {t("settingsSubtitle")}
            </p>
          </div>
        </div>
      </PurpleGradientHeader>

      {error && (
        <div className="mb-4 p-3 rounded-3xl bg-[#FFE0E0] dark:bg-[#991B1B]/10 border border-[#FECACA] dark:border-[#991B1B]/30 text-[#991B1B] dark:text-[#F87171] text-sm">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 rounded-3xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm">
          {successMsg}
        </div>
      )}

      {subscriptionStatus?.status === "GRACE_PERIOD" && (
        <div className="mb-6 p-4 rounded-3xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-[#D97706] dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                {t("subscriptionCancelled", { date: subscriptionStatus.gracePeriodEndsAt
                  ? new Date(subscriptionStatus.gracePeriodEndsAt).toLocaleDateString()
                  : t("gracePeriodEndDate") })}
              </p>
              <p className="text-xs text-[#D97706] dark:text-amber-400 mt-1">
                {t("resubscribePrompt")}
              </p>
              <div className="flex gap-3 mt-3">
                <Button
                  onClick={handleReactivate}
                  loading={reactivating}
                  size="sm"
                >
                  {t("resubscribeNow")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBrainExport}
                  leftIcon={<Download size={14} />}
                >
                  {t("exportBrainData")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {settings && (
        <div className="space-y-6">
          <ExpandableCard
            icon={<Shield size={16} />}
            title={t("privacySettings")}
            subtitle={t("privacySettingsSubtitle")}
            gradient="linear-gradient(135deg, #7C3AED, #A855F7)"
            delay={100}
            infoText={t("privacySettingsInfo")}
          >
              <div>
                <label className="block text-sm font-medium text-[var(--aivo-text)] mb-1">
                  {t("privacyLevel")}
                </label>
                <select
                  value={settings.privacyLevel}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      privacyLevel: e.target.value as "standard" | "strict",
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-3xl border border-[#E8DDF0] dark:border-[#3D2D5C] bg-white dark:bg-[#2A1E45] text-[var(--aivo-text)] focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none"
                >
                  <option value="standard">
                    {t("privacyStandard")}
                  </option>
                  <option value="strict">
                    {t("privacyStrict")}
                  </option>
                </select>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.shareWithCollaborators}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      shareWithCollaborators: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded border-[#E8DDF0] text-[#7C3AED] focus:ring-[#7C3AED]"
                />
                <div>
                  <span className="text-sm font-medium text-[var(--aivo-text)]">
                    {t("shareWithCollaborators")}
                  </span>
                  <p className="text-xs text-[var(--aivo-text-secondary)]">
                    {t("shareWithCollaboratorsDesc")}
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowAnalytics}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      allowAnalytics: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded border-[#E8DDF0] text-[#7C3AED] focus:ring-[#7C3AED]"
                />
                <div>
                  <span className="text-sm font-medium text-[var(--aivo-text)]">
                    {t("allowAnalytics")}
                  </span>
                  <p className="text-xs text-[var(--aivo-text-secondary)]">
                    {t("allowAnalyticsDesc")}
                  </p>
                </div>
              </label>

              <div>
                <label className="block text-sm font-medium text-[var(--aivo-text)] mb-1">
                  {t("dataRetentionPeriod")}
                </label>
                <select
                  value={settings.dataRetentionMonths}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      dataRetentionMonths: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-3xl border border-[#E8DDF0] dark:border-[#3D2D5C] bg-white dark:bg-[#2A1E45] text-[var(--aivo-text)] focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none"
                >
                  <option value={6}>{t("nMonths", { n: 6 })}</option>
                  <option value={12}>{t("nMonths", { n: 12 })}</option>
                  <option value={24}>{t("nMonths", { n: 24 })}</option>
                  <option value={36}>{t("nMonths", { n: 36 })}</option>
                </select>
              </div>


            <Button onClick={handleSave} loading={saving} leftIcon={<Save size={16} />} className="mt-4">
              {t("saveSettings")}
            </Button>
          </ExpandableCard>

          <PinSection learnerId={learnerId} hasPinSet={hasPinSet} />

          <ExpandableCard
            icon={<Globe size={16} />}
            title={t("languagePreferences")}
            subtitle={t("languagePreferencesSubtitle")}
            gradient="linear-gradient(135deg, #3B82F6, #2563EB)"
            delay={200}
            infoText={t("languagePreferencesInfo")}
          >
            <div className="space-y-4">
              <LanguageSelect
                value={parentLanguage}
                onChange={handleLanguageChange}
                label={t("yourLanguage")}
                disabled={savingLanguage}
              />
              <p className="text-xs text-[var(--aivo-text-secondary)]">
                {t("languageReloadNote")}
              </p>
            </div>
          </ExpandableCard>

          <ExpandableCard
            icon={<Download size={16} />}
            title={t("dataExport")}
            subtitle={t("dataExportSubtitle")}
            gradient="linear-gradient(135deg, #2DD4BF, #14B8A6)"
            delay={300}
            infoText={t("dataExportInfo")}
          >
            <p className="text-sm text-[var(--aivo-text-secondary)] mb-4">
              {t("dataExportDesc")}
            </p>
            <Button
              variant="outline"
              onClick={handleExport}
              loading={exporting}
              leftIcon={<Download size={16} />}
            >
              {t("exportAllData")}
            </Button>
          </ExpandableCard>

          <ExpandableCard
            icon={<Brain size={16} />}
            title={t("exportBrainData")}
            subtitle={t("exportBrainDataSubtitle")}
            gradient="linear-gradient(135deg, #8B5CF6, #6D28D9)"
            delay={400}
            infoText={t("exportBrainDataInfo")}
          >
              <p className="text-sm text-[var(--aivo-text-secondary)] mb-4">
                {t("exportBrainDataDesc")}
              </p>

              {brainExportStatus === "idle" && (
                <Button
                  variant="outline"
                  onClick={handleBrainExport}
                  leftIcon={<Brain size={16} />}
                >
                  {t("exportBrainData")}
                </Button>
              )}

              {brainExportStatus === "processing" && (
                <div className="flex items-center gap-3 p-4 rounded-3xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <Loader2 size={20} className="text-[#7C3AED] animate-spin" />
                  <div>
                    <p className="text-sm font-medium text-[var(--aivo-text)]">
                      {t("generatingBrainExport")}
                    </p>
                    <p className="text-xs text-[var(--aivo-text-secondary)]">
                      {t("exportMayTakeMinutes")}
                    </p>
                  </div>
                </div>
              )}

              {brainExportStatus === "ready" && brainExportDownloadUrl && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 rounded-3xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-300">
                        {t("brainExportReady")}
                      </p>
                      {brainExportExpiresAt && (
                        <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
                          <Clock size={12} />
                          {t("downloadLinkExpires", { date: new Date(brainExportExpiresAt).toLocaleDateString() })}
                        </p>
                      )}
                    </div>
                  </div>
                  <a
                    href={brainExportDownloadUrl}
                    download
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-3xl bg-[#7C3AED] text-white text-sm font-medium hover:bg-[#6D28D9] transition-colors"
                  >
                    <Download size={16} />
                    {t("downloadBrainData")}
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBrainExport}
                    className="ml-2"
                  >
                    {t("generateNewExport")}
                  </Button>
                </div>
              )}

              {brainExportStatus === "error" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 rounded-3xl bg-[#FFE0E0] dark:bg-[#991B1B]/10 border border-[#FECACA] dark:border-[#991B1B]/30">
                    <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">
                      {t("exportFailedRetry")}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleBrainExport}
                    leftIcon={<RefreshCw size={16} />}
                  >
                    {t("retryExport")}
                  </Button>
                </div>
              )}
          </ExpandableCard>

          {exportHistory.length > 0 && (
            <ExpandableCard
              icon={<Clock size={16} />}
              title={t("exportHistory")}
              subtitle={t("exportHistorySubtitle")}
              gradient="linear-gradient(135deg, #6B7280, #4B5563)"
              delay={500}
              defaultExpanded={false}
              infoText={t("exportHistoryInfo")}
            >
                <div className="space-y-3">
                  {exportHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 border border-[#E8DDF0] dark:border-[#3D2D5C] rounded-3xl"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            entry.status === "ready"
                              ? "success"
                              : entry.status === "failed"
                                ? "error"
                                : entry.status === "expired"
                                  ? "secondary"
                                  : "warning"
                          }
                        >
                          {entry.status}
                        </Badge>
                        <span className="text-sm text-[var(--aivo-text-secondary)]">
                          {new Date(entry.createdAt).toLocaleDateString()} at{" "}
                          {new Date(entry.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      {entry.status === "ready" && entry.downloadUrl && (
                        <a
                          href={entry.downloadUrl}
                          download
                          className="text-sm text-[#7C3AED] hover:text-[#6D28D9] font-medium flex items-center gap-1"
                        >
                          <Download size={14} />
                          {t("download")}
                          {entry.expiresAt && (
                            <span className="text-xs text-[var(--aivo-text-muted)] ml-1">
                              ({t("expiresOn", { date: new Date(entry.expiresAt).toLocaleDateString() })})
                            </span>
                          )}
                        </a>
                      )}
                      {entry.status === "expired" && (
                        <span className="text-xs text-[#A89BB5]">{t("linkExpired")}</span>
                      )}
                    </div>
                  ))}
                </div>
            </ExpandableCard>
          )}

          <ExpandableCard
            icon={<Trash2 size={16} />}
            title={t("dangerZone")}
            subtitle={t("dangerZoneSubtitle")}
            gradient="linear-gradient(135deg, #EF4444, #DC2626)"
            delay={600}
            defaultExpanded={false}
            infoText={t("dangerZoneInfo")}
          >
            <div className="space-y-6">
              <div className="p-4 rounded-3xl" style={{ backgroundColor: "var(--aivo-bg)", border: "1px solid var(--aivo-border)" }}>
                <h4 className="font-bold text-red-600 dark:text-red-400 mb-2">{t("deleteLearnerAccount")}</h4>
                <p className="text-sm text-[var(--aivo-text-secondary)] mb-4">
                  {t("deleteLearnerAccountDesc")}
                </p>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteModal(true)}
                  leftIcon={<Trash2 size={16} />}
                >
                  {t("deleteLearnerAccount")}
                </Button>
              </div>

              <div className="p-4 rounded-3xl border-2 border-red-300 dark:border-red-700">
              <p className="text-sm text-[var(--aivo-text-secondary)] mb-3">
                {t("deleteAllDataDesc", { name: learnerName || t("thisLearner") })}
              </p>
              <p className="text-sm text-[var(--aivo-text-secondary)] mb-3">
                {t("deleteAllDataList")}
              </p>
              <div className="flex items-start gap-3 p-4 rounded-3xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 mb-4">
                <Shield size={18} className="text-[#D97706] shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {t("complianceAuditNote")}
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => {
                  setDeletePassword("");
                  setDeletePasswordVisible(false);
                  setDeleteConfirmName("");
                  setShowDeleteAllModal(true);
                }}
                leftIcon={<Trash2 size={16} />}
              >
                {t("deleteAllDataFor", { name: learnerName || t("thisLearner") })}
              </Button>
              </div>
            </div>
          </ExpandableCard>
        </div>
      )}

      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t("deleteLearnerAccount")}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              loading={isDeleting}
            >
              {t("permanentlyDelete")}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-[var(--aivo-text-secondary)]">
          {t("deleteLearnerConfirmDesc")}
        </p>
      </Modal>

      <Modal
        open={showDeleteAllModal}
        onClose={() => {
          if (!deletingAllData) {
            setShowDeleteAllModal(false);
            setDeletePassword("");
            setDeleteConfirmName("");
          }
        }}
        title={t("deleteAllData")}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setShowDeleteAllModal(false);
                setDeletePassword("");
                setDeleteConfirmName("");
              }}
              disabled={deletingAllData}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAllData}
              loading={deletingAllData}
              disabled={!deletePassword || deleteConfirmName !== learnerName}
            >
              {t("permanentlyDeleteAllData")}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-3xl bg-[#FFE0E0] dark:bg-[#991B1B]/10 border border-[#FECACA] dark:border-[#991B1B]/30">
            <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300 font-medium">
              {t("deleteAllDataWarning")}
            </p>
          </div>

          <div>
            <label
              htmlFor="delete-confirm-name"
              className="block text-sm font-medium text-[var(--aivo-text)] mb-1"
            >
              {t("typeToConfirm")} <strong>{learnerName}</strong>
            </label>
            <input
              id="delete-confirm-name"
              type="text"
              value={deleteConfirmName}
              onChange={(e) => setDeleteConfirmName(e.target.value)}
              placeholder={learnerName}
              className="w-full px-4 py-2.5 rounded-3xl border border-[#E8DDF0] dark:border-[#3D2D5C] bg-white dark:bg-[#2A1E45] text-[var(--aivo-text)] focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              autoComplete="off"
            />
          </div>

          <div>
            <label
              htmlFor="delete-confirm-password"
              className="block text-sm font-medium text-[var(--aivo-text)] mb-1"
            >
              {t("enterPasswordToConfirm")}
            </label>
            <div className="relative">
              <input
                id="delete-confirm-password"
                type={deletePasswordVisible ? "text" : "password"}
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder={t("enterAccountPassword")}
                className="w-full px-4 py-2.5 pr-10 rounded-3xl border border-[#E8DDF0] dark:border-[#3D2D5C] bg-white dark:bg-[#2A1E45] text-[var(--aivo-text)] focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setDeletePasswordVisible(!deletePasswordVisible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A89BB5] hover:text-[#7C3AED]"
              >
                {deletePasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}

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
          setError(result.error ?? "Export failed");
          stopPolling();
        }
      } catch {
        setBrainExportStatus("error");
        setBrainExportLoading(false);
        setError("Failed to check export status");
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
      setError(err instanceof Error ? err.message : "Failed to start export");
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
      setError(err instanceof Error ? err.message : "Failed to delete data");
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
      setError(err instanceof Error ? err.message : "Failed to reactivate subscription");
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
      setError(err instanceof Error ? err.message : "Failed to update language");
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
          setError("Failed to load settings");
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
          err instanceof Error ? err.message : "Failed to load settings",
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
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    try {
      const isMock = document.cookie.includes("user_role=");
      if (isMock) {
        await new Promise((r) => setTimeout(r, 1500));
        const mockExport = { learnerId, exportedAt: new Date().toISOString(), data: { note: "This is a demo export." } };
        const blob = new Blob([JSON.stringify(mockExport, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `learner-${learnerId}-data.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const blob = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/learners/${learnerId}/data-export`,
          { credentials: "include" },
        ).then((r) => r.blob());

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `learner-${learnerId}-data.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
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
        err instanceof Error ? err.message : "Failed to delete account",
      );
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={80} className="w-full rounded-2xl" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={100} className="w-full rounded-2xl" />
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
          Retry
        </Button>
      </div>
    );
  }

  return (
    <PageWrapper>
      <BackLink href={`/parent/${learnerId}`}>{td("backToDashboard")}</BackLink>

      <PurpleGradientHeader className="rounded-2xl mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
            <Settings size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{t("title")}</h1>
            <p className="text-white/80 text-sm">
              Manage privacy, data, and preferences for your child&apos;s account
            </p>
          </div>
        </div>
      </PurpleGradientHeader>

      {error && (
        <div className="mb-4 p-3 rounded-2xl bg-[#FFE0E0] dark:bg-[#991B1B]/10 border border-[#FECACA] dark:border-[#991B1B]/30 text-[#991B1B] dark:text-[#F87171] text-sm">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm">
          {successMsg}
        </div>
      )}

      {subscriptionStatus?.status === "GRACE_PERIOD" && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-[#D97706] dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Your subscription is cancelled. Your data will be deleted on{" "}
                {subscriptionStatus.gracePeriodEndsAt
                  ? new Date(subscriptionStatus.gracePeriodEndsAt).toLocaleDateString()
                  : "the grace period end date"}.
              </p>
              <p className="text-xs text-[#D97706] dark:text-amber-400 mt-1">
                Resubscribe now to keep all Brain data intact, or export your data before the deadline.
              </p>
              <div className="flex gap-3 mt-3">
                <Button
                  onClick={handleReactivate}
                  loading={reactivating}
                  size="sm"
                >
                  Resubscribe Now
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBrainExport}
                  leftIcon={<Download size={14} />}
                >
                  Export Brain Data
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
            title="Privacy Settings"
            subtitle="Control how your child's data is shared and stored"
            gradient="linear-gradient(135deg, #7C3AED, #A855F7)"
            delay={100}
            infoText="Privacy settings control who can see your child's learning data and how long it's stored. 'Standard' mode shares analytics with your collaboration team, while 'Strict' minimizes data sharing."
          >
              <div>
                <label className="block text-sm font-medium text-[var(--aivo-text)] mb-1">
                  Privacy Level
                </label>
                <select
                  value={settings.privacyLevel}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      privacyLevel: e.target.value as "standard" | "strict",
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E8DDF0] dark:border-[#3D2D5C] bg-white dark:bg-[#2A1E45] text-[var(--aivo-text)] focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none"
                >
                  <option value="standard">
                    Standard - Share learning analytics with collaborators
                  </option>
                  <option value="strict">
                    Strict - Minimal data sharing
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
                    Share progress with collaborators
                  </span>
                  <p className="text-xs text-[var(--aivo-text-secondary)]">
                    Allow teachers and therapists to view learning data.
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
                    Allow anonymous analytics
                  </span>
                  <p className="text-xs text-[var(--aivo-text-secondary)]">
                    Help us improve AIVO by sharing anonymized usage data.
                  </p>
                </div>
              </label>

              <div>
                <label className="block text-sm font-medium text-[var(--aivo-text)] mb-1">
                  Data Retention Period
                </label>
                <select
                  value={settings.dataRetentionMonths}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      dataRetentionMonths: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E8DDF0] dark:border-[#3D2D5C] bg-white dark:bg-[#2A1E45] text-[var(--aivo-text)] focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none"
                >
                  <option value={6}>6 months</option>
                  <option value={12}>12 months</option>
                  <option value={24}>24 months</option>
                  <option value={36}>36 months</option>
                </select>
              </div>


            <Button onClick={handleSave} loading={saving} leftIcon={<Save size={16} />} className="mt-4">
              Save Settings
            </Button>
          </ExpandableCard>

          <PinSection learnerId={learnerId} hasPinSet={hasPinSet} />

          <ExpandableCard
            icon={<Globe size={16} />}
            title="Language Preferences"
            subtitle="Change the language used across the app"
            gradient="linear-gradient(135deg, #3B82F6, #2563EB)"
            delay={200}
            infoText="Change the display language for the entire AIVO interface. The page will reload to apply the new language."
          >
            <div className="space-y-4">
              <LanguageSelect
                value={parentLanguage}
                onChange={handleLanguageChange}
                label="Your Language"
                disabled={savingLanguage}
              />
              <p className="text-xs text-[var(--aivo-text-secondary)]">
                Changing the language will reload the page to apply the new locale across the entire app.
              </p>
            </div>
          </ExpandableCard>

          <ExpandableCard
            icon={<Download size={16} />}
            title="Data Export"
            subtitle="Download your child's learning data"
            gradient="linear-gradient(135deg, #2DD4BF, #14B8A6)"
            delay={300}
            infoText="Export all of your child's learning data as a JSON file. This includes progress, brain profile, session history, and IEP information."
          >
            <p className="text-sm text-[var(--aivo-text-secondary)] mb-4">
              Download all learner data including progress, brain profile,
              session history, and IEP information.
            </p>
            <Button
              variant="outline"
              onClick={handleExport}
              loading={exporting}
              leftIcon={<Download size={16} />}
            >
              Export All Data
            </Button>
          </ExpandableCard>

          <ExpandableCard
            icon={<Brain size={16} />}
            title="Export Brain Data"
            subtitle="Download neural adaptation data and AI model weights"
            gradient="linear-gradient(135deg, #8B5CF6, #6D28D9)"
            delay={400}
            infoText="This exports a complete copy of your child's brain profile data, including neural adaptations, learning patterns, and AI model weights. The file is generated in the background and a download link appears when ready."
          >
              <p className="text-sm text-[var(--aivo-text-secondary)] mb-4">
                Export a complete copy of this learner&apos;s brain profile data, including
                neural adaptations, learning patterns, and AI model weights. The export
                is generated asynchronously and a download link will appear when ready.
              </p>

              {brainExportStatus === "idle" && (
                <Button
                  variant="outline"
                  onClick={handleBrainExport}
                  leftIcon={<Brain size={16} />}
                >
                  Export Brain Data
                </Button>
              )}

              {brainExportStatus === "processing" && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <Loader2 size={20} className="text-[#7C3AED] animate-spin" />
                  <div>
                    <p className="text-sm font-medium text-[var(--aivo-text)]">
                      Generating brain data export...
                    </p>
                    <p className="text-xs text-[var(--aivo-text-secondary)]">
                      This may take a few minutes. You can leave this page and come back.
                    </p>
                  </div>
                </div>
              )}

              {brainExportStatus === "ready" && brainExportDownloadUrl && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-300">
                        Brain data export is ready!
                      </p>
                      {brainExportExpiresAt && (
                        <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
                          <Clock size={12} />
                          Download link expires in 72 hours (
                          {new Date(brainExportExpiresAt).toLocaleDateString()})
                        </p>
                      )}
                    </div>
                  </div>
                  <a
                    href={brainExportDownloadUrl}
                    download
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#7C3AED] text-white text-sm font-medium hover:bg-[#6D28D9] transition-colors"
                  >
                    <Download size={16} />
                    Download Brain Data
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBrainExport}
                    className="ml-2"
                  >
                    Generate New Export
                  </Button>
                </div>
              )}

              {brainExportStatus === "error" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#FFE0E0] dark:bg-[#991B1B]/10 border border-[#FECACA] dark:border-[#991B1B]/30">
                    <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">
                      Export failed. Please try again.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleBrainExport}
                    leftIcon={<RefreshCw size={16} />}
                  >
                    Retry Export
                  </Button>
                </div>
              )}
          </ExpandableCard>

          {exportHistory.length > 0 && (
            <ExpandableCard
              icon={<Clock size={16} />}
              title="Export History"
              subtitle="Previous data exports and download links"
              gradient="linear-gradient(135deg, #6B7280, #4B5563)"
              delay={500}
              defaultExpanded={false}
              infoText="View your previous data exports. Download links expire after 72 hours."
            >
                <div className="space-y-3">
                  {exportHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 border border-[#E8DDF0] dark:border-[#3D2D5C] rounded-2xl"
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
                          Download
                          {entry.expiresAt && (
                            <span className="text-xs text-[var(--aivo-text-muted)] ml-1">
                              (expires {new Date(entry.expiresAt).toLocaleDateString()})
                            </span>
                          )}
                        </a>
                      )}
                      {entry.status === "expired" && (
                        <span className="text-xs text-[#A89BB5]">Link expired</span>
                      )}
                    </div>
                  ))}
                </div>
            </ExpandableCard>
          )}

          <ExpandableCard
            icon={<Trash2 size={16} />}
            title="Danger Zone"
            subtitle="Permanent actions that cannot be undone"
            gradient="linear-gradient(135deg, #EF4444, #DC2626)"
            delay={600}
            defaultExpanded={false}
            infoText="These actions permanently delete data. Please make sure you've exported any data you want to keep before proceeding."
          >
            <div className="space-y-6">
              <div className="p-4 rounded-2xl" style={{ backgroundColor: "var(--aivo-bg)", border: "1px solid var(--aivo-border)" }}>
                <h4 className="font-bold text-red-600 dark:text-red-400 mb-2">Delete Learner Account</h4>
                <p className="text-sm text-[var(--aivo-text-secondary)] mb-4">
                  Permanently delete this learner profile and all associated data.
                  This action cannot be undone.
                </p>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteModal(true)}
                  leftIcon={<Trash2 size={16} />}
                >
                  Delete Learner Account
                </Button>
              </div>

              <div className="p-4 rounded-2xl border-2 border-red-300 dark:border-red-700">
              <p className="text-sm text-[var(--aivo-text-secondary)] mb-3">
                Permanently delete <strong>ALL</strong> data for {learnerName || "this learner"}. This action cannot be undone.
              </p>
              <p className="text-sm text-[var(--aivo-text-secondary)] mb-3">
                This will delete: Brain state, all snapshots, session history, mastery data,
                IEP documents, tutor sessions, homework history, gamification data, and all recommendations.
              </p>
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 mb-4">
                <Shield size={18} className="text-[#D97706] shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  A compliance audit record will be retained per GDPR Article 17(3). The user record will be anonymized for billing audit purposes.
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
                Delete All Data for {learnerName || "Learner"}
              </Button>
              </div>
            </div>
          </ExpandableCard>
        </div>
      )}

      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Learner Account"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              loading={isDeleting}
            >
              Permanently Delete
            </Button>
          </div>
        }
      >
        <p className="text-sm text-[var(--aivo-text-secondary)]">
          Are you sure you want to delete this learner account? All data
          including brain profile, learning history, IEP documents, and progress
          will be permanently removed. This action cannot be undone.
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
        title="Delete All Data"
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
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAllData}
              loading={deletingAllData}
              disabled={!deletePassword || deleteConfirmName !== learnerName}
            >
              Permanently Delete All Data
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#FFE0E0] dark:bg-[#991B1B]/10 border border-[#FECACA] dark:border-[#991B1B]/30">
            <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300 font-medium">
              This action cannot be undone. All brain data, learning history, and
              associated records will be permanently destroyed.
            </p>
          </div>

          <div>
            <label
              htmlFor="delete-confirm-name"
              className="block text-sm font-medium text-[var(--aivo-text)] mb-1"
            >
              Type <strong>{learnerName}</strong> to confirm
            </label>
            <input
              id="delete-confirm-name"
              type="text"
              value={deleteConfirmName}
              onChange={(e) => setDeleteConfirmName(e.target.value)}
              placeholder={learnerName}
              className="w-full px-4 py-2.5 rounded-2xl border border-[#E8DDF0] dark:border-[#3D2D5C] bg-white dark:bg-[#2A1E45] text-[var(--aivo-text)] focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              autoComplete="off"
            />
          </div>

          <div>
            <label
              htmlFor="delete-confirm-password"
              className="block text-sm font-medium text-[var(--aivo-text)] mb-1"
            >
              Enter your password to confirm
            </label>
            <div className="relative">
              <input
                id="delete-confirm-password"
                type={deletePasswordVisible ? "text" : "password"}
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter your account password"
                className="w-full px-4 py-2.5 pr-10 rounded-2xl border border-[#E8DDF0] dark:border-[#3D2D5C] bg-white dark:bg-[#2A1E45] text-[var(--aivo-text)] focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
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

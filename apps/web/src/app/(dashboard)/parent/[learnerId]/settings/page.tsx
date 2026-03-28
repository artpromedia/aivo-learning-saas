"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { apiFetch } from "@/lib/api";

interface LearnerSettings {
  privacyLevel: "standard" | "strict";
  shareWithCollaborators: boolean;
  allowAnalytics: boolean;
  dataRetentionMonths: number;
}

export default function LearnerSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const learnerId = params.learnerId as string;

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
        }>(`/api/family/learners/${learnerId}/export/status`);

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
      await apiFetch(`/api/family/learners/${learnerId}/export`, {
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
    if (!deletePassword) return;
    setDeletingAllData(true);
    setError(null);
    try {
      await apiFetch(`/api/family/learners/${learnerId}/delete-all-data`, {
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

  useEffect(() => {
    async function fetchSettings() {
      try {
        const result = await apiFetch<LearnerSettings>(
          `/api/learners/${learnerId}/settings`,
        );
        setSettings(result);
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
      setSuccessMsg("Settings saved successfully.");
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
      const blob = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/api/learners/${learnerId}/data-export`,
        { credentials: "include" },
      ).then((r) => r.blob());

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `learner-${learnerId}-data.json`;
      a.click();
      URL.revokeObjectURL(url);
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
        <Skeleton height={80} className="w-full rounded-xl" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={100} className="w-full rounded-lg" />
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
          <Settings size={32} />
          <div>
            <h1 className="text-2xl font-bold">Learner Settings</h1>
            <p className="text-white/80 text-sm">
              Privacy, data management, and account settings.
            </p>
          </div>
        </div>
      </PurpleGradientHeader>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm">
          {successMsg}
        </div>
      )}

      {settings && (
        <div className="space-y-6">
          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Shield size={18} className="text-[#7C3AED]" />
                Privacy Settings
              </h3>
            </CardHeader>
            <CardBody className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none"
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
                  className="w-4 h-4 rounded border-gray-300 text-[#7C3AED] focus:ring-[#7C3AED]"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Share progress with collaborators
                  </span>
                  <p className="text-xs text-gray-500">
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
                  className="w-4 h-4 rounded border-gray-300 text-[#7C3AED] focus:ring-[#7C3AED]"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Allow anonymous analytics
                  </span>
                  <p className="text-xs text-gray-500">
                    Help us improve AIVO by sharing anonymized usage data.
                  </p>
                </div>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none"
                >
                  <option value={6}>6 months</option>
                  <option value={12}>12 months</option>
                  <option value={24}>24 months</option>
                  <option value={36}>36 months</option>
                </select>
              </div>
            </CardBody>
          </Card>

          <Button onClick={handleSave} loading={saving} leftIcon={<Save size={16} />}>
            Save Settings
          </Button>

          {/* Data Export */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Download size={18} className="text-[#7C3AED]" />
                Data Export
              </h3>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
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
            </CardBody>
          </Card>

          {/* Export Brain Data */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Brain size={18} className="text-[#7C3AED]" />
                Export Brain Data
              </h3>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
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
                <div className="flex items-center gap-3 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <Loader2 size={20} className="text-[#7C3AED] animate-spin" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Generating brain data export...
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      This may take a few minutes. You can leave this page and come back.
                    </p>
                  </div>
                </div>
              )}

              {brainExportStatus === "ready" && brainExportDownloadUrl && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
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
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7C3AED] text-white text-sm font-medium hover:bg-[#6D28D9] transition-colors"
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
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
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
            </CardBody>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <h3 className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                <Trash2 size={18} />
                Danger Zone
              </h3>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
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
            </CardBody>
          </Card>

          {/* Delete All Data */}
          <Card className="border-2 border-red-300 dark:border-red-700">
            <CardHeader className="bg-red-50 dark:bg-red-900/10">
              <h3 className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle size={18} />
                Delete All Data
              </h3>
            </CardHeader>
            <CardBody>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-4">
                <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
                <div className="text-sm text-red-700 dark:text-red-300">
                  <p className="font-medium mb-1">Warning: This will permanently delete all data</p>
                  <p>
                    This includes the brain profile, all learning sessions, progress history,
                    IEP documents, analytics, and any AI-generated insights. This data cannot
                    be recovered after deletion. We recommend exporting your brain data first.
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={() => {
                  setDeletePassword("");
                  setDeletePasswordVisible(false);
                  setShowDeleteAllModal(true);
                }}
                leftIcon={<Trash2 size={16} />}
              >
                Delete All Data
              </Button>
            </CardBody>
          </Card>
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
        <p className="text-sm text-gray-600 dark:text-gray-400">
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
              }}
              disabled={deletingAllData}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAllData}
              loading={deletingAllData}
              disabled={!deletePassword}
            >
              Permanently Delete All Data
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300 font-medium">
              This action cannot be undone. All brain data, learning history, and
              associated records will be permanently destroyed.
            </p>
          </div>

          <div>
            <label
              htmlFor="delete-confirm-password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
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
                className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setDeletePasswordVisible(!deletePasswordVisible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {deletePasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
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
    </div>
  );
}

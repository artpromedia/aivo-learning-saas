"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
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
  const searchParams = useSearchParams();
  const syncLogId = searchParams.get("id");

  const [syncLog, setSyncLog] = useState<SyncLogFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!syncLogId) return;
    try {
      const result = await apiFetch<SyncLogFull>(
        `/api/integrations/sync-logs/${syncLogId}`,
      );
      setSyncLog(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sync details");
    } finally {
      setLoading(false);
    }
  }, [syncLogId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  async function handleRetryItem(detailId: string) {
    setRetrying(detailId);
    try {
      await apiFetch(`/api/integrations/sync-logs/${syncLogId}/retry/${detailId}`, {
        method: "POST",
      });
      await fetchDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Retry failed");
    } finally {
      setRetrying(null);
    }
  }

  async function handleRetryAllFailed() {
    setRetrying("all");
    try {
      await apiFetch(`/api/integrations/sync-logs/${syncLogId}/retry-all`, {
        method: "POST",
      });
      await fetchDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Retry all failed");
    } finally {
      setRetrying(null);
    }
  }

  const entityIcon = (type: string) => {
    switch (type) {
      case "student":
        return <GraduationCap size={16} className="text-blue-500" />;
      case "teacher":
        return <User size={16} className="text-green-500" />;
      case "section":
        return <BookOpen size={16} className="text-purple-500" />;
      default:
        return <User size={16} className="text-gray-400" />;
    }
  };

  const actionBadge = (action: string) => {
    switch (action) {
      case "ADDED":
        return <Badge variant="success">Added</Badge>;
      case "UPDATED":
        return <Badge variant="warning">Updated</Badge>;
      case "DEACTIVATED":
        return <Badge variant="secondary">Deactivated</Badge>;
      case "ERROR":
        return <Badge variant="error">Error</Badge>;
      default:
        return <Badge>{action}</Badge>;
    }
  };

  if (!syncLogId) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">No sync log ID provided.</p>
        <Link href="/admin/district/integrations" className="text-[#7C3AED] mt-2 inline-block">
          Back to Integrations
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin/district/integrations"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-4"
      >
        <ArrowLeft size={16} />
        Back to Integrations
      </Link>

      <PurpleGradientHeader className="rounded-xl mb-8">
        <h1 className="text-2xl font-bold">Sync Details</h1>
        <p className="mt-1 text-white/80">Drill into sync results and resolve errors.</p>
      </PurpleGradientHeader>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <Skeleton height={120} className="w-full rounded-lg" />
          <Skeleton height={200} className="w-full rounded-lg" />
        </div>
      ) : syncLog ? (
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardBody>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Type</p>
                  <p className="text-lg font-semibold">{syncLog.syncType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                  <Badge variant={syncLog.status === "COMPLETED" ? "success" : "error"}>
                    {syncLog.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Started</p>
                  <p className="text-sm">{new Date(syncLog.startedAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Duration</p>
                  <p className="text-sm">
                    {syncLog.completedAt
                      ? `${Math.round((new Date(syncLog.completedAt).getTime() - new Date(syncLog.startedAt).getTime()) / 1000)}s`
                      : "In progress"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{syncLog.studentsAdded}</p>
                  <p className="text-xs text-gray-500">Students Added</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{syncLog.studentsUpdated}</p>
                  <p className="text-xs text-gray-500">Students Updated</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-600">{syncLog.studentsDeleted}</p>
                  <p className="text-xs text-gray-500">Students Deactivated</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{syncLog.teachersAdded}</p>
                  <p className="text-xs text-gray-500">Teachers Added</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{syncLog.sectionsAdded}</p>
                  <p className="text-xs text-gray-500">Sections</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{syncLog.errors?.length ?? 0}</p>
                  <p className="text-xs text-gray-500">Errors</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Errors */}
          {syncLog.errors && syncLog.errors.length > 0 && (
            <Card>
              <CardBody>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertTriangle size={20} />
                    Sync Errors ({syncLog.errors.length})
                  </h2>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<RefreshCw size={14} />}
                    loading={retrying === "all"}
                    onClick={handleRetryAllFailed}
                  >
                    Retry All Failed
                  </Button>
                </div>
                <div className="space-y-2">
                  {syncLog.errors.map((err, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 border border-red-200 dark:border-red-800 rounded-lg bg-red-50/50 dark:bg-red-900/10"
                    >
                      <div className="flex items-center gap-3">
                        <XCircle size={16} className="text-red-500 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {err.item}
                          </p>
                          <p className="text-xs text-red-600 dark:text-red-400">{err.error}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Detailed Changes */}
          {syncLog.details && syncLog.details.length > 0 && (
            <Card>
              <CardBody>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Change Log ({syncLog.details.length})
                </h2>
                <div className="space-y-2">
                  {syncLog.details.map((detail) => (
                    <div
                      key={detail.id}
                      className="flex items-center gap-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      {entityIcon(detail.entityType)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{detail.entityType}</span>
                          {actionBadge(detail.action)}
                          <span className="text-xs text-gray-400">SIS: {detail.sisId}</span>
                        </div>
                        {detail.error && (
                          <p className="text-xs text-red-500 mt-1">{detail.error}</p>
                        )}
                      </div>
                      {detail.action === "ERROR" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          leftIcon={<RefreshCw size={12} />}
                          loading={retrying === detail.id}
                          onClick={() => handleRetryItem(detail.id)}
                        >
                          Retry
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      ) : null}
    </div>
  );
}

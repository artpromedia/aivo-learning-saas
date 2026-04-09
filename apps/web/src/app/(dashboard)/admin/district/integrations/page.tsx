"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { RefreshCw, CheckCircle, XCircle, Clock, Link2, Key, Webhook, FileSearch } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { apiFetch } from "@/lib/api";

interface SyncHistoryEntry {
  id: string;
  triggeredAt: string;
  completedAt?: string;
  status: "success" | "failed" | "in_progress";
  recordsSynced?: number;
  errorMessage?: string;
}

interface IntegrationStatus {
  provider: "clever" | "classlink" | "none";
  connected: boolean;
  lastSyncAt?: string;
  syncHistory: SyncHistoryEntry[];
}

export default function IntegrationsPage() {
  const [data, setData] = useState<IntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await apiFetch<IntegrationStatus>("/api/integrations/status");
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load integration status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  async function handleSync() {
    setSyncing(true);
    setSyncMessage(null);

    try {
      await apiFetch("/api/integrations/sync", { method: "POST" });
      setSyncMessage("Sync triggered successfully. It may take a few minutes to complete.");
      await fetchStatus();
    } catch (err) {
      setSyncMessage(err instanceof Error ? err.message : "Failed to trigger sync");
    } finally {
      setSyncing(false);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString();
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle size={16} className="text-green-500" />;
      case "failed":
        return <XCircle size={16} className="text-red-500" />;
      case "in_progress":
        return <RefreshCw size={16} className="text-yellow-500 animate-spin" />;
      default:
        return <Clock size={16} className="text-[#A89BB5]" />;
    }
  };

  const statusVariant = (status: string): "success" | "error" | "warning" => {
    switch (status) {
      case "success": return "success";
      case "failed": return "error";
      default: return "warning";
    }
  };

  return (
    <div>
      <PurpleGradientHeader className="rounded-2xl mb-8">
        <h1 className="text-2xl font-extrabold">SIS Integrations</h1>
        <p className="mt-1 text-white/80">
          Manage your Student Information System sync settings.
        </p>
      </PurpleGradientHeader>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-[#FFE0E0] dark:bg-[#991B1B]/10 border border-[#FECACA] dark:border-[#991B1B]/30 text-[#991B1B] dark:text-[#F87171]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <Card>
            <CardBody className="space-y-4">
              <Skeleton height={24} className="w-48" />
              <Skeleton height={16} className="w-72" />
              <Skeleton height={40} className="w-40" />
            </CardBody>
          </Card>
          <Card>
            <CardBody className="space-y-3">
              <Skeleton height={20} className="w-32" />
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height={48} className="w-full" rounded="lg" />
              ))}
            </CardBody>
          </Card>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Quick navigation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/district/integrations/lti">
              <Card className="hover:border-[#7C3AED] transition-colors cursor-pointer">
                <CardBody className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#7C3AED]/10 flex items-center justify-center">
                    <Key size={20} className="text-[#7C3AED]" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--aivo-text)]">LTI Configuration</p>
                    <p className="text-xs text-[var(--aivo-text-secondary)]">Manage LTI 1.3 platforms</p>
                  </div>
                </CardBody>
              </Card>
            </Link>
            <Link href="/admin/district/integrations/webhooks">
              <Card className="hover:border-[#7C3AED] transition-colors cursor-pointer">
                <CardBody className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#7C3AED]/10 flex items-center justify-center">
                    <Webhook size={20} className="text-[#7C3AED]" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--aivo-text)]">Outbound Webhooks</p>
                    <p className="text-xs text-[var(--aivo-text-secondary)]">Endpoints & delivery logs</p>
                  </div>
                </CardBody>
              </Card>
            </Link>
            <Link href={`/admin/district/integrations/sync?id=${data.syncHistory[0]?.id ?? ""}`}>
              <Card className="hover:border-[#7C3AED] transition-colors cursor-pointer">
                <CardBody className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#7C3AED]/10 flex items-center justify-center">
                    <FileSearch size={20} className="text-[#7C3AED]" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--aivo-text)]">Sync Error Dashboard</p>
                    <p className="text-xs text-[var(--aivo-text-secondary)]">Drill into sync details</p>
                  </div>
                </CardBody>
              </Card>
            </Link>
          </div>

          <Card>
            <CardBody>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#7C3AED]/10 flex items-center justify-center text-[#7C3AED] shrink-0">
                  <Link2 size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-lg font-bold text-[var(--aivo-text)]">
                      {data.provider === "clever"
                        ? "Clever"
                        : data.provider === "classlink"
                          ? "ClassLink"
                          : "No SIS Connected"}
                    </h2>
                    {data.connected ? (
                      <Badge variant="success">Connected</Badge>
                    ) : (
                      <Badge variant="secondary">Disconnected</Badge>
                    )}
                  </div>
                  {data.lastSyncAt && (
                    <p className="text-sm text-[var(--aivo-text-secondary)]">
                      Last synced: {formatDate(data.lastSyncAt)}
                    </p>
                  )}
                  {!data.lastSyncAt && data.connected && (
                    <p className="text-sm text-[var(--aivo-text-secondary)]">
                      No syncs have been performed yet.
                    </p>
                  )}
                </div>
                <Button
                  leftIcon={<RefreshCw size={16} />}
                  loading={syncing}
                  disabled={!data.connected}
                  onClick={handleSync}
                >
                  Trigger Manual Sync
                </Button>
              </div>
              {syncMessage && (
                <p className="mt-3 text-sm text-[var(--aivo-text-secondary)] bg-[var(--aivo-bg)] p-3 rounded-2xl">
                  {syncMessage}
                </p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h2 className="text-lg font-bold text-[var(--aivo-text)] mb-4">
                Sync History
              </h2>
              {data.syncHistory.length === 0 ? (
                <p className="text-[var(--aivo-text-secondary)] text-sm py-4 text-center">
                  No sync history available.
                </p>
              ) : (
                <div className="space-y-3">
                  {data.syncHistory.map((entry) => (
                    <Link
                      key={entry.id}
                      href={`/admin/district/integrations/sync?id=${entry.id}`}
                      className="flex items-center gap-4 p-3 border border-[#E8DDF0] dark:border-[#3D2D5C] rounded-2xl hover:border-[#7C3AED] transition-colors"
                    >
                      {statusIcon(entry.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[var(--aivo-text)]">
                            {formatDate(entry.triggeredAt)}
                          </span>
                          <Badge variant={statusVariant(entry.status)}>
                            {entry.status === "in_progress" ? "In Progress" : entry.status}
                          </Badge>
                        </div>
                        {entry.recordsSynced !== undefined && (
                          <p className="text-xs text-[var(--aivo-text-secondary)] mt-0.5">
                            {entry.recordsSynced} records synced
                          </p>
                        )}
                        {entry.errorMessage && (
                          <p className="text-xs text-red-500 mt-0.5">{entry.errorMessage}</p>
                        )}
                      </div>
                      {entry.completedAt && (
                        <span className="text-xs text-[var(--aivo-text-muted)] shrink-0">
                          Completed: {formatDate(entry.completedAt)}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

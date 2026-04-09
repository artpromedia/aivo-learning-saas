"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { RefreshCw, CheckCircle, XCircle, Clock, Link2, Key, Webhook, FileSearch } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, BackLink, ExpandableCard, AnimatedCard } from "@/components/ui/PageDesign";
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
      case "success": return <CheckCircle size={16} className="text-green-500" />;
      case "failed": return <XCircle size={16} className="text-red-500" />;
      case "in_progress": return <RefreshCw size={16} className="text-yellow-500 animate-spin" />;
      default: return <Clock size={16} className="text-[#A89BB5]" />;
    }
  };

  const statusVariant = (status: string): "success" | "error" | "warning" => {
    switch (status) {
      case "success": return "success";
      case "failed": return "error";
      default: return "warning";
    }
  };

  const latestSyncId = data?.syncHistory?.[0]?.id ?? "";
  const quickLinks = [
    { href: "/admin/district/integrations/lti", icon: Key, label: "LTI Configuration", desc: "Manage LTI 1.3 platforms", gradient: "linear-gradient(135deg, #7C3AED, #A855F7)" },
    { href: "/admin/district/integrations/webhooks", icon: Webhook, label: "Outbound Webhooks", desc: "Endpoints & delivery logs", gradient: "linear-gradient(135deg, #3B82F6, #2563EB)" },
    { href: `/admin/district/integrations/sync?id=${latestSyncId}`, icon: FileSearch, label: "Sync Error Dashboard", desc: "Drill into sync details", gradient: "linear-gradient(135deg, #2DD4BF, #14B8A6)" },
  ];

  return (
    <PageWrapper>
      <BackLink href="/admin/district">Back to District</BackLink>

      <PurpleGradientHeader className="rounded-2xl mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
            <Link2 size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">SIS Integrations</h1>
            <p className="mt-0.5 text-white/80 text-sm">
              Manage your Student Information System sync settings
            </p>
          </div>
        </div>
      </PurpleGradientHeader>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-[#FFE0E0] dark:bg-[#991B1B]/10 border border-[#FECACA] dark:border-[#991B1B]/30 text-[#991B1B] dark:text-[#F87171]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (<Skeleton key={i} height={80} className="w-full rounded-2xl" />))}
          </div>
          <Skeleton height={120} className="w-full rounded-2xl" />
        </div>
      ) : data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickLinks.map(({ href, icon: Icon, label, desc, gradient }, idx) => (
              <AnimatedCard key={href} delay={100 + idx * 80}>
                <Link href={href}>
                  <Card className="hover:shadow-[var(--shadow-hover)] transition-all cursor-pointer hover:scale-[1.02]">
                    <CardBody className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0" style={{ background: gradient }}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: "var(--aivo-text)" }}>{label}</p>
                        <p className="text-xs" style={{ color: "var(--aivo-text-secondary)" }}>{desc}</p>
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              </AnimatedCard>
            ))}
          </div>

          <ExpandableCard
            icon={<Link2 size={16} />}
            title={data.provider === "clever" ? "Clever" : data.provider === "classlink" ? "ClassLink" : "No SIS Connected"}
            subtitle={data.lastSyncAt ? `Last synced: ${formatDate(data.lastSyncAt)}` : data.connected ? "No syncs performed yet" : "Connect a SIS provider"}
            gradient="linear-gradient(135deg, #7C3AED, #A855F7)"
            delay={400}
            infoText="This shows the status of your Student Information System connection. Manual syncs pull the latest data from your SIS."
          >
            <div className="flex items-center justify-between">
              <Badge variant={data.connected ? "success" : "secondary"}>
                {data.connected ? "Connected" : "Disconnected"}
              </Badge>
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
              <p className="mt-3 text-sm p-3 rounded-2xl" style={{ backgroundColor: "var(--aivo-bg)", color: "var(--aivo-text-secondary)" }}>
                {syncMessage}
              </p>
            )}
          </ExpandableCard>

          <ExpandableCard
            icon={<Clock size={16} />}
            title="Sync History"
            subtitle={`${data.syncHistory?.length ?? 0} sync records`}
            gradient="linear-gradient(135deg, #6B7280, #4B5563)"
            delay={500}
            defaultExpanded={false}
            infoText="View the history of all SIS sync operations. Click on an entry to see detailed results."
          >
            {!data.syncHistory || data.syncHistory.length === 0 ? (
              <p className="text-sm py-4 text-center" style={{ color: "var(--aivo-text-secondary)" }}>
                No sync history available.
              </p>
            ) : (
              <div className="space-y-3">
                {(data.syncHistory ?? []).map((entry) => (
                  <Link
                    key={entry.id}
                    href={`/admin/district/integrations/sync?id=${entry.id}`}
                    className="flex items-center gap-4 p-3 border border-[#E8DDF0] dark:border-[#3D2D5C] rounded-2xl hover:border-[#7C3AED] transition-colors"
                  >
                    {statusIcon(entry.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium" style={{ color: "var(--aivo-text)" }}>
                          {formatDate(entry.triggeredAt)}
                        </span>
                        <Badge variant={statusVariant(entry.status)}>
                          {entry.status === "in_progress" ? "In Progress" : entry.status}
                        </Badge>
                      </div>
                      {entry.recordsSynced !== undefined && (
                        <p className="text-xs mt-0.5" style={{ color: "var(--aivo-text-secondary)" }}>
                          {entry.recordsSynced} records synced
                        </p>
                      )}
                      {entry.errorMessage && (
                        <p className="text-xs text-red-500 mt-0.5">{entry.errorMessage}</p>
                      )}
                    </div>
                    {entry.completedAt && (
                      <span className="text-xs shrink-0" style={{ color: "var(--aivo-text-muted)" }}>
                        Completed: {formatDate(entry.completedAt)}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </ExpandableCard>
        </div>
      ) : null}
    </PageWrapper>
  );
}

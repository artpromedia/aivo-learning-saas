"use client";

import React, { useEffect, useState } from "react";
import { FileText, Search, Filter, Shield, AlertTriangle, CheckCircle, Info, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, BackLink, AnimatedCard, ExpandableCard } from "@/components/ui/PageDesign";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiFetch } from "@/lib/api";

interface AuditEntry {
  id: string;
  action: string;
  actor: string;
  actorRole: string;
  target: string;
  targetType: string;
  severity: "info" | "warning" | "critical";
  timestamp: string;
  ip: string;
  details?: string;
}

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const t = useTranslations("platformAdmin");

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await apiFetch<{ entries: AuditEntry[] }>("/api/admin/platform/audit");
        setEntries(result.entries ?? []);
      } catch {
        setEntries([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filtered = entries.filter((e) => {
    const matchesSearch = e.action.toLowerCase().includes(search.toLowerCase()) || e.actor.toLowerCase().includes(search.toLowerCase()) || e.target.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === "all" || e.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const sevIcons: Record<string, React.ReactNode> = { info: <Info size={14} className="text-blue-500" />, warning: <AlertTriangle size={14} className="text-yellow-500" />, critical: <Shield size={14} className="text-red-500" /> };
  const sevColors: Record<string, string> = { info: "default", warning: "warning", critical: "error" };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={120} className="w-full rounded-3xl" />
        <div className="space-y-3">{[1, 2, 3, 4, 5].map((i) => (<Skeleton key={i} height={60} className="w-full rounded-3xl" />))}</div>
      </div>
    );
  }

  return (
    <PageWrapper>
      <BackLink href="/admin/platform">{t("backToDashboard")}</BackLink>

      <PurpleGradientHeader className="rounded-3xl mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
            <FileText size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{t("auditTitle")}</h1>
            <p className="text-white/80 text-sm">{t("auditSubtitle")}</p>
          </div>
        </div>
      </PurpleGradientHeader>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--aivo-text-muted)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("auditSearchPlaceholder")}
            className="w-full pl-11 pr-4 py-3 rounded-3xl border border-[#E8DDF0] bg-white text-[var(--aivo-text)] focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none"
          />
        </div>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-4 py-3 rounded-3xl border border-[#E8DDF0] bg-white text-[var(--aivo-text)] focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none text-sm"
        >
          <option value="all">{t("auditAllSeverity")}</option>
          <option value="info">{t("severityInfo")}</option>
          <option value="warning">{t("severityWarning")}</option>
          <option value="critical">{t("severityCritical")}</option>
        </select>
      </div>

      <ExpandableCard
        icon={<FileText size={16} />}
        title={t("auditEntriesCount", { count: filtered.length })}
        subtitle={t("auditEntriesSubtitle")}
        gradient="linear-gradient(135deg, #6B7280, #4B5563)"
        delay={200}
      >
        <div className="space-y-2">
          {filtered.map((entry, idx) => (
            <AnimatedCard key={entry.id} delay={300 + idx * 30}>
              <div className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: "var(--aivo-bg)", border: "1px solid var(--aivo-border)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: entry.severity === "critical" ? "rgba(239,68,68,0.1)" : entry.severity === "warning" ? "rgba(245,158,11,0.1)" : "rgba(59,130,246,0.1)" }}>
                  {sevIcons[entry.severity]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm" style={{ color: "var(--aivo-text)" }}>{entry.action}</h3>
                    <Badge variant={sevColors[entry.severity] as "default" | "warning" | "error" ?? "default"}>{entry.severity}</Badge>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "var(--aivo-text-muted)" }}>
                    {t("auditByActor", { actor: entry.actor, role: entry.actorRole, target: entry.target, targetType: entry.targetType })}
                  </p>
                  {entry.details && <p className="text-xs mt-1" style={{ color: "var(--aivo-text-muted)" }}>{entry.details}</p>}
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] flex items-center gap-1" style={{ color: "var(--aivo-text-muted)" }}><Clock size={10} />{new Date(entry.timestamp).toLocaleString()}</span>
                    <span className="text-[10px]" style={{ color: "var(--aivo-text-muted)" }}>{t("auditIp", { ip: entry.ip })}</span>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </ExpandableCard>
    </PageWrapper>
  );
}

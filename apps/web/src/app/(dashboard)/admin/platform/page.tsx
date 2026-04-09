"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3, Building2, Users, CreditCard, TrendingUp, Activity, Globe, Server,
  ArrowUpRight, AlertTriangle, CheckCircle,
} from "lucide-react";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, StatCard, ExpandableCard, AnimatedCard } from "@/components/ui/PageDesign";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuthStore } from "@/stores/auth.store";
import { apiFetch } from "@/lib/api";
import { hasPermission } from "@/lib/rbac";
import type { PlatformRole } from "@/lib/rbac";

interface PlatformOverview {
  totalDistricts: number;
  totalUsers: number;
  totalLearners: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  systemHealth: "healthy" | "degraded" | "down";
  uptime: number;
  apiLatency: number;
  recentActivity: { id: string; action: string; user: string; timestamp: string; type: "info" | "warning" | "success" }[];
  topDistricts: { name: string; learners: number; mastery: number }[];
}

export default function PlatformDashboardPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<PlatformOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const platformRole = (user?.platformRole ?? "super_admin") as PlatformRole;

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await apiFetch<PlatformOverview>("/api/admin/platform/overview");
        setData(result);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={120} className="w-full rounded-3xl" />
        <div className="grid gap-4 sm:grid-cols-4">{[1, 2, 3, 4].map((i) => (<Skeleton key={i} height={100} className="w-full rounded-3xl" />))}</div>
      </div>
    );
  }

  if (!data) return null;

  const healthColors = { healthy: "#10B981", degraded: "#F59E0B", down: "#EF4444" };
  const healthLabels = { healthy: "All Systems Operational", degraded: "Partial Degradation", down: "System Down" };

  return (
    <PageWrapper>
      <PurpleGradientHeader className="rounded-3xl mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
            <BarChart3 size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">Platform Dashboard</h1>
            <p className="text-white/80 text-sm">Enterprise overview of AIVO Learning</p>
          </div>
        </div>
      </PurpleGradientHeader>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard icon={<Building2 size={18} />} label="Districts" value={data.totalDistricts} color="#3B82F6" delay={100} />
        <StatCard icon={<Users size={18} />} label="Total Users" value={data.totalUsers.toLocaleString()} color="#7C3AED" delay={200} />
        <StatCard icon={<TrendingUp size={18} />} label="Active Learners" value={data.totalLearners.toLocaleString()} color="#10B981" delay={300} />
        <StatCard icon={<CreditCard size={18} />} label="Active Subs" value={data.activeSubscriptions} color="#F59E0B" delay={400} />
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-8">
        <AnimatedCard delay={150}>
          <div className="rounded-3xl p-5 text-center transition-all duration-200 hover:shadow-[var(--shadow-hover)]" style={{ backgroundColor: "var(--aivo-bg-card)", border: "1px solid var(--aivo-border)" }}>
            <div className="w-12 h-12 rounded-3xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: `${healthColors[data.systemHealth]}18` }}>
              {data.systemHealth === "healthy" ? <CheckCircle size={22} style={{ color: healthColors[data.systemHealth] }} /> : <AlertTriangle size={22} style={{ color: healthColors[data.systemHealth] }} />}
            </div>
            <p className="text-xs font-bold" style={{ color: healthColors[data.systemHealth] }}>{healthLabels[data.systemHealth]}</p>
          </div>
        </AnimatedCard>
        <AnimatedCard delay={200}>
          <div className="rounded-3xl p-5 text-center transition-all duration-200 hover:shadow-[var(--shadow-hover)]" style={{ backgroundColor: "var(--aivo-bg-card)", border: "1px solid var(--aivo-border)" }}>
            <div className="w-12 h-12 rounded-3xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: "#7C3AED18", color: "#7C3AED" }}>
              <Server size={22} />
            </div>
            <p className="text-lg font-extrabold" style={{ color: "var(--aivo-text)", fontFamily: "var(--font-display)" }}>{data.uptime}%</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--aivo-text-muted)" }}>Uptime (30d)</p>
          </div>
        </AnimatedCard>
        <AnimatedCard delay={250}>
          <div className="rounded-3xl p-5 text-center transition-all duration-200 hover:shadow-[var(--shadow-hover)]" style={{ backgroundColor: "var(--aivo-bg-card)", border: "1px solid var(--aivo-border)" }}>
            <div className="w-12 h-12 rounded-3xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: "#3B82F618", color: "#3B82F6" }}>
              <Activity size={22} />
            </div>
            <p className="text-lg font-extrabold" style={{ color: "var(--aivo-text)", fontFamily: "var(--font-display)" }}>{data.apiLatency}ms</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--aivo-text-muted)" }}>Avg API Latency</p>
          </div>
        </AnimatedCard>
        <AnimatedCard delay={300}>
          <div className="rounded-3xl p-5 text-center transition-all duration-200 hover:shadow-[var(--shadow-hover)]" style={{ backgroundColor: "var(--aivo-bg-card)", border: "1px solid var(--aivo-border)" }}>
            <div className="w-12 h-12 rounded-3xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: "#10B98118", color: "#10B981" }}>
              <Globe size={22} />
            </div>
            <p className="text-lg font-extrabold" style={{ color: "var(--aivo-text)", fontFamily: "var(--font-display)" }}>${(data.monthlyRevenue / 100).toLocaleString()}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--aivo-text-muted)" }}>Monthly Revenue</p>
          </div>
        </AnimatedCard>
      </div>

      {hasPermission(platformRole, "platform.districts.view") && (
        <ExpandableCard
          icon={<Building2 size={16} />}
          title="Top Districts"
          subtitle="Highest-performing districts by learner count"
          gradient="linear-gradient(135deg, #3B82F6, #2563EB)"
          delay={350}
          linkHref="/admin/platform/districts"
          linkLabel="View all districts"
        >
          <div className="space-y-3">
            {data.topDistricts.map((district, idx) => (
              <AnimatedCard key={district.name} delay={Math.min(400 + idx * 30, 500)}>
                <div className="flex items-center gap-4 p-3 rounded-xl" style={{ backgroundColor: "var(--aivo-bg)", border: "1px solid var(--aivo-border)" }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-extrabold text-white" style={{ background: "linear-gradient(135deg, #3B82F6, #2563EB)" }}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate" style={{ color: "var(--aivo-text)" }}>{district.name}</h3>
                    <p className="text-xs" style={{ color: "var(--aivo-text-muted)" }}>{district.learners} learners</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: "#7C3AED" }}>{district.mastery}%</p>
                    <p className="text-[10px]" style={{ color: "var(--aivo-text-muted)" }}>Avg Mastery</p>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </ExpandableCard>
      )}

      <div className="mt-6">
        <ExpandableCard
          icon={<Activity size={16} />}
          title="Recent Activity"
          subtitle="Latest actions across the platform"
          gradient="linear-gradient(135deg, #7C3AED, #A855F7)"
          delay={450}
          linkHref="/admin/platform/audit"
          linkLabel="View full audit log"
        >
          <div className="space-y-2">
            {data.recentActivity.map((item, idx) => (
              <AnimatedCard key={item.id} delay={Math.min(350 + idx * 30, 500)}>
                <div className="flex items-center gap-3 p-2.5 rounded-xl" style={{ backgroundColor: "var(--aivo-bg)" }}>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${item.type === "warning" ? "bg-yellow-400" : item.type === "success" ? "bg-green-400" : "bg-blue-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={{ color: "var(--aivo-text)" }}>{item.action}</p>
                    <p className="text-[10px]" style={{ color: "var(--aivo-text-muted)" }}>{item.user} &middot; {new Date(item.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </ExpandableCard>
      </div>

      <div className="mt-6 grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/admin/platform/districts", label: "Districts", icon: <Building2 size={20} />, gradient: "linear-gradient(135deg, #3B82F6, #2563EB)", perm: "platform.districts.view" as const },
          { href: "/admin/platform/users", label: "Users", icon: <Users size={20} />, gradient: "linear-gradient(135deg, #2DD4BF, #14B8A6)", perm: "platform.users.view" as const },
          { href: "/admin/platform/subscriptions", label: "Subscriptions", icon: <CreditCard size={20} />, gradient: "linear-gradient(135deg, #F59E0B, #D97706)", perm: "platform.subscriptions.view" as const },
          { href: "/admin/platform/settings", label: "Settings", icon: <Activity size={20} />, gradient: "linear-gradient(135deg, #10B981, #059669)", perm: "platform.settings.view" as const },
        ].filter((item) => hasPermission(platformRole, item.perm)).map((item) => (
          <Link key={item.href} href={item.href}>
            <div className="rounded-3xl p-5 text-center transition-all cursor-pointer hover:scale-[1.03] h-full" style={{ backgroundColor: "var(--aivo-bg-card)", border: "1px solid var(--aivo-border)" }}>
              <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center text-white" style={{ background: item.gradient }}>{item.icon}</div>
              <span className="text-sm font-bold block" style={{ color: "var(--aivo-text)" }}>{item.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </PageWrapper>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { CreditCard, TrendingUp, DollarSign, Users, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, BackLink, StatCard, ExpandableCard, AnimatedCard } from "@/components/ui/PageDesign";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiFetch } from "@/lib/api";

interface Subscription {
  id: string;
  district: string;
  plan: string;
  status: "active" | "trial" | "past_due" | "canceled";
  mrr: number;
  learners: number;
  renewsAt: string;
}

interface SubsOverview {
  totalMrr: number;
  totalArr: number;
  activeCount: number;
  trialCount: number;
  pastDueCount: number;
  churnRate: number;
  subscriptions: Subscription[];
}

export default function SubscriptionsPage() {
  const [data, setData] = useState<SubsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await apiFetch<SubsOverview>("/api/admin/platform/subscriptions");
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
        <Skeleton height={120} className="w-full rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-4">{[1, 2, 3, 4].map((i) => (<Skeleton key={i} height={100} className="w-full rounded-2xl" />))}</div>
      </div>
    );
  }

  if (!data) return null;

  const statusIcons: Record<string, React.ReactNode> = {
    active: <CheckCircle size={14} className="text-green-500" />,
    trial: <Clock size={14} className="text-yellow-500" />,
    past_due: <AlertTriangle size={14} className="text-red-500" />,
    canceled: <AlertTriangle size={14} className="text-gray-400" />,
  };
  const statusBadge: Record<string, string> = { active: "success", trial: "warning", past_due: "error", canceled: "secondary" };

  return (
    <PageWrapper>
      <BackLink href="/admin/platform">Back to Dashboard</BackLink>

      <PurpleGradientHeader className="rounded-2xl mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
            <CreditCard size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">Subscriptions</h1>
            <p className="text-white/80 text-sm">Revenue and subscription management</p>
          </div>
        </div>
      </PurpleGradientHeader>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard icon={<DollarSign size={18} />} label="Monthly Revenue" value={`$${(data.totalMrr / 100).toLocaleString()}`} color="#10B981" delay={100} />
        <StatCard icon={<TrendingUp size={18} />} label="Annual Revenue" value={`$${(data.totalArr / 100).toLocaleString()}`} color="#7C3AED" delay={200} />
        <StatCard icon={<CheckCircle size={18} />} label="Active" value={data.activeCount} color="#3B82F6" delay={300} />
        <StatCard icon={<AlertTriangle size={18} />} label="Churn Rate" value={`${data.churnRate}%`} color="#EF4444" delay={400} />
      </div>

      <div className="grid gap-3 grid-cols-3 mb-8">
        <AnimatedCard delay={500}>
          <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: "var(--aivo-bg-card)", border: "1px solid var(--aivo-border)" }}>
            <CheckCircle size={20} className="mx-auto mb-2 text-green-500" />
            <p className="text-lg font-extrabold" style={{ color: "var(--aivo-text)" }}>{data.activeCount}</p>
            <p className="text-xs" style={{ color: "var(--aivo-text-muted)" }}>Active</p>
          </div>
        </AnimatedCard>
        <AnimatedCard delay={600}>
          <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: "var(--aivo-bg-card)", border: "1px solid var(--aivo-border)" }}>
            <Clock size={20} className="mx-auto mb-2 text-yellow-500" />
            <p className="text-lg font-extrabold" style={{ color: "var(--aivo-text)" }}>{data.trialCount}</p>
            <p className="text-xs" style={{ color: "var(--aivo-text-muted)" }}>Trials</p>
          </div>
        </AnimatedCard>
        <AnimatedCard delay={700}>
          <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: "var(--aivo-bg-card)", border: "1px solid var(--aivo-border)" }}>
            <AlertTriangle size={20} className="mx-auto mb-2 text-red-500" />
            <p className="text-lg font-extrabold" style={{ color: "var(--aivo-text)" }}>{data.pastDueCount}</p>
            <p className="text-xs" style={{ color: "var(--aivo-text-muted)" }}>Past Due</p>
          </div>
        </AnimatedCard>
      </div>

      <ExpandableCard
        icon={<CreditCard size={16} />}
        title={`All Subscriptions (${data.subscriptions.length})`}
        subtitle="District and individual plan subscriptions"
        gradient="linear-gradient(135deg, #F59E0B, #D97706)"
        delay={800}
      >
        <div className="space-y-2">
          {data.subscriptions.map((sub, idx) => (
            <AnimatedCard key={sub.id} delay={900 + idx * 50}>
              <div className="flex items-center gap-4 p-3 rounded-xl" style={{ backgroundColor: "var(--aivo-bg)", border: "1px solid var(--aivo-border)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(245,158,11,0.1)" }}>
                  {statusIcons[sub.status]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm truncate" style={{ color: "var(--aivo-text)" }}>{sub.district}</h3>
                    <Badge variant={statusBadge[sub.status] as "success" | "warning" | "error" | "secondary" ?? "default"}>{sub.status.replace("_", " ")}</Badge>
                  </div>
                  <p className="text-xs" style={{ color: "var(--aivo-text-muted)" }}>{sub.plan} &middot; {sub.learners} learners &middot; Renews {new Date(sub.renewsAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: "#10B981" }}>${(sub.mrr / 100).toLocaleString()}/mo</p>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </ExpandableCard>
    </PageWrapper>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Search, Users, TrendingUp, MapPin, ChevronRight } from "lucide-react";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, BackLink, StatCard, ExpandableCard, AnimatedCard } from "@/components/ui/PageDesign";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuthStore } from "@/stores/auth.store";
import { apiFetch } from "@/lib/api";
import { hasPermission } from "@/lib/rbac";
import type { PlatformRole } from "@/lib/rbac";

interface District {
  id: string;
  name: string;
  state: string;
  learnerCount: number;
  teacherCount: number;
  avgMastery: number;
  status: "active" | "trial" | "suspended";
  plan: string;
  createdAt: string;
}

export default function DistrictsPage() {
  const { user } = useAuthStore();
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const platformRole = (user?.platformRole ?? "super_admin") as PlatformRole;
  const canManage = hasPermission(platformRole, "platform.districts.manage");

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await apiFetch<{ districts: District[] }>("/api/admin/platform/districts");
        setDistricts(result.districts ?? []);
      } catch {
        setDistricts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filtered = districts.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.state.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors: Record<string, string> = { active: "success", trial: "warning", suspended: "error" };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={120} className="w-full rounded-2xl" />
        <div className="space-y-3">{[1, 2, 3, 4].map((i) => (<Skeleton key={i} height={80} className="w-full rounded-2xl" />))}</div>
      </div>
    );
  }

  return (
    <PageWrapper>
      <BackLink href="/admin/platform">Back to Dashboard</BackLink>

      <PurpleGradientHeader className="rounded-2xl mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
            <Building2 size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">Districts</h1>
            <p className="text-white/80 text-sm">Manage all school districts on the platform</p>
          </div>
        </div>
      </PurpleGradientHeader>

      <div className="grid gap-3 grid-cols-3 mb-8">
        <StatCard icon={<Building2 size={18} />} label="Total Districts" value={districts.length} color="#3B82F6" delay={100} />
        <StatCard icon={<Users size={18} />} label="Total Learners" value={districts.reduce((s, d) => s + d.learnerCount, 0).toLocaleString()} color="#7C3AED" delay={200} />
        <StatCard icon={<TrendingUp size={18} />} label="Avg Mastery" value={`${Math.round(districts.reduce((s, d) => s + d.avgMastery, 0) / (districts.length || 1))}%`} color="#10B981" delay={300} />
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--aivo-text-muted)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search districts..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#E8DDF0] bg-white text-[var(--aivo-text)] focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none"
          />
        </div>
      </div>

      <ExpandableCard
        icon={<Building2 size={16} />}
        title={`All Districts (${filtered.length})`}
        subtitle="Click any district to view details"
        gradient="linear-gradient(135deg, #3B82F6, #2563EB)"
        delay={400}
      >
        <div className="space-y-3">
          {filtered.map((district, idx) => (
            <AnimatedCard key={district.id} delay={500 + idx * 60}>
              <Link href={`/admin/platform/districts/${district.id}`}>
                <div className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.01]" style={{ backgroundColor: "var(--aivo-bg)", border: "1px solid var(--aivo-border)" }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: "linear-gradient(135deg, #3B82F6, #2563EB)" }}>
                    <Building2 size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold truncate" style={{ color: "var(--aivo-text)" }}>{district.name}</h3>
                      <Badge variant={statusColors[district.status] as "success" | "warning" | "error" ?? "default"}>{district.status}</Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs flex items-center gap-1" style={{ color: "var(--aivo-text-muted)" }}><MapPin size={12} />{district.state}</span>
                      <span className="text-xs" style={{ color: "var(--aivo-text-muted)" }}>{district.learnerCount} learners</span>
                      <span className="text-xs" style={{ color: "var(--aivo-text-muted)" }}>{district.teacherCount} teachers</span>
                      <span className="text-xs font-bold" style={{ color: "#7C3AED" }}>{district.avgMastery}% mastery</span>
                    </div>
                  </div>
                  <ChevronRight size={18} style={{ color: "var(--aivo-text-muted)" }} />
                </div>
              </Link>
            </AnimatedCard>
          ))}
        </div>
      </ExpandableCard>
    </PageWrapper>
  );
}

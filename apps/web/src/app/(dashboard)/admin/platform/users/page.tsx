"use client";

import React, { useEffect, useState } from "react";
import { Users, Search, Shield, UserCheck, UserX, Mail, Calendar } from "lucide-react";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, BackLink, StatCard, ExpandableCard, AnimatedCard } from "@/components/ui/PageDesign";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuthStore } from "@/stores/auth.store";
import { apiFetch } from "@/lib/api";
import { hasPermission, PLATFORM_ROLE_LABELS } from "@/lib/rbac";
import type { PlatformRole } from "@/lib/rbac";

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: string;
  platformRole?: string;
  status: "active" | "suspended" | "pending";
  district?: string;
  lastLoginAt: string;
  createdAt: string;
}

export default function UsersPage() {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const platformRole = (user?.platformRole ?? "super_admin") as PlatformRole;
  const canManage = hasPermission(platformRole, "platform.users.manage");

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await apiFetch<{ users: PlatformUser[] }>("/api/admin/platform/users");
        setUsers(result.users ?? []);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filtered = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleBadgeColors: Record<string, string> = { parent: "default", teacher: "success", admin: "warning", platform_admin: "error", learner: "secondary" };
  const statusColors: Record<string, string> = { active: "success", suspended: "error", pending: "warning" };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={120} className="w-full rounded-3xl" />
        <div className="space-y-3">{[1, 2, 3, 4, 5].map((i) => (<Skeleton key={i} height={70} className="w-full rounded-3xl" />))}</div>
      </div>
    );
  }

  const roles = ["all", ...Array.from(new Set(users.map((u) => u.role)))];

  return (
    <PageWrapper>
      <BackLink href="/admin/platform">Back to Dashboard</BackLink>

      <PurpleGradientHeader className="rounded-3xl mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
            <Users size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">User Management</h1>
            <p className="text-white/80 text-sm">View and manage all platform users</p>
          </div>
        </div>
      </PurpleGradientHeader>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard icon={<Users size={18} />} label="Total Users" value={users.length} color="#7C3AED" delay={100} />
        <StatCard icon={<UserCheck size={18} />} label="Active" value={users.filter((u) => u.status === "active").length} color="#10B981" delay={200} />
        <StatCard icon={<UserX size={18} />} label="Suspended" value={users.filter((u) => u.status === "suspended").length} color="#EF4444" delay={300} />
        <StatCard icon={<Shield size={18} />} label="Platform Admins" value={users.filter((u) => u.role === "platform_admin").length} color="#F59E0B" delay={400} />
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--aivo-text-muted)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full pl-11 pr-4 py-3 rounded-3xl border border-[#E8DDF0] bg-white text-[var(--aivo-text)] focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-3 rounded-3xl border border-[#E8DDF0] bg-white text-[var(--aivo-text)] focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none text-sm"
        >
          {roles.map((r) => <option key={r} value={r}>{r === "all" ? "All Roles" : r.replace("_", " ")}</option>)}
        </select>
      </div>

      <ExpandableCard
        icon={<Users size={16} />}
        title={`Users (${filtered.length})`}
        subtitle="All registered users across the platform"
        gradient="linear-gradient(135deg, #7C3AED, #A855F7)"
        delay={500}
      >
        <div className="space-y-2">
          {filtered.map((u, idx) => (
            <AnimatedCard key={u.id} delay={600 + idx * 40}>
              <div className="flex items-center gap-4 p-3 rounded-xl" style={{ backgroundColor: "var(--aivo-bg)", border: "1px solid var(--aivo-border)" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-extrabold text-white shrink-0" style={{ background: "linear-gradient(135deg, #7C3AED, #A855F7)" }}>
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm truncate" style={{ color: "var(--aivo-text)" }}>{u.name}</h3>
                    <Badge variant={roleBadgeColors[u.role] as "default" | "success" | "warning" | "error" | "secondary" ?? "default"}>{u.role.replace("_", " ")}</Badge>
                    <Badge variant={statusColors[u.status] as "success" | "warning" | "error" ?? "default"}>{u.status}</Badge>
                    {u.platformRole && <Badge variant="secondary">{PLATFORM_ROLE_LABELS[u.platformRole as PlatformRole] ?? u.platformRole}</Badge>}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs flex items-center gap-1" style={{ color: "var(--aivo-text-muted)" }}><Mail size={10} />{u.email}</span>
                    {u.district && <span className="text-xs" style={{ color: "var(--aivo-text-muted)" }}>{u.district}</span>}
                  </div>
                </div>
                {canManage && (
                  <Button variant="outline" size="sm">Manage</Button>
                )}
              </div>
            </AnimatedCard>
          ))}
        </div>
      </ExpandableCard>
    </PageWrapper>
  );
}

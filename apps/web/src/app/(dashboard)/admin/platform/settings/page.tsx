"use client";

import React, { useEffect, useState } from "react";
import { Shield, Users, Key, Bell, Globe, Server, Lock, Save } from "lucide-react";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, BackLink, ExpandableCard, AnimatedCard } from "@/components/ui/PageDesign";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { hasPermission, PLATFORM_ROLE_LABELS, PLATFORM_ROLE_DESCRIPTIONS } from "@/lib/rbac";
import type { PlatformRole } from "@/lib/rbac";

interface PlatformAdmin {
  id: string;
  name: string;
  email: string;
  platformRole: PlatformRole;
  lastLoginAt: string;
}

interface PlatformSettings {
  maintenanceMode: boolean;
  maxDistrictSize: number;
  defaultTrialDays: number;
  enforceSSO: boolean;
  apiRateLimit: number;
  admins: PlatformAdmin[];
}

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const platformRole = (user?.platformRole ?? "super_admin") as PlatformRole;
  const canManageSettings = hasPermission(platformRole, "platform.settings.manage");
  const canManageRoles = hasPermission(platformRole, "platform.roles.manage");

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await apiFetch<PlatformSettings>("/api/admin/platform/settings");
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
        <div className="space-y-3">{[1, 2, 3].map((i) => (<Skeleton key={i} height={100} className="w-full rounded-3xl" />))}</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <PageWrapper>
      <BackLink href="/admin/platform">Back to Dashboard</BackLink>

      <PurpleGradientHeader className="rounded-3xl mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
            <Shield size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">Platform Settings</h1>
            <p className="text-white/80 text-sm">Global configuration and role management</p>
          </div>
        </div>
      </PurpleGradientHeader>

      <ExpandableCard
        icon={<Server size={16} />}
        title="General Settings"
        subtitle="Platform-wide configuration"
        gradient="linear-gradient(135deg, #10B981, #059669)"
        delay={100}
      >
        <div className="space-y-4">
          {[
            { label: "Maintenance Mode", value: data.maintenanceMode ? "Enabled" : "Disabled", icon: <Server size={16} />, badgeVariant: data.maintenanceMode ? "error" : "success" },
            { label: "Max District Size", value: `${data.maxDistrictSize} learners`, icon: <Users size={16} />, badgeVariant: "default" },
            { label: "Default Trial Period", value: `${data.defaultTrialDays} days`, icon: <Key size={16} />, badgeVariant: "default" },
            { label: "Enforce SSO", value: data.enforceSSO ? "Yes" : "No", icon: <Lock size={16} />, badgeVariant: data.enforceSSO ? "success" : "secondary" },
            { label: "API Rate Limit", value: `${data.apiRateLimit} req/min`, icon: <Globe size={16} />, badgeVariant: "default" },
          ].map((setting, idx) => (
            <AnimatedCard key={setting.label} delay={200 + idx * 60}>
              <div className="flex items-center gap-4 p-3 rounded-xl" style={{ backgroundColor: "var(--aivo-bg)", border: "1px solid var(--aivo-border)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "#10B981" }}>
                  {setting.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold" style={{ color: "var(--aivo-text)" }}>{setting.label}</p>
                </div>
                <Badge variant={setting.badgeVariant as "success" | "error" | "secondary" | "default" ?? "default"}>{setting.value}</Badge>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </ExpandableCard>

      {canManageRoles && (
        <div className="mt-6">
          <ExpandableCard
            icon={<Shield size={16} />}
            title={`Platform Admins (${data.admins.length})`}
            subtitle="Users with platform-level access"
            gradient="linear-gradient(135deg, #7C3AED, #A855F7)"
            delay={500}
          >
            <div className="space-y-3">
              {data.admins.map((admin, idx) => (
                <AnimatedCard key={admin.id} delay={600 + idx * 60}>
                  <div className="flex items-center gap-4 p-3 rounded-xl" style={{ backgroundColor: "var(--aivo-bg)", border: "1px solid var(--aivo-border)" }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-extrabold text-white shrink-0" style={{ background: "linear-gradient(135deg, #7C3AED, #A855F7)" }}>
                      {admin.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm" style={{ color: "var(--aivo-text)" }}>{admin.name}</h3>
                        <Badge variant="warning">{PLATFORM_ROLE_LABELS[admin.platformRole]}</Badge>
                      </div>
                      <p className="text-xs" style={{ color: "var(--aivo-text-muted)" }}>{admin.email}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--aivo-text-muted)" }}>{PLATFORM_ROLE_DESCRIPTIONS[admin.platformRole]}</p>
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-bold mb-3" style={{ color: "var(--aivo-text)" }}>Role Definitions</h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {(Object.entries(PLATFORM_ROLE_LABELS) as [PlatformRole, string][]).map(([role, label]) => (
                  <div key={role} className="rounded-xl p-3" style={{ backgroundColor: "var(--aivo-bg)", border: "1px solid var(--aivo-border)" }}>
                    <p className="text-sm font-bold" style={{ color: "#7C3AED" }}>{label}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--aivo-text-muted)" }}>{PLATFORM_ROLE_DESCRIPTIONS[role]}</p>
                  </div>
                ))}
              </div>
            </div>
          </ExpandableCard>
        </div>
      )}
    </PageWrapper>
  );
}

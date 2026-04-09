"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Shield, Users, Key, Globe, Server, Lock, Save, CheckCircle, Loader2 } from "lucide-react";
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

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED] disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ backgroundColor: checked ? "#7C3AED" : "var(--aivo-border)" }}
    >
      <span
        className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200"
        style={{ transform: checked ? "translateX(22px)" : "translateX(4px)" }}
      />
    </button>
  );
}

function NumberInput({ value, onChange, min, max, suffix, disabled }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; suffix?: string; disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          if (!isNaN(n)) onChange(n);
        }}
        min={min}
        max={max}
        disabled={disabled}
        className="w-24 px-3 py-1.5 rounded-xl text-sm font-bold text-right transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] disabled:opacity-50"
        style={{
          backgroundColor: "var(--aivo-bg)",
          border: "1px solid var(--aivo-border)",
          color: "var(--aivo-text)",
        }}
      />
      {suffix && <span className="text-xs font-medium" style={{ color: "var(--aivo-text-muted)" }}>{suffix}</span>}
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maxDistrictSize, setMaxDistrictSize] = useState(5000);
  const [defaultTrialDays, setDefaultTrialDays] = useState(30);
  const [enforceSSO, setEnforceSSO] = useState(false);
  const [apiRateLimit, setApiRateLimit] = useState(1000);

  const platformRole = (user?.platformRole ?? "super_admin") as PlatformRole;
  const canManageSettings = hasPermission(platformRole, "platform.settings.manage");
  const canManageRoles = hasPermission(platformRole, "platform.roles.manage");

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await apiFetch<PlatformSettings>("/api/admin/platform/settings");
        setData(result);
        setMaintenanceMode(result.maintenanceMode);
        setMaxDistrictSize(result.maxDistrictSize);
        setDefaultTrialDays(result.defaultTrialDays);
        setEnforceSSO(result.enforceSSO);
        setApiRateLimit(result.apiRateLimit);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!data) return;
    const changed =
      maintenanceMode !== data.maintenanceMode ||
      maxDistrictSize !== data.maxDistrictSize ||
      defaultTrialDays !== data.defaultTrialDays ||
      enforceSSO !== data.enforceSSO ||
      apiRateLimit !== data.apiRateLimit;
    setDirty(changed);
    if (changed) setSaved(false);
  }, [maintenanceMode, maxDistrictSize, defaultTrialDays, enforceSSO, apiRateLimit, data]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const result = await apiFetch<PlatformSettings>("/api/admin/platform/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maintenanceMode, maxDistrictSize, defaultTrialDays, enforceSSO, apiRateLimit }),
      });
      setData(result);
      setDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
    } finally {
      setSaving(false);
    }
  }, [maintenanceMode, maxDistrictSize, defaultTrialDays, enforceSSO, apiRateLimit]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={120} className="w-full rounded-3xl" />
        <div className="space-y-3">{[1, 2, 3].map((i) => (<Skeleton key={i} height={100} className="w-full rounded-3xl" />))}</div>
      </div>
    );
  }

  if (!data) return null;

  const settingsFields = [
    {
      key: "maintenanceMode",
      label: "Maintenance Mode",
      description: "When enabled, the platform shows a maintenance page to all non-admin users",
      icon: <Server size={16} />,
      control: <Toggle checked={maintenanceMode} onChange={setMaintenanceMode} disabled={!canManageSettings} />,
      color: maintenanceMode ? "#EF4444" : "#10B981",
    },
    {
      key: "maxDistrictSize",
      label: "Max District Size",
      description: "Maximum number of learners allowed per district",
      icon: <Users size={16} />,
      control: <NumberInput value={maxDistrictSize} onChange={setMaxDistrictSize} min={100} max={50000} suffix="learners" disabled={!canManageSettings} />,
      color: "#3B82F6",
    },
    {
      key: "defaultTrialDays",
      label: "Default Trial Period",
      description: "Number of days for new district trial subscriptions",
      icon: <Key size={16} />,
      control: <NumberInput value={defaultTrialDays} onChange={setDefaultTrialDays} min={7} max={90} suffix="days" disabled={!canManageSettings} />,
      color: "#F59E0B",
    },
    {
      key: "enforceSSO",
      label: "Enforce SSO",
      description: "Require single sign-on for all platform users",
      icon: <Lock size={16} />,
      control: <Toggle checked={enforceSSO} onChange={setEnforceSSO} disabled={!canManageSettings} />,
      color: "#7C3AED",
    },
    {
      key: "apiRateLimit",
      label: "API Rate Limit",
      description: "Maximum API requests per minute per client",
      icon: <Globe size={16} />,
      control: <NumberInput value={apiRateLimit} onChange={setApiRateLimit} min={100} max={10000} suffix="req/min" disabled={!canManageSettings} />,
      color: "#10B981",
    },
  ];

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
        <div className="space-y-1">
          {settingsFields.map((setting, idx) => (
            <AnimatedCard key={setting.key} delay={150 + idx * 40}>
              <div className="flex items-center gap-4 p-4 rounded-xl transition-all duration-200 hover:shadow-sm" style={{ backgroundColor: "var(--aivo-bg)", border: "1px solid var(--aivo-border)" }}>
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${setting.color}18`, color: setting.color }}>
                  {setting.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: "var(--aivo-text)" }}>{setting.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--aivo-text-muted)" }}>{setting.description}</p>
                </div>
                <div className="shrink-0">
                  {setting.control}
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>

        {canManageSettings && (
          <div className="mt-6 flex items-center justify-end gap-3">
            {saved && (
              <span className="flex items-center gap-1.5 text-sm font-medium" style={{ color: "#10B981" }}>
                <CheckCircle size={16} />
                Settings saved
              </span>
            )}
            <Button
              onClick={handleSave}
              disabled={!dirty || saving}
              className="rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: dirty ? "linear-gradient(135deg, #7C3AED, #A855F7)" : "var(--aivo-border)",
                boxShadow: dirty ? "0 4px 14px rgba(124,58,237,0.3)" : "none",
              }}
            >
              {saving ? (
                <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Saving...</span>
              ) : (
                <span className="flex items-center gap-2"><Save size={16} /> Save Changes</span>
              )}
            </Button>
          </div>
        )}
      </ExpandableCard>

      {canManageRoles && (
        <div className="mt-6">
          <ExpandableCard
            icon={<Shield size={16} />}
            title={`Platform Admins (${data.admins.length})`}
            subtitle="Users with platform-level access"
            gradient="linear-gradient(135deg, #7C3AED, #A855F7)"
            delay={300}
          >
            <div className="space-y-3">
              {data.admins.map((admin, idx) => (
                <AnimatedCard key={admin.id} delay={350 + idx * 40}>
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

"use client";

import React, { useEffect, useState } from "react";
import {
  Settings, User, Shield, Loader2, Save, CheckCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, BackLink, ExpandableCard } from "@/components/ui/PageDesign";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/auth.store";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

export default function LearnerSettingsPage() {
  const t = useTranslations("settings");
  const { user } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);
  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await apiFetch<{ name: string; email: string; id: string; role: string; avatarUrl?: string }>(
        API_ROUTES.USER.UPDATE_PROFILE,
        { method: "PATCH", body: JSON.stringify({ name }) }
      );
      if (user) setUser({ ...user, name: updated.name });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("failedToSave"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageWrapper>
      <BackLink href="/learner">{t("backToHome", { defaultValue: "Back to Home" })}</BackLink>

      <PurpleGradientHeader className="rounded-3xl mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
            <Settings size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{t("settings")}</h1>
            <p className="text-white/80 text-sm">Update your profile and preferences</p>
          </div>
        </div>
      </PurpleGradientHeader>

      <div className="space-y-6 max-w-2xl">
        <ExpandableCard
          icon={<User size={16} />}
          title={t("account")}
          subtitle="Manage your display name and profile"
          gradient="linear-gradient(135deg, #7C3AED, #A855F7)"
          delay={100}
          infoText="Change your display name that appears throughout the app. Your email is managed by your parent or guardian."
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--aivo-text)" }}>
                {t("displayName")}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-[#E8DDF0] dark:border-[#3D2D5C] rounded-2xl bg-white dark:bg-[#2A1E45] text-[var(--aivo-text)] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex items-center gap-3">
              <Button
                onClick={handleSave}
                disabled={saving}
                leftIcon={saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              >
                {saving ? t("saving") : t("saveChanges")}
              </Button>
              {saved && (
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle size={16} />
                  {t("saved")}
                </span>
              )}
            </div>
          </div>
        </ExpandableCard>

        <ExpandableCard
          icon={<Shield size={16} />}
          title={t("learnerPin")}
          subtitle="Manage your security PIN"
          gradient="linear-gradient(135deg, #3B82F6, #2563EB)"
          delay={200}
          infoText="Your learner PIN adds an extra layer of security. Ask your parent or guardian if you need to change it."
        >
          <p className="text-sm" style={{ color: "var(--aivo-text-secondary)" }}>
            {t("pinDescription")}
          </p>
        </ExpandableCard>
      </div>
    </PageWrapper>
  );
}

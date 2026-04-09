"use client";

import React, { useEffect, useState } from "react";
import {
  Settings,
  User,
  Bell,
  Shield,
  Loader2,
  Save,
  CheckCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/auth.store";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

export default function ParentSettingsPage() {
  const { user } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);
  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("dashboard");
  const ts = useTranslations("settings");

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
      if (user) {
        setUser({ ...user, name: updated.name });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("failedToSave"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PurpleGradientHeader className="rounded-3xl mb-8">
        <div className="flex items-center gap-3">
          <Settings size={32} />
          <div>
            <h1 className="text-2xl font-extrabold">{t("accountSettings")}</h1>
            <p className="text-white/80 text-sm">{t("manageProfileAndPrefs")}</p>
          </div>
        </div>
      </PurpleGradientHeader>

      <div className="space-y-4 max-w-2xl">
        {/* Profile */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User size={18} className="text-[#7C3AED]" />
              <h3 className="font-semibold text-[var(--aivo-text)]">{t("profileSection")}</h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--aivo-text)] mb-1">
                {t("nameLabel")}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-[#E8DDF0] dark:border-[#3D2D5C] rounded-2xl bg-white dark:bg-[#2A1E45] text-[var(--aivo-text)] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--aivo-text)] mb-1">
                {t("emailLabel")}
              </label>
              <input
                type="email"
                value={user?.email ?? ""}
                disabled
                className="w-full px-3 py-2 border border-[#E8DDF0] dark:border-[#3D2D5C] rounded-2xl bg-[var(--aivo-bg)] dark:bg-[#2A1E45] text-[var(--aivo-text-secondary)] cursor-not-allowed"
              />
              <p className="text-xs text-[var(--aivo-text-muted)] mt-1">{t("emailCannotChange")}</p>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex items-center gap-3">
              <Button
                onClick={handleSave}
                disabled={saving}
                leftIcon={saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              >
                {saving ? ts("saving") : ts("saveChanges")}
              </Button>
              {saved && (
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle size={16} />
                  {ts("saved")}
                </span>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-[#7C3AED]" />
              <h3 className="font-semibold text-[var(--aivo-text)]">{t("notifications")}</h3>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-[var(--aivo-text-secondary)]">
              {t("notificationsHint")}
            </p>
          </CardBody>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-[#7C3AED]" />
              <h3 className="font-semibold text-[var(--aivo-text)]">{t("securitySection")}</h3>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-[var(--aivo-text-secondary)]">
              {t("securityHint")}
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import {
  Settings,
  User,
  Shield,
  Loader2,
  Save,
  CheckCircle,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/auth.store";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

export default function LearnerSettingsPage() {
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
      if (user) {
        setUser({ ...user, name: updated.name });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PurpleGradientHeader className="rounded-xl mb-8">
        <div className="flex items-center gap-3">
          <Settings size={32} />
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-white/80 text-sm">Manage your profile and preferences</p>
          </div>
        </div>
      </PurpleGradientHeader>

      <div className="space-y-4 max-w-2xl">
        {/* Profile */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User size={18} className="text-[#7C3AED]" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Profile</h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex items-center gap-3">
              <Button
                onClick={handleSave}
                disabled={saving}
                leftIcon={saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              >
                {saving ? "Saving…" : "Save changes"}
              </Button>
              {saved && (
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle size={16} />
                  Saved
                </span>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-[#7C3AED]" />
              <h3 className="font-semibold text-gray-900 dark:text-white">PIN</h3>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your parent manages your account PIN. Ask them to update it from the learner profile settings.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

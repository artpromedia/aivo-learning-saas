"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Settings,
  User,
  Bell,
  Shield,
  Loader2,
  Save,
  CheckCircle,
  Trash2,
  AlertTriangle,
  Mail,
  Smartphone,
  MessageSquare,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/auth.store";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface NotificationPreference {
  notificationType: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
}

const NOTIFICATION_TYPES = [
  "learning_reminder",
  "streak_warning",
  "badge_earned",
  "recommendation",
  "weekly_report",
  "system",
] as const;

export default function ParentSettingsPage() {
  const t = useTranslations("settings");
  const { user, logout } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);

  // Profile state
  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Notification preferences state
  const [notifPrefs, setNotifPrefs] = useState<NotificationPreference[]>([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifMessage, setNotifMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Delete account state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  // Fetch notification preferences
  const fetchPreferences = useCallback(async () => {
    try {
      const res = await apiFetch<{ preferences: NotificationPreference[] }>(
        API_ROUTES.NOTIFICATION.PREFERENCES,
      );
      setNotifPrefs(res.preferences ?? []);
    } catch {
      // Silently fail — defaults will apply
    } finally {
      setNotifLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const getPreference = (type: string): NotificationPreference => {
    return (
      notifPrefs.find((p) => p.notificationType === type) ?? {
        notificationType: type,
        emailEnabled: true,
        pushEnabled: true,
        inAppEnabled: true,
      }
    );
  };

  const handleToggleNotif = async (
    type: string,
    channel: "emailEnabled" | "pushEnabled" | "inAppEnabled",
  ) => {
    const current = getPreference(type);
    const updated = { ...current, [channel]: !current[channel] };

    // Optimistic update
    setNotifPrefs((prev) => {
      const idx = prev.findIndex((p) => p.notificationType === type);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      }
      return [...prev, updated];
    });

    setNotifSaving(true);
    setNotifMessage(null);
    try {
      await apiFetch(API_ROUTES.NOTIFICATION.PREFERENCES, {
        method: "PATCH",
        body: JSON.stringify({
          preferences: [{ notificationType: type, [channel]: !current[channel] }],
        }),
      });
      setNotifMessage({ type: "success", text: t("preferencesUpdated") });
      setTimeout(() => setNotifMessage(null), 3000);
    } catch {
      // Revert
      setNotifPrefs((prev) => {
        const idx = prev.findIndex((p) => p.notificationType === type);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = current;
          return copy;
        }
        return prev;
      });
      setNotifMessage({ type: "error", text: t("preferencesUpdateFailed") });
    } finally {
      setNotifSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setProfileError(null);
    try {
      const updated = await apiFetch<{ name: string; email: string; id: string; role: string; avatarUrl?: string }>(
        API_ROUTES.USER.UPDATE_PROFILE,
        { method: "PATCH", body: JSON.stringify({ name }) },
      );
      if (user) {
        setUser({ ...user, name: updated.name });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setProfileError(e instanceof Error ? e.message : t("failedToSave"));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordMessage(null);

    if (newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: t("passwordMinLength") });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: t("passwordsDoNotMatch") });
      return;
    }

    setPasswordSaving(true);
    try {
      await apiFetch(API_ROUTES.AUTH.CHANGE_PASSWORD, {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setPasswordMessage({ type: "success", text: t("passwordChanged") });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      setPasswordMessage({
        type: "error",
        text: e instanceof Error ? e.message : t("passwordChangeFailed"),
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await apiFetch(API_ROUTES.USER.ME, { method: "DELETE" });
      await logout();
      window.location.href = "/login";
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PurpleGradientHeader className="rounded-xl mb-8">
        <div className="flex items-center gap-3">
          <Settings size={32} />
          <div>
            <h1 className="text-2xl font-bold">{t("accountSettings")}</h1>
            <p className="text-white/80 text-sm">{t("manageProfilePrefs")}</p>
          </div>
        </div>
      </PurpleGradientHeader>

      <div className="space-y-4 max-w-2xl">
        {/* Profile */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User size={18} className="text-[#7C3AED]" />
              <h3 className="font-semibold text-gray-900 dark:text-white">{t("profile")}</h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("name")}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("email")}
              </label>
              <input
                type="email"
                value={user?.email ?? ""}
                disabled
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">{t("emailCannotBeChanged")}</p>
            </div>
            {profileError && <p className="text-sm text-red-500">{profileError}</p>}
            <div className="flex items-center gap-3">
              <Button
                onClick={handleSaveProfile}
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
          </CardBody>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-[#7C3AED]" />
              <h3 className="font-semibold text-gray-900 dark:text-white">{t("notificationPreferences")}</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t("manageNotificationPrefs")}
            </p>
          </CardHeader>
          <CardBody>
            {notifLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 size={20} className="animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="space-y-1">
                {/* Header row */}
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider" />
                  <span className="w-10 text-center" title={t("emailNotifications")}>
                    <Mail size={14} className="mx-auto text-gray-400" />
                  </span>
                  <span className="w-10 text-center" title={t("pushNotifications")}>
                    <Smartphone size={14} className="mx-auto text-gray-400" />
                  </span>
                  <span className="w-10 text-center" title={t("inAppNotifications")}>
                    <MessageSquare size={14} className="mx-auto text-gray-400" />
                  </span>
                </div>

                {NOTIFICATION_TYPES.map((type) => {
                  const pref = getPreference(type);
                  return (
                    <div
                      key={type}
                      className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {t(`notifType_${type}`)}
                      </span>
                      {(["emailEnabled", "pushEnabled", "inAppEnabled"] as const).map((channel) => (
                        <label key={channel} className="w-10 flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={pref[channel]}
                            onChange={() => handleToggleNotif(type, channel)}
                            disabled={notifSaving}
                            className="w-4 h-4 rounded border-gray-300 text-[#7C3AED] focus:ring-[#7C3AED]"
                          />
                        </label>
                      ))}
                    </div>
                  );
                })}

                {notifMessage && (
                  <p className={`text-sm mt-2 ${notifMessage.type === "success" ? "text-green-600" : "text-red-500"}`}>
                    {notifMessage.text}
                  </p>
                )}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Security — Change Password */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-[#7C3AED]" />
              <h3 className="font-semibold text-gray-900 dark:text-white">{t("changePassword")}</h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("currentPassword")}
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("newPassword")}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("confirmNewPassword")}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              />
            </div>
            {passwordMessage && (
              <p className={`text-sm ${passwordMessage.type === "success" ? "text-green-600" : "text-red-500"}`}>
                {passwordMessage.text}
              </p>
            )}
            <Button
              onClick={handleChangePassword}
              disabled={passwordSaving || !currentPassword || !newPassword}
              loading={passwordSaving}
              leftIcon={<Shield size={16} />}
            >
              {t("changePassword")}
            </Button>
          </CardBody>
        </Card>

        {/* Danger Zone — Delete Account */}
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-500" />
              <h3 className="font-semibold text-red-600 dark:text-red-400">{t("dangerZone")}</h3>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {t("deleteAccountDesc")}
            </p>
            <Button
              variant="destructive"
              onClick={() => setDeleteModalOpen(true)}
              leftIcon={<Trash2 size={16} />}
            >
              {t("deleteAccountButton")}
            </Button>
          </CardBody>
        </Card>
      </div>

      {/* Delete Account Confirmation Modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteConfirm("");
        }}
        title={t("deleteAccount")}
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setDeleteModalOpen(false);
                setDeleteConfirm("");
              }}
            >
              {t("deleteAccountCancelled")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirm !== "DELETE" || deleting}
              loading={deleting}
            >
              {t("deleteAccountButton")}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("deleteAccountConfirm")}
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("deleteAccountConfirmPrompt")}
            </label>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="DELETE"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

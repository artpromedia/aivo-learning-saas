"use client";

import React, { useState } from "react";
import { Settings, Bell, User, Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, ExpandableCard, AnimatedCard } from "@/components/ui/PageDesign";
import { useAuthStore } from "@/stores/auth.store";

export default function TeacherSettingsPage() {
  const t = useTranslations("teacher");
  const { user } = useAuthStore();
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <PageWrapper>
      <PurpleGradientHeader className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
            <Settings size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{t("settingsTitle")}</h1>
            <p className="text-white/80 text-sm">{t("settingsSubtitle")}</p>
          </div>
        </div>
      </PurpleGradientHeader>

      <ExpandableCard
        icon={<User size={16} />}
        title={t("profileTitle")}
        subtitle={t("profileSubtitle")}
        gradient="linear-gradient(135deg, #7C3AED, #A855F7)"
        delay={100}
        infoText={t("profileInfo")}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: "var(--aivo-text-muted)" }}>{t("nameLabel")}</label>
            <p className="text-sm font-medium" style={{ color: "var(--aivo-text)" }}>{user?.name ?? t("defaultTeacher")}</p>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: "var(--aivo-text-muted)" }}>{t("emailLabel")}</label>
            <p className="text-sm font-medium" style={{ color: "var(--aivo-text)" }}>{user?.email ?? t("teacherEmailPlaceholder")}</p>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: "var(--aivo-text-muted)" }}>{t("roleLabel")}</label>
            <p className="text-sm font-medium" style={{ color: "var(--aivo-text)" }}>{t("roleEducator")}</p>
          </div>
        </div>
      </ExpandableCard>

      <div className="mt-6">
        <ExpandableCard
          icon={<Bell size={16} />}
          title={t("notificationsTitle")}
          subtitle={t("notificationsSubtitle")}
          gradient="linear-gradient(135deg, #38BDF8, #0EA5E9)"
          delay={200}
          infoText={t("notificationsInfo")}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--aivo-text)" }}>{t("emailNotifications")}</p>
                <p className="text-xs" style={{ color: "var(--aivo-text-muted)" }}>{t("emailNotificationsDesc")}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={emailNotifs}
                onClick={() => setEmailNotifs(!emailNotifs)}
                className="relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED]"
                style={{ backgroundColor: emailNotifs ? "#7C3AED" : "var(--aivo-border)" }}
              >
                <span className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200" style={{ transform: emailNotifs ? "translateX(22px)" : "translateX(4px)" }} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--aivo-text)" }}>{t("pushNotifications")}</p>
                <p className="text-xs" style={{ color: "var(--aivo-text-muted)" }}>{t("pushNotificationsDesc")}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={pushNotifs}
                onClick={() => setPushNotifs(!pushNotifs)}
                className="relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED]"
                style={{ backgroundColor: pushNotifs ? "#7C3AED" : "var(--aivo-border)" }}
              >
                <span className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200" style={{ transform: pushNotifs ? "translateX(22px)" : "translateX(4px)" }} />
              </button>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button size="sm" onClick={handleSave}>{t("savePreferences")}</Button>
            {saved && <span className="text-sm text-green-600 font-medium">{t("saved")}</span>}
          </div>
        </ExpandableCard>
      </div>

      <div className="mt-6">
        <ExpandableCard
          icon={<Shield size={16} />}
          title={t("privacySecurityTitle")}
          subtitle={t("privacySecuritySubtitle")}
          gradient="linear-gradient(135deg, #10B981, #059669)"
          delay={300}
          infoText={t("privacySecurityInfo")}
        >
          <div className="space-y-3">
            <div className="p-3 rounded-xl" style={{ backgroundColor: "var(--aivo-bg)", border: "1px solid var(--aivo-border)" }}>
              <p className="text-sm font-bold" style={{ color: "var(--aivo-text)" }}>{t("ferpaCompliant")}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--aivo-text-muted)" }}>{t("ferpaCompliantDesc")}</p>
            </div>
            <div className="p-3 rounded-xl" style={{ backgroundColor: "var(--aivo-bg)", border: "1px solid var(--aivo-border)" }}>
              <p className="text-sm font-bold" style={{ color: "var(--aivo-text)" }}>{t("dataEncryption")}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--aivo-text-muted)" }}>{t("dataEncryptionDesc")}</p>
            </div>
          </div>
        </ExpandableCard>
      </div>
    </PageWrapper>
  );
}

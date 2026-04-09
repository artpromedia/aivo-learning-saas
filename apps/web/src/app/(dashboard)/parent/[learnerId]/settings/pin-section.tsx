"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Key } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface PinSectionProps {
  learnerId: string;
  hasPinSet: boolean;
}

export function PinSection({ learnerId, hasPinSet }: PinSectionProps) {
  const t = useTranslations("settings");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!/^\d{4,6}$/.test(newPin)) {
      setError(t("pinMustBe4to6Digits"));
      return;
    }
    if (newPin !== confirmPin) {
      setError(t("pinsMustMatch"));
      return;
    }

    setLoading(true);
    try {
      await apiFetch(API_ROUTES.LEARNER.SET_PIN(learnerId), {
        method: "POST",
        body: JSON.stringify({ pin: newPin }),
      });
      setSuccess(hasPinSet ? t("pinUpdated") : t("pinCreated"));
      setNewPin("");
      setConfirmPin("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("pinSetFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Key size={20} className="text-[#7C3AED]" />
          <h3 className="text-lg font-bold">{t("learnerPin")}</h3>
        </div>
        <p className="text-sm text-[var(--aivo-text-secondary)] mt-1">{t("learnerPinDescription")}</p>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-xs">
          <div>
            <label htmlFor="newPin" className="block text-sm font-medium text-[var(--aivo-text)] mb-1">
              {hasPinSet ? t("newPin") : t("createPin")}
            </label>
            <input
              id="newPin"
              type="password"
              inputMode="numeric"
              maxLength={6}
              pattern="[0-9]*"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
              className="w-full px-4 py-2.5 rounded-2xl border border-[#E8DDF0] dark:border-[#3D2D5C] bg-white dark:bg-[#2A1E45] tracking-[0.5em] text-center text-lg"
              placeholder="••••"
            />
          </div>
          <div>
            <label htmlFor="confirmNewPin" className="block text-sm font-medium text-[var(--aivo-text)] mb-1">
              {t("confirmPin")}
            </label>
            <input
              id="confirmNewPin"
              type="password"
              inputMode="numeric"
              maxLength={6}
              pattern="[0-9]*"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
              className="w-full px-4 py-2.5 rounded-2xl border border-[#E8DDF0] dark:border-[#3D2D5C] bg-white dark:bg-[#2A1E45] tracking-[0.5em] text-center text-lg"
              placeholder="••••"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
          <Button type="submit" loading={loading} className="w-full">
            {hasPinSet ? t("updatePin") : t("setPin")}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}

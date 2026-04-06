"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Lock } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface PinGateProps {
  learnerId: string;
  learnerName: string;
  onSuccess: (token: string) => void;
}

export function PinGate({ learnerId, learnerName, onSuccess }: PinGateProps) {
  const t = useTranslations("learner");
  const [pin, setPin] = useState<string[]>(["", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    setError(null);

    if (value && index < pin.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullPin = newPin.join("");
    if (fullPin.length === pin.length && newPin.every((d) => d !== "")) {
      submitPin(fullPin);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const submitPin = async (fullPin: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ success: boolean; token: string }>(
        API_ROUTES.LEARNER.VERIFY_PIN(learnerId),
        { method: "POST", body: JSON.stringify({ pin: fullPin }) },
      );
      if (res.success && res.token) {
        onSuccess(res.token);
      }
    } catch {
      setError(t("invalidPin"));
      setPin(["", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 px-4">
      <Card className="w-full max-w-sm">
        <CardBody className="text-center">
          <div className="w-20 h-20 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mx-auto mb-6">
            <Lock className="text-[#7C3AED]" size={36} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t("welcomeBack", { name: learnerName })}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            {t("enterYourPin")}
          </p>
          <div className="flex justify-center gap-3 mb-6">
            {pin.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/30 outline-none transition-all"
                aria-label={`PIN digit ${i + 1}`}
              />
            ))}
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
          )}
          {loading && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("verifying")}</p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

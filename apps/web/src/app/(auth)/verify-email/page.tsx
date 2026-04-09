"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { AivoLogo } from "@/components/brand/AivoLogo";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";

function VerifyEmailContent() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<"verifying" | "success" | "error" | "pending">(
    token ? "verifying" : "pending",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) return;

    async function verify() {
      try {
        await apiFetch("/api/auth/verify-email", {
          method: "POST",
          body: JSON.stringify({ token }),
        });
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setErrorMessage(err instanceof Error ? err.message : t("verificationFailed"));
      }
    }

    verify();
  }, [token]);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      await apiFetch("/api/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
    } catch {
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-bubbles" style={{ backgroundColor: "var(--aivo-bg)" }}>
      <div className="w-full max-w-md text-center">
        <AivoLogo size="lg" className="mx-auto mb-8" />

        <div className="rounded-3xl shadow-[var(--shadow-playful)] p-8" style={{ backgroundColor: "var(--aivo-bg-card)", border: "1px solid var(--aivo-border)" }}>
          {status === "verifying" && (
            <>
              <Loader2 className="mx-auto mb-4 animate-spin" size={48} style={{ color: "var(--aivo-purple-500)" }} />
              <h1 className="text-xl font-extrabold mb-2" style={{ color: "var(--aivo-text)", fontFamily: "var(--font-display)" }}>
                {t("verifyingEmail")}
              </h1>
              <p className="font-medium" style={{ color: "var(--aivo-text-secondary)" }}>
                {t("verifyingEmailDescription")}
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "var(--aivo-mint-light)" }}>
                <CheckCircle size={32} style={{ color: "var(--aivo-mint)" }} />
              </div>
              <h1 className="text-xl font-extrabold mb-2" style={{ color: "var(--aivo-text)", fontFamily: "var(--font-display)" }}>
                {t("emailVerified")}
              </h1>
              <p className="font-medium mb-6" style={{ color: "var(--aivo-text-secondary)" }}>
                {t("emailVerifiedDescription")}
              </p>
              <Link href="/login">
                <Button className="w-full" size="lg">{t("continueToSignIn")}</Button>
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "var(--aivo-coral-light, #FFE0E0)" }}>
                <XCircle size={32} style={{ color: "var(--aivo-coral)" }} />
              </div>
              <h1 className="text-xl font-extrabold mb-2" style={{ color: "var(--aivo-text)", fontFamily: "var(--font-display)" }}>
                {t("verificationFailed")}
              </h1>
              <p className="font-medium mb-6" style={{ color: "var(--aivo-text-secondary)" }}>
                {errorMessage || t("verificationLinkExpired")}
              </p>
              <div className="space-y-3">
                <Button onClick={handleResend} loading={resending} variant="outline" className="w-full">
                  {t("resendVerificationEmail")}
                </Button>
                <Link href="/login">
                  <Button variant="ghost" className="w-full">{t("backToSignIn")}</Button>
                </Link>
              </div>
            </>
          )}

          {status === "pending" && (
            <>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "var(--aivo-purple-50, #F0E6FF)" }}>
                <Mail size={32} style={{ color: "var(--aivo-purple-500)" }} />
              </div>
              <h1 className="text-xl font-extrabold mb-2" style={{ color: "var(--aivo-text)", fontFamily: "var(--font-display)" }}>
                {t("checkYourEmail")}
              </h1>
              <p className="font-medium mb-2" style={{ color: "var(--aivo-text-secondary)" }}>
                {t("verificationSentTo")}
              </p>
              {email && (
                <p className="font-bold mb-6" style={{ color: "var(--aivo-text)" }}>{email}</p>
              )}
              <p className="text-sm mb-6" style={{ color: "var(--aivo-text-muted)" }}>
                {t("verificationSentDescription")}
              </p>
              <div className="space-y-3">
                <Button onClick={handleResend} loading={resending} variant="outline" className="w-full" disabled={!email}>
                  {t("resendVerificationEmail")}
                </Button>
                <Link href="/login">
                  <Button variant="ghost" className="w-full">{t("backToSignIn")}</Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--aivo-bg)" }}><Loader2 className="animate-spin" size={32} style={{ color: "var(--aivo-purple-500)" }} /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

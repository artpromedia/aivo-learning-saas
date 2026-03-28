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
        setErrorMessage(
          err instanceof Error ? err.message : t("verificationFailed"),
        );
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
      // Silently fail - don't reveal whether email exists
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md text-center">
        <AivoLogo size="lg" className="mx-auto mb-8" />

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          {status === "verifying" && (
            <>
              <Loader2
                className="mx-auto mb-4 text-[#7C3AED] animate-spin"
                size={48}
              />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {t("verifyingEmail")}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                {t("verifyingEmailDescription")}
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle
                className="mx-auto mb-4 text-green-500"
                size={48}
              />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {t("emailVerified")}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {t("emailVerifiedDescription")}
              </p>
              <Link href="/login">
                <Button className="w-full" size="lg">
                  {t("continueToSignIn")}
                </Button>
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="mx-auto mb-4 text-red-500" size={48} />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {t("verificationFailed")}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {errorMessage ||
                  t("verificationLinkExpired")}
              </p>
              <div className="space-y-3">
                <Button
                  onClick={handleResend}
                  loading={resending}
                  variant="outline"
                  className="w-full"
                >
                  {t("resendVerificationEmail")}
                </Button>
                <Link href="/login">
                  <Button variant="ghost" className="w-full">
                    {t("backToSignIn")}
                  </Button>
                </Link>
              </div>
            </>
          )}

          {status === "pending" && (
            <>
              <div className="w-16 h-16 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="text-[#7C3AED]" size={32} />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {t("checkYourEmail")}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                {t("verificationSentTo")}
              </p>
              {email && (
                <p className="font-semibold text-gray-900 dark:text-white mb-6">
                  {email}
                </p>
              )}
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
                {t("verificationSentDescription")}
              </p>
              <div className="space-y-3">
                <Button
                  onClick={handleResend}
                  loading={resending}
                  variant="outline"
                  className="w-full"
                  disabled={!email}
                >
                  {t("resendVerificationEmail")}
                </Button>
                <Link href="/login">
                  <Button variant="ghost" className="w-full">
                    {t("backToSignIn")}
                  </Button>
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#7C3AED]" size={32} /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

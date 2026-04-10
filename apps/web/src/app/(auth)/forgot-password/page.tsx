"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { AivoLogo } from "@/components/brand/AivoLogo";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

type ForgotForm = z.infer<ReturnType<typeof createForgotSchema>>;

function createForgotSchema(t: (key: string) => string) {
  return z.object({
    email: z.string().email(t("emailInvalid")),
  });
}

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);

  const forgotSchema = createForgotSchema(t);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotForm) => {
    setServerError(null);
    try {
      await apiFetch(API_ROUTES.AUTH.FORGOT_PASSWORD, {
        method: "POST",
        body: JSON.stringify({ email: data.email }),
      });
      setSentEmail(data.email);
      setSent(true);
    } catch (err) {
      setSentEmail(data.email);
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-bubbles" style={{ backgroundColor: "var(--aivo-bg)" }}>
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <AivoLogo size="lg" />
        </div>

        <div className="rounded-3xl shadow-[var(--shadow-playful)] p-8" style={{ backgroundColor: "var(--aivo-bg-card)", border: "1px solid var(--aivo-border)" }}>
          {!sent ? (
            <>
              <h1 className="text-xl font-extrabold mb-2" style={{ color: "var(--aivo-text)", fontFamily: "var(--font-display)" }}>
                {t("forgotYourPassword")}
              </h1>
              <p className="mb-6 text-sm font-medium" style={{ color: "var(--aivo-text-secondary)" }}>
                {t("forgotPasswordSubtitle")}
              </p>

              {serverError && (
                <div className="mb-4 p-3 rounded-2xl text-sm font-medium" style={{ backgroundColor: "#FFE0E0", color: "#991B1B", border: "1px solid #FECACA" }}>
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-bold mb-2" style={{ color: "var(--aivo-text)" }}>
                    {t("emailAddress")}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2" size={18} style={{ color: "var(--aivo-text-muted)" }} />
                    <input
                      id="email" type="email" autoComplete="email" {...register("email")}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 font-medium transition-all"
                      style={{ borderColor: "var(--aivo-border)", backgroundColor: "var(--aivo-bg)", color: "var(--aivo-text)" }}
                      placeholder={t("emailPlaceholder")}
                    />
                  </div>
                  {errors.email && <p className="mt-1.5 text-sm font-medium" style={{ color: "var(--aivo-error)" }}>{errors.email.message}</p>}
                </div>

                <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
                  {t("sendResetLink")}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "var(--aivo-mint-light)" }}>
                <CheckCircle size={32} style={{ color: "var(--aivo-mint)" }} />
              </div>
              <h1 className="text-xl font-extrabold mb-2" style={{ color: "var(--aivo-text)", fontFamily: "var(--font-display)" }}>
                {t("checkYourEmail")}
              </h1>
              <p className="text-sm font-medium mb-2" style={{ color: "var(--aivo-text-secondary)" }}>
                {t("resetEmailSentDescription", { email: sentEmail })}
              </p>
              <p className="text-xs mb-6" style={{ color: "var(--aivo-text-muted)" }}>
                {t("checkSpamFolder")}
              </p>
            </div>
          )}

          <Link href="/login" className="mt-6 flex items-center justify-center gap-2 text-sm font-bold" style={{ color: "var(--aivo-purple-500)" }}>
            <ArrowLeft size={16} />
            {t("backToSignIn")}
          </Link>
        </div>
      </div>
    </div>
  );
}

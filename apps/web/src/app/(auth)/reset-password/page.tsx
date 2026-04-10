"use client";

import React, { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, CheckCircle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { AivoLogo } from "@/components/brand/AivoLogo";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

type ResetForm = z.infer<ReturnType<typeof createResetSchema>>;

function createResetSchema(t: (key: string) => string) {
  return z
    .object({
      password: z
        .string()
        .min(8, t("passwordMinLength"))
        .regex(/[A-Z]/, t("passwordUppercase"))
        .regex(/[a-z]/, t("passwordLowercase"))
        .regex(/[0-9]/, t("passwordNumber")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordsMismatch"),
      path: ["confirmPassword"],
    });
}

function ResetPasswordContent() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const resetSchema = createResetSchema(t);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetForm) => {
    if (!token) {
      setServerError(t("invalidResetToken"));
      return;
    }
    setServerError(null);
    try {
      await apiFetch(API_ROUTES.AUTH.RESET_PASSWORD, {
        method: "POST",
        body: JSON.stringify({ token, password: data.password }),
      });
      setSuccess(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : t("resetFailed"));
    }
  };

  const inputStyle = { borderColor: "var(--aivo-border)", backgroundColor: "var(--aivo-bg)", color: "var(--aivo-text)" };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-bubbles" style={{ backgroundColor: "var(--aivo-bg)" }}>
        <div className="w-full max-w-md text-center">
          <AivoLogo size="lg" className="mx-auto mb-8" />
          <div className="rounded-3xl shadow-[var(--shadow-playful)] p-8" style={{ backgroundColor: "var(--aivo-bg-card)", border: "1px solid var(--aivo-border)" }}>
            <h1 className="text-xl font-extrabold mb-2" style={{ color: "var(--aivo-text)", fontFamily: "var(--font-display)" }}>
              {t("invalidResetLink")}
            </h1>
            <p className="mb-6 font-medium" style={{ color: "var(--aivo-text-secondary)" }}>
              {t("resetLinkExpired")}
            </p>
            <Link href="/forgot-password">
              <Button className="w-full">{t("requestNewLink")}</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-bubbles" style={{ backgroundColor: "var(--aivo-bg)" }}>
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <AivoLogo size="lg" />
        </div>

        <div className="rounded-3xl shadow-[var(--shadow-playful)] p-8" style={{ backgroundColor: "var(--aivo-bg-card)", border: "1px solid var(--aivo-border)" }}>
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "var(--aivo-mint-light)" }}>
                <CheckCircle size={32} style={{ color: "var(--aivo-mint)" }} />
              </div>
              <h1 className="text-xl font-extrabold mb-2" style={{ color: "var(--aivo-text)", fontFamily: "var(--font-display)" }}>
                {t("passwordUpdated")}
              </h1>
              <p className="mb-6 font-medium" style={{ color: "var(--aivo-text-secondary)" }}>
                {t("passwordUpdatedDescription")}
              </p>
              <Link href="/login">
                <Button className="w-full" size="lg">{t("signIn")}</Button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-extrabold mb-2" style={{ color: "var(--aivo-text)", fontFamily: "var(--font-display)" }}>
                {t("setNewPassword")}
              </h1>
              <p className="mb-6 text-sm font-medium" style={{ color: "var(--aivo-text-secondary)" }}>
                {t("setNewPasswordSubtitle")}
              </p>

              {serverError && (
                <div className="mb-4 p-3 rounded-2xl text-sm font-medium" style={{ backgroundColor: "#FFE0E0", color: "#991B1B", border: "1px solid #FECACA" }}>
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label htmlFor="password" className="block text-sm font-bold mb-2" style={{ color: "var(--aivo-text)" }}>
                    {t("newPassword")}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2" size={18} style={{ color: "var(--aivo-text-muted)" }} />
                    <input id="password" type={showPassword ? "text" : "password"} autoComplete="new-password" {...register("password")} className="w-full pl-11 pr-12 py-3 rounded-2xl border-2 font-medium transition-all" style={inputStyle} placeholder={t("passwordHint")} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--aivo-text-muted)" }} aria-label={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1.5 text-sm font-medium" style={{ color: "var(--aivo-error)" }}>{errors.password.message}</p>}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-bold mb-2" style={{ color: "var(--aivo-text)" }}>
                    {t("confirmNewPassword")}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2" size={18} style={{ color: "var(--aivo-text-muted)" }} />
                    <input id="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" {...register("confirmPassword")} className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 font-medium transition-all" style={inputStyle} placeholder={t("confirmPasswordPlaceholder")} />
                  </div>
                  {errors.confirmPassword && <p className="mt-1.5 text-sm font-medium" style={{ color: "var(--aivo-error)" }}>{errors.confirmPassword.message}</p>}
                </div>

                <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
                  {t("resetPassword")}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--aivo-bg)" }}><Loader2 className="animate-spin" size={32} style={{ color: "var(--aivo-purple-500)" }} /></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

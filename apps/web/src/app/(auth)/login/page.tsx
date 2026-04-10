"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { AivoLogo } from "@/components/brand/AivoLogo";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const loginSchema = z.object({
    email: z.string().email(t("emailInvalid")),
    password: z.string().min(1, t("passwordRequired")),
  });

  type LoginForm = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setServerError(null);
    try {
      const result = await login(data.email, data.password);
      if (result.user.role.toLowerCase() === "parent") {
        router.push("/parent");
      } else {
        router.push("/learner");
      }
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : t("loginFailed"),
      );
    }
  };

  const handleOAuth = (provider: "google" | "apple") => {
    window.location.href = `/api/auth/${provider}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-bubbles" style={{ backgroundColor: "var(--aivo-bg)" }}>
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <AivoLogo size="lg" />
          <h1 className="mt-5 text-2xl font-extrabold" style={{ color: "var(--aivo-text)", fontFamily: "var(--font-display)" }}>
            {t("welcomeBack")}
          </h1>
          <p className="mt-1 font-medium" style={{ color: "var(--aivo-text-secondary)" }}>
            {t("signInSubtitle")}
          </p>
        </div>

        <div className="rounded-3xl shadow-[var(--shadow-playful)] p-8" style={{ backgroundColor: "var(--aivo-bg-card)", border: "1px solid var(--aivo-border)" }}>
          {serverError && (
            <div className="mb-4 p-3 rounded-2xl flex items-center gap-2 text-sm font-medium" style={{ backgroundColor: "var(--aivo-coral-light, #FFE0E0)", color: "#991B1B", border: "1px solid #FECACA" }}>
              <span className="shrink-0">&#9888;</span>
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
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 font-medium transition-all"
                  style={{ borderColor: "var(--aivo-border)", backgroundColor: "var(--aivo-bg)", color: "var(--aivo-text)" }}
                  placeholder={t("emailPlaceholder")}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-sm font-medium" style={{ color: "var(--aivo-error)" }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold mb-2" style={{ color: "var(--aivo-text)" }}>
                {t("password")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2" size={18} style={{ color: "var(--aivo-text-muted)" }} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  {...register("password")}
                  className="w-full pl-11 pr-12 py-3 rounded-2xl border-2 font-medium transition-all"
                  style={{ borderColor: "var(--aivo-border)", backgroundColor: "var(--aivo-bg)", color: "var(--aivo-text)" }}
                  placeholder={t("enterPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors hover:opacity-70"
                  style={{ color: "var(--aivo-text-muted)" }}
                  aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm font-medium" style={{ color: "var(--aivo-error)" }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end">
              <Link href="/forgot-password" className="text-sm font-bold transition-colors" style={{ color: "var(--aivo-purple-500)" }}>
                {t("forgotPassword")}
              </Link>
            </div>

            <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
              <Sparkles size={18} className="mr-1" />
              {t("signIn")}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full" style={{ borderTop: "2px solid var(--aivo-border)" }} />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 font-bold" style={{ backgroundColor: "var(--aivo-bg-card)", color: "var(--aivo-text-muted)" }}>
                  {t("orContinueWith")}
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleOAuth("google")}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 font-bold text-sm transition-all hover:shadow-[var(--shadow-card)] hover:scale-[1.02]"
                style={{ borderColor: "var(--aivo-border)", color: "var(--aivo-text)" }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>

              <button
                type="button"
                onClick={() => handleOAuth("apple")}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 font-bold text-sm transition-all hover:shadow-[var(--shadow-card)] hover:scale-[1.02]"
                style={{ borderColor: "var(--aivo-border)", color: "var(--aivo-text)" }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Apple
              </button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm font-medium" style={{ color: "var(--aivo-text-secondary)" }}>
          {t("noAccount")}{" "}
          <Link href="/register" className="font-bold" style={{ color: "var(--aivo-purple-500)" }}>
            {t("createAccount")}
          </Link>
        </p>
      </div>
    </div>
  );
}

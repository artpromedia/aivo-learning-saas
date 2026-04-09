"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, Eye, EyeOff, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { AivoLogo } from "@/components/brand/AivoLogo";
import { Button } from "@/components/ui/Button";
import { LanguageSelect } from "@/components/ui/LanguageSelect";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

type RegisterForm = z.infer<ReturnType<typeof createRegisterSchema>>;

function createRegisterSchema(t: (key: string) => string) {
  return z
    .object({
      name: z.string().min(2, t("nameMinLength")),
      email: z.string().email(t("emailInvalid")),
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

export default function RegisterPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [preferredLanguage, setPreferredLanguage] = useState<string>("");
  const [serverError, setServerError] = useState<string | null>(null);

  const registerSchema = createRegisterSchema(t);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setServerError(null);
    try {
      await apiFetch(API_ROUTES.AUTH.REGISTER, {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          preferredLanguage: preferredLanguage || undefined,
        }),
      });
      router.push("/verify-email?email=" + encodeURIComponent(data.email));
    } catch (err) {
      setServerError(
        err instanceof Error
          ? err.message
          : t("registrationFailed"),
      );
    }
  };

  const inputClasses = "w-full pl-11 pr-4 py-3 rounded-2xl border-2 font-medium transition-all";
  const inputStyle = { borderColor: "var(--aivo-border)", backgroundColor: "var(--aivo-bg)", color: "var(--aivo-text)" };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-bubbles" style={{ backgroundColor: "var(--aivo-bg)" }}>
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <AivoLogo size="lg" />
          <h1 className="mt-5 text-2xl font-extrabold" style={{ color: "var(--aivo-text)", fontFamily: "var(--font-display)" }}>
            {t("createYourAccount")}
          </h1>
          <p className="mt-1 font-medium" style={{ color: "var(--aivo-text-secondary)" }}>
            {t("registerSubtitle")}
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
              <label htmlFor="name" className="block text-sm font-bold mb-2" style={{ color: "var(--aivo-text)" }}>
                {t("fullName")}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2" size={18} style={{ color: "var(--aivo-text-muted)" }} />
                <input id="name" type="text" autoComplete="name" {...register("name")} className={inputClasses} style={inputStyle} placeholder={t("fullNamePlaceholder")} />
              </div>
              {errors.name && <p className="mt-1.5 text-sm font-medium" style={{ color: "var(--aivo-error)" }}>{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold mb-2" style={{ color: "var(--aivo-text)" }}>
                {t("emailAddress")}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2" size={18} style={{ color: "var(--aivo-text-muted)" }} />
                <input id="email" type="email" autoComplete="email" {...register("email")} className={inputClasses} style={inputStyle} placeholder={t("emailPlaceholder")} />
              </div>
              {errors.email && <p className="mt-1.5 text-sm font-medium" style={{ color: "var(--aivo-error)" }}>{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold mb-2" style={{ color: "var(--aivo-text)" }}>
                {t("password")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2" size={18} style={{ color: "var(--aivo-text-muted)" }} />
                <input id="password" type={showPassword ? "text" : "password"} autoComplete="new-password" {...register("password")} className="w-full pl-11 pr-12 py-3 rounded-2xl border-2 font-medium transition-all" style={inputStyle} placeholder={t("passwordHint")} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors hover:opacity-70" style={{ color: "var(--aivo-text-muted)" }} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-sm font-medium" style={{ color: "var(--aivo-error)" }}>{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold mb-2" style={{ color: "var(--aivo-text)" }}>
                {t("confirmPassword")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2" size={18} style={{ color: "var(--aivo-text-muted)" }} />
                <input id="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" {...register("confirmPassword")} className={inputClasses} style={inputStyle} placeholder={t("confirmPasswordPlaceholder")} />
              </div>
              {errors.confirmPassword && <p className="mt-1.5 text-sm font-medium" style={{ color: "var(--aivo-error)" }}>{errors.confirmPassword.message}</p>}
            </div>

            <LanguageSelect
              value={preferredLanguage}
              onChange={(locale) => {
                setPreferredLanguage(locale);
                if (locale) {
                  document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000`;
                }
              }}
              label={t("preferredLanguage")}
            />

            <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
              <Sparkles size={18} className="mr-1" />
              {t("createAccount")}
            </Button>
          </form>

          <p className="mt-4 text-xs font-medium text-center" style={{ color: "var(--aivo-text-muted)" }}>
            {t("termsAgreement")}{" "}
            <a href="/terms" className="underline" style={{ color: "var(--aivo-purple-500)" }}>{t("termsOfService")}</a> &{" "}
            <a href="/privacy" className="underline" style={{ color: "var(--aivo-purple-500)" }}>{t("privacyPolicy")}</a>.
          </p>
        </div>

        <p className="mt-6 text-center text-sm font-medium" style={{ color: "var(--aivo-text-secondary)" }}>
          {t("alreadyHaveAccount")}{" "}
          <Link href="/login" className="font-bold" style={{ color: "var(--aivo-purple-500)" }}>{t("signIn")}</Link>
        </p>
      </div>
    </div>
  );
}

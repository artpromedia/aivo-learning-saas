"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Check, Brain, BookOpen, Sparkles, Shield, User, Mail, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { AivoLogo } from "@/components/brand/AivoLogo";
import { Button } from "@/components/ui/Button";
import { LanguageSelect } from "@/components/ui/LanguageSelect";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

const benefits = [
  {
    icon: Brain,
    title: "Adaptive AI Learning",
    description: "Lessons that adjust in real-time to your child's pace and style.",
    color: "#7C3AED",
    bgColor: "#F0E6FF",
  },
  {
    icon: BookOpen,
    title: "Full Curriculum Coverage",
    description: "Aligned to national standards across all core subjects.",
    color: "#2DD4BF",
    bgColor: "#CCFBF1",
  },
  {
    icon: Sparkles,
    title: "Engaging Quest-Based Learning",
    description: "Adventure-driven lessons that keep learners motivated.",
    color: "#F472B6",
    bgColor: "#FCE7F3",
  },
  {
    icon: Shield,
    title: "COPPA & FERPA Compliant",
    description: "Built with student privacy and safety as a top priority.",
    color: "#38BDF8",
    bgColor: "#E0F2FE",
  },
];

type AccountType = "parent" | "teacher" | "district";

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

type RegisterForm = z.infer<ReturnType<typeof createRegisterSchema>>;

export default function GetStartedPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountType>("parent");
  const [showPassword, setShowPassword] = useState(false);
  const [preferredLanguage, setPreferredLanguage] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
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
          role: accountType,
          preferredLanguage: preferredLanguage || undefined,
        }),
      });
      setSubmitted(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : t("registrationFailed"));
    }
  };

  const inputClasses = "w-full pl-11 pr-4 py-3 rounded-2xl border-2 font-medium transition-all";
  const inputStyle = { borderColor: "var(--aivo-border)", backgroundColor: "var(--aivo-bg)", color: "var(--aivo-text)" };

  return (
    <main className="min-h-screen bg-bubbles" style={{ backgroundColor: "var(--aivo-bg)" }}>
      <header className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/">
            <AivoLogo size="md" />
          </Link>
          <Link href="/login" className="text-sm font-bold transition-colors" style={{ color: "var(--aivo-purple-500)" }}>
            {t("signIn")}
          </Link>
        </div>
      </header>

      <section className="pt-12 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight" style={{ color: "var(--aivo-text)", fontFamily: "var(--font-display)" }}>
            Start Your Child&apos;s{" "}
            <span style={{ background: "linear-gradient(135deg, #7C3AED, #A855F7, #2DD4BF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Learning Journey
            </span>
          </h1>
          <p className="mt-4 text-lg max-w-2xl mx-auto font-medium" style={{ color: "var(--aivo-text-secondary)" }}>
            Create your free account in seconds. No credit card required.
          </p>
        </div>
      </section>

      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            <h2 className="text-2xl font-extrabold" style={{ color: "var(--aivo-text)", fontFamily: "var(--font-display)" }}>
              Why families love AIVO
            </h2>
            <div className="space-y-6">
              {benefits.map((b) => (
                <div key={b.title} className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: b.bgColor }}>
                    <b.icon className="w-6 h-6" style={{ color: b.color }} />
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: "var(--aivo-text)" }}>{b.title}</h3>
                    <p className="text-sm mt-0.5 font-medium" style={{ color: "var(--aivo-text-secondary)" }}>{b.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-3xl p-6 border-2" style={{ backgroundColor: "var(--aivo-purple-50)", borderColor: "var(--aivo-purple-100, #E0CCFF)" }}>
              <p className="italic font-medium" style={{ color: "var(--aivo-text)" }}>
                &ldquo;AIVO transformed homework from a battle into something my daughter actually looks forward to. The AI knows exactly where she needs help.&rdquo;
              </p>
              <p className="mt-3 text-sm font-bold" style={{ color: "var(--aivo-text-secondary)" }}>
                — Parent of a 3rd grader, Washington DC
              </p>
            </div>
          </div>

          <div className="rounded-3xl shadow-[var(--shadow-playful)] p-8" style={{ backgroundColor: "var(--aivo-bg-card)", border: "1px solid var(--aivo-border)" }}>
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#D1FAE5" }}>
                  <Check className="w-8 h-8" style={{ color: "#34D399" }} />
                </div>
                <h3 className="text-2xl font-extrabold" style={{ color: "var(--aivo-text)", fontFamily: "var(--font-display)" }}>
                  Welcome to AIVO!
                </h3>
                <p className="mt-2 font-medium" style={{ color: "var(--aivo-text-secondary)" }}>
                  Check your email to verify your account and get started.
                </p>
                <Link href="/login" className="mt-6 inline-block font-bold hover:underline" style={{ color: "var(--aivo-purple-500)" }}>
                  Sign in
                </Link>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-extrabold mb-6" style={{ color: "var(--aivo-text)", fontFamily: "var(--font-display)" }}>
                  Create your free account
                </h2>

                <div className="flex gap-2 mb-6">
                  {([
                    { key: "parent", label: "Parent" },
                    { key: "teacher", label: "Teacher" },
                    { key: "district", label: "District" },
                  ] as const).map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setAccountType(key)}
                      className="flex-1 rounded-2xl py-2.5 text-sm font-bold transition-all"
                      style={
                        accountType === key
                          ? { background: "linear-gradient(135deg, #7C3AED, #A855F7)", color: "#fff", boxShadow: "0 4px 14px rgba(124,58,237,0.3)" }
                          : { backgroundColor: "var(--aivo-bg)", color: "var(--aivo-text-secondary)", border: "2px solid var(--aivo-border)" }
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {serverError && (
                  <div className="mb-4 p-3 rounded-2xl flex items-center gap-2 text-sm font-medium" style={{ backgroundColor: "#FFE0E0", color: "#991B1B", border: "1px solid #FECACA" }}>
                    <span className="shrink-0">&#9888;</span>
                    {serverError}
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-bold mb-2" style={{ color: "var(--aivo-text)" }}>
                      {t("fullName")} <span style={{ color: "var(--aivo-coral)" }}>*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2" size={18} style={{ color: "var(--aivo-text-muted)" }} />
                      <input id="name" type="text" autoComplete="name" {...register("name")} placeholder="Enter your full name" className={inputClasses} style={inputStyle} />
                    </div>
                    {errors.name && <p className="mt-1.5 text-sm font-medium" style={{ color: "var(--aivo-error)" }}>{errors.name.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-bold mb-2" style={{ color: "var(--aivo-text)" }}>
                      {t("emailAddress")} <span style={{ color: "var(--aivo-coral)" }}>*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2" size={18} style={{ color: "var(--aivo-text-muted)" }} />
                      <input id="email" type="email" autoComplete="email" {...register("email")} placeholder="you@example.com" className={inputClasses} style={inputStyle} />
                    </div>
                    {errors.email && <p className="mt-1.5 text-sm font-medium" style={{ color: "var(--aivo-error)" }}>{errors.email.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-bold mb-2" style={{ color: "var(--aivo-text)" }}>
                      {t("password")} <span style={{ color: "var(--aivo-coral)" }}>*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2" size={18} style={{ color: "var(--aivo-text-muted)" }} />
                      <input id="password" type={showPassword ? "text" : "password"} autoComplete="new-password" {...register("password")} placeholder="At least 8 characters" className="w-full pl-11 pr-12 py-3 rounded-2xl border-2 font-medium transition-all" style={inputStyle} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--aivo-text-muted)" }} aria-label={showPassword ? "Hide password" : "Show password"}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.password && <p className="mt-1.5 text-sm font-medium" style={{ color: "var(--aivo-error)" }}>{errors.password.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-bold mb-2" style={{ color: "var(--aivo-text)" }}>
                      {t("confirmPassword")} <span style={{ color: "var(--aivo-coral)" }}>*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2" size={18} style={{ color: "var(--aivo-text-muted)" }} />
                      <input id="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" {...register("confirmPassword")} placeholder="Confirm your password" className={inputClasses} style={inputStyle} />
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
                    Create Free Account
                  </Button>

                  <p className="text-xs text-center font-medium mt-4" style={{ color: "var(--aivo-text-muted)" }}>
                    By creating an account, you agree to our{" "}
                    <a href="https://aivolearning.com/legal/terms" className="underline" style={{ color: "var(--aivo-purple-500)" }}>Terms of Service</a>{" "}and{" "}
                    <a href="https://aivolearning.com/legal/privacy" className="underline" style={{ color: "var(--aivo-purple-500)" }}>Privacy Policy</a>.
                  </p>
                </form>

                <div className="mt-6 text-center text-sm font-medium" style={{ color: "var(--aivo-text-secondary)" }}>
                  Already have an account?{" "}
                  <Link href="/login" className="font-bold" style={{ color: "var(--aivo-purple-500)" }}>Sign in</Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-sm font-medium" style={{ color: "var(--aivo-text-muted)" }}>
        &copy; {new Date().getFullYear()} AIVO Learning. All rights reserved.
      </footer>
    </main>
  );
}

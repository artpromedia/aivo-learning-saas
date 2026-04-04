"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Check, Brain, BookOpen, Sparkles, Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import { AivoLogo } from "@/components/brand/AivoLogo";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

const benefits = [
  {
    icon: Brain,
    title: "Adaptive AI Learning",
    description:
      "Lessons that adjust in real-time to your child's pace and style.",
  },
  {
    icon: BookOpen,
    title: "Full Curriculum Coverage",
    description: "Aligned to national standards across all core subjects.",
  },
  {
    icon: Sparkles,
    title: "Engaging Quest-Based Learning",
    description: "Adventure-driven lessons that keep learners motivated.",
  },
  {
    icon: Shield,
    title: "COPPA & FERPA Compliant",
    description: "Built with student privacy and safety as a top priority.",
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
        }),
      });
      setSubmitted(true);
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : t("registrationFailed"),
      );
    }
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--aivo-purple-50, #F5F0FF)" }}>
      {/* Header */}
      <header className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/">
            <AivoLogo size="md" />
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium transition-colors"
            style={{ color: "var(--aivo-purple-600, #6B3FE8)" }}
          >
            {t("signIn")}
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-12 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1
            className="text-4xl sm:text-5xl font-extrabold tracking-tight"
            style={{
              color: "var(--aivo-text, #212529)",
              fontFamily: "var(--font-display)",
            }}
          >
            Start Your Child&apos;s{" "}
            <span style={{ color: "var(--aivo-purple-600, #6B3FE8)" }}>
              Learning Journey
            </span>
          </h1>
          <p
            className="mt-4 text-lg max-w-2xl mx-auto"
            style={{ color: "var(--aivo-text-secondary, #6C757D)" }}
          >
            Create your free account in seconds. No credit card required.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
          {/* Benefits */}
          <div className="space-y-8">
            <h2
              className="text-2xl font-bold"
              style={{ color: "var(--aivo-text, #212529)" }}
            >
              Why families love AIVO
            </h2>
            <div className="space-y-6">
              {benefits.map((b) => (
                <div key={b.title} className="flex gap-4">
                  <div
                    className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "var(--aivo-purple-100, #EDE5FF)" }}
                  >
                    <b.icon
                      className="w-5 h-5"
                      style={{ color: "var(--aivo-purple-600, #6B3FE8)" }}
                    />
                  </div>
                  <div>
                    <h3
                      className="font-semibold"
                      style={{ color: "var(--aivo-text, #212529)" }}
                    >
                      {b.title}
                    </h3>
                    <p
                      className="text-sm mt-0.5"
                      style={{ color: "var(--aivo-text-secondary, #6C757D)" }}
                    >
                      {b.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="rounded-xl p-6 border"
              style={{
                backgroundColor: "var(--aivo-purple-50, #F5F0FF)",
                borderColor: "var(--aivo-purple-100, #EDE5FF)",
              }}
            >
              <p
                className="italic"
                style={{ color: "var(--aivo-text, #212529)" }}
              >
                &ldquo;AIVO transformed homework from a battle into something my
                daughter actually looks forward to. The AI knows exactly where she
                needs help.&rdquo;
              </p>
              <p
                className="mt-3 text-sm font-medium"
                style={{ color: "var(--aivo-text-secondary, #6C757D)" }}
              >
                — Parent of a 3rd grader, Washington DC
              </p>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3
                  className="text-2xl font-bold"
                  style={{ color: "var(--aivo-text, #212529)" }}
                >
                  Welcome to AIVO!
                </h3>
                <p
                  className="mt-2"
                  style={{ color: "var(--aivo-text-secondary, #6C757D)" }}
                >
                  Check your email to verify your account and get started.
                </p>
                <Link
                  href="/login"
                  className="mt-6 inline-block font-medium hover:underline"
                  style={{ color: "var(--aivo-purple-600, #6B3FE8)" }}
                >
                  Sign in
                </Link>
              </div>
            ) : (
              <>
                <h2
                  className="text-2xl font-bold mb-6"
                  style={{ color: "var(--aivo-text, #212529)" }}
                >
                  Create your free account
                </h2>

                {/* Account type selector */}
                <div className="flex gap-2 mb-6">
                  {(
                    [
                      { key: "parent", label: "Parent" },
                      { key: "teacher", label: "Teacher" },
                      { key: "district", label: "District" },
                    ] as const
                  ).map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setAccountType(key)}
                      className="flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors"
                      style={
                        accountType === key
                          ? {
                              backgroundColor: "var(--aivo-purple-600, #6B3FE8)",
                              color: "#fff",
                            }
                          : {
                              backgroundColor: "var(--aivo-bg-alt, #F8F9FA)",
                              color: "var(--aivo-text-secondary, #6C757D)",
                            }
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {serverError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                    {serverError}
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      {t("fullName")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      autoComplete="name"
                      {...register("name")}
                      placeholder="Enter your full name"
                      className="mt-1.5 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none transition-shadow"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      {t("emailAddress")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      {...register("email")}
                      placeholder="you@example.com"
                      className="mt-1.5 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none transition-shadow"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      {t("password")} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        {...register("password")}
                        placeholder="At least 8 characters"
                        className="mt-1.5 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 pr-12 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none transition-shadow"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mt-[3px]"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      {t("confirmPassword")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      {...register("confirmPassword")}
                      placeholder="Confirm your password"
                      className="mt-1.5 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none transition-shadow"
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    loading={isSubmitting}
                    className="w-full"
                    size="lg"
                  >
                    Create Free Account
                  </Button>

                  <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                    By creating an account, you agree to our{" "}
                    <a
                      href="https://aivolearning.com/legal/terms"
                      className="underline hover:text-[#7C3AED]"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="https://aivolearning.com/legal/privacy"
                      className="underline hover:text-[#7C3AED]"
                    >
                      Privacy Policy
                    </a>
                    .
                  </p>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-medium hover:underline"
                    style={{ color: "var(--aivo-purple-600, #6B3FE8)" }}
                  >
                    Sign in
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-8 text-center text-sm"
        style={{ color: "var(--aivo-text-muted, #ADB5BD)" }}
      >
        &copy; {new Date().getFullYear()} AIVO Learning. All rights reserved.
      </footer>
    </main>
  );
}

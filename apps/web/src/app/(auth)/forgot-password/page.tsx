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
      // Don't reveal whether email exists, always show success
      setSentEmail(data.email);
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <AivoLogo size="lg" />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          {!sent ? (
            <>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {t("forgotYourPassword")}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                {t("forgotPasswordSubtitle")}
              </p>

              {serverError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    {t("emailAddress")}
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      {...register("email")}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none transition-shadow"
                      placeholder="parent@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  loading={isSubmitting}
                  className="w-full"
                  size="lg"
                >
                  {t("sendResetLink")}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <CheckCircle
                className="mx-auto mb-4 text-green-500"
                size={48}
              />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {t("checkYourEmail")}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mb-2 text-sm">
                {t("resetEmailSentDescription", { email: sentEmail })}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">
                {t("checkSpamFolder")}
              </p>
            </div>
          )}

          <Link
            href="/login"
            className="mt-6 flex items-center justify-center gap-2 text-sm text-[#7C3AED] hover:text-[#6B3FE8] font-medium"
          >
            <ArrowLeft size={16} />
            {t("backToSignIn")}
          </Link>
        </div>
      </div>
    </div>
  );
}

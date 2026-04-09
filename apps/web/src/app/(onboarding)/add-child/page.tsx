"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { User, Calendar, GraduationCap, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { LanguageSelect } from "@/components/ui/LanguageSelect";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import { useLearnerStore } from "@/stores/learner.store";

const GRADE_KEYS = [
  "preK",
  "kindergarten",
  "grade1",
  "grade2",
  "grade3",
  "grade4",
  "grade5",
  "grade6",
  "grade7",
  "grade8",
  "grade9",
  "grade10",
  "grade11",
  "grade12",
] as const;

function gradeToNumber(grade: string): number {
  if (grade === "preK") return 0;
  if (grade === "kindergarten") return 0;
  const match = grade.match(/^grade(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

export default function AddChildPage() {
  const router = useRouter();
  const t = useTranslations("onboarding");
  const { addLearner, setActiveLearner } = useLearnerStore();
  const [childLanguage, setChildLanguage] = useState<string>("");
  const [serverError, setServerError] = useState<string | null>(null);

  const addChildSchema = z.object({
    name: z.string().min(1, t("childNameRequired")).max(50),
    dateOfBirth: z.string().min(1, t("dateOfBirth")),
    enrolledGrade: z.string().min(1, t("selectGradeRequired")),
    pin: z.string().regex(/^\d{4,6}$/, t("pinMustBe4to6Digits")),
    confirmPin: z.string(),
  }).refine((data) => data.pin === data.confirmPin, {
    message: t("pinsMustMatch"),
    path: ["confirmPin"],
  });

  type AddChildForm = z.infer<typeof addChildSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddChildForm>({
    resolver: zodResolver(addChildSchema),
  });

  const onSubmit = async (data: AddChildForm) => {
    setServerError(null);
    try {
      const res = await apiFetch<{
        learner: {
          id: string;
          name: string;
          dateOfBirth: string;
          avatarUrl?: string;
          functioningLevel: "STANDARD" | "SUPPORTED" | "LOW_VERBAL" | "NON_VERBAL" | "PRE_SYMBOLIC";
          preferences: Record<string, unknown>;
        };
      }>(API_ROUTES.LEARNER.CREATE, {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          dateOfBirth: new Date(data.dateOfBirth).toISOString(),
          enrolledGrade: gradeToNumber(data.enrolledGrade),
          pin: data.pin,
          preferredLanguage: childLanguage || undefined,
        }),
      });
      const learner = res.learner;
      addLearner({
        id: learner.id,
        name: learner.name,
        dateOfBirth: learner.dateOfBirth,
        avatarUrl: learner.avatarUrl,
        functioningLevel: learner.functioningLevel,
        preferences: {},
      });
      setActiveLearner({
        id: learner.id,
        name: learner.name,
        dateOfBirth: learner.dateOfBirth,
        avatarUrl: learner.avatarUrl,
        functioningLevel: learner.functioningLevel,
        preferences: {},
      });
      router.push("/parent-assessment");
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : t("failedToAddChild"),
      );
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mx-auto mb-4">
          <User className="text-[#7C3AED]" size={32} />
        </div>
        <h1 className="text-2xl font-extrabold text-[var(--aivo-text)]">
          {t("tellUsAboutChild")}
        </h1>
        <p className="mt-2 text-[var(--aivo-text-secondary)]">
          {t("tellUsAboutChildSubtitle")}
        </p>
      </div>

      <Card>
        <CardBody>
          {serverError && (
            <div className="mb-4 p-3 rounded-2xl bg-[#FFE0E0] dark:bg-[#991B1B]/10 border border-[#FECACA] dark:border-[#991B1B]/30 text-[#991B1B] dark:text-[#F87171] text-sm">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-[var(--aivo-text)] mb-1.5"
              >
                {t("childName")}
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A89BB5]"
                  size={18}
                />
                <input
                  id="name"
                  type="text"
                  {...register("name")}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#E8DDF0] dark:border-[#3D2D5C] bg-white dark:bg-[#2A1E45] text-[var(--aivo-text)] focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none transition-shadow"
                  placeholder={t("firstName")}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="dateOfBirth"
                className="block text-sm font-medium text-[var(--aivo-text)] mb-1.5"
              >
                {t("dateOfBirth")}
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A89BB5]"
                  size={18}
                />
                <input
                  id="dateOfBirth"
                  type="date"
                  {...register("dateOfBirth")}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#E8DDF0] dark:border-[#3D2D5C] bg-white dark:bg-[#2A1E45] text-[var(--aivo-text)] focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none transition-shadow"
                />
              </div>
              {errors.dateOfBirth && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.dateOfBirth.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="enrolledGrade"
                className="block text-sm font-medium text-[var(--aivo-text)] mb-1.5"
              >
                {t("enrolledGrade")}
              </label>
              <div className="relative">
                <GraduationCap
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A89BB5]"
                  size={18}
                />
                <select
                  id="enrolledGrade"
                  {...register("enrolledGrade")}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#E8DDF0] dark:border-[#3D2D5C] bg-white dark:bg-[#2A1E45] text-[var(--aivo-text)] focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none transition-shadow appearance-none"
                >
                  <option value="">{t("selectGrade")}</option>
                  {GRADE_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {t(key)}
                    </option>
                  ))}
                </select>
              </div>
              {errors.enrolledGrade && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.enrolledGrade.message}
                </p>
              )}
            </div>

            {/* Child's preferred language */}
            <div>
              <LanguageSelect
                value={childLanguage}
                onChange={setChildLanguage}
                label={t("childPreferredLanguage")}
              />
              <p className="mt-1 text-xs text-[var(--aivo-text-secondary)]">
                {t("childLanguageHint")}
              </p>
            </div>

            {/* PIN Creation */}
            <div>
              <label
                htmlFor="pin"
                className="block text-sm font-medium text-[var(--aivo-text)] mb-1.5"
              >
                {t("createLearnerPin")}
              </label>
              <p className="text-xs text-[var(--aivo-text-secondary)] mb-2">
                {t("createLearnerPinDescription")}
              </p>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A89BB5]"
                  size={18}
                />
                <input
                  id="pin"
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  pattern="[0-9]*"
                  {...register("pin")}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#E8DDF0] dark:border-[#3D2D5C] bg-white dark:bg-[#2A1E45] text-[var(--aivo-text)] focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none transition-shadow tracking-[0.5em] text-center text-lg"
                  placeholder="••••"
                />
              </div>
              {errors.pin && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.pin.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPin"
                className="block text-sm font-medium text-[var(--aivo-text)] mb-1.5"
              >
                {t("confirmLearnerPin")}
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A89BB5]"
                  size={18}
                />
                <input
                  id="confirmPin"
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  pattern="[0-9]*"
                  {...register("confirmPin")}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#E8DDF0] dark:border-[#3D2D5C] bg-white dark:bg-[#2A1E45] text-[var(--aivo-text)] focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none transition-shadow tracking-[0.5em] text-center text-lg"
                  placeholder="••••"
                />
              </div>
              {errors.confirmPin && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.confirmPin.message}
                </p>
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                loading={isSubmitting}
                className="w-full"
                size="lg"
              >
                {t("continue")}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

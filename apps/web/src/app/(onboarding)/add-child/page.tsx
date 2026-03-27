"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { User, Calendar, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import { useLearnerStore } from "@/stores/learner.store";

const addChildSchema = z.object({
  name: z.string().min(1, "Child's name is required").max(50),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  enrolledGrade: z.string().min(1, "Please select a grade"),
});

type AddChildForm = z.infer<typeof addChildSchema>;

const GRADES = [
  "Pre-K",
  "Kindergarten",
  "1st Grade",
  "2nd Grade",
  "3rd Grade",
  "4th Grade",
  "5th Grade",
  "6th Grade",
  "7th Grade",
  "8th Grade",
  "9th Grade",
  "10th Grade",
  "11th Grade",
  "12th Grade",
];

export default function AddChildPage() {
  const router = useRouter();
  const { addLearner, setActiveLearner } = useLearnerStore();
  const [serverError, setServerError] = useState<string | null>(null);

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
      const learner = await apiFetch<{
        id: string;
        name: string;
        dateOfBirth: string;
        avatarUrl?: string;
        functioningLevel: "level1" | "level2" | "level3";
        preferences: Record<string, unknown>;
      }>(API_ROUTES.LEARNER.CREATE, {
        method: "POST",
        body: JSON.stringify(data),
      });
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
        err instanceof Error ? err.message : "Failed to add child",
      );
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mx-auto mb-4">
          <User className="text-[#7C3AED]" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Tell us about your child
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          This helps us create a personalized learning experience.
        </p>
      </div>

      <Card>
        <CardBody>
          {serverError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Child&apos;s name
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  id="name"
                  type="text"
                  {...register("name")}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none transition-shadow"
                  placeholder="First name"
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
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Date of birth
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  id="dateOfBirth"
                  type="date"
                  {...register("dateOfBirth")}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none transition-shadow"
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
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Enrolled grade
              </label>
              <div className="relative">
                <GraduationCap
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <select
                  id="enrolledGrade"
                  {...register("enrolledGrade")}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none transition-shadow appearance-none"
                >
                  <option value="">Select a grade</option>
                  {GRADES.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
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

            <div className="pt-2">
              <Button
                type="submit"
                loading={isSubmitting}
                className="w-full"
                size="lg"
              >
                Continue
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

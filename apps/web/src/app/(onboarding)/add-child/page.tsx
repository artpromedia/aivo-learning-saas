"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { User, Calendar, GraduationCap, Lock, MapPin, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { LanguageSelect } from "@/components/ui/LanguageSelect";
import { apiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import { useLearnerStore } from "@/stores/learner.store";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
] as const;

const STATE_NAMES: Record<string, string> = {
  AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",
  CO:"Colorado",CT:"Connecticut",DE:"Delaware",FL:"Florida",GA:"Georgia",
  HI:"Hawaii",ID:"Idaho",IL:"Illinois",IN:"Indiana",IA:"Iowa",KS:"Kansas",
  KY:"Kentucky",LA:"Louisiana",ME:"Maine",MD:"Maryland",MA:"Massachusetts",
  MI:"Michigan",MN:"Minnesota",MS:"Mississippi",MO:"Missouri",MT:"Montana",
  NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",NJ:"New Jersey",NM:"New Mexico",
  NY:"New York",NC:"North Carolina",ND:"North Dakota",OH:"Ohio",OK:"Oklahoma",
  OR:"Oregon",PA:"Pennsylvania",RI:"Rhode Island",SC:"South Carolina",
  SD:"South Dakota",TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",
  VA:"Virginia",WA:"Washington",WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming",
  DC:"Washington D.C.",
};

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

interface DistrictInfo {
  id: string;
  name: string;
  state: string;
  curriculumFramework: string;
}

const FRAMEWORK_LABELS: Record<string, string> = {
  COMMON_CORE: "Common Core",
  TEKS: "Texas Essential Knowledge & Skills",
  NGSS: "Next Generation Science Standards",
  BEST: "B.E.S.T. Standards",
  NYSLS: "New York State Learning Standards",
  STATE_SPECIFIC: "State Standards",
};

export default function AddChildPage() {
  const router = useRouter();
  const t = useTranslations("onboarding");
  const { addLearner, setActiveLearner } = useLearnerStore();
  const [childLanguage, setChildLanguage] = useState<string>("");
  const [serverError, setServerError] = useState<string | null>(null);

  const [selectedState, setSelectedState] = useState<string>("");
  const [zipCode, setZipCode] = useState<string>("");
  const [districtInfo, setDistrictInfo] = useState<DistrictInfo | null>(null);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [districtError, setDistrictError] = useState<string | null>(null);
  const lookupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const lookupDistrict = useCallback(async (zip: string) => {
    if (zip.length < 5) {
      setDistrictInfo(null);
      setDistrictError(null);
      return;
    }
    setDistrictLoading(true);
    setDistrictError(null);
    try {
      const res = await apiFetch<{ district: DistrictInfo }>(
        `${API_ROUTES.DISTRICT.LOOKUP}?zip=${encodeURIComponent(zip)}`,
      );
      setDistrictInfo(res.district);
    } catch {
      setDistrictInfo(null);
      setDistrictError(t("noDistrictFound"));
    } finally {
      setDistrictLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (lookupTimerRef.current) clearTimeout(lookupTimerRef.current);
    if (zipCode.length >= 5) {
      lookupTimerRef.current = setTimeout(() => lookupDistrict(zipCode), 400);
    } else {
      setDistrictInfo(null);
      setDistrictError(null);
    }
    return () => {
      if (lookupTimerRef.current) clearTimeout(lookupTimerRef.current);
    };
  }, [zipCode, lookupDistrict]);

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
          state: selectedState || undefined,
          zipCode: zipCode || undefined,
          districtId: districtInfo?.id || undefined,
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

  const inputClass = "w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#E8DDF0] dark:border-[#3D2D5C] bg-white dark:bg-[#2A1E45] text-[var(--aivo-text)] focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none transition-shadow";

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
                  className={inputClass}
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
                  className={inputClass}
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
                  className={`${inputClass} appearance-none`}
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

            <div className="p-4 rounded-2xl border border-[#E8DDF0] dark:border-[#3D2D5C] bg-[#F9F5FF] dark:bg-[#2A1E45]/50 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="text-[#7C3AED]" size={16} />
                <span className="text-sm font-medium text-[var(--aivo-text)]">{t("stateLabel")} & {t("zipCodeLabel")}</span>
                <span className="text-xs text-[var(--aivo-text-secondary)] ml-auto italic">optional</span>
              </div>
              <p className="text-xs text-[var(--aivo-text-secondary)] -mt-2">{t("locationOptional")}</p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="relative">
                    <MapPin
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A89BB5]"
                      size={18}
                    />
                    <select
                      id="state"
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className={`${inputClass} appearance-none`}
                    >
                      <option value="">{t("selectState")}</option>
                      {US_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st} — {STATE_NAMES[st]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <MapPin
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A89BB5]"
                      size={18}
                    />
                    <input
                      id="zipCode"
                      type="text"
                      inputMode="numeric"
                      maxLength={5}
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
                      className={inputClass}
                      placeholder={t("zipCodePlaceholder")}
                    />
                  </div>
                </div>
              </div>

              {districtLoading && (
                <div className="flex items-center gap-2 text-xs text-[var(--aivo-text-secondary)]">
                  <Loader2 className="animate-spin" size={14} />
                  {t("lookingUpDistrict")}
                </div>
              )}

              {districtInfo && !districtLoading && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-[#ECFDF5] dark:bg-[#065F46]/20 border border-[#A7F3D0] dark:border-[#065F46]/40">
                  <CheckCircle2 className="text-[#059669] mt-0.5 shrink-0" size={16} />
                  <div>
                    <p className="text-sm font-medium text-[#065F46] dark:text-[#6EE7B7]">
                      {t("districtDetected", { name: districtInfo.name })}
                    </p>
                    <p className="text-xs text-[#047857] dark:text-[#A7F3D0] mt-0.5">
                      {t("curriculumFramework", { framework: FRAMEWORK_LABELS[districtInfo.curriculumFramework] ?? districtInfo.curriculumFramework })}
                    </p>
                  </div>
                </div>
              )}

              {districtError && !districtLoading && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  {districtError}
                </p>
              )}
            </div>

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
                  className={`${inputClass} tracking-[0.5em] text-center text-lg`}
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
                  className={`${inputClass} tracking-[0.5em] text-center text-lg`}
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

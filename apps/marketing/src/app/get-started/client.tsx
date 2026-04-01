"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { submitLead } from "@/lib/leads-api";
import { events } from "@/lib/analytics";

type Step = 1 | 2 | 3;

const learningGoals = [
  "Catch Up",
  "Stay On Track",
  "Get Ahead",
  "Special Education/IEP Support",
  "Test Prep",
  "Enrichment",
];

const gradeOptions = ["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

function PasswordStrength({ password }: { password: string }) {
  let strength: "weak" | "fair" | "strong" = "weak";
  let width = "w-1/4";
  let color = "bg-red-400";

  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const diversity = [hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

  if (hasLength && diversity >= 2) {
    strength = "strong";
    width = "w-full";
    color = "bg-green-500";
  } else if (hasLength && diversity >= 1) {
    strength = "fair";
    width = "w-2/3";
    color = "bg-amber-400";
  }

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-300", width, color)} />
      </div>
      <p className={cn("text-xs mt-1", color === "bg-green-500" ? "text-green-600" : color === "bg-amber-400" ? "text-amber-600" : "text-red-500")}>
        Password strength: {strength}
      </p>
    </div>
  );
}

function StepIndicator({ currentStep }: { currentStep: Step }) {
  const steps = [
    { num: 1, label: "About You" },
    { num: 2, label: "Your Learner" },
    { num: 3, label: "Choose Plan" },
  ];

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, i) => (
        <div key={step.num} className="flex items-center">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
              step.num < currentStep
                ? "bg-green-500 text-white"
                : step.num === currentStep
                  ? "bg-aivo-purple-600 text-white"
                  : "bg-gray-100 text-gray-400"
            )}
          >
            {step.num < currentStep ? "✓" : step.num}
          </div>
          <span
            className={cn(
              "ml-2 text-sm font-medium hidden sm:inline",
              step.num === currentStep ? "text-aivo-navy-800" : "text-aivo-navy-400"
            )}
          >
            {step.label}
          </span>
          {i < steps.length - 1 && (
            <div className={cn("w-12 h-0.5 mx-3", step.num < currentStep ? "bg-green-500" : "bg-gray-200")} />
          )}
        </div>
      ))}
    </div>
  );
}

function ConfettiAnimation() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2.5 h-2.5"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: ["#8b5cf6", "#14b8a6", "#f59e0b", "#ef4444", "#3b82f6", "#10b981"][i % 6],
            animation: `confetti-fall ${2 + Math.random() * 2}s ease-out forwards`,
            animationDelay: `${Math.random() * 0.5}s`,
            borderRadius: Math.random() > 0.5 ? "50%" : "0",
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti-fall {
          0% { top: -10%; transform: rotate(0deg) scale(1); opacity: 1; }
          100% { top: 110%; transform: rotate(${Math.random() * 720}deg) scale(0.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.aivolearning.com";

export function GetStartedClient() {
  const searchParams = useSearchParams();
  const preselectedPlan = searchParams.get("plan");

  const [step, setStep] = useState<Step>(1);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Step 1 data
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isOver13, setIsOver13] = useState(false);
  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({});

  // Step 2 data
  const [learnerName, setLearnerName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [hasIep, setHasIep] = useState(false);
  const [step2Errors, setStep2Errors] = useState<Record<string, string>>({});

  // Step 3 data
  const [selectedPlan, setSelectedPlan] = useState<"free" | "pro">(
    preselectedPlan === "pro" ? "pro" : "free"
  );

  // Focus management
  useEffect(() => {
    if (formRef.current) {
      const firstInput = formRef.current.querySelector<HTMLInputElement>("input, select");
      firstInput?.focus();
    }
  }, [step]);

  function validateStep1(): boolean {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = "Name is required";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email";
    if (password.length < 8) errs.password = "Password must be at least 8 characters";
    if (!isOver13) errs.age = "You must confirm you are 13+ or a parent";
    setStep1Errors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateStep2(): boolean {
    const errs: Record<string, string> = {};
    if (!learnerName.trim()) errs.learnerName = "Learner name is required";
    if (!gradeLevel) errs.gradeLevel = "Please select a grade level";
    setStep2Errors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleStep1Continue(e: FormEvent) {
    e.preventDefault();
    if (validateStep1()) setStep(2);
  }

  function handleStep2Continue(e: FormEvent) {
    e.preventDefault();
    if (validateStep2()) setStep(3);
  }

  async function handleFinalSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await submitLead({
        contactName: fullName,
        contactEmail: email,
        source: "get-started",
        stage: "signup",
        metadata: {
          learnerName,
          gradeLevel,
          goals,
          hasIep,
          plan: selectedPlan,
        },
      });
    } catch {
      // Continue to success even if lead capture fails
    }
    events.signupClick("get-started-complete");
    setSubmitted(true);
  }

  function toggleGoal(goal: string) {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-aivo-purple-50 to-white flex items-center justify-center px-4">
        <ConfettiAnimation />
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-bold text-aivo-navy-800">Welcome to Aivo!</h1>
          <p className="mt-4 text-aivo-navy-500">
            Check your email to verify your account.
          </p>
          <a
            href="#product-walkthrough"
            className="mt-6 inline-block text-sm font-medium text-aivo-purple-600 hover:underline"
          >
            While you wait, watch how Aivo works →
          </a>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-aivo-purple-50 to-white">
      <section className="pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto">
          <StepIndicator currentStep={step} />

          <div ref={formRef} className="bg-white rounded-2xl shadow-xl border border-aivo-navy-100 p-8">
            <AnimatePresence mode="wait">
              {/* Step 1: About You */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-2xl font-bold text-aivo-navy-800 mb-6">About You</h2>
                  <form onSubmit={handleStep1Continue} className="space-y-4" noValidate>
                    <div>
                      <label htmlFor="gs-name" className="block text-sm font-medium text-aivo-navy-700">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input id="gs-name" type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                        className="mt-1.5 block w-full rounded-lg border border-aivo-navy-200 px-4 py-2.5 text-aivo-navy-800 focus:border-aivo-purple-400 focus:outline-none focus:ring-2 focus:ring-aivo-purple-200" />
                      {step1Errors.fullName && <p className="mt-1 text-xs text-red-500">{step1Errors.fullName}</p>}
                    </div>

                    <div>
                      <label htmlFor="gs-email" className="block text-sm font-medium text-aivo-navy-700">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input id="gs-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                        className="mt-1.5 block w-full rounded-lg border border-aivo-navy-200 px-4 py-2.5 text-aivo-navy-800 focus:border-aivo-purple-400 focus:outline-none focus:ring-2 focus:ring-aivo-purple-200" />
                      {step1Errors.email && <p className="mt-1 text-xs text-red-500">{step1Errors.email}</p>}
                    </div>

                    <div>
                      <label htmlFor="gs-password" className="block text-sm font-medium text-aivo-navy-700">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input id="gs-password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="mt-1.5 block w-full rounded-lg border border-aivo-navy-200 px-4 py-2.5 text-aivo-navy-800 placeholder:text-aivo-navy-300 focus:border-aivo-purple-400 focus:outline-none focus:ring-2 focus:ring-aivo-purple-200" />
                      <PasswordStrength password={password} />
                      {step1Errors.password && <p className="mt-1 text-xs text-red-500">{step1Errors.password}</p>}
                    </div>

                    <label className="flex items-start gap-2 cursor-pointer">
                      <input type="checkbox" checked={isOver13} onChange={(e) => setIsOver13(e.target.checked)}
                        className="mt-1 rounded border-aivo-navy-300 text-aivo-purple-600 focus:ring-aivo-purple-500" />
                      <span className="text-sm text-aivo-navy-600">I confirm I am 13 years or older, or I am a parent/guardian creating this account</span>
                    </label>
                    {step1Errors.age && <p className="text-xs text-red-500">{step1Errors.age}</p>}

                    <button type="submit"
                      className="w-full rounded-lg bg-aivo-purple-600 px-6 py-3 font-semibold text-white hover:bg-aivo-purple-700 transition-colors mt-2">
                      Continue
                    </button>

                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-aivo-navy-100" /></div>
                      <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-aivo-navy-400">or</span></div>
                    </div>

                    <div className="space-y-2">
                      <a href={`${APP_URL}/auth/google`}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-aivo-navy-200 px-4 py-2.5 text-sm font-medium text-aivo-navy-700 hover:bg-aivo-navy-50 transition-colors">
                        Continue with Google
                      </a>
                      <a href={`${APP_URL}/auth/microsoft`}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-aivo-navy-200 px-4 py-2.5 text-sm font-medium text-aivo-navy-700 hover:bg-aivo-navy-50 transition-colors">
                        Continue with Microsoft
                      </a>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Step 2: Your Learner */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-2xl font-bold text-aivo-navy-800 mb-6">Your Learner</h2>
                  <form onSubmit={handleStep2Continue} className="space-y-4" noValidate>
                    <div>
                      <label htmlFor="gs-learner" className="block text-sm font-medium text-aivo-navy-700">
                        Learner&apos;s First Name <span className="text-red-500">*</span>
                      </label>
                      <input id="gs-learner" type="text" required value={learnerName} onChange={(e) => setLearnerName(e.target.value)}
                        className="mt-1.5 block w-full rounded-lg border border-aivo-navy-200 px-4 py-2.5 text-aivo-navy-800 focus:border-aivo-purple-400 focus:outline-none focus:ring-2 focus:ring-aivo-purple-200" />
                      {step2Errors.learnerName && <p className="mt-1 text-xs text-red-500">{step2Errors.learnerName}</p>}
                    </div>

                    <div>
                      <label htmlFor="gs-grade" className="block text-sm font-medium text-aivo-navy-700">
                        Grade Level <span className="text-red-500">*</span>
                      </label>
                      <select id="gs-grade" required value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                        className={cn("mt-1.5 block w-full rounded-lg border border-aivo-navy-200 px-4 py-2.5 text-aivo-navy-800 focus:border-aivo-purple-400 focus:outline-none focus:ring-2 focus:ring-aivo-purple-200", !gradeLevel && "text-aivo-navy-300")}>
                        <option value="" disabled>Select grade...</option>
                        {gradeOptions.map((g) => <option key={g} value={g}>{g === "K" ? "Kindergarten" : `Grade ${g}`}</option>)}
                      </select>
                      {step2Errors.gradeLevel && <p className="mt-1 text-xs text-red-500">{step2Errors.gradeLevel}</p>}
                    </div>

                    <div>
                      <p className="block text-sm font-medium text-aivo-navy-700 mb-2">Learning Goals</p>
                      <div className="grid grid-cols-2 gap-2">
                        {learningGoals.map((goal) => (
                          <label key={goal} className={cn(
                            "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors",
                            goals.includes(goal) ? "border-aivo-purple-400 bg-aivo-purple-50 text-aivo-purple-700" : "border-aivo-navy-200 text-aivo-navy-600 hover:bg-aivo-navy-50"
                          )}>
                            <input type="checkbox" checked={goals.includes(goal)} onChange={() => toggleGoal(goal)} className="sr-only" />
                            {goal}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 py-2">
                      <button type="button" onClick={() => setHasIep(!hasIep)}
                        className={cn("relative inline-flex h-6 w-11 rounded-full transition-colors", hasIep ? "bg-aivo-purple-600" : "bg-gray-200")}
                        role="switch" aria-checked={hasIep}>
                        <span className={cn("inline-block h-5 w-5 rounded-full bg-white shadow transition-transform", hasIep ? "translate-x-5" : "translate-x-0.5")} style={{ marginTop: 2 }} />
                      </button>
                      <div>
                        <span className="text-sm text-aivo-navy-700">Does your learner have an IEP?</span>
                        <p className="text-xs text-aivo-navy-400">Aivo supports IEP-aligned content and tracking</p>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-2">
                      <button type="button" onClick={() => setStep(1)}
                        className="flex-1 rounded-lg border border-aivo-navy-200 px-6 py-3 font-semibold text-aivo-navy-700 hover:bg-aivo-navy-50 transition-colors">
                        Back
                      </button>
                      <button type="submit"
                        className="flex-1 rounded-lg bg-aivo-purple-600 px-6 py-3 font-semibold text-white hover:bg-aivo-purple-700 transition-colors">
                        Continue
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Step 3: Choose Plan */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-2xl font-bold text-aivo-navy-800 mb-6">Choose Your Plan</h2>
                  <form onSubmit={handleFinalSubmit} className="space-y-4">
                    <div className="grid gap-4">
                      {/* Free plan */}
                      <button type="button" onClick={() => setSelectedPlan("free")}
                        className={cn("rounded-xl border-2 p-5 text-left transition-all",
                          selectedPlan === "free" ? "border-aivo-purple-500 ring-2 ring-aivo-purple-200 bg-aivo-purple-50/30" : "border-aivo-navy-100 hover:border-aivo-navy-200")}>
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-aivo-navy-800">Free</h3>
                          <span className="text-lg font-bold text-aivo-navy-800">$0/mo</span>
                        </div>
                        <p className="text-sm text-aivo-navy-500 mt-1">1 student, 2 tutors, 30 min/day</p>
                      </button>

                      {/* Pro plan */}
                      <button type="button" onClick={() => setSelectedPlan("pro")}
                        className={cn("rounded-xl border-2 p-5 text-left transition-all relative",
                          selectedPlan === "pro" ? "border-aivo-purple-500 ring-2 ring-aivo-purple-200 bg-aivo-purple-50/30" : "border-aivo-navy-100 hover:border-aivo-navy-200")}>
                        <span className="absolute -top-2.5 right-4 rounded-full bg-aivo-purple-600 px-3 py-0.5 text-[10px] font-semibold text-white">
                          RECOMMENDED
                        </span>
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-aivo-navy-800">Pro</h3>
                          <span className="text-lg font-bold text-aivo-navy-800">$19/mo</span>
                        </div>
                        <p className="text-sm text-aivo-navy-500 mt-1">5 students, all tutors, unlimited</p>
                        <p className="text-xs text-aivo-teal-600 font-medium mt-1">No credit card required</p>
                      </button>
                    </div>

                    <div className="flex gap-3 mt-2">
                      <button type="button" onClick={() => setStep(2)}
                        className="flex-1 rounded-lg border border-aivo-navy-200 px-6 py-3 font-semibold text-aivo-navy-700 hover:bg-aivo-navy-50 transition-colors">
                        Back
                      </button>
                      <button type="submit"
                        className="flex-1 rounded-lg bg-aivo-purple-600 px-6 py-3 font-semibold text-white hover:bg-aivo-purple-700 transition-colors">
                        {selectedPlan === "pro" ? "Start 14-Day Free Trial" : "Create Free Account"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="text-xs text-center text-aivo-navy-400 mt-4">
            By creating an account, you agree to our{" "}
            <Link href="/legal/terms" className="underline hover:text-aivo-purple-600">Terms of Service</Link>{" "}
            and{" "}
            <Link href="/legal/privacy" className="underline hover:text-aivo-purple-600">Privacy Policy</Link>.
          </p>
        </div>
      </section>
    </main>
  );
}

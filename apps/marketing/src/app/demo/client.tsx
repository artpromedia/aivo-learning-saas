"use client";

import { useState, useEffect, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { submitLead } from "@/lib/leads-api";
import { events } from "@/lib/analytics";
import {
  OonrumailCalendar,
  type BookingConfirmation,
} from "@/components/booking/oonrumail-calendar";
import { BookingConfirmationCard } from "@/components/booking/booking-confirmation-card";
import { BookingFallbackForm } from "@/components/booking/booking-fallback-form";

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

const CALENDAR_URL = "https://calendar.oonrumail.com/aivo/demo-30min";

const ROLES = [
  "Parent",
  "Teacher",
  "School Administrator",
  "District Leader",
  "Other",
];

/* ------------------------------------------------------------------ */
/*  Form field helpers                                                  */
/* ------------------------------------------------------------------ */

function InputField({
  id,
  label,
  type = "text",
  required = true,
  value,
  onChange,
  error,
  placeholder,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-aivo-navy-700"
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          "mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-aivo-navy-800 placeholder:text-aivo-navy-300 focus:outline-none focus:ring-2 transition-colors",
          error
            ? "border-red-400 focus:border-red-400 focus:ring-red-200"
            : "border-aivo-navy-200 focus:border-aivo-purple-400 focus:ring-aivo-purple-200",
        )}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

function SelectField({
  id,
  label,
  options,
  required = false,
  value,
  onChange,
}: {
  id: string;
  label: string;
  options: string[];
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-aivo-navy-700"
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "mt-1.5 block w-full rounded-lg border border-aivo-navy-200 bg-white px-4 py-2.5 text-aivo-navy-800 focus:border-aivo-purple-400 focus:outline-none focus:ring-2 focus:ring-aivo-purple-200 transition-colors",
          value === "" && "text-aivo-navy-300",
        )}
      >
        <option value="" disabled>
          Select...
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step indicator                                                      */
/* ------------------------------------------------------------------ */

const stepLabels = ["Tell Us About You", "Pick a Time", "You\u2019re All Set!"];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8" role="navigation" aria-label="Booking progress">
      {stepLabels.map((label, i) => {
        const stepNum = i + 1;
        return (
          <div key={stepNum} className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                currentStep > stepNum
                  ? "bg-aivo-teal-500 text-white"
                  : currentStep === stepNum
                    ? "bg-aivo-purple-600 text-white"
                    : "bg-aivo-navy-100 text-aivo-navy-400",
              )}
              aria-current={currentStep === stepNum ? "step" : undefined}
            >
              {currentStep > stepNum ? (
                <Check className="h-4 w-4" />
              ) : (
                stepNum
              )}
            </div>
            <span
              className={cn(
                "text-sm font-medium hidden sm:inline",
                currentStep >= stepNum
                  ? "text-aivo-navy-800"
                  : "text-aivo-navy-400",
              )}
            >
              Step {stepNum} of 3
            </span>
            {i < stepLabels.length - 1 && (
              <div
                className={cn(
                  "w-8 sm:w-12 h-0.5 mx-1",
                  currentStep > stepNum
                    ? "bg-aivo-teal-500"
                    : "bg-aivo-navy-200",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sidebar                                                             */
/* ------------------------------------------------------------------ */

const bulletPoints = [
  "Personalized 30-min walkthrough of the platform",
  "See how Brain Clone AI adapts to each student",
  "Get answers to all your questions",
];

function Sidebar() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="flex flex-col justify-center"
    >
      <h2 className="text-2xl sm:text-3xl font-bold text-aivo-navy-800">
        See Aivo in Action
      </h2>
      <p className="mt-3 text-lg text-aivo-navy-500">
        Book a free 30-minute personalized demo
      </p>

      <ul className="mt-8 space-y-4">
        {bulletPoints.map((text) => (
          <li key={text} className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aivo-teal-100 mt-0.5">
              <Check className="h-3.5 w-3.5 text-aivo-teal-600" />
            </div>
            <span className="text-aivo-navy-600 leading-relaxed">{text}</span>
          </li>
        ))}
      </ul>

      <div className="mt-10 rounded-xl bg-aivo-navy-50 p-6">
        <p className="text-sm font-medium text-aivo-navy-700">
          Prefer email?
        </p>
        <p className="mt-1 text-sm text-aivo-navy-500">
          Reach us at{" "}
          <a
            href="mailto:demo@aivolearning.com"
            className="text-aivo-purple-600 font-semibold hover:text-aivo-purple-700 transition-colors"
          >
            demo@aivolearning.com
          </a>
        </p>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export function DemoPageClient() {
  const [step, setStep] = useState(1);
  const [calendarFailed, setCalendarFailed] = useState(false);

  // Step 1 fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [role, setRole] = useState("");
  const [students, setStudents] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 3
  const [booking, setBooking] = useState<BookingConfirmation | null>(null);

  // Track page view on mount
  useEffect(() => {
    events.signupClick("demo-page");
  }, []);

  function validateStep1(): boolean {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleStep1Submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validateStep1()) return;
    setStep(2);
  }

  function handleBack() {
    setCalendarFailed(false);
    setStep(1);
  }

  async function handleBookingConfirmed(data: BookingConfirmation) {
    setBooking(data);
    setStep(3);
    events.demoRequest();

    try {
      await submitLead({
        contactName: name,
        contactEmail: email,
        organizationName: organization || undefined,
        source: "demo-calendar-booking",
        stage: "demo-booked",
        metadata: {
          role: role || undefined,
          students: students || undefined,
          bookingId: data.bookingId,
        },
      });
    } catch {
      // Lead submission is best-effort; booking is already confirmed
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl"
          >
            See AIVO in Action
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto"
          >
            Book a free 30-minute personalized demo
          </motion.p>
        </div>
      </section>

      {/* Main content */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <StepIndicator currentStep={step} />

          <div className="grid gap-12 lg:grid-cols-5">
            {/* Sidebar — 2 cols on desktop, stacked above on mobile */}
            <div className="lg:col-span-2 order-first">
              <Sidebar />
            </div>

            {/* Main content — 3 cols on desktop */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <h2 className="text-xl font-bold text-aivo-navy-800 mb-6">
                      Tell Us About You
                    </h2>
                    <form
                      onSubmit={handleStep1Submit}
                      className="space-y-5 rounded-2xl border border-aivo-navy-100 bg-white p-8 shadow-sm"
                      noValidate
                    >
                      <InputField
                        id="name"
                        label="Name"
                        value={name}
                        onChange={setName}
                        error={errors.name}
                      />

                      <InputField
                        id="email"
                        label="Email"
                        type="email"
                        value={email}
                        onChange={setEmail}
                        error={errors.email}
                      />

                      <InputField
                        id="organization"
                        label="Organization"
                        required={false}
                        value={organization}
                        onChange={setOrganization}
                      />

                      <SelectField
                        id="role"
                        label="Role"
                        options={ROLES}
                        value={role}
                        onChange={setRole}
                      />

                      <InputField
                        id="students"
                        label="Number of Students"
                        required={false}
                        value={students}
                        onChange={setStudents}
                        placeholder="e.g. 150"
                      />

                      <button
                        type="submit"
                        className="w-full rounded-lg bg-aivo-purple-600 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-aivo-purple-700 focus:outline-none focus:ring-2 focus:ring-aivo-purple-500 focus:ring-offset-2 flex items-center justify-center gap-2"
                      >
                        Continue
                        <ArrowRight size={18} />
                      </button>
                    </form>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <button
                        onClick={handleBack}
                        className="flex items-center gap-1 text-sm text-aivo-purple-600 hover:text-aivo-purple-700 font-medium transition-colors"
                        aria-label="Go back to step 1"
                      >
                        <ArrowLeft size={16} />
                        Back
                      </button>
                      <h2 className="text-xl font-bold text-aivo-navy-800">
                        Pick a Time
                      </h2>
                    </div>
                    <div className="rounded-2xl border border-aivo-navy-100 bg-white p-4 sm:p-6 shadow-sm">
                      <p className="text-sm text-aivo-navy-500 mb-4">
                        Hi {name.split(" ")[0] || name}, select a convenient time for your
                        personalized demo below.
                      </p>
                      {calendarFailed ? (
                        <BookingFallbackForm />
                      ) : (
                        <OonrumailCalendar
                          calendarUrl={CALENDAR_URL}
                          prefillName={name}
                          prefillEmail={email}
                          prefillOrganization={organization}
                          onBookingConfirmed={handleBookingConfirmed}
                          onBookingStarted={() =>
                            events.signupClick("demo-calendar-started")
                          }
                          theme="light"
                        />
                      )}
                    </div>
                  </motion.div>
                )}

                {step === 3 && booking && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <h2 className="text-xl font-bold text-aivo-navy-800 mb-6">
                      You&apos;re All Set!
                    </h2>
                    <BookingConfirmationCard booking={booking} />
                    <div className="mt-6 text-center">
                      <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-lg bg-aivo-purple-600 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-aivo-purple-700"
                      >
                        Back to Home
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

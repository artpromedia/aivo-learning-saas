"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Clock,
  MessageSquare,
  DollarSign,
  Users,
  Loader2,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { submitLead } from "@/lib/leads-api";
import { events } from "@/lib/analytics";
import {
  OonrumailCalendar,
  type BookingConfirmation,
} from "@/components/booking/oonrumail-calendar";
import { BookingConfirmationCard } from "@/components/booking/booking-confirmation-card";

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

const CALENDAR_URL =
  process.env.NEXT_PUBLIC_OONRUMAIL_CALENDAR_URL ??
  "https://calendar.oonrumail.com/aivo/demo";

const ROLES = [
  "Teacher",
  "Administrator",
  "IT Director",
  "Curriculum Director",
  "Special Education Coordinator",
  "Parent / Guardian",
  "Other",
];

const STUDENT_RANGES = ["1-50", "51-200", "201-500", "501-1000", "1000+"];

const SIZE_MAP: Record<string, number> = {
  "1-50": 25,
  "51-200": 125,
  "201-500": 350,
  "501-1000": 750,
  "1000+": 1500,
};

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
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  error?: string;
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
  required = true,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  options: string[];
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  error?: string;
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
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-required={required}
        aria-invalid={!!error}
        className={cn(
          "mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-aivo-navy-800 focus:outline-none focus:ring-2 transition-colors",
          error
            ? "border-red-400 focus:border-red-400 focus:ring-red-200"
            : "border-aivo-navy-200 focus:border-aivo-purple-400 focus:ring-aivo-purple-200",
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
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step indicator                                                      */
/* ------------------------------------------------------------------ */

const steps = [
  { label: "Your Info", number: 1 },
  { label: "Pick a Time", number: 2 },
  { label: "Confirmed", number: 3 },
];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, i) => (
        <div key={step.number} className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors",
              currentStep > step.number
                ? "bg-aivo-teal-500 text-white"
                : currentStep === step.number
                  ? "bg-aivo-purple-600 text-white"
                  : "bg-aivo-navy-100 text-aivo-navy-400",
            )}
          >
            {currentStep > step.number ? (
              <Check className="h-4 w-4" />
            ) : (
              step.number
            )}
          </div>
          <span
            className={cn(
              "text-sm font-medium hidden sm:inline",
              currentStep >= step.number
                ? "text-aivo-navy-800"
                : "text-aivo-navy-400",
            )}
          >
            {step.label}
          </span>
          {i < steps.length - 1 && (
            <div
              className={cn(
                "w-8 sm:w-12 h-0.5 mx-1",
                currentStep > step.number
                  ? "bg-aivo-teal-500"
                  : "bg-aivo-navy-200",
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  What to expect                                                      */
/* ------------------------------------------------------------------ */

const expectations = [
  { icon: Clock, text: "30-minute call with our education team" },
  { icon: Users, text: "Personalized walkthrough of AIVO" },
  { icon: MessageSquare, text: "Q&A session to answer all your questions" },
  { icon: DollarSign, text: "Custom pricing tailored to your needs" },
];

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export function DemoPageClient() {
  const [step, setStep] = useState(1);

  // Step 1 fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [school, setSchool] = useState("");
  const [role, setRole] = useState("");
  const [students, setStudents] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Step 3
  const [booking, setBooking] = useState<BookingConfirmation | null>(null);

  function validateStep1(): boolean {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!school.trim()) newErrors.school = "School/district is required";
    if (!role) newErrors.role = "Please select a role";
    if (!students) newErrors.students = "Please select student count";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleStep1Submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validateStep1() || submitting) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await submitLead({
        organizationName: school,
        contactName: `${firstName} ${lastName}`,
        contactEmail: email,
        source: "demo_booking_step1",
        districtSize: SIZE_MAP[students] ?? 0,
        stage: "demo-info-submitted",
        message: message || undefined,
        metadata: { role, studentRange: students },
      });

      events.demoRequest(SIZE_MAP[students]);
      setStep(2);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Failed to submit. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleBookingConfirmed(data: BookingConfirmation) {
    setBooking(data);
    setStep(3);
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
            Schedule a personalized demo with our education team
          </motion.p>
        </div>
      </section>

      {/* Main content */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <StepIndicator currentStep={step} />

          <div className="grid gap-12 lg:grid-cols-2">
            {/* Left: Multi-step flow */}
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
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
                    <div className="grid gap-5 sm:grid-cols-2">
                      <InputField
                        id="firstName"
                        label="First Name"
                        value={firstName}
                        onChange={setFirstName}
                        error={errors.firstName}
                      />
                      <InputField
                        id="lastName"
                        label="Last Name"
                        value={lastName}
                        onChange={setLastName}
                        error={errors.lastName}
                      />
                    </div>

                    <InputField
                      id="email"
                      label="Work Email"
                      type="email"
                      value={email}
                      onChange={setEmail}
                      error={errors.email}
                    />

                    <InputField
                      id="school"
                      label="School/District Name"
                      value={school}
                      onChange={setSchool}
                      error={errors.school}
                    />

                    <SelectField
                      id="role"
                      label="Role"
                      options={ROLES}
                      value={role}
                      onChange={setRole}
                      error={errors.role}
                    />

                    <SelectField
                      id="students"
                      label="Number of Students"
                      options={STUDENT_RANGES}
                      value={students}
                      onChange={setStudents}
                      error={errors.students}
                    />

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-aivo-navy-700"
                      >
                        Message{" "}
                        <span className="text-aivo-navy-400">(optional)</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        aria-required={false}
                        className="mt-1.5 block w-full rounded-lg border border-aivo-navy-200 bg-white px-4 py-2.5 text-aivo-navy-800 placeholder:text-aivo-navy-300 focus:border-aivo-purple-400 focus:outline-none focus:ring-2 focus:ring-aivo-purple-200 transition-colors resize-y"
                      />
                    </div>

                    {submitError && (
                      <p className="text-sm text-red-500">{submitError}</p>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-lg bg-aivo-purple-600 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-aivo-purple-700 focus:outline-none focus:ring-2 focus:ring-aivo-purple-500 focus:ring-offset-2 disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <ArrowRight size={18} />
                      )}
                      {submitting ? "Submitting..." : "Continue to Scheduling"}
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
                      onClick={() => setStep(1)}
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
                      Hi {firstName}, select a convenient time for your
                      personalized demo below.
                    </p>
                    <OonrumailCalendar
                      calendarUrl={CALENDAR_URL}
                      prefillName={`${firstName} ${lastName}`}
                      prefillEmail={email}
                      prefillOrganization={school}
                      onBookingConfirmed={handleBookingConfirmed}
                      onBookingStarted={() =>
                        events.signupClick("demo-calendar-started")
                      }
                      theme="light"
                    />
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

            {/* Right: Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col justify-center"
            >
              <h2 className="text-2xl font-bold text-aivo-navy-800">
                What to expect
              </h2>
              <ul className="mt-6 space-y-5">
                {expectations.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-aivo-purple-50">
                      <Icon className="h-5 w-5 text-aivo-purple-600" />
                    </div>
                    <span className="text-aivo-navy-600 leading-relaxed pt-1.5">
                      {text}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-10 rounded-xl bg-aivo-navy-50 p-6">
                <p className="text-sm font-medium text-aivo-navy-700">
                  Prefer to reach out directly?
                </p>
                <a
                  href="mailto:sales@aivolearning.com"
                  className="mt-1 text-aivo-purple-600 font-semibold hover:text-aivo-purple-700 transition-colors"
                >
                  sales@aivolearning.com
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}

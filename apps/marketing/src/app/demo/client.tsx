"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { submitLead } from "@/lib/leads-api";
import { events } from "@/lib/analytics";
import { OonrumailCalendar, type BookingConfirmation } from "@/components/booking/oonrumail-calendar";
import { BookingConfirmationCard } from "@/components/booking/booking-confirmation-card";

const checklist = [
  "Brain Clone™ AI creating a unique student profile",
  "5 AI tutors adapting to different learning styles",
  "Real-time parent and teacher dashboards",
  "IEP integration and accessibility features",
];

const miniTestimonials = [
  {
    initials: "SC",
    name: "Sarah Chen",
    title: "5th Grade Teacher, Springfield USD",
    quote: "Aivo transformed how I differentiate for each student.",
  },
  {
    initials: "JR",
    name: "Dr. James Rodriguez",
    title: "Principal, Lincoln Academy",
    quote: "The data insights are invaluable for our admin team.",
  },
  {
    initials: "MP",
    name: "Michelle Park",
    title: "Parent",
    quote: "My child's reading level jumped two grades in one semester.",
  },
];

const trustBadges = [
  { label: "SOC 2 Compliant", icon: "🔒" },
  { label: "FERPA Certified", icon: "📋" },
  { label: "COPPA Safe", icon: "🛡️" },
  { label: "GDPR Ready", icon: "🌐" },
];

const CALENDAR_URL =
  process.env.NEXT_PUBLIC_OONRUMAIL_URL ??
  "https://calendar.oonrumail.com/embed/aivo-demo";

export function DemoPageClient() {
  // Qualification form state
  const [fullName, setFullName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [role, setRole] = useState("");
  const [districtSize, setDistrictSize] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Flow state
  const [qualified, setQualified] = useState(false);
  const [booking, setBooking] = useState<BookingConfirmation | null>(null);

  function validateForm(): boolean {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = "Name is required";
    if (!workEmail.trim()) errs.workEmail = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(workEmail))
      errs.workEmail = "Enter a valid email";
    if (!schoolName.trim()) errs.schoolName = "School/District is required";
    if (!role) errs.role = "Please select your role";
    if (!districtSize) errs.districtSize = "Please select district size";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleQualificationSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validateForm() || submitting) return;

    setSubmitting(true);
    try {
      await submitLead({
        contactName: fullName,
        contactEmail: workEmail,
        organizationName: schoolName,
        source: "demo-qualification",
        stage: "qualified",
        metadata: { role, districtSize },
      });
      events.demoBookingStarted("demo-page");
      setQualified(true);
    } catch {
      // Still show calendar even if lead submission fails
      setQualified(true);
    } finally {
      setSubmitting(false);
    }
  }

  function handleBookingConfirmed(data: BookingConfirmation) {
    setBooking(data);
    events.demoBookingCompleted("demo-page", data.dateTime);
  }

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Left column — Value proposition */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col justify-center"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-aivo-navy-800 leading-tight">
              See Aivo Transform Learning in 30 Minutes
            </h1>
            <p className="mt-4 text-lg text-aivo-navy-500">
              A personalized demo with our education specialists. No commitment,
              no credit card.
            </p>

            {/* Checklist */}
            <div className="mt-8">
              <p className="text-sm font-semibold text-aivo-navy-700 mb-4">
                What you&apos;ll see:
              </p>
              <ul className="space-y-3">
                {checklist.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-aivo-navy-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mini testimonials */}
            <div className="mt-10">
              <p className="text-sm font-semibold text-aivo-navy-700 mb-4">
                Join 500+ schools
              </p>
              <div className="space-y-4">
                {miniTestimonials.map((t, i) => (
                  <motion.div
                    key={t.name}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * i }}
                  >
                    <div className="w-9 h-9 rounded-full bg-aivo-purple-100 text-aivo-purple-600 flex items-center justify-center text-xs font-bold shrink-0">
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm text-aivo-navy-600 italic">
                        &ldquo;{t.quote}&rdquo;
                      </p>
                      <p className="text-xs text-aivo-navy-400 mt-0.5">
                        {t.name}, {t.title}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Trust badges */}
            <div className="mt-8 flex flex-wrap gap-3">
              {trustBadges.map((badge) => (
                <div
                  key={badge.label}
                  className="flex items-center gap-1.5 rounded-full bg-aivo-navy-50 px-3 py-1.5 text-xs font-medium text-aivo-navy-600"
                >
                  <span>{badge.icon}</span>
                  {badge.label}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right column — Booking widget */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <AnimatePresence mode="wait">
              {booking ? (
                <BookingConfirmationCard
                  key="confirmed"
                  booking={booking!}
                />
              ) : !qualified ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="rounded-2xl border border-aivo-navy-100 bg-white p-8 shadow-sm"
                >
                  <h2 className="text-xl font-bold text-aivo-navy-800 mb-6">
                    Tell us about yourself
                  </h2>
                  <form onSubmit={handleQualificationSubmit} className="space-y-4" noValidate>
                    <div>
                      <label htmlFor="demo-name" className="block text-sm font-medium text-aivo-navy-700">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="demo-name"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="mt-1.5 block w-full rounded-lg border border-aivo-navy-200 px-4 py-2.5 text-aivo-navy-800 focus:border-aivo-purple-400 focus:outline-none focus:ring-2 focus:ring-aivo-purple-200 transition-colors"
                      />
                      {formErrors.fullName && (
                        <p className="mt-1 text-xs text-red-500">{formErrors.fullName}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="demo-email" className="block text-sm font-medium text-aivo-navy-700">
                        Work Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="demo-email"
                        type="email"
                        required
                        value={workEmail}
                        onChange={(e) => setWorkEmail(e.target.value)}
                        className="mt-1.5 block w-full rounded-lg border border-aivo-navy-200 px-4 py-2.5 text-aivo-navy-800 focus:border-aivo-purple-400 focus:outline-none focus:ring-2 focus:ring-aivo-purple-200 transition-colors"
                      />
                      {formErrors.workEmail && (
                        <p className="mt-1 text-xs text-red-500">{formErrors.workEmail}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="demo-school" className="block text-sm font-medium text-aivo-navy-700">
                        School/District Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="demo-school"
                        type="text"
                        required
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        className="mt-1.5 block w-full rounded-lg border border-aivo-navy-200 px-4 py-2.5 text-aivo-navy-800 focus:border-aivo-purple-400 focus:outline-none focus:ring-2 focus:ring-aivo-purple-200 transition-colors"
                      />
                      {formErrors.schoolName && (
                        <p className="mt-1 text-xs text-red-500">{formErrors.schoolName}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="demo-role" className="block text-sm font-medium text-aivo-navy-700">
                        Role <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="demo-role"
                        required
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className={cn(
                          "mt-1.5 block w-full rounded-lg border border-aivo-navy-200 px-4 py-2.5 text-aivo-navy-800 focus:border-aivo-purple-400 focus:outline-none focus:ring-2 focus:ring-aivo-purple-200 transition-colors",
                          !role && "text-aivo-navy-300"
                        )}
                      >
                        <option value="" disabled>Select...</option>
                        <option value="Teacher">Teacher</option>
                        <option value="Principal">Principal</option>
                        <option value="IT Director">IT Director</option>
                        <option value="Superintendent">Superintendent</option>
                        <option value="Parent">Parent</option>
                        <option value="Other">Other</option>
                      </select>
                      {formErrors.role && (
                        <p className="mt-1 text-xs text-red-500">{formErrors.role}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="demo-district-size" className="block text-sm font-medium text-aivo-navy-700">
                        District Size <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="demo-district-size"
                        required
                        value={districtSize}
                        onChange={(e) => setDistrictSize(e.target.value)}
                        className={cn(
                          "mt-1.5 block w-full rounded-lg border border-aivo-navy-200 px-4 py-2.5 text-aivo-navy-800 focus:border-aivo-purple-400 focus:outline-none focus:ring-2 focus:ring-aivo-purple-200 transition-colors",
                          !districtSize && "text-aivo-navy-300"
                        )}
                      >
                        <option value="" disabled>Select...</option>
                        <option value="<500">&lt;500</option>
                        <option value="500-2000">500–2,000</option>
                        <option value="2000-10000">2,000–10,000</option>
                        <option value="10000+">10,000+</option>
                      </select>
                      {formErrors.districtSize && (
                        <p className="mt-1 text-xs text-red-500">{formErrors.districtSize}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-lg bg-aivo-purple-600 px-6 py-3 font-semibold text-white hover:bg-aivo-purple-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                    >
                      {submitting && <Loader2 size={18} className="animate-spin" />}
                      Continue to Booking
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="calendar"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <OonrumailCalendar
                    calendarUrl={CALENDAR_URL}
                    prefillName={fullName}
                    prefillEmail={workEmail}
                    prefillOrganization={schoolName}
                    onBookingConfirmed={handleBookingConfirmed}
                    onBookingStarted={() => {}}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

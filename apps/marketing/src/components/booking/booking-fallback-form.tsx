"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { submitLead } from "@/lib/leads-api";
import { cn } from "@/lib/utils";

interface BookingFallbackFormProps {
  className?: string;
}

interface FormErrors {
  name?: string;
  email?: string;
}

export function BookingFallbackForm({ className }: BookingFallbackFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate() || submitting) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await submitLead({
        contactName: name,
        contactEmail: email,
        organizationName: organization || undefined,
        contactPhone: phone || undefined,
        source: "demo-booking-fallback",
        stage: "demo-requested",
        message: message || undefined,
        metadata: {
          preferredDate,
          preferredTime,
        },
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className={cn("rounded-xl border border-aivo-navy-100 bg-white p-8 text-center", className)}>
        <div className="text-4xl mb-4">📬</div>
        <h3 className="text-xl font-bold text-aivo-navy-800">Request Received!</h3>
        <p className="mt-2 text-aivo-navy-500">
          We&apos;ll email you to confirm a time within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)} noValidate>
      {/* Name */}
      <div>
        <label htmlFor="fallback-name" className="block text-sm font-medium text-aivo-navy-700">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          id="fallback-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-describedby={errors.name ? "fallback-name-error" : undefined}
          aria-invalid={!!errors.name}
          className="mt-1.5 block w-full rounded-lg border border-aivo-navy-200 px-4 py-2.5 text-aivo-navy-800 focus:border-aivo-purple-400 focus:outline-none focus:ring-2 focus:ring-aivo-purple-200 transition-colors"
        />
        {errors.name && (
          <p id="fallback-name-error" className="mt-1 text-xs text-red-500">{errors.name}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="fallback-email" className="block text-sm font-medium text-aivo-navy-700">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="fallback-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-describedby={errors.email ? "fallback-email-error" : undefined}
          aria-invalid={!!errors.email}
          className="mt-1.5 block w-full rounded-lg border border-aivo-navy-200 px-4 py-2.5 text-aivo-navy-800 focus:border-aivo-purple-400 focus:outline-none focus:ring-2 focus:ring-aivo-purple-200 transition-colors"
        />
        {errors.email && (
          <p id="fallback-email-error" className="mt-1 text-xs text-red-500">{errors.email}</p>
        )}
      </div>

      {/* Organization */}
      <div>
        <label htmlFor="fallback-org" className="block text-sm font-medium text-aivo-navy-700">
          Organization
        </label>
        <input
          id="fallback-org"
          type="text"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          className="mt-1.5 block w-full rounded-lg border border-aivo-navy-200 px-4 py-2.5 text-aivo-navy-800 focus:border-aivo-purple-400 focus:outline-none focus:ring-2 focus:ring-aivo-purple-200 transition-colors"
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="fallback-phone" className="block text-sm font-medium text-aivo-navy-700">
          Phone
        </label>
        <input
          id="fallback-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1.5 block w-full rounded-lg border border-aivo-navy-200 px-4 py-2.5 text-aivo-navy-800 focus:border-aivo-purple-400 focus:outline-none focus:ring-2 focus:ring-aivo-purple-200 transition-colors"
        />
      </div>

      {/* Preferred Date & Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="fallback-date" className="block text-sm font-medium text-aivo-navy-700">
            Preferred Date
          </label>
          <input
            id="fallback-date"
            type="date"
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            className="mt-1.5 block w-full rounded-lg border border-aivo-navy-200 px-4 py-2.5 text-aivo-navy-800 focus:border-aivo-purple-400 focus:outline-none focus:ring-2 focus:ring-aivo-purple-200 transition-colors"
          />
        </div>
        <div>
          <label htmlFor="fallback-time" className="block text-sm font-medium text-aivo-navy-700">
            Preferred Time
          </label>
          <select
            id="fallback-time"
            value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value)}
            className="mt-1.5 block w-full rounded-lg border border-aivo-navy-200 px-4 py-2.5 text-aivo-navy-800 focus:border-aivo-purple-400 focus:outline-none focus:ring-2 focus:ring-aivo-purple-200 transition-colors"
          >
            <option value="">Select...</option>
            <option value="Morning">Morning</option>
            <option value="Afternoon">Afternoon</option>
            <option value="Evening">Evening</option>
          </select>
        </div>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="fallback-message" className="block text-sm font-medium text-aivo-navy-700">
          Message
        </label>
        <textarea
          id="fallback-message"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1.5 block w-full rounded-lg border border-aivo-navy-200 px-4 py-2.5 text-aivo-navy-800 focus:border-aivo-purple-400 focus:outline-none focus:ring-2 focus:ring-aivo-purple-200 transition-colors resize-y"
        />
      </div>

      {submitError && <p className="text-sm text-red-500">{submitError}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-aivo-purple-600 px-6 py-3 font-semibold text-white hover:bg-aivo-purple-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {submitting && <Loader2 size={18} className="animate-spin" />}
        Request Demo
      </button>
    </form>
  );
}

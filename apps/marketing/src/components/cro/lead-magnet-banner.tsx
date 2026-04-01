"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { submitLead } from "@/lib/leads-api";
import { events } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface LeadMagnetBannerProps {
  title: string;
  description: string;
  ctaLabel: string;
  source: string;
  className?: string;
}

export function LeadMagnetBanner({
  title,
  description,
  ctaLabel,
  source,
  className,
}: LeadMagnetBannerProps) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (dismissed || (typeof window !== "undefined" && sessionStorage.getItem(`aivo-banner-dismissed-${source}`))) {
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      await submitLead({
        contactName: email.split("@")[0],
        contactEmail: email,
        source,
        stage: "lead-magnet",
      });
      events.leadMagnetDownload(source);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function handleDismiss() {
    sessionStorage.setItem(`aivo-banner-dismissed-${source}`, "true");
    setDismissed(true);
  }

  return (
    <div
      className={cn(
        "rounded-xl bg-gradient-to-r from-aivo-purple-50 to-aivo-teal-50 border border-aivo-purple-100 p-6",
        className
      )}
    >
      <h3 className="text-lg font-bold text-aivo-navy-800">{title}</h3>
      <p className="mt-1 text-sm text-aivo-navy-500">{description}</p>

      {success ? (
        <p className="mt-3 text-sm font-medium text-aivo-teal-600">
          Check your inbox! Your guide is on its way. 📬
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <input
            type="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded-lg border border-aivo-navy-200 px-4 py-2.5 text-sm text-aivo-navy-800 focus:outline-none focus:ring-2 focus:ring-aivo-purple-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-aivo-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-aivo-purple-700 transition-colors disabled:opacity-60 flex items-center gap-2 shrink-0"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {ctaLabel}
          </button>
        </form>
      )}

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

      {!success && (
        <button
          onClick={handleDismiss}
          className="mt-2 text-xs text-aivo-navy-400 hover:text-aivo-navy-600 transition-colors"
        >
          No thanks
        </button>
      )}
    </div>
  );
}

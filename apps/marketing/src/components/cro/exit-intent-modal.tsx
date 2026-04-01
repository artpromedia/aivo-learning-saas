"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { submitLead } from "@/lib/leads-api";
import { events } from "@/lib/analytics";

export function ExitIntentModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasShown = useRef(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("aivo-exit-intent-dismissed");
    const hasBooking = localStorage.getItem("aivo-booking-confirmed-at");
    const hasSubscribed = sessionStorage.getItem("aivo-lead-magnet-subscribed");
    if (dismissed || hasBooking || hasSubscribed) return;

    function handleMouseLeave(e: MouseEvent) {
      if (e.clientY <= 0 && !hasShown.current) {
        hasShown.current = true;
        setIsVisible(true);
        events.exitIntentCapture();
      }
    }

    function handlePopState() {
      if (!hasShown.current) {
        hasShown.current = true;
        // Push state back to prevent leaving
        window.history.pushState(null, "", window.location.href);
        setIsVisible(true);
        events.exitIntentCapture();
      }
    }

    // Mobile: detect back button
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    sessionStorage.setItem("aivo-exit-intent-dismissed", "true");
  }, []);

  // Escape key
  useEffect(() => {
    if (!isVisible) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, handleClose]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      await submitLead({
        contactName: email.split("@")[0],
        contactEmail: email,
        source: "exit-intent",
        stage: "lead-magnet",
      });
      sessionStorage.setItem("aivo-lead-magnet-subscribed", "true");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-modal-title"
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, type: "spring", damping: 25 }}
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1 text-aivo-navy-400 hover:text-aivo-navy-800 transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div className="text-center">
              <h2
                id="exit-modal-title"
                className="text-2xl font-bold text-aivo-navy-800 mb-2"
              >
                Wait! Don&apos;t Miss This Free Resource 📚
              </h2>
              <p className="text-aivo-navy-500 mb-4">
                Download our free guide: &ldquo;10 Ways AI Transforms Special
                Education&rdquo; — packed with actionable strategies for
                IEP-aligned learning.
              </p>

              {/* Mock ebook cover */}
              <div className="mx-auto w-48 h-64 rounded-lg bg-gradient-to-br from-aivo-purple-600 to-aivo-teal-500 flex flex-col items-center justify-center p-4 shadow-lg mb-6">
                <p className="text-white text-xs font-bold uppercase tracking-wider mb-2">
                  Free Guide
                </p>
                <p className="text-white text-sm font-bold text-center leading-snug">
                  10 Ways AI Transforms Special Education
                </p>
                <div className="mt-auto text-white text-[10px] font-bold opacity-80">
                  AIVO
                </div>
              </div>

              {success ? (
                <div className="py-4">
                  <p className="text-sm font-medium text-aivo-teal-600">
                    Check your inbox! Your guide is on its way. 📬
                  </p>
                  <a
                    href="/demo"
                    className="mt-3 inline-block text-sm font-medium text-aivo-purple-600 hover:underline"
                  >
                    While you wait, see Aivo in action →
                  </a>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-aivo-navy-200 px-4 py-3 text-sm text-aivo-navy-800 placeholder:text-aivo-navy-400 focus:outline-none focus:ring-2 focus:ring-aivo-purple-500 focus:border-transparent"
                  />
                  {error && <p className="text-xs text-red-500">{error}</p>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-lg bg-aivo-purple-600 px-4 py-3 text-sm font-semibold text-white hover:bg-aivo-purple-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {submitting && <Loader2 size={16} className="animate-spin" />}
                    Download Free Guide
                  </button>
                </form>
              )}

              <p className="mt-4 text-xs text-aivo-navy-400">
                No spam, ever. Unsubscribe anytime.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

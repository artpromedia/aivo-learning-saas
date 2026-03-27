"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

export function ExitIntentModal() {
  const [isVisible, setIsVisible] = useState(false);
  const hasShown = useRef(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("aivo-exit-intent-dismissed");
    if (dismissed) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown.current) {
        hasShown.current = true;
        setIsVisible(true);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem("aivo-exit-intent-dismissed", "true");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-modal-title"
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in"
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 text-aivo-navy-400 hover:text-aivo-navy-800 transition-colors"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="text-center">
          <div className="text-4xl mb-4">🎓</div>
          <h2
            id="exit-modal-title"
            className="text-2xl font-bold text-aivo-navy-800 mb-2"
          >
            Wait! Get a Free Learning Assessment
          </h2>
          <p className="text-aivo-navy-400 mb-6">
            Discover your child&apos;s unique learning profile with our free AI-powered assessment. Takes less than 5 minutes.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              required
              className="w-full rounded-lg border border-aivo-navy-200 px-4 py-3 text-sm text-aivo-navy-800 placeholder:text-aivo-navy-400 focus:outline-none focus:ring-2 focus:ring-aivo-purple-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-aivo-purple-600 px-4 py-3 text-sm font-semibold text-white hover:bg-aivo-purple-700 transition-colors"
            >
              Get Free Assessment
            </button>
          </form>

          <p className="mt-4 text-xs text-aivo-navy-400">
            No spam, ever. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("aivo-cookie-consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("aivo-cookie-consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("aivo-cookie-consent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-aivo-navy-100 shadow-lg p-4 sm:p-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-aivo-navy-600 text-center sm:text-left">
          We use cookies for analytics to improve your experience. By continuing to use our site, you agree to our{" "}
          <a href="/privacy" className="text-aivo-purple-600 hover:underline">
            Privacy Policy
          </a>
          .
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleDecline}
            className="rounded-lg px-4 py-2 text-sm font-medium text-aivo-navy-600 border border-aivo-navy-200 hover:bg-aivo-navy-50 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white bg-aivo-purple-600 hover:bg-aivo-purple-700 transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { events } from "@/lib/analytics";
import { OonrumailCalendar } from "@/components/booking/oonrumail-calendar";
import { BookingFallbackForm } from "@/components/booking/booking-fallback-form";

const CALENDAR_URL =
  process.env.NEXT_PUBLIC_OONRUMAIL_URL ??
  "https://calendar.oonrumail.com/embed/aivo-demo";

const BOOKING_DISMISSED_KEY = "aivo-booking-confirmed-at";

export function FloatingDemoCta() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show on /demo page
  const isOnDemoPage = pathname === "/demo";

  useEffect(() => {
    // Check if booking was confirmed in last 24 hours
    const confirmedAt = localStorage.getItem(BOOKING_DISMISSED_KEY);
    if (confirmedAt) {
      const elapsed = Date.now() - parseInt(confirmedAt, 10);
      if (elapsed < 24 * 60 * 60 * 1000) {
        setIsDismissed(true);
        return;
      }
      localStorage.removeItem(BOOKING_DISMISSED_KEY);
    }

    let shown = false;

    // Show after 15 seconds
    const timer = setTimeout(() => {
      if (!shown) {
        shown = true;
        setIsVisible(true);
      }
    }, 15000);

    // Or after 50% scroll depth
    function handleScroll() {
      if (shown) return;
      const scrollPct =
        window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (scrollPct >= 0.5) {
        shown = true;
        setIsVisible(true);
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    events.ctaClicked("floating-demo", "floating-widget");
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleBookingConfirmed = useCallback(() => {
    localStorage.setItem(BOOKING_DISMISSED_KEY, Date.now().toString());
    setIsDismissed(true);
    setIsOpen(false);
  }, []);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  if (isOnDemoPage || isDismissed || !isVisible) return null;

  const hasCalendarUrl = !!CALENDAR_URL;

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleOpen}
          className="fixed bottom-20 right-4 z-50 lg:bottom-6 flex items-center gap-2 rounded-full bg-aivo-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-aivo-purple-700 transition-colors"
        >
          <span className="animate-pulse">📅</span>
          Book a Demo
        </motion.button>
      )}

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile backdrop */}
            <motion.div
              className="fixed inset-0 z-50 bg-black/40 sm:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
            />
            <motion.div
              className={cn(
                "fixed z-50 bg-white shadow-2xl overflow-hidden",
                "sm:bottom-6 sm:right-4 sm:w-[400px] sm:h-[600px] sm:rounded-xl",
                "max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:rounded-t-xl max-sm:max-h-[80vh]"
              )}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-aivo-navy-100">
                <h3 className="text-lg font-bold text-aivo-navy-800">
                  Book Your Free Demo
                </h3>
                <button
                  onClick={handleClose}
                  className="p-1 text-aivo-navy-400 hover:text-aivo-navy-800 transition-colors"
                  aria-label="Close booking panel"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 overflow-y-auto h-[calc(100%-56px)]">
                {hasCalendarUrl ? (
                  <OonrumailCalendar
                    calendarUrl={CALENDAR_URL}
                    onBookingConfirmed={handleBookingConfirmed}
                  />
                ) : (
                  <BookingFallbackForm />
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

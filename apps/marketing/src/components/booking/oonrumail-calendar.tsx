"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface BookingConfirmation {
  bookingId: string;
  dateTime: string;
  attendeeName: string;
  attendeeEmail: string;
  meetingType: string;
}

interface OonrumailCalendarProps {
  calendarUrl: string;
  prefillName?: string;
  prefillEmail?: string;
  prefillOrganization?: string;
  onBookingConfirmed?: (data: BookingConfirmation) => void;
  onBookingStarted?: () => void;
  theme?: "light" | "dark";
  className?: string;
}

export function OonrumailCalendar({
  calendarUrl,
  prefillName,
  prefillEmail,
  prefillOrganization,
  onBookingConfirmed,
  onBookingStarted,
  theme = "light",
  className,
}: OonrumailCalendarProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasFailed, setHasFailed] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const buildUrl = useCallback(() => {
    const url = new URL(calendarUrl);
    if (prefillName) url.searchParams.set("name", prefillName);
    if (prefillEmail) url.searchParams.set("email", prefillEmail);
    if (prefillOrganization) url.searchParams.set("org", prefillOrganization);
    url.searchParams.set("theme", theme);
    return url.toString();
  }, [calendarUrl, prefillName, prefillEmail, prefillOrganization, theme]);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      if (isLoading) {
        setHasFailed(true);
        setIsLoading(false);
      }
    }, 10000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isLoading]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (!event.data || typeof event.data !== "object") return;
      const { type, data } = event.data;

      if (type === "oonrumail:booking:started") {
        onBookingStarted?.();
      } else if (type === "oonrumail:booking:confirmed" && data) {
        onBookingConfirmed?.({
          bookingId: data.bookingId ?? "",
          dateTime: data.dateTime ?? "",
          attendeeName: data.attendeeName ?? "",
          attendeeEmail: data.attendeeEmail ?? "",
          meetingType: data.meetingType ?? "",
        });
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onBookingConfirmed, onBookingStarted]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  if (hasFailed) {
    return (
      <div className={cn("rounded-xl border border-aivo-navy-200 bg-aivo-navy-50 p-8 text-center", className)}>
        <p className="text-aivo-navy-600 font-medium mb-2">
          Unable to load the booking calendar.
        </p>
        <p className="text-sm text-aivo-navy-400">
          Please email us at{" "}
          <a href="mailto:demo@aivolearning.com" className="text-aivo-purple-600 hover:underline">
            demo@aivolearning.com
          </a>{" "}
          or call{" "}
          <a href="tel:+17639005372" className="text-aivo-purple-600 hover:underline">
            +1 (763) 900-5372
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 z-10 bg-white rounded-xl flex items-center justify-center">
          <div className="space-y-4 w-full max-w-sm px-8">
            <div className="h-6 bg-aivo-navy-100 rounded animate-pulse" />
            <div className="h-40 bg-aivo-navy-50 rounded animate-pulse" />
            <div className="h-10 bg-aivo-navy-100 rounded animate-pulse" />
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={buildUrl()}
        onLoad={handleIframeLoad}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        title="Book a demo with OONRUMAIL"
        className="w-full rounded-xl border-0 min-h-[600px] sm:min-h-[600px] max-sm:min-h-[700px]"
      />
    </div>
  );
}

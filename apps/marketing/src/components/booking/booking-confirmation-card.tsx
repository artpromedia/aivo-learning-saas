"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { BookingConfirmation } from "./oonrumail-calendar";

interface BookingConfirmationCardProps {
  booking: BookingConfirmation;
  className?: string;
}

function formatDateTime(iso: string): string {
  try {
    const date = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(date);
  } catch {
    return iso;
  }
}

function buildGoogleCalendarUrl(booking: BookingConfirmation): string {
  const start = new Date(booking.dateTime);
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Aivo Demo - ${booking.meetingType || "Product Walkthrough"}`,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: `Demo booking with Aivo Learning.\nBooking ID: ${booking.bookingId}`,
    location: "Online (link will be emailed)",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function buildIcsContent(booking: BookingConfirmation): string {
  const start = new Date(booking.dateTime);
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Aivo Learning//Demo Booking//EN",
    "BEGIN:VEVENT",
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:Aivo Demo - ${booking.meetingType || "Product Walkthrough"}`,
    `DESCRIPTION:Demo booking with Aivo Learning. Booking ID: ${booking.bookingId}`,
    "LOCATION:Online (link will be emailed)",
    `ORGANIZER:mailto:demo@aivolearning.com`,
    `ATTENDEE:mailto:${booking.attendeeEmail}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function buildIcsDownloadUrl(booking: BookingConfirmation): string {
  const ics = buildIcsContent(booking);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  return URL.createObjectURL(blob);
}

export function BookingConfirmationCard({
  booking,
  className,
}: BookingConfirmationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, type: "spring" }}
      className={className}
    >
      <div className="rounded-2xl border border-aivo-navy-100 bg-white p-8 shadow-sm text-center">
        {/* Checkmark animation */}
        <motion.div
          className="mx-auto w-20 h-20 rounded-full bg-green-50 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="18" stroke="#10B981" strokeWidth="2.5" />
            <motion.path
              d="M12 20l5.5 5.5L28 14"
              stroke="#10B981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            />
          </svg>
        </motion.div>

        <h2 className="mt-6 text-2xl font-bold text-aivo-navy-800">
          Demo Booked!
        </h2>
        <p className="mt-3 text-lg text-aivo-navy-600">
          {formatDateTime(booking.dateTime)}
        </p>
        <p className="mt-2 text-sm text-aivo-navy-400">
          You&apos;ll receive a confirmation at {booking.attendeeEmail}
        </p>

        {/* Add to calendar links */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href={buildGoogleCalendarUrl(booking)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-aivo-navy-200 px-4 py-2 text-sm font-medium text-aivo-navy-700 hover:bg-aivo-navy-50 transition-colors"
          >
            Google Calendar
          </a>
          <a
            href={buildIcsDownloadUrl(booking)}
            download="aivo-demo.ics"
            className="inline-flex items-center gap-2 rounded-lg border border-aivo-navy-200 px-4 py-2 text-sm font-medium text-aivo-navy-700 hover:bg-aivo-navy-50 transition-colors"
          >
            iCal / Outlook
          </a>
        </div>

        <div className="mt-8">
          <Link
            href="/case-studies"
            className="text-sm font-medium text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
          >
            While you wait, explore our case studies →
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
      const safe: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(props)) {
        if (typeof v === "string" || k === "className") safe[k] = v;
      }
      return <div {...safe}>{children}</div>;
    },
    path: (props: Record<string, unknown>) => <path {...props} />,
  },
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import { BookingConfirmationCard } from "@/components/booking/booking-confirmation-card";

const mockBooking = {
  bookingId: "bk-123",
  dateTime: "2025-06-15T14:00:00Z",
  attendeeName: "John Doe",
  attendeeEmail: "john@test.com",
  meetingType: "Product Demo",
};

describe("BookingConfirmationCard", () => {
  it("renders confirmation with correct date/time", () => {
    render(<BookingConfirmationCard booking={mockBooking} />);
    expect(screen.getByText("Demo Booked!")).toBeDefined();
    // Date should be formatted (locale-dependent)
    expect(screen.getByText(/john@test.com/)).toBeDefined();
  });

  it("renders Google Calendar link with correct URL parameters", () => {
    render(<BookingConfirmationCard booking={mockBooking} />);
    const gcalLink = screen.getByText("Google Calendar");
    const href = gcalLink.getAttribute("href");
    expect(href).toContain("calendar.google.com/calendar/render");
    expect(href).toContain("action=TEMPLATE");
    expect(href).toContain("Aivo+Demo");
  });

  it("renders iCal download link", () => {
    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi.fn(() => "blob:test-url");
    render(<BookingConfirmationCard booking={mockBooking} />);
    const icalLink = screen.getByText("iCal / Outlook");
    expect(icalLink.getAttribute("download")).toBe("aivo-demo.ics");
  });

  it("renders Add to Calendar links that are accessible", () => {
    global.URL.createObjectURL = vi.fn(() => "blob:test-url");
    render(<BookingConfirmationCard booking={mockBooking} />);
    const links = screen.getAllByRole("link");
    const calendarLinks = links.filter(
      (l) => l.textContent?.includes("Google Calendar") || l.textContent?.includes("iCal")
    );
    expect(calendarLinks.length).toBe(2);
  });

  it("renders case studies link", () => {
    render(<BookingConfirmationCard booking={mockBooking} />);
    expect(screen.getByText(/explore our case studies/)).toBeDefined();
  });
});

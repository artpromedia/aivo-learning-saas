import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";

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
    h1: ({ children }: React.PropsWithChildren) => <h1>{children}</h1>,
    p: ({ children }: React.PropsWithChildren) => <p>{children}</p>,
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: React.PropsWithChildren<{ href: string }>) => <a href={href}>{children}</a>,
}));

vi.mock("lucide-react", () => ({
  Check: () => <span>✓</span>,
  Loader2: () => <span>Loading</span>,
  Shield: () => <span>Shield</span>,
}));

const mockSubmitLead = vi.hoisted(() => vi.fn().mockResolvedValue({ lead: { id: "123" } }));
vi.mock("@/lib/leads-api", () => ({
  submitLead: (...args: unknown[]) => mockSubmitLead(...args),
}));

const mockEvents = vi.hoisted(() => ({
  demoBookingStarted: vi.fn(),
  demoBookingCompleted: vi.fn(),
}));
vi.mock("@/lib/analytics", () => ({ events: mockEvents }));

vi.mock("@/components/booking/oonrumail-calendar", () => ({
  OonrumailCalendar: () => <div data-testid="oonrumail-calendar">Calendar</div>,
}));

vi.mock("@/components/booking/booking-confirmation-card", () => ({
  BookingConfirmationCard: () => <div data-testid="booking-confirmation">Confirmed!</div>,
}));

import { DemoPageClient } from "@/app/demo/client";

describe("DemoPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders left column content", () => {
    render(<DemoPageClient />);
    expect(screen.getByText(/See Aivo Transform Learning/)).toBeDefined();
    expect(screen.getByText(/Brain Clone™ AI creating/)).toBeDefined();
    expect(screen.getByText(/5 AI tutors adapting/)).toBeDefined();
  });

  it("renders checklist items", () => {
    render(<DemoPageClient />);
    expect(screen.getByText(/Real-time parent and teacher dashboards/)).toBeDefined();
    expect(screen.getByText(/IEP integration and accessibility/)).toBeDefined();
  });

  it("renders mini testimonials", () => {
    render(<DemoPageClient />);
    expect(screen.getByText(/Sarah Chen/)).toBeDefined();
    expect(screen.getByText(/Dr. James Rodriguez/)).toBeDefined();
  });

  it("renders trust badges", () => {
    render(<DemoPageClient />);
    expect(screen.getByText("SOC 2 Compliant")).toBeDefined();
    expect(screen.getByText("FERPA Certified")).toBeDefined();
    expect(screen.getByText("COPPA Safe")).toBeDefined();
    expect(screen.getByText("GDPR Ready")).toBeDefined();
  });

  it("renders qualification form with all fields", () => {
    render(<DemoPageClient />);
    expect(screen.getByLabelText(/Full Name/)).toBeDefined();
    expect(screen.getByLabelText(/Work Email/)).toBeDefined();
    expect(screen.getByLabelText(/School\/District Name/)).toBeDefined();
    expect(screen.getByLabelText(/^Role/)).toBeDefined();
    expect(screen.getByLabelText(/District Size/)).toBeDefined();
  });

  it("validates required fields on empty submission", () => {
    render(<DemoPageClient />);
    fireEvent.click(screen.getByText("Continue to Booking"));
    expect(screen.getByText("Name is required")).toBeDefined();
    expect(screen.getByText("Email is required")).toBeDefined();
  });

  it("reveals calendar after valid form submission", async () => {
    render(<DemoPageClient />);

    fireEvent.change(screen.getByLabelText(/Full Name/), { target: { value: "Test User" } });
    fireEvent.change(screen.getByLabelText(/Work Email/), { target: { value: "test@school.com" } });
    fireEvent.change(screen.getByLabelText(/School\/District/), { target: { value: "Test School" } });
    fireEvent.change(screen.getByLabelText(/^Role/), { target: { value: "Teacher" } });
    fireEvent.change(screen.getByLabelText(/District Size/), { target: { value: "<500" } });
    fireEvent.click(screen.getByText("Continue to Booking"));

    await waitFor(() => {
      expect(screen.getByTestId("oonrumail-calendar")).toBeDefined();
    });
  });

  it("fires demoBookingStarted analytics event", async () => {
    render(<DemoPageClient />);

    fireEvent.change(screen.getByLabelText(/Full Name/), { target: { value: "Test" } });
    fireEvent.change(screen.getByLabelText(/Work Email/), { target: { value: "t@t.com" } });
    fireEvent.change(screen.getByLabelText(/School\/District/), { target: { value: "S" } });
    fireEvent.change(screen.getByLabelText(/^Role/), { target: { value: "Teacher" } });
    fireEvent.change(screen.getByLabelText(/District Size/), { target: { value: "<500" } });
    fireEvent.click(screen.getByText("Continue to Booking"));

    await waitFor(() => {
      expect(mockEvents.demoBookingStarted).toHaveBeenCalledWith("demo-page");
    });
  });

  it("calls submitLead with correct payload", async () => {
    render(<DemoPageClient />);

    fireEvent.change(screen.getByLabelText(/Full Name/), { target: { value: "John Doe" } });
    fireEvent.change(screen.getByLabelText(/Work Email/), { target: { value: "john@school.com" } });
    fireEvent.change(screen.getByLabelText(/School\/District/), { target: { value: "School" } });
    fireEvent.change(screen.getByLabelText(/^Role/), { target: { value: "Principal" } });
    fireEvent.change(screen.getByLabelText(/District Size/), { target: { value: "500-2000" } });
    fireEvent.click(screen.getByText("Continue to Booking"));

    await waitFor(() => {
      expect(mockSubmitLead).toHaveBeenCalledWith(
        expect.objectContaining({
          contactName: "John Doe",
          contactEmail: "john@school.com",
          source: "demo-qualification",
          stage: "qualified",
        })
      );
    });
  });
});

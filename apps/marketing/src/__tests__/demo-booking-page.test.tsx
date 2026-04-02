import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

afterEach(() => {
  cleanup();
});

vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => {
      const safe: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(props)) {
        if (typeof v === "string" || typeof v === "number" || k === "className")
          safe[k] = v;
      }
      return <div {...safe}>{children}</div>;
    },
    h1: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => {
      const safe: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(props)) {
        if (typeof v === "string" || typeof v === "number" || k === "className")
          safe[k] = v;
      }
      return <h1 {...safe}>{children}</h1>;
    },
    p: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => {
      const safe: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(props)) {
        if (typeof v === "string" || typeof v === "number" || k === "className")
          safe[k] = v;
      }
      return <p {...safe}>{children}</p>;
    },
    path: (props: Record<string, unknown>) => <path {...props} />,
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockSubmitLead = vi.fn().mockResolvedValue({ lead: { id: "lead-123" } });
vi.mock("@/lib/leads-api", () => ({
  submitLead: (...args: unknown[]) => mockSubmitLead(...args),
}));

vi.mock("@/lib/analytics", () => ({
  events: { signupClick: vi.fn(), demoRequest: vi.fn() },
}));

vi.mock("@/components/booking/oonrumail-calendar", () => ({
  OonrumailCalendar: (props: Record<string, unknown>) => (
    <div data-testid="oonrumail-calendar">
      <button
        data-testid="mock-confirm"
        onClick={() => {
          const onConfirmed = props.onBookingConfirmed as (
            data: unknown,
          ) => void;
          onConfirmed?.({
            bookingId: "bk-123",
            dateTime: "2026-04-10T14:00:00Z",
            attendeeName: "Jane Doe",
            attendeeEmail: "jane@school.org",
            meetingType: "Demo",
          });
        }}
      >
        Confirm Booking
      </button>
    </div>
  ),
}));

vi.mock("@/components/booking/booking-confirmation-card", () => ({
  BookingConfirmationCard: ({
    booking,
  }: {
    booking: { bookingId: string };
  }) => (
    <div data-testid="booking-confirmation">
      Booking confirmed: {booking.bookingId}
    </div>
  ),
}));

vi.mock("@/components/booking/booking-fallback-form", () => ({
  BookingFallbackForm: () => <div data-testid="booking-fallback">Fallback</div>,
}));

import { DemoPageClient } from "@/app/demo/client";

describe("DemoPageClient — Multi-step Booking", () => {
  beforeEach(() => {
    mockSubmitLead.mockClear();
  });

  it("renders step 1 heading and form", () => {
    render(<DemoPageClient />);
    expect(screen.getByText("Tell Us About You")).toBeDefined();
    expect(screen.getByLabelText(/^Name/)).toBeDefined();
    expect(screen.getByLabelText(/^Email/)).toBeDefined();
    expect(screen.getByLabelText(/Organization/)).toBeDefined();
    expect(screen.getByLabelText(/^Role/)).toBeDefined();
    expect(screen.getByLabelText(/Number of Students/)).toBeDefined();
  });

  it("renders step indicator with 3 steps", () => {
    render(<DemoPageClient />);
    expect(screen.getByText("Step 1 of 3")).toBeDefined();
    expect(screen.getByText("Step 2 of 3")).toBeDefined();
    expect(screen.getByText("Step 3 of 3")).toBeDefined();
  });

  it("renders sidebar with See Aivo in Action", () => {
    render(<DemoPageClient />);
    expect(screen.getByText("See Aivo in Action")).toBeDefined();
    expect(
      screen.getByText("Personalized 30-min walkthrough of the platform"),
    ).toBeDefined();
  });

  it("shows validation errors on empty submit", async () => {
    const user = userEvent.setup();
    render(<DemoPageClient />);

    const submitBtn = screen.getByRole("button", { name: /Continue/ });
    await user.click(submitBtn);

    expect(screen.getByText("Name is required")).toBeDefined();
    expect(screen.getByText("Email is required")).toBeDefined();
  });

  it("advances to step 2 when valid name and email are entered", async () => {
    const user = userEvent.setup();
    render(<DemoPageClient />);

    await user.type(screen.getByLabelText(/^Name/), "Jane Doe");
    await user.type(screen.getByLabelText(/^Email/), "jane@school.org");

    const submitBtn = screen.getByRole("button", { name: /Continue/ });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByTestId("oonrumail-calendar")).toBeDefined();
    });
  });

  it("advances to step 3 after booking confirmation", async () => {
    const user = userEvent.setup();
    render(<DemoPageClient />);

    await user.type(screen.getByLabelText(/^Name/), "Jane Doe");
    await user.type(screen.getByLabelText(/^Email/), "jane@school.org");

    await user.click(screen.getByRole("button", { name: /Continue/ }));

    await waitFor(() => {
      expect(screen.getByTestId("oonrumail-calendar")).toBeDefined();
    });

    await user.click(screen.getByTestId("mock-confirm"));

    await waitFor(() => {
      expect(screen.getByTestId("booking-confirmation")).toBeDefined();
    });

    expect(screen.getByText(/Booking confirmed: bk-123/)).toBeDefined();
  });

  it("renders prefer email block with demo@aivolearning.com", () => {
    render(<DemoPageClient />);
    expect(screen.getByText("demo@aivolearning.com")).toBeDefined();
  });
});

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

const mockSubmitLead = vi.fn().mockResolvedValue({ id: "lead-123" });
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

import { DemoPageClient } from "@/app/demo/client";

describe("DemoPageClient — Multi-step Booking", () => {
  beforeEach(() => {
    mockSubmitLead.mockClear();
  });

  it("renders step 1 heading and form", () => {
    render(<DemoPageClient />);
    expect(screen.getByText("Tell Us About You")).toBeDefined();
    expect(screen.getByLabelText(/First Name/)).toBeDefined();
    expect(screen.getByLabelText(/Last Name/)).toBeDefined();
    expect(screen.getByLabelText(/Work Email/)).toBeDefined();
    expect(screen.getByLabelText(/School\/District/)).toBeDefined();
    expect(screen.getByLabelText(/^Role/)).toBeDefined();
    expect(screen.getByLabelText(/Number of Students/)).toBeDefined();
  });

  it("renders step indicator with 3 steps", () => {
    render(<DemoPageClient />);
    expect(screen.getByText("Your Info")).toBeDefined();
    expect(screen.getByText("Pick a Time")).toBeDefined();
    expect(screen.getByText("Confirmed")).toBeDefined();
  });

  it("renders What to expect section", () => {
    render(<DemoPageClient />);
    expect(screen.getByText("What to expect")).toBeDefined();
    expect(
      screen.getByText("30-minute call with our education team"),
    ).toBeDefined();
  });

  it("shows validation errors on empty submit", async () => {
    const user = userEvent.setup();
    render(<DemoPageClient />);

    const submitBtn = screen.getByRole("button", {
      name: /Continue to Scheduling/,
    });
    await user.click(submitBtn);

    expect(screen.getByText("First name is required")).toBeDefined();
    expect(screen.getByText("Email is required")).toBeDefined();
  });

  it("advances to step 2 after successful form submission", async () => {
    const user = userEvent.setup();
    render(<DemoPageClient />);

    await user.type(screen.getByLabelText(/First Name/), "Jane");
    await user.type(screen.getByLabelText(/Last Name/), "Doe");
    await user.type(screen.getByLabelText(/Work Email/), "jane@school.org");
    await user.type(
      screen.getByLabelText(/School\/District/),
      "Springfield USD",
    );

    const roleSelect = screen.getByLabelText(/^Role/);
    await user.selectOptions(roleSelect, "Teacher");

    const studentSelect = screen.getByLabelText(/Number of Students/);
    await user.selectOptions(studentSelect, "51-200");

    const submitBtn = screen.getByRole("button", {
      name: /Continue to Scheduling/,
    });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByTestId("oonrumail-calendar")).toBeDefined();
    });

    expect(mockSubmitLead).toHaveBeenCalledOnce();
  });

  it("advances to step 3 after booking confirmation", async () => {
    const user = userEvent.setup();
    render(<DemoPageClient />);

    // Fill step 1
    await user.type(screen.getByLabelText(/First Name/), "Jane");
    await user.type(screen.getByLabelText(/Last Name/), "Doe");
    await user.type(screen.getByLabelText(/Work Email/), "jane@school.org");
    await user.type(
      screen.getByLabelText(/School\/District/),
      "Springfield USD",
    );
    await user.selectOptions(screen.getByLabelText(/^Role/), "Teacher");
    await user.selectOptions(
      screen.getByLabelText(/Number of Students/),
      "51-200",
    );

    await user.click(
      screen.getByRole("button", { name: /Continue to Scheduling/ }),
    );

    await waitFor(() => {
      expect(screen.getByTestId("oonrumail-calendar")).toBeDefined();
    });

    // Confirm booking
    await user.click(screen.getByTestId("mock-confirm"));

    await waitFor(() => {
      expect(screen.getByTestId("booking-confirmation")).toBeDefined();
    });

    expect(screen.getByText(/Booking confirmed: bk-123/)).toBeDefined();
  });

  it("renders direct contact email", () => {
    render(<DemoPageClient />);
    expect(screen.getByText("sales@aivolearning.com")).toBeDefined();
  });
});

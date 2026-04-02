import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

afterEach(() => {
  cleanup();
});

/* ------------------------------------------------------------------ */
/*  Mocks                                                               */
/* ------------------------------------------------------------------ */

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
    button: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => {
      const safe: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(props)) {
        if (
          typeof v === "string" ||
          typeof v === "number" ||
          typeof v === "function" ||
          k === "className"
        )
          safe[k] = v;
      }
      return <button {...safe}>{children}</button>;
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

const mockSignupClick = vi.fn();
const mockDemoRequest = vi.fn();
vi.mock("@/lib/analytics", () => ({
  events: {
    signupClick: (...args: unknown[]) => mockSignupClick(...args),
    demoRequest: (...args: unknown[]) => mockDemoRequest(...args),
  },
}));

const mockSubmitLead = vi.fn().mockResolvedValue({ lead: { id: "lead-123" } });
vi.mock("@/lib/leads-api", () => ({
  submitLead: (...args: unknown[]) => mockSubmitLead(...args),
}));

let capturedCalendarProps: Record<string, unknown> = {};
vi.mock("@/components/booking/oonrumail-calendar", () => ({
  OonrumailCalendar: (props: Record<string, unknown>) => {
    capturedCalendarProps = props;
    return (
      <div data-testid="oonrumail-calendar">
        <button
          data-testid="mock-booking-started"
          onClick={() => {
            const fn = props.onBookingStarted as (() => void) | undefined;
            fn?.();
          }}
        >
          Start Booking
        </button>
        <button
          data-testid="mock-booking-confirmed"
          onClick={() => {
            const fn = props.onBookingConfirmed as
              | ((data: unknown) => void)
              | undefined;
            fn?.({
              bookingId: "bk-456",
              dateTime: "2026-04-15T10:00:00Z",
              attendeeName: "Jane Doe",
              attendeeEmail: "jane@school.org",
              meetingType: "Demo",
            });
          }}
        >
          Confirm Booking
        </button>
      </div>
    );
  },
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
  BookingFallbackForm: () => <div data-testid="booking-fallback">Fallback Form</div>,
}));

/* ------------------------------------------------------------------ */
/*  Import component under test                                         */
/* ------------------------------------------------------------------ */

import { DemoPageClient } from "@/app/demo/client";

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

async function fillAndSubmitStep1(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/^Name/), "Jane Doe");
  await user.type(screen.getByLabelText(/^Email/), "jane@school.org");
  await user.type(screen.getByLabelText(/Organization/), "Springfield USD");
  await user.selectOptions(screen.getByLabelText(/^Role/), "Teacher");

  const continueBtn = screen.getByRole("button", { name: /Continue/ });
  await user.click(continueBtn);
}

/* ------------------------------------------------------------------ */
/*  Tests                                                               */
/* ------------------------------------------------------------------ */

describe("DemoPageClient — Multi-step Booking Flow", () => {
  beforeEach(() => {
    mockSignupClick.mockClear();
    mockDemoRequest.mockClear();
    mockSubmitLead.mockClear();
    capturedCalendarProps = {};
  });

  /* ---- Page load ---- */

  it("tracks signupClick('demo-page') on mount", () => {
    render(<DemoPageClient />);
    expect(mockSignupClick).toHaveBeenCalledWith("demo-page");
  });

  /* ---- Sidebar ---- */

  it("renders sidebar with headline and bullet points", () => {
    render(<DemoPageClient />);
    expect(screen.getByText("See Aivo in Action")).toBeDefined();
    expect(screen.getAllByText("Book a free 30-minute personalized demo").length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText("Personalized 30-min walkthrough of the platform"),
    ).toBeDefined();
    expect(
      screen.getByText("See how Brain Clone AI adapts to each student"),
    ).toBeDefined();
    expect(
      screen.getByText("Get answers to all your questions"),
    ).toBeDefined();
  });

  it("renders 'Prefer email?' block with mailto link", () => {
    render(<DemoPageClient />);
    expect(screen.getByText("Prefer email?")).toBeDefined();
    const mailLink = screen.getByText("demo@aivolearning.com");
    expect(mailLink.closest("a")?.getAttribute("href")).toBe(
      "mailto:demo@aivolearning.com",
    );
  });

  /* ---- Step indicator ---- */

  it("shows step indicator with step numbers", () => {
    render(<DemoPageClient />);
    expect(screen.getByText("Step 1 of 3")).toBeDefined();
    expect(screen.getByText("Step 2 of 3")).toBeDefined();
    expect(screen.getByText("Step 3 of 3")).toBeDefined();
  });

  /* ---- Step 1 ---- */

  it("renders Step 1 form fields", () => {
    render(<DemoPageClient />);
    expect(screen.getByText("Tell Us About You")).toBeDefined();
    expect(screen.getByLabelText(/^Name/)).toBeDefined();
    expect(screen.getByLabelText(/^Email/)).toBeDefined();
    expect(screen.getByLabelText(/Organization/)).toBeDefined();
    expect(screen.getByLabelText(/^Role/)).toBeDefined();
    expect(screen.getByLabelText(/Number of Students/)).toBeDefined();
  });

  it("shows validation errors when name and email are empty", async () => {
    const user = userEvent.setup();
    render(<DemoPageClient />);

    const continueBtn = screen.getByRole("button", { name: /Continue/ });
    await user.click(continueBtn);

    expect(screen.getByText("Name is required")).toBeDefined();
    expect(screen.getByText("Email is required")).toBeDefined();
  });

  it("shows email format validation error", async () => {
    const user = userEvent.setup();
    render(<DemoPageClient />);

    await user.type(screen.getByLabelText(/^Name/), "Jane");
    await user.type(screen.getByLabelText(/^Email/), "not-an-email");

    const continueBtn = screen.getByRole("button", { name: /Continue/ });
    await user.click(continueBtn);

    expect(screen.getByText("Please enter a valid email")).toBeDefined();
  });

  it("advances to Step 2 with valid name and email", async () => {
    const user = userEvent.setup();
    render(<DemoPageClient />);

    await fillAndSubmitStep1(user);

    await waitFor(() => {
      expect(screen.getByText("Pick a Time")).toBeDefined();
      expect(screen.getByTestId("oonrumail-calendar")).toBeDefined();
    });
  });

  /* ---- Step 2 ---- */

  it("passes correct prefill props to OonrumailCalendar", async () => {
    const user = userEvent.setup();
    render(<DemoPageClient />);

    await fillAndSubmitStep1(user);

    await waitFor(() => {
      expect(screen.getByTestId("oonrumail-calendar")).toBeDefined();
    });

    expect(capturedCalendarProps.calendarUrl).toBe(
      "https://calendar.oonrumail.com/aivo/demo-30min",
    );
    expect(capturedCalendarProps.prefillName).toBe("Jane Doe");
    expect(capturedCalendarProps.prefillEmail).toBe("jane@school.org");
    expect(capturedCalendarProps.prefillOrganization).toBe("Springfield USD");
    expect(capturedCalendarProps.theme).toBe("light");
  });

  it("Back button returns to Step 1 with form data preserved", async () => {
    const user = userEvent.setup();
    render(<DemoPageClient />);

    await fillAndSubmitStep1(user);

    await waitFor(() => {
      expect(screen.getByText("Pick a Time")).toBeDefined();
    });

    const backBtn = screen.getByLabelText("Go back to step 1");
    await user.click(backBtn);

    await waitFor(() => {
      expect(screen.getByText("Tell Us About You")).toBeDefined();
    });

    expect(screen.getByLabelText<HTMLInputElement>(/^Name/).value).toBe(
      "Jane Doe",
    );
    expect(screen.getByLabelText<HTMLInputElement>(/^Email/).value).toBe(
      "jane@school.org",
    );
  });

  it("onBookingStarted triggers signupClick('demo-calendar-started')", async () => {
    const user = userEvent.setup();
    render(<DemoPageClient />);

    await fillAndSubmitStep1(user);

    await waitFor(() => {
      expect(screen.getByTestId("mock-booking-started")).toBeDefined();
    });

    mockSignupClick.mockClear();
    await user.click(screen.getByTestId("mock-booking-started"));

    expect(mockSignupClick).toHaveBeenCalledWith("demo-calendar-started");
  });

  /* ---- Step 3 ---- */

  it("onBookingConfirmed advances to Step 3 and shows confirmation", async () => {
    const user = userEvent.setup();
    render(<DemoPageClient />);

    await fillAndSubmitStep1(user);

    await waitFor(() => {
      expect(screen.getByTestId("mock-booking-confirmed")).toBeDefined();
    });

    await user.click(screen.getByTestId("mock-booking-confirmed"));

    await waitFor(() => {
      expect(screen.getByTestId("booking-confirmation")).toBeDefined();
      expect(screen.getByText(/Booking confirmed: bk-456/)).toBeDefined();
    });
  });

  it("calls demoRequest() on booking confirmation", async () => {
    const user = userEvent.setup();
    render(<DemoPageClient />);

    await fillAndSubmitStep1(user);

    await waitFor(() => {
      expect(screen.getByTestId("mock-booking-confirmed")).toBeDefined();
    });

    mockDemoRequest.mockClear();
    await user.click(screen.getByTestId("mock-booking-confirmed"));

    await waitFor(() => {
      expect(mockDemoRequest).toHaveBeenCalled();
    });
  });

  it("calls submitLead with source 'demo-calendar-booking' on confirmation", async () => {
    const user = userEvent.setup();
    render(<DemoPageClient />);

    await fillAndSubmitStep1(user);

    await waitFor(() => {
      expect(screen.getByTestId("mock-booking-confirmed")).toBeDefined();
    });

    await user.click(screen.getByTestId("mock-booking-confirmed"));

    await waitFor(() => {
      expect(mockSubmitLead).toHaveBeenCalledWith(
        expect.objectContaining({
          contactName: "Jane Doe",
          contactEmail: "jane@school.org",
          organizationName: "Springfield USD",
          source: "demo-calendar-booking",
          stage: "demo-booked",
          metadata: expect.objectContaining({
            bookingId: "bk-456",
            role: "Teacher",
          }),
        }),
      );
    });
  });

  it("renders 'You\\'re All Set!' heading on Step 3", async () => {
    const user = userEvent.setup();
    render(<DemoPageClient />);

    await fillAndSubmitStep1(user);

    await waitFor(() => {
      expect(screen.getByTestId("mock-booking-confirmed")).toBeDefined();
    });

    await user.click(screen.getByTestId("mock-booking-confirmed"));

    await waitFor(() => {
      expect(screen.getByText(/All Set/)).toBeDefined();
    });
  });

  it("shows Back to Home link on Step 3", async () => {
    const user = userEvent.setup();
    render(<DemoPageClient />);

    await fillAndSubmitStep1(user);

    await waitFor(() => {
      expect(screen.getByTestId("mock-booking-confirmed")).toBeDefined();
    });

    await user.click(screen.getByTestId("mock-booking-confirmed"));

    await waitFor(() => {
      const homeLink = screen.getByText("Back to Home");
      expect(homeLink.closest("a")?.getAttribute("href")).toBe("/");
    });
  });
});

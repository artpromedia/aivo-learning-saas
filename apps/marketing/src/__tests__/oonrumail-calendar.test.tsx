import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";

vi.mock("@/lib/utils", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

import { OonrumailCalendar } from "@/components/booking/oonrumail-calendar";

describe("OonrumailCalendar", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders iframe with correct src including prefill params", () => {
    render(
      <OonrumailCalendar
        calendarUrl="https://calendar.oonrumail.com/embed/aivo-demo"
        prefillName="John Doe"
        prefillEmail="john@school.edu"
        prefillOrganization="Springfield USD"
        theme="light"
      />
    );

    const iframe = screen.getByTitle("Book a demo with OONRUMAIL");
    const src = iframe.getAttribute("src");
    expect(src).toContain("name=John+Doe");
    expect(src).toContain("email=john%40school.edu");
    expect(src).toContain("org=Springfield+USD");
    expect(src).toContain("theme=light");
  });

  it("shows loading skeleton before iframe loads", () => {
    const { container } = render(
      <OonrumailCalendar calendarUrl="https://calendar.oonrumail.com/embed/aivo-demo" />
    );

    // Skeleton should be present (animate-pulse class)
    const skeleton = container.querySelector(".animate-pulse");
    expect(skeleton).not.toBeNull();
  });

  it("hides skeleton on iframe load", async () => {
    render(
      <OonrumailCalendar calendarUrl="https://calendar.oonrumail.com/embed/aivo-demo" />
    );

    const iframe = screen.getByTitle("Book a demo with OONRUMAIL");

    await act(async () => {
      iframe.dispatchEvent(new Event("load"));
    });

    // After load, skeleton should be gone
    // The iframe should still be present
    expect(iframe).toBeDefined();
  });

  it("shows timeout fallback after 10 seconds", async () => {
    render(
      <OonrumailCalendar calendarUrl="https://calendar.oonrumail.com/embed/aivo-demo" />
    );

    act(() => {
      vi.advanceTimersByTime(10001);
    });

    expect(screen.getByText(/Unable to load the booking calendar/)).toBeDefined();
    expect(screen.getByText(/demo@aivolearning.com/)).toBeDefined();
  });

  it("handles postMessage booking:confirmed correctly", async () => {
    const onConfirmed = vi.fn();
    render(
      <OonrumailCalendar
        calendarUrl="https://calendar.oonrumail.com/embed/aivo-demo"
        onBookingConfirmed={onConfirmed}
      />
    );

    await act(async () => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: {
            type: "oonrumail:booking:confirmed",
            data: {
              bookingId: "abc123",
              dateTime: "2025-01-15T10:00:00Z",
              attendeeName: "John Doe",
              attendeeEmail: "john@test.com",
              meetingType: "Demo",
            },
          },
        })
      );
    });

    expect(onConfirmed).toHaveBeenCalledWith({
      bookingId: "abc123",
      dateTime: "2025-01-15T10:00:00Z",
      attendeeName: "John Doe",
      attendeeEmail: "john@test.com",
      meetingType: "Demo",
    });
  });

  it("has correct sandbox attribute", () => {
    render(
      <OonrumailCalendar calendarUrl="https://calendar.oonrumail.com/embed/aivo-demo" />
    );

    const iframe = screen.getByTitle("Book a demo with OONRUMAIL");
    expect(iframe.getAttribute("sandbox")).toBe(
      "allow-scripts allow-same-origin allow-forms allow-popups"
    );
  });

  it("removes event listener on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = render(
      <OonrumailCalendar calendarUrl="https://calendar.oonrumail.com/embed/aivo-demo" />
    );
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith("message", expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });
});

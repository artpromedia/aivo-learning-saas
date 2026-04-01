import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";

vi.mock("framer-motion", () => ({
  motion: {
    button: ({ children, onClick, ...props }: React.PropsWithChildren<{ onClick?: () => void }>) => (
      <button onClick={onClick}>{children}</button>
    ),
    div: ({ children, onClick, ...props }: React.PropsWithChildren<{ onClick?: () => void; className?: string }>) => (
      <div onClick={onClick} className={props.className}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

vi.mock("lucide-react", () => ({
  X: () => <span>X</span>,
}));

let mockPathname = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

vi.mock("@/components/booking/oonrumail-calendar", () => ({
  OonrumailCalendar: () => <div data-testid="floating-calendar">Calendar</div>,
}));

vi.mock("@/components/booking/booking-fallback-form", () => ({
  BookingFallbackForm: () => <div>Fallback Form</div>,
}));

const mockEvents = vi.hoisted(() => ({ ctaClicked: vi.fn() }));
vi.mock("@/lib/analytics", () => ({ events: mockEvents }));

vi.mock("@/lib/utils", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

import { FloatingDemoCta } from "@/components/cro/floating-demo-cta";

describe("FloatingDemoCta", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockPathname = "/";
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("does not render button before 15 seconds", () => {
    render(<FloatingDemoCta />);
    expect(screen.queryByText("Book a Demo")).toBeNull();
  });

  it("renders button after 15 seconds", () => {
    render(<FloatingDemoCta />);
    act(() => {
      vi.advanceTimersByTime(15001);
    });
    expect(screen.getByText("Book a Demo")).toBeDefined();
  });

  it("opens panel on click with calendar", () => {
    render(<FloatingDemoCta />);
    act(() => {
      vi.advanceTimersByTime(15001);
    });
    fireEvent.click(screen.getByText("Book a Demo"));
    expect(screen.getByText("Book Your Free Demo")).toBeDefined();
    expect(screen.getByTestId("floating-calendar")).toBeDefined();
  });

  it("closes panel on close button", () => {
    render(<FloatingDemoCta />);
    act(() => {
      vi.advanceTimersByTime(15001);
    });
    fireEvent.click(screen.getByText("Book a Demo"));
    expect(screen.getByText("Book Your Free Demo")).toBeDefined();

    // Find and click close button (X)
    const closeBtn = screen.getByLabelText("Close booking panel");
    fireEvent.click(closeBtn);
    expect(screen.queryByText("Book Your Free Demo")).toBeNull();
  });

  it("closes panel on Escape key", () => {
    render(<FloatingDemoCta />);
    act(() => {
      vi.advanceTimersByTime(15001);
    });
    fireEvent.click(screen.getByText("Book a Demo"));

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(screen.queryByText("Book Your Free Demo")).toBeNull();
  });

  it("does NOT render on /demo page", () => {
    mockPathname = "/demo";
    render(<FloatingDemoCta />);
    act(() => {
      vi.advanceTimersByTime(15001);
    });
    expect(screen.queryByText("Book a Demo")).toBeNull();
  });

  it("does NOT render within 24 hours of a confirmed booking", () => {
    localStorage.setItem("aivo-booking-confirmed-at", Date.now().toString());
    render(<FloatingDemoCta />);
    act(() => {
      vi.advanceTimersByTime(15001);
    });
    expect(screen.queryByText("Book a Demo")).toBeNull();
  });

  it("fires analytics event on open", () => {
    render(<FloatingDemoCta />);
    act(() => {
      vi.advanceTimersByTime(15001);
    });
    fireEvent.click(screen.getByText("Book a Demo"));
    expect(mockEvents.ctaClicked).toHaveBeenCalledWith("floating-demo", "floating-widget");
  });
});

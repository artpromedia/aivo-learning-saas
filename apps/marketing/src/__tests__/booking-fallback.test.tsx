import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

vi.mock("lucide-react", () => ({
  Loader2: () => <span data-testid="loader" />,
}));

const mockSubmitLead = vi.hoisted(() => vi.fn().mockResolvedValue({ lead: { id: "123" } }));
vi.mock("@/lib/leads-api", () => ({
  submitLead: (...args: unknown[]) => mockSubmitLead(...args),
}));

vi.mock("@/lib/utils", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

import { BookingFallbackForm } from "@/components/booking/booking-fallback-form";

describe("BookingFallbackForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all form fields", () => {
    render(<BookingFallbackForm />);
    expect(screen.getByLabelText(/Name/)).toBeDefined();
    expect(screen.getByLabelText(/Email/)).toBeDefined();
    expect(screen.getByLabelText(/Organization/)).toBeDefined();
    expect(screen.getByLabelText(/Phone/)).toBeDefined();
    expect(screen.getByLabelText(/Preferred Date/)).toBeDefined();
    expect(screen.getByLabelText(/Preferred Time/)).toBeDefined();
    expect(screen.getByLabelText(/Message/)).toBeDefined();
  });

  it("validates name and email on empty submission", async () => {
    render(<BookingFallbackForm />);
    const submitBtn = screen.getByText("Request Demo");
    fireEvent.click(submitBtn);

    expect(screen.getByText("Name is required")).toBeDefined();
    expect(screen.getByText("Email is required")).toBeDefined();
    expect(mockSubmitLead).not.toHaveBeenCalled();
  });

  it("validates email format", async () => {
    render(<BookingFallbackForm />);
    fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: "John" } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "notanemail" } });
    fireEvent.click(screen.getByText("Request Demo"));

    expect(screen.getByText("Please enter a valid email")).toBeDefined();
  });

  it("calls submitLead with correct payload on valid submission", async () => {
    render(<BookingFallbackForm />);

    fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: "John Doe" } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "john@test.com" } });
    fireEvent.change(screen.getByLabelText(/Organization/), { target: { value: "Test School" } });
    fireEvent.click(screen.getByText("Request Demo"));

    await waitFor(() => {
      expect(mockSubmitLead).toHaveBeenCalledWith(
        expect.objectContaining({
          contactName: "John Doe",
          contactEmail: "john@test.com",
          organizationName: "Test School",
          source: "demo-booking-fallback",
          stage: "demo-requested",
        })
      );
    });
  });

  it("shows success message after submission", async () => {
    render(<BookingFallbackForm />);
    fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: "John" } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "john@test.com" } });
    fireEvent.click(screen.getByText("Request Demo"));

    await waitFor(() => {
      expect(screen.getByText(/confirm a time within 24 hours/)).toBeDefined();
    });
  });
});

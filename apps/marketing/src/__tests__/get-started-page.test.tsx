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
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href}>{children}</a>
  ),
}));

let mockSearchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
}));

const mockSubmitLead = vi.hoisted(() => vi.fn().mockResolvedValue({ lead: { id: "123" } }));
vi.mock("@/lib/leads-api", () => ({
  submitLead: (...args: unknown[]) => mockSubmitLead(...args),
}));

const mockEvents = vi.hoisted(() => ({ signupClick: vi.fn() }));
vi.mock("@/lib/analytics", () => ({ events: mockEvents }));

vi.mock("@/lib/utils", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

import { GetStartedClient } from "@/app/get-started/client";

describe("GetStartedPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  it("renders step 1 with all fields", () => {
    render(<GetStartedClient />);
    expect(screen.getByRole("heading", { name: "About You" })).toBeDefined();
    expect(screen.getByLabelText(/Full Name/)).toBeDefined();
    expect(screen.getByLabelText(/Email/)).toBeDefined();
    expect(screen.getByLabelText(/Password/)).toBeDefined();
  });

  it("shows password strength meter", () => {
    render(<GetStartedClient />);
    const passwordInput = screen.getByLabelText(/Password/);
    fireEvent.change(passwordInput, { target: { value: "weak" } });
    expect(screen.getByText(/Password strength: weak/)).toBeDefined();

    fireEvent.change(passwordInput, { target: { value: "StrongPass1!" } });
    expect(screen.getByText(/Password strength: strong/)).toBeDefined();
  });

  it("validates required fields before advancing", () => {
    render(<GetStartedClient />);
    fireEvent.click(screen.getByText("Continue"));
    expect(screen.getByText("Name is required")).toBeDefined();
  });

  it("renders step 2 after step 1 completion", () => {
    render(<GetStartedClient />);

    fireEvent.change(screen.getByLabelText(/Full Name/), { target: { value: "John" } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "j@t.com" } });
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: "LongPass1!" } });
    fireEvent.click(screen.getByText(/I confirm I am 13/));
    fireEvent.click(screen.getByText("Continue"));

    expect(screen.getByRole("heading", { name: "Your Learner" })).toBeDefined();
  });

  it("renders step 3 after step 2 completion", () => {
    render(<GetStartedClient />);

    // Complete step 1
    fireEvent.change(screen.getByLabelText(/Full Name/), { target: { value: "John" } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "j@t.com" } });
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: "LongPass1!" } });
    fireEvent.click(screen.getByText(/I confirm I am 13/));
    fireEvent.click(screen.getByText("Continue"));

    // Complete step 2
    fireEvent.change(screen.getByLabelText(/Learner.*First Name/), { target: { value: "Alex" } });
    fireEvent.change(screen.getByLabelText(/Grade Level/), { target: { value: "5" } });
    fireEvent.click(screen.getByText("Continue"));

    expect(screen.getByText("Choose Your Plan")).toBeDefined();
  });

  it("?plan=pro pre-selects Pro plan", () => {
    mockSearchParams = new URLSearchParams("plan=pro");
    render(<GetStartedClient />);

    // Complete step 1 and 2 to reach step 3
    fireEvent.change(screen.getByLabelText(/Full Name/), { target: { value: "J" } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "j@t.com" } });
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: "LongPass1!" } });
    fireEvent.click(screen.getByText(/I confirm I am 13/));
    fireEvent.click(screen.getByText("Continue"));

    fireEvent.change(screen.getByLabelText(/Learner.*First Name/), { target: { value: "A" } });
    fireEvent.change(screen.getByLabelText(/Grade Level/), { target: { value: "3" } });
    fireEvent.click(screen.getByText("Continue"));

    // Pro should show "Start 14-Day Free Trial" as the submit button
    expect(screen.getByText("Start 14-Day Free Trial")).toBeDefined();
  });

  it("final submit calls submitLead", async () => {
    render(<GetStartedClient />);

    // Step 1
    fireEvent.change(screen.getByLabelText(/Full Name/), { target: { value: "John" } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "j@t.com" } });
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: "LongPass1!" } });
    fireEvent.click(screen.getByText(/I confirm I am 13/));
    fireEvent.click(screen.getByText("Continue"));

    // Step 2
    fireEvent.change(screen.getByLabelText(/Learner.*First Name/), { target: { value: "Alex" } });
    fireEvent.change(screen.getByLabelText(/Grade Level/), { target: { value: "5" } });
    fireEvent.click(screen.getByText("Continue"));

    // Step 3
    fireEvent.click(screen.getByText("Create Free Account"));

    await waitFor(() => {
      expect(mockSubmitLead).toHaveBeenCalledWith(
        expect.objectContaining({
          contactName: "John",
          contactEmail: "j@t.com",
          source: "get-started",
          stage: "signup",
        })
      );
    });
  });

  it("shows confetti success screen", async () => {
    render(<GetStartedClient />);

    // Complete all steps
    fireEvent.change(screen.getByLabelText(/Full Name/), { target: { value: "J" } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "j@t.com" } });
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: "LongPass1!" } });
    fireEvent.click(screen.getByText(/I confirm I am 13/));
    fireEvent.click(screen.getByText("Continue"));

    fireEvent.change(screen.getByLabelText(/Learner.*First Name/), { target: { value: "A" } });
    fireEvent.change(screen.getByLabelText(/Grade Level/), { target: { value: "3" } });
    fireEvent.click(screen.getByText("Continue"));

    fireEvent.click(screen.getByText("Create Free Account"));

    await waitFor(() => {
      expect(screen.getByText("Welcome to Aivo!")).toBeDefined();
    });
  });

  it("back button returns to previous step with preserved data", () => {
    render(<GetStartedClient />);

    // Step 1
    fireEvent.change(screen.getByLabelText(/Full Name/), { target: { value: "John" } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "j@t.com" } });
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: "LongPass1!" } });
    fireEvent.click(screen.getByText(/I confirm I am 13/));
    fireEvent.click(screen.getByText("Continue"));

    // In step 2, click Back
    fireEvent.click(screen.getByText("Back"));

    // Should be back on step 1 with data preserved
    expect(screen.getByRole("heading", { name: "About You" })).toBeDefined();
    expect((screen.getByLabelText(/Full Name/) as HTMLInputElement).value).toBe("John");
  });
});

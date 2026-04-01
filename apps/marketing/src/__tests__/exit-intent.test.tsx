import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, onClick, ...props }: React.PropsWithChildren<{ onClick?: () => void; className?: string; role?: string }>) => (
      <div onClick={onClick} className={props.className} role={props.role} aria-modal={props["aria-modal"]} aria-labelledby={props["aria-labelledby"]}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

vi.mock("lucide-react", () => ({
  X: () => <span>X</span>,
  Loader2: () => <span>Loading</span>,
}));

const mockSubmitLead = vi.fn().mockResolvedValue({ lead: { id: "123" } });
vi.mock("@/lib/leads-api", () => ({
  submitLead: (...args: unknown[]) => mockSubmitLead(...args),
}));

const mockEvents = { exitIntentCapture: vi.fn() };
vi.mock("@/lib/analytics", () => ({ events: mockEvents }));

import { ExitIntentModal } from "@/components/cro/exit-intent-modal";

describe("ExitIntentModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
  });

  it("shows modal when mouse exits viewport top", () => {
    render(<ExitIntentModal />);
    expect(screen.queryByText(/Don't Miss This Free Resource/)).toBeNull();

    act(() => {
      document.dispatchEvent(new MouseEvent("mouseleave", { clientY: -1 }));
    });

    expect(screen.getByText(/Don't Miss This Free Resource/)).toBeDefined();
  });

  it("does NOT show twice per session", () => {
    sessionStorage.setItem("aivo-exit-intent-dismissed", "true");
    render(<ExitIntentModal />);

    act(() => {
      document.dispatchEvent(new MouseEvent("mouseleave", { clientY: -1 }));
    });

    expect(screen.queryByText(/Don't Miss This Free Resource/)).toBeNull();
  });

  it("validates email", () => {
    render(<ExitIntentModal />);
    act(() => {
      document.dispatchEvent(new MouseEvent("mouseleave", { clientY: -1 }));
    });

    // Empty submit should not call API
    const submitBtn = screen.getByText("Download Free Guide");
    fireEvent.click(submitBtn);
    expect(mockSubmitLead).not.toHaveBeenCalled();
  });

  it("calls submitLead with correct payload on valid submission", async () => {
    render(<ExitIntentModal />);
    act(() => {
      document.dispatchEvent(new MouseEvent("mouseleave", { clientY: -1 }));
    });

    const emailInput = screen.getByPlaceholderText("Enter your email");
    fireEvent.change(emailInput, { target: { value: "test@test.com" } });
    fireEvent.click(screen.getByText("Download Free Guide"));

    await waitFor(() => {
      expect(mockSubmitLead).toHaveBeenCalledWith(
        expect.objectContaining({
          contactEmail: "test@test.com",
          source: "exit-intent",
          stage: "lead-magnet",
        })
      );
    });
  });

  it("shows success state after submission", async () => {
    render(<ExitIntentModal />);
    act(() => {
      document.dispatchEvent(new MouseEvent("mouseleave", { clientY: -1 }));
    });

    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "test@test.com" },
    });
    fireEvent.click(screen.getByText("Download Free Guide"));

    await waitFor(() => {
      expect(screen.getByText(/Check your inbox/)).toBeDefined();
    });
  });

  it("Escape key closes modal", () => {
    render(<ExitIntentModal />);
    act(() => {
      document.dispatchEvent(new MouseEvent("mouseleave", { clientY: -1 }));
    });

    expect(screen.getByText(/Don't Miss This Free Resource/)).toBeDefined();

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });

    expect(screen.queryByText(/Don't Miss This Free Resource/)).toBeNull();
  });

  it("fires analytics event", () => {
    render(<ExitIntentModal />);
    act(() => {
      document.dispatchEvent(new MouseEvent("mouseleave", { clientY: -1 }));
    });

    expect(mockEvents.exitIntentCapture).toHaveBeenCalled();
  });
});

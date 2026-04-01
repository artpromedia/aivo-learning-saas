import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

afterEach(() => {
  cleanup();
});

// ─── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockSubmitLead = vi.fn();
vi.mock("@/lib/leads-api", () => ({
  submitLead: (...args: unknown[]) => mockSubmitLead(...args),
}));

vi.mock("@/lib/utm", () => ({
  attachUtmToPayload: <T extends object>(p: T) => ({ ...p, utmParams: {} }),
}));

vi.mock("framer-motion", () => {
  const React = require("react");
  return {
    AnimatePresence: ({
      children,
    }: {
      children: React.ReactNode;
      mode?: string;
    }) => <>{children}</>,
    motion: new Proxy(
      {},
      {
        get: (_target: unknown, prop: string) => {
          return React.forwardRef(
            (
              {
                children,
                ...props
              }: { children?: React.ReactNode; [key: string]: unknown },
              ref: React.Ref<HTMLElement>,
            ) => {
              const filtered: Record<string, unknown> = {};
              for (const [k, v] of Object.entries(props)) {
                if (
                  ![
                    "initial",
                    "animate",
                    "exit",
                    "transition",
                    "variants",
                    "whileHover",
                    "whileTap",
                    "whileInView",
                    "layout",
                    "layoutId",
                  ].includes(k)
                ) {
                  filtered[k] = v;
                }
              }
              return React.createElement(
                prop,
                { ...filtered, ref },
                children,
              );
            },
          );
        },
      },
    ),
  };
});

// Mock LocaleSwitcher since it uses document.cookie
vi.mock("@/components/layout/locale-switcher", () => ({
  LocaleSwitcher: () => <div data-testid="locale-switcher" />,
}));

import { Footer } from "@/components/layout/footer";

// ─── Tests ──────────────────────────────────────────────────────────────────────

beforeEach(() => {
  mockSubmitLead.mockReset();
});

describe("Footer — Column structure", () => {
  it("renders 4 column headings: Product, Solutions, Resources, Company", () => {
    render(<Footer />);
    expect(screen.getByText("Product")).toBeInTheDocument();
    expect(screen.getByText("Solutions")).toBeInTheDocument();
    expect(screen.getByText("Resources")).toBeInTheDocument();
    expect(screen.getByText("Company")).toBeInTheDocument();
  });

  it("renders Product column links", () => {
    render(<Footer />);
    expect(screen.getAllByText("Brain Clone AI").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("AI Tutors").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Gamification").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("IEP Integration").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Pricing").length).toBeGreaterThanOrEqual(1);
  });

  it("renders Company column links", () => {
    render(<Footer />);
    expect(screen.getAllByText("About").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Careers").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Contact").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Press").length).toBeGreaterThanOrEqual(1);
  });

  it("renders copyright text", () => {
    render(<Footer />);
    expect(screen.getAllByText(/AIVO Learning/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/All rights reserved/).length).toBeGreaterThanOrEqual(1);
  });
});

describe("Footer — Newsletter form", () => {
  it("submits email and shows success message", async () => {
    mockSubmitLead.mockResolvedValueOnce({ lead: { id: "123" } });
    const user = userEvent.setup();
    render(<Footer />);

    const input = screen.getByPlaceholderText("your@email.com");
    const submit = screen.getByRole("button", { name: "Subscribe" });

    await user.type(input, "test@example.com");
    await user.click(submit);

    await waitFor(() => {
      expect(screen.getByText("Thanks for subscribing!")).toBeInTheDocument();
    });

    expect(mockSubmitLead).toHaveBeenCalledWith({
      contactName: "",
      contactEmail: "test@example.com",
      source: "footer-newsletter",
    });
  });

  it("shows error message on API failure", async () => {
    mockSubmitLead.mockRejectedValueOnce(new Error("Network error"));
    const user = userEvent.setup();
    render(<Footer />);

    const input = screen.getByPlaceholderText("your@email.com");
    const submit = screen.getByRole("button", { name: "Subscribe" });

    await user.type(input, "test@fail.com");
    await user.click(submit);

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  it("shows validation error for invalid email", async () => {
    const user = userEvent.setup();
    render(<Footer />);

    const input = screen.getByPlaceholderText("your@email.com");
    const submit = screen.getByRole("button", { name: "Subscribe" });

    await user.type(input, "not-an-email");
    await user.click(submit);

    await waitFor(() => {
      expect(
        screen.getByText("Please enter a valid email address."),
      ).toBeInTheDocument();
    });
    expect(mockSubmitLead).not.toHaveBeenCalled();
  });
});

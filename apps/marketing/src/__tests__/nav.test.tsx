import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

afterEach(() => {
  cleanup();
});

// ─── Mocks ──────────────────────────────────────────────────────────────────────

let mockPathname = "/";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

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

vi.mock("@/lib/analytics", () => ({
  events: {
    demoRequest: vi.fn(),
    signupClick: vi.fn(),
  },
}));

vi.mock("@/hooks/use-scroll-position", () => ({
  useScrollPosition: () => 0,
}));

// Minimal framer-motion mock that preserves AnimatePresence children rendering
vi.mock("framer-motion", async () => {
  const React = await import("react");
  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
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
                // Strip framer-motion-specific props
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

import { Nav } from "@/components/layout/nav";

// ─── Tests ──────────────────────────────────────────────────────────────────────

beforeEach(() => {
  mockPathname = "/";
});

describe("Nav — Desktop Links", () => {
  it("renders Product, Solutions, Pricing, Resources top-level items", () => {
    render(<Nav />);
    expect(screen.getByText("Product")).toBeInTheDocument();
    expect(screen.getByText("Solutions")).toBeInTheDocument();
    expect(screen.getByText("Pricing")).toBeInTheDocument();
    expect(screen.getByText("Resources")).toBeInTheDocument();
  });

  it('renders "Login" link', () => {
    render(<Nav />);
    const loginLinks = screen.getAllByText("Login");
    expect(loginLinks.length).toBeGreaterThanOrEqual(1);
  });

  it('renders "Book a Demo" button with correct test ID', () => {
    render(<Nav />);
    const demos = screen.getAllByTestId("nav-cta-demo");
    expect(demos.length).toBeGreaterThanOrEqual(1);
    expect(demos[0]).toHaveTextContent("Book a Demo");
  });

  it('renders "Get Started Free" button with correct test ID', () => {
    render(<Nav />);
    const signups = screen.getAllByTestId("nav-cta-signup");
    expect(signups.length).toBeGreaterThanOrEqual(1);
    expect(signups[0]).toHaveTextContent("Get Started Free");
  });
});

describe("Nav — mega-dropdown", () => {
  it("opens Product mega-dropdown on click and shows feature items", async () => {
    const user = userEvent.setup();
    render(<Nav />);

    const triggers = screen.getAllByText("Product");
    const desktopTrigger = triggers.find(
      (el) => el.closest("button")?.getAttribute("data-dropdown-trigger") === "product",
    );
    expect(desktopTrigger).toBeDefined();

    await user.click(desktopTrigger!);

    expect(screen.getByText("Brain Clone AI")).toBeInTheDocument();
    expect(screen.getByText("AI Tutors")).toBeInTheDocument();
    expect(screen.getByText("Gamification")).toBeInTheDocument();
    expect(screen.getByText("IEP Integration")).toBeInTheDocument();
  });

  it("opens Solutions dropdown on click", async () => {
    const user = userEvent.setup();
    render(<Nav />);

    const triggers = screen.getAllByText("Solutions");
    const desktopTrigger = triggers.find(
      (el) => el.closest("button")?.getAttribute("data-dropdown-trigger") === "solutions",
    );
    await user.click(desktopTrigger!);

    expect(screen.getByText("For Teachers")).toBeInTheDocument();
    expect(screen.getByText("For Parents")).toBeInTheDocument();
    expect(screen.getByText("For Districts")).toBeInTheDocument();
  });

  it("opens Resources dropdown on click", async () => {
    const user = userEvent.setup();
    render(<Nav />);

    const triggers = screen.getAllByText("Resources");
    const desktopTrigger = triggers.find(
      (el) => el.closest("button")?.getAttribute("data-dropdown-trigger") === "resources",
    );
    await user.click(desktopTrigger!);

    expect(screen.getByText("Blog")).toBeInTheDocument();
    expect(screen.getByText("Case Studies")).toBeInTheDocument();
    expect(screen.getByText("FAQ")).toBeInTheDocument();
    expect(screen.getByText("Help Center")).toBeInTheDocument();
  });
});

describe("Nav — Mobile menu", () => {
  it("opens full-screen mobile overlay when hamburger is clicked", async () => {
    const user = userEvent.setup();
    render(<Nav />);

    const hamburgers = screen.getAllByLabelText("Open menu");
    await user.click(hamburgers[0]);

    const mobileNav = screen.getByLabelText("Mobile");
    expect(mobileNav).toBeInTheDocument();
  });

  it("closes mobile menu when close button is clicked", async () => {
    const user = userEvent.setup();
    render(<Nav />);

    const hamburgers = screen.getAllByLabelText("Open menu");
    await user.click(hamburgers[0]);
    expect(screen.getByLabelText("Mobile")).toBeInTheDocument();

    const closeButtons = screen.getAllByLabelText("Close menu");
    await user.click(closeButtons[0]);
    expect(screen.queryByLabelText("Mobile")).not.toBeInTheDocument();
  });
});

describe("Nav — Keyboard navigation", () => {
  it("opens dropdown on Enter key press", async () => {
    const user = userEvent.setup();
    render(<Nav />);

    const trigger = screen.getAllByText("Product").find(
      (el) => el.closest("button")?.getAttribute("data-dropdown-trigger") === "product",
    )!;

    trigger.closest("button")!.focus();
    await user.keyboard("{Enter}");

    expect(screen.getByText("Brain Clone AI")).toBeInTheDocument();
  });

  it("closes dropdown on Escape key press", async () => {
    const user = userEvent.setup();
    render(<Nav />);

    const trigger = screen.getAllByText("Product").find(
      (el) => el.closest("button")?.getAttribute("data-dropdown-trigger") === "product",
    )!;

    trigger.closest("button")!.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByText("Brain Clone AI")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    // After escape, the dropdown menu role should be gone
    expect(screen.queryByRole("menu", { name: "Product features" })).not.toBeInTheDocument();
  });
});

describe("Nav — aria-current", () => {
  it('sets aria-current="page" on the active Pricing link', () => {
    mockPathname = "/pricing";
    render(<Nav />);

    const pricingLinks = screen.getAllByText("Pricing");
    const activeLink = pricingLinks.find(
      (el) => el.getAttribute("aria-current") === "page",
    );
    expect(activeLink).toBeDefined();
  });

  it("does not set aria-current on non-active links", () => {
    mockPathname = "/";
    render(<Nav />);

    const pricingLinks = screen.getAllByText("Pricing");
    const activeLink = pricingLinks.find(
      (el) => el.getAttribute("aria-current") === "page",
    );
    expect(activeLink).toBeUndefined();
  });
});

describe("Nav — CTA analytics", () => {
  it('fires demoRequest event when "Book a Demo" is clicked', async () => {
    const { events } = await import("@/lib/analytics");
    const user = userEvent.setup();
    render(<Nav />);

    const demoBtn = screen.getAllByTestId("nav-cta-demo")[0];
    await user.click(demoBtn);

    expect(events.demoRequest).toHaveBeenCalled();
  });

  it('fires signupClick event when "Get Started Free" is clicked', async () => {
    const { events } = await import("@/lib/analytics");
    const user = userEvent.setup();
    render(<Nav />);

    const signupBtn = screen.getAllByTestId("nav-cta-signup")[0];
    await user.click(signupBtn);

    expect(events.signupClick).toHaveBeenCalledWith("nav");
  });
});

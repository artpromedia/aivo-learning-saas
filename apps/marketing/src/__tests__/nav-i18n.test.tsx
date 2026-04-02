import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Nav } from "@/components/layout/nav";

/* ------------------------------------------------------------------ */
/* Mocks                                                               */
/* ------------------------------------------------------------------ */

// Mock next/navigation
const mockPathname = vi.fn(() => "/");
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
}));

// Mock the I18n provider
const mockT = vi.fn((section: string, key: string) => key);
vi.mock("@/providers/i18n-provider", () => ({
  useI18n: () => ({
    locale: "en",
    messages: null,
    t: mockT,
  }),
}));

// Mock LocaleSwitcher
vi.mock("@/components/layout/locale-switcher", () => ({
  LocaleSwitcher: ({ variant }: { variant?: string }) => (
    <button aria-label="Change language" data-variant={variant}>
      LocaleSwitcher
    </button>
  ),
}));

// Mock navLinks
vi.mock("@/content/nav", () => ({
  navLinks: [
    { key: "features", href: "#features" },
    { key: "pricing", href: "/pricing" },
  ],
}));

/* ------------------------------------------------------------------ */
/* Tests                                                               */
/* ------------------------------------------------------------------ */

describe("Nav i18n integration", () => {
  beforeEach(() => {
    cleanup();
    mockPathname.mockReturnValue("/");
    mockT.mockImplementation((_section: string, key: string) => key);
  });

  it("renders nav links via t() translation function", () => {
    render(<Nav />);

    expect(mockT).toHaveBeenCalledWith("nav", "features");
    expect(mockT).toHaveBeenCalledWith("nav", "pricing");
  });

  it("renders Log In and Get Started via t()", () => {
    render(<Nav />);

    expect(mockT).toHaveBeenCalledWith("nav", "login");
    expect(mockT).toHaveBeenCalledWith("nav", "getStarted");
  });

  it("renders Spanish strings when t() returns Spanish translations", () => {
    mockT.mockImplementation((_section: string, key: string) => {
      const translations: Record<string, string> = {
        features: "Funciones",
        pricing: "Precios",
        login: "Iniciar Sesión",
        getStarted: "Empezar Gratis",
      };
      return translations[key] ?? key;
    });

    render(<Nav />);

    expect(screen.getAllByText("Funciones").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Precios").length).toBeGreaterThan(0);
    expect(screen.getByText("Iniciar Sesión")).toBeTruthy();
    expect(screen.getAllByText("Empezar Gratis").length).toBeGreaterThan(0);
  });

  it("includes LocaleSwitcher with aria-label 'Change language'", () => {
    render(<Nav />);

    expect(screen.getByLabelText("Change language")).toBeTruthy();
  });

  it("returns null on /demo routes", () => {
    mockPathname.mockReturnValue("/demo");

    const { container } = render(<Nav />);
    expect(container.innerHTML).toBe("");
  });

  it("returns null on /get-started routes", () => {
    mockPathname.mockReturnValue("/get-started");

    const { container } = render(<Nav />);
    expect(container.innerHTML).toBe("");
  });
});

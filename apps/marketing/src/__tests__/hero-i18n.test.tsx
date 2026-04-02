import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { Hero } from "@/components/home/hero";

/* ------------------------------------------------------------------ */
/* Mocks                                                               */
/* ------------------------------------------------------------------ */

// Mock the I18n provider
const mockT = vi.fn((section: string, key: string) => key);
vi.mock("@/providers/i18n-provider", () => ({
  useI18n: () => ({
    locale: "en",
    messages: null,
    t: mockT,
  }),
}));

// Mock next/link
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

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      [key: string]: unknown;
    }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock analytics
vi.mock("@/lib/analytics", () => ({
  events: { signupClick: vi.fn() },
}));

// Mock visual components
vi.mock("@/components/home/dashboard-mockup", () => ({
  DashboardMockup: () => <div data-testid="dashboard-mockup" />,
}));
vi.mock("@/components/home/brain-clone-mockup", () => ({
  BrainCloneMockup: () => <div data-testid="brain-clone-mockup" />,
}));
vi.mock("@/components/home/tutors-mockup", () => ({
  TutorsMockup: () => <div data-testid="tutors-mockup" />,
}));

/* ------------------------------------------------------------------ */
/* Tests                                                               */
/* ------------------------------------------------------------------ */

describe("Hero i18n integration", () => {
  beforeEach(() => {
    cleanup();
    mockT.mockImplementation((_section: string, key: string) => key);
  });

  it("calls t() for slide 1 headline and CTA keys", () => {
    render(<Hero />);

    expect(mockT).toHaveBeenCalledWith("hero", "headline");
    expect(mockT).toHaveBeenCalledWith("hero", "subheadline");
    expect(mockT).toHaveBeenCalledWith("hero", "cta");
    expect(mockT).toHaveBeenCalledWith("hero", "ctaSecondary");
  });

  it("calls t() for all 5 slides headline keys", () => {
    render(<Hero />);

    expect(mockT).toHaveBeenCalledWith("hero", "headline");
    expect(mockT).toHaveBeenCalledWith("hero", "slide2Headline");
    expect(mockT).toHaveBeenCalledWith("hero", "slide3Headline");
    expect(mockT).toHaveBeenCalledWith("hero", "slide4Headline");
    expect(mockT).toHaveBeenCalledWith("hero", "slide5Headline");
  });

  it("displays slide 1 headline text on initial render", () => {
    mockT.mockImplementation((_section: string, key: string) => {
      const translations: Record<string, string> = {
        headline: "Aprendizaje con IA",
        subheadline: "Ningún estudiante se queda atrás.",
        cta: "Empezar Gratis",
        ctaSecondary: "Solicitar una Demo",
      };
      return translations[key] ?? key;
    });

    render(<Hero />);

    expect(screen.getByText("Aprendizaje con IA")).toBeTruthy();
    expect(
      screen.getByText("Ningún estudiante se queda atrás."),
    ).toBeTruthy();
    expect(screen.getByText("Empezar Gratis")).toBeTruthy();
    expect(screen.getByText("Solicitar una Demo")).toBeTruthy();
  });

  it("navigates to slide 2 when Next button is clicked", () => {
    mockT.mockImplementation((_section: string, key: string) => {
      const translations: Record<string, string> = {
        slide2Headline: "Caminos Personalizados",
        slide2Cta: "Ver Cómo Funciona",
        slide2CtaSecondary: "Ver el Recorrido",
      };
      return translations[key] ?? key;
    });

    render(<Hero />);

    const nextBtn = screen.getByLabelText("Next slide");
    fireEvent.click(nextBtn);

    expect(screen.getByText("Caminos Personalizados")).toBeTruthy();
    expect(screen.getByText("Ver Cómo Funciona")).toBeTruthy();
    expect(screen.getByText("Ver el Recorrido")).toBeTruthy();
  });

  it("renders navigation dots for all 5 slides", () => {
    render(<Hero />);

    const dots = screen.getAllByLabelText(/Go to slide/);
    expect(dots.length).toBe(5);
  });

  it("renders Previous / Next arrow buttons", () => {
    render(<Hero />);

    expect(screen.getByLabelText("Previous slide")).toBeTruthy();
    expect(screen.getByLabelText("Next slide")).toBeTruthy();
  });
});

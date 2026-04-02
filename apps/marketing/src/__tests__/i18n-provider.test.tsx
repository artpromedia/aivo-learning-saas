import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { I18nProvider, useI18n } from "@/providers/i18n-provider";

// English messages fixture
const enMessages = {
  nav: {
    features: "Features",
    pricing: "Pricing",
    about: "About",
    blog: "Blog",
    howItWorks: "How It Works",
    tutors: "AI Tutors",
    login: "Log In",
    getStarted: "Get Started Free",
  },
  hero: { headline: "AI-Powered Learning" },
  features: { title: "Features Title" },
  howItWorks: { title: "How It Works" },
  aiTutors: { title: "AI Tutors" },
  pricing: { title: "Pricing" },
  cta: { headline: "CTA" },
  demo: { title: "Demo" },
  contact: { title: "Contact" },
  footer: { copyright: "© 2025 AIVO" },
  common: { learnMore: "Learn More" },
};

// Spanish messages fixture
const esMessages = {
  nav: {
    features: "Funciones",
    pricing: "Precios",
    about: "Nosotros",
    blog: "Blog",
    howItWorks: "Cómo Funciona",
    tutors: "Tutores IA",
    login: "Iniciar Sesión",
    getStarted: "Empezar Gratis",
  },
  hero: { headline: "Aprendizaje con IA" },
  features: { title: "Funciones Título" },
  howItWorks: { title: "Cómo Funciona" },
  aiTutors: { title: "Tutores IA" },
  pricing: { title: "Precios" },
  cta: { headline: "CTA" },
  demo: { title: "Demo" },
  contact: { title: "Contacto" },
  footer: { copyright: "© 2025 AIVO" },
  common: { learnMore: "Más Información" },
};

// Mock the i18n hooks
vi.mock("@/lib/i18n", () => ({
  useLocale: vi.fn(() => "en"),
  useTranslations: vi.fn(() => null),
}));

// Import the mocked module for manipulation
import { useLocale, useTranslations } from "@/lib/i18n";
const mockUseLocale = vi.mocked(useLocale);
const mockUseTranslations = vi.mocked(useTranslations);

// Helper component that displays i18n values
function TestConsumer({ tKey }: { tKey: string }) {
  const { locale, t } = useI18n();
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="translated">{t(tKey)}</span>
    </div>
  );
}

describe("I18nProvider", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockUseLocale.mockReturnValue("en");
    mockUseTranslations.mockReturnValue(null);
  });

  it("renders children", () => {
    render(
      <I18nProvider>
        <div data-testid="child">Hello</div>
      </I18nProvider>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("returns locale defaulting to 'en'", () => {
    render(
      <I18nProvider>
        <TestConsumer tKey="nav.features" />
      </I18nProvider>,
    );
    expect(screen.getByTestId("locale")).toHaveTextContent("en");
  });

  it("t('nav.features') returns 'Features' when English messages are loaded", () => {
    mockUseTranslations.mockReturnValue(enMessages as any);
    render(
      <I18nProvider>
        <TestConsumer tKey="nav.features" />
      </I18nProvider>,
    );
    expect(screen.getByTestId("translated")).toHaveTextContent("Features");
  });

  it("t('nonexistent.key') returns 'nonexistent.key' as fallback", () => {
    mockUseTranslations.mockReturnValue(enMessages as any);
    render(
      <I18nProvider>
        <TestConsumer tKey="nonexistent.key" />
      </I18nProvider>,
    );
    expect(screen.getByTestId("translated")).toHaveTextContent(
      "nonexistent.key",
    );
  });

  it("t() returns the key when messages are still loading (null)", () => {
    mockUseTranslations.mockReturnValue(null);
    render(
      <I18nProvider>
        <TestConsumer tKey="nav.features" />
      </I18nProvider>,
    );
    expect(screen.getByTestId("translated")).toHaveTextContent("nav.features");
  });

  it("returns Spanish translation when es messages are loaded", () => {
    mockUseLocale.mockReturnValue("es");
    mockUseTranslations.mockReturnValue(esMessages as any);
    render(
      <I18nProvider>
        <TestConsumer tKey="nav.features" />
      </I18nProvider>,
    );
    expect(screen.getByTestId("locale")).toHaveTextContent("es");
    expect(screen.getByTestId("translated")).toHaveTextContent("Funciones");
  });
});

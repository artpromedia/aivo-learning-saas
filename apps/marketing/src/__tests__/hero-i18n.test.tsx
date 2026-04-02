import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";

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
  hero: {
    headline: "Aprendizaje con IA que se Adapta a Cada Estudiante",
    subheadline:
      "Ningún estudiante se queda atrás. Educación personalizada impulsada por la tecnología Brain Clone AI que crea un perfil de aprendizaje único para cada alumno.",
    cta: "Empezar Gratis",
    ctaSecondary: "Solicitar una Demo",
    slide2Headline: "Caminos Personalizados para Cada Estudiante",
    slide2Subheadline:
      "Nuestra IA se adapta en tiempo real, identificando fortalezas y áreas de mejora para crear un plan de estudios personalizado que mantiene a los estudiantes motivados.",
    slide2Cta: "Ver Cómo Funciona",
    slide2CtaSecondary: "Ver el Recorrido",
    slide3Headline: "Diseñado para Estudiantes con IEP — Amado por Todos",
    slide3Subheadline:
      "Ya sea que tu hijo tenga un IEP, un plan 504 o simplemente necesite apoyo adicional, el Brain Clone AI de Aivo crea una experiencia de aprendizaje tan única como ellos.",
    slide3Cta: "Empezar Gratis",
    slide3CtaSecondary: "Solicitar una Demo",
    slide4Headline: "5 Tutores IA Expertos, Un Viaje Personalizado",
    slide4Subheadline:
      "Desde matemáticas hasta comprensión lectora, nuestros tutores de IA especializados se encuentran con los estudiantes donde están y los guían hacia adelante — con paciencia, estímulo e inteligencia adaptativa.",
    slide4Cta: "Conoce a los Tutores",
    slide4CtaSecondary: "Reservar una Demo",
    slide5Headline: "Seguimiento del Progreso en Tiempo Real",
    slide5Subheadline:
      "Un panel de aprendizaje intuitivo que ofrece a estudiantes, padres y profesores visibilidad instantánea del progreso, rachas y recomendaciones con IA.",
    slide5Cta: "Empezar Gratis",
    slide5CtaSecondary: "Ver Casos de Éxito",
  },
  features: { title: "", subtitle: "" },
  howItWorks: { title: "", subtitle: "" },
  aiTutors: { title: "", subtitle: "" },
  pricing: { title: "", subtitle: "", monthly: "", annual: "", faqTitle: "" },
  cta: {
    headline: "",
    subheadline: "",
    button: "",
    secondary: "",
    mobileNote: "",
  },
  demo: { title: "", subtitle: "", successTitle: "", successMessage: "" },
  contact: { title: "", subtitle: "", successTitle: "", successMessage: "" },
  footer: {
    copyright: "",
    privacy: "",
    terms: "",
    newsletter: "",
    subscribe: "",
  },
  common: {
    learnMore: "",
    getStarted: "",
    contactUs: "",
    readMore: "",
    backToHome: "",
  },
};

// Build a t() function from esMessages
function makeT(msgs: any) {
  return (key: string): string => {
    const parts = key.split(".");
    let current: any = msgs;
    for (const part of parts) {
      if (current == null || typeof current !== "object") return key;
      current = current[part];
    }
    return typeof current === "string" ? current : key;
  };
}

// Mock the i18n provider
vi.mock("@/providers/i18n-provider", () => ({
  useI18n: () => ({
    locale: "es",
    messages: esMessages,
    t: makeT(esMessages),
  }),
  I18nProvider: ({ children }: { children: React.ReactNode }) => children,
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
    [key: string]: any;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock framer-motion to render children immediately without animation
vi.mock("framer-motion", () => {
  const React = require("react");
  const MotionDiv = React.forwardRef(
    ({ children, ...props }: any, ref: any) => (
      <div ref={ref} {...props}>
        {children}
      </div>
    ),
  );
  MotionDiv.displayName = "MotionDiv";
  return {
    motion: { div: MotionDiv },
    AnimatePresence: ({ children }: any) => children,
  };
});

// Mock analytics
vi.mock("@/lib/analytics", () => ({
  events: { signupClick: vi.fn() },
}));

// Mock cn utility
vi.mock("@/lib/utils", () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(" "),
}));

// Mock dashboard mockup
vi.mock("../components/home/dashboard-mockup", () => ({
  DashboardMockup: () => <div data-testid="dashboard-mockup" />,
}));

// Use a path that matches the hero import
vi.mock("@/components/home/dashboard-mockup", () => ({
  DashboardMockup: () => <div data-testid="dashboard-mockup" />,
}));

import { Hero } from "@/components/home/hero";

const slideHeadlinesEs = [
  "Aprendizaje con IA que se Adapta a Cada Estudiante",
  "Caminos Personalizados para Cada Estudiante",
  "Diseñado para Estudiantes con IEP — Amado por Todos",
  "5 Tutores IA Expertos, Un Viaje Personalizado",
  "Seguimiento del Progreso en Tiempo Real",
];

describe("Hero with Spanish translations", () => {
  beforeEach(() => {
    cleanup();
    vi.useFakeTimers({ shouldAdvanceTime: false });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the first slide headline in Spanish", () => {
    render(<Hero />);
    expect(
      screen.getByText(
        "Aprendizaje con IA que se Adapta a Cada Estudiante",
      ),
    ).toBeInTheDocument();
  });

  it("renders 'Empezar Gratis' as the CTA text", () => {
    render(<Hero />);
    expect(screen.getByText("Empezar Gratis")).toBeInTheDocument();
  });

  it("all 5 slide headlines are reachable by clicking Next slide", () => {
    render(<Hero />);

    // Slide 1 is visible on initial render
    expect(screen.getByText(slideHeadlinesEs[0])).toBeInTheDocument();

    const nextButton = screen.getByLabelText("Next slide");

    // Click through slides 2-5
    for (let i = 1; i < slideHeadlinesEs.length; i++) {
      fireEvent.click(nextButton);
      expect(screen.getByText(slideHeadlinesEs[i])).toBeInTheDocument();
    }
  });
});

import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { ExitIntentModal } from "@/components/cro/exit-intent-modal";
import { MobileStickyCta } from "@/components/cro/mobile-sticky-cta";
import { UtmCapture } from "@/components/cro/utm-capture";
import { I18nProvider } from "@/providers/i18n-provider";
import { HtmlLangSetter } from "@/components/layout/html-lang-setter";

export const metadata: Metadata = {
  metadataBase: new URL("https://aivolearning.com"),
  title: {
    default: "AIVO Learning: AI-Powered Personalized Education",
    template: "%s | AIVO",
  },
  description:
    "AI-powered personalized learning that adapts to every student. Brain Clone AI technology, 5 specialized AI tutors, IEP integration, and gamification. No learner left behind.",
  keywords: [
    "AI learning",
    "personalized education",
    "IEP",
    "special education",
    "adaptive learning",
    "AI tutors",
    "edtech",
  ],
  alternates: {
    canonical: "https://aivolearning.com",
  },
  openGraph: {
    title: "AIVO Learning: AI-Powered Personalized Education",
    description:
      "Personalized education powered by Brain Clone AI technology that creates a unique learning profile for every student.",
    url: "https://aivolearning.com",
    siteName: "AIVO Learning",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AIVO Learning — AI-Powered Personalized Education",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AIVO Learning: AI-Powered Personalized Education",
    description:
      "Personalized education powered by Brain Clone AI. No learner left behind.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        {/* Plausible Analytics — cookieless, GDPR-compliant */}
        <script
          defer
          data-domain="aivolearning.com"
          src="https://plausible.io/js/script.tagged-events.js"
        />
      </head>
      <body className="min-h-screen bg-white antialiased">
        <I18nProvider>
          <HtmlLangSetter />
          <UtmCapture />
          <Nav />
          <main>{children}</main>
          <Footer />
          <CookieBanner />
          <ExitIntentModal />
          <MobileStickyCta />
        </I18nProvider>
      </body>
    </html>
  );
}

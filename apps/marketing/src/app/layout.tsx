import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { ExitIntentModal } from "@/components/cro/exit-intent-modal";
import { MobileStickyCta } from "@/components/cro/mobile-sticky-cta";
import { FloatingDemoCta } from "@/components/cro/floating-demo-cta";
import { UtmCapture } from "@/components/cro/utm-capture";

export const metadata: Metadata = {
  title: {
    default: "AIVO Learning — AI-Powered Personalized Education",
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
  openGraph: {
    title: "AIVO Learning — AI-Powered Personalized Education",
    description:
      "Personalized education powered by Brain Clone AI technology that creates a unique learning profile for every student.",
    url: "https://aivolearning.com",
    siteName: "AIVO Learning",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AIVO Learning — AI-Powered Personalized Education",
    description:
      "Personalized education powered by Brain Clone AI. No learner left behind.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AIVO Learning",
  url: "https://aivolearning.com",
  logo: "https://aivolearning.com/logos/aivo-logo-horizontal-purple.svg",
  sameAs: [
    "https://twitter.com/aivolearning",
    "https://linkedin.com/company/aivolearning",
    "https://youtube.com/@aivolearning",
  ],
  description:
    "AI-powered personalized learning that adapts to every student. No learner left behind.",
};

function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="fixed left-2 top-2 z-[100] -translate-y-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-transform focus:translate-y-0"
    >
      Skip to content
    </a>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#7c3aed" />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="preload"
          href="/fonts/PlusJakartaSans-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/PlusJakartaSans-Medium.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/PlusJakartaSans-SemiBold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/PlusJakartaSans-Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/PlusJakartaSans-ExtraBold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* Plausible Analytics — cookieless, GDPR-compliant */}
        <script
          defer
          data-domain="aivolearning.com"
          src="https://plausible.io/js/script.tagged-events.js"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
      </head>
      <body className="min-h-screen bg-white antialiased">
        <SkipToContent />
        <UtmCapture />
        <Nav />
        <main id="main-content">{children}</main>
        <Footer />
        <CookieBanner />
        <ExitIntentModal />
        <MobileStickyCta />
        <FloatingDemoCta />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { ExitIntentModal } from "@/components/cro/exit-intent-modal";
import { MobileStickyCta } from "@/components/cro/mobile-sticky-cta";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-white antialiased">
        <Nav />
        <main>{children}</main>
        <Footer />
        <CookieBanner />
        <ExitIntentModal />
        <MobileStickyCta />
      </body>
    </html>
  );
}

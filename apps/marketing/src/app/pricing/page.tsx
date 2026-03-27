import type { Metadata } from "next";
import { PricingPageClient } from "./client";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for AIVO Learning. Start free and scale as your family or school grows. No hidden fees.",
  openGraph: {
    title: "Pricing | AIVO",
    description:
      "Simple, transparent pricing for AIVO Learning. Start free and scale as your family or school grows.",
    url: "https://aivolearning.com/pricing",
    siteName: "AIVO Learning",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing | AIVO",
    description:
      "Simple, transparent pricing for AIVO Learning. Start free and scale as your family or school grows.",
  },
};

export default function PricingPage() {
  return <PricingPageClient />;
}

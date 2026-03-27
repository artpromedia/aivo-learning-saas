import type { Metadata } from "next";
import { audiences } from "@/content/audiences";
import { AudiencePage } from "@/components/audience-page";

const audience = audiences.find((a) => a.id === "districts")!;

export const metadata: Metadata = {
  title: "For Districts",
  description: audience.subheadline,
  openGraph: {
    title: "For Districts | AIVO",
    description: audience.subheadline,
    url: "https://aivolearning.com/for-districts",
    siteName: "AIVO Learning",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "For Districts | AIVO",
    description: audience.subheadline,
  },
};

export default function ForDistrictsPage() {
  return <AudiencePage audience={audience} />;
}

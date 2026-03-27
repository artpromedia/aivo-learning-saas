import type { Metadata } from "next";
import { audiences } from "@/content/audiences";
import { AudiencePage } from "@/components/audience-page";

const audience = audiences.find((a) => a.id === "parents")!;

export const metadata: Metadata = {
  title: "For Parents",
  description: audience.subheadline,
  openGraph: {
    title: "For Parents | AIVO",
    description: audience.subheadline,
    url: "https://aivolearning.com/for-parents",
    siteName: "AIVO Learning",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "For Parents | AIVO",
    description: audience.subheadline,
  },
};

export default function ForParentsPage() {
  return <AudiencePage audience={audience} />;
}

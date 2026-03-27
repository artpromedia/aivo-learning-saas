import type { Metadata } from "next";
import { audiences } from "@/content/audiences";
import { AudiencePage } from "@/components/audience-page";

const audience = audiences.find((a) => a.id === "teachers")!;

export const metadata: Metadata = {
  title: "For Teachers",
  description: audience.subheadline,
  openGraph: {
    title: "For Teachers | AIVO",
    description: audience.subheadline,
    url: "https://aivolearning.com/for-teachers",
    siteName: "AIVO Learning",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "For Teachers | AIVO",
    description: audience.subheadline,
  },
};

export default function ForTeachersPage() {
  return <AudiencePage audience={audience} />;
}

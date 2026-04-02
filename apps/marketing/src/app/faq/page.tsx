import type { Metadata } from "next";
import { FaqPageClient } from "./client";

export const metadata: Metadata = {
  title: "FAQ | AIVO",
  description:
    "Frequently asked questions about AIVO Learning: pricing, AI tutors, IEP support, privacy, and getting started.",
  openGraph: {
    title: "FAQ | AIVO",
    description:
      "Frequently asked questions about AIVO Learning.",
  },
};

export default function FaqPage() {
  return <FaqPageClient />;
}

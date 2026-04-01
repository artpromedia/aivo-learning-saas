import type { Metadata } from "next";
import { DemoPageClient } from "./client";

export const metadata: Metadata = {
  title: "Book a Demo",
  description:
    "Schedule a personalized demo of Aivo Learning. See Brain Clone™ AI, 5 expert tutors, and real-time analytics in action. No commitment required.",
  openGraph: {
    title: "Book a Demo | AIVO",
    description:
      "Schedule a personalized demo of Aivo Learning with our education specialists.",
  },
};

export default function DemoPage() {
  return <DemoPageClient />;
}

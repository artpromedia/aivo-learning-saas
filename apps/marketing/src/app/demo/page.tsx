import type { Metadata } from "next";
import { DemoPageClient } from "./client";

export const metadata: Metadata = {
  title: "Request a Demo | AIVO",
  description:
    "See AIVO Learning in action. Request a personalized demo for your school or district.",
  openGraph: {
    title: "Request a Demo | AIVO",
    description: "See AIVO Learning in action.",
  },
};

export default function DemoPage() {
  return <DemoPageClient />;
}

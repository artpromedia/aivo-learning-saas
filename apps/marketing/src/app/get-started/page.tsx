import type { Metadata } from "next";
import { GetStartedClient } from "./client";

export const metadata: Metadata = {
  title: "Get Started Free | AIVO",
  description:
    "Create your free AIVO Learning account. AI-powered personalized learning that adapts to every student.",
  openGraph: {
    title: "Get Started Free | AIVO",
    description:
      "Create your free AIVO Learning account. Personalized learning for every student.",
  },
};

export default function GetStartedPage() {
  return <GetStartedClient />;
}

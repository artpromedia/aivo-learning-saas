import type { Metadata } from "next";
import { TutorsPageClient } from "./client";

export const metadata: Metadata = {
  title: "AI Tutors",
  description:
    "Meet AIVO's five AI tutors: Nova for Math, Sage for ELA, Spark for Science, Chrono for History, and Pixel for Coding. Each with a unique personality built to engage every learner.",
  openGraph: {
    title: "AI Tutors | AIVO",
    description:
      "Meet AIVO's five AI tutors: Nova, Sage, Spark, Chrono, and Pixel. Each with a unique personality built to engage every learner.",
    url: "https://aivolearning.com/tutors",
    siteName: "AIVO Learning",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Tutors | AIVO",
    description:
      "Meet AIVO's five AI tutors, each with a unique personality built to engage every learner.",
  },
};

export default function TutorsPage() {
  return <TutorsPageClient />;
}

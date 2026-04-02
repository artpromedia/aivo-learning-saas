import type { Metadata } from "next";
import { TutorsPageClient } from "./client";

export const metadata: Metadata = {
  title: "AI Tutors | AIVO Learning",
  description:
    "Meet AIVO's seven AI tutors: Nova for Math, Sage for ELA, Spark for Science, Chrono for History, Pixel for Coding, Harmony for Social-Emotional Learning, and Echo for Speech & Language Practice. Each adapts to every learner.",
  openGraph: {
    title: "Meet AIVO's Seven AI Tutors",
    description:
      "Seven specialized AI tutors, each with a unique personality and real teaching methods. They adapt to every learner \u2014 including those with IEPs and varying needs.",
    url: "https://aivolearning.com/tutors",
    siteName: "AIVO Learning",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meet AIVO's Seven AI Tutors",
    description:
      "Seven AI tutors, each with a unique personality built to engage every learner. From math to social-emotional learning to speech practice.",
  },
};

export default function TutorsPage() {
  return <TutorsPageClient />;
}

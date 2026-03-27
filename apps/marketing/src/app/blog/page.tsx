import type { Metadata } from "next";
import { BlogIndexClient } from "./client";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Insights on AI-powered education, adaptive learning, special education technology, and the future of personalized learning from the AIVO team.",
  openGraph: {
    title: "Blog | AIVO",
    description:
      "Insights on AI-powered education, adaptive learning, and personalized learning from the AIVO team.",
    url: "https://aivolearning.com/blog",
    siteName: "AIVO Learning",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | AIVO",
    description:
      "Insights on AI-powered education and personalized learning from the AIVO team.",
  },
};

export default function BlogPage() {
  return <BlogIndexClient />;
}

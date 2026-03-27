import type { Metadata } from "next";
import { ContactPageClient } from "./client";

export const metadata: Metadata = {
  title: "Contact Us | AIVO",
  description:
    "Get in touch with the AIVO Learning team. We're here to help with questions about our platform, partnerships, and more.",
  openGraph: {
    title: "Contact Us | AIVO",
    description: "Get in touch with the AIVO Learning team.",
  },
};

export default function ContactPage() {
  return <ContactPageClient />;
}

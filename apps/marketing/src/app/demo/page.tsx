import { createPageMetadata } from "@/lib/metadata-factory";
import {
  breadcrumbSchema,
  organizationSchema,
  toScriptProps,
} from "@/lib/structured-data";
import { DemoPageClient } from "./client";

export const metadata = createPageMetadata({
  title: "Request a Demo | AIVO Learning",
  description:
    "Book a free 30-minute personalized demo of AIVO Learning. See how Brain Clone AI adapts to every student. Perfect for parents, teachers, and school administrators.",
  path: "/demo",
});

export default function DemoPage() {
  return (
    <>
      <script
        {...toScriptProps(
          breadcrumbSchema([
            { name: "Home", url: "https://aivolearning.com" },
            { name: "Request a Demo", url: "https://aivolearning.com/demo" },
          ]),
        )}
      />
      <script {...toScriptProps(organizationSchema())} />
      <DemoPageClient />
    </>
  );
}

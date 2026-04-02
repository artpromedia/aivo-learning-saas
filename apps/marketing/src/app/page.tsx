import { Hero } from "@/components/home/hero";
import { SocialProofBar } from "@/components/home/social-proof-bar";
import { FeaturesGrid } from "@/components/home/features-grid";
import { HowItWorks } from "@/components/home/how-it-works";
import { WalkthroughShowcase } from "@/components/home/walkthrough-showcase";
import { AiTutors } from "@/components/home/ai-tutors";
import { AudienceTabs } from "@/components/home/audience-tabs";
import { StatsBand } from "@/components/home/stats-band";
import { TrustBadges } from "@/components/cro/trust-badges";
import { Testimonials } from "@/components/home/testimonials";
import { CtaBand } from "@/components/home/cta-band";
import { createPageMetadata } from "@/lib/metadata-factory";
import {
  organizationSchema,
  websiteSchema,
  productSchema,
  toScriptProps,
} from "@/lib/structured-data";

export const metadata = createPageMetadata({
  title: "AIVO Learning — AI-Powered Personalized Education",
  description:
    "AI-powered personalized learning that adapts to every student. Brain Clone AI technology, 5 specialized AI tutors, IEP integration, and gamification. No learner left behind.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <script {...toScriptProps(organizationSchema())} />
      <script {...toScriptProps(websiteSchema())} />
      <script {...toScriptProps(productSchema())} />
      <Hero />
      <SocialProofBar />
      <FeaturesGrid />
      <HowItWorks />
      <WalkthroughShowcase />
      <AiTutors />
      <AudienceTabs />
      <StatsBand />
      <TrustBadges />
      <Testimonials />
      <CtaBand />
    </>
  );
}

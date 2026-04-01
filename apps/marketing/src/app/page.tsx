import { Hero } from "@/components/home/hero";
import { SocialProofBar } from "@/components/home/social-proof-bar";
import { WalkthroughShowcase } from "@/components/home/walkthrough-showcase";
import { FeaturesGrid } from "@/components/home/features-grid";
import { HowItWorks } from "@/components/home/how-it-works";
import { AiTutors } from "@/components/home/ai-tutors";
import { AudienceTabs } from "@/components/home/audience-tabs";
import { StatsBand } from "@/components/home/stats-band";
import { TrustBadges } from "@/components/cro/trust-badges";
import { Testimonials } from "@/components/home/testimonials";
import { CtaBand } from "@/components/home/cta-band";

export default function HomePage() {
  return (
    <>
      <Hero />
      <SocialProofBar />
      <WalkthroughShowcase />
      <FeaturesGrid />
      <HowItWorks />
      <AiTutors />
      <AudienceTabs />
      <StatsBand />
      <TrustBadges />
      <Testimonials />
      <CtaBand />
    </>
  );
}

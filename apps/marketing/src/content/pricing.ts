export interface PricingPlan {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
  contactSales?: boolean;
}

export interface PricingFaq {
  question: string;
  answer: string;
}

export const pricingPlans: PricingPlan[] = [
  {
    name: "Starter",
    monthlyPrice: 19.99,
    yearlyPrice: 15.99,
    description: "Get started with core features for one student. Add AI Tutors as needed.",
    features: [
      "1 student profile",
      "Brain Clone AI assessment",
      "2 AI Tutor sessions/day",
      "Basic progress dashboard",
      "Community support",
      "AI Tutors available as add-ons ($9.99/mo each)",
    ],
    cta: "Start 30-Day Free Trial",
  },
  {
    name: "Family",
    monthlyPrice: 29.99,
    yearlyPrice: 23.99,
    description: "For families who want Math & ELA tutoring included.",
    features: [
      "Up to 4 student profiles",
      "Math & ELA Tutors included",
      "Full Brain Clone AI customization",
      "IEP document upload & tracking",
      "Homework Helper (unlimited)",
      "Detailed progress analytics",
      "Priority email support",
    ],
    cta: "Start 30-Day Free Trial",
    popular: true,
  },
  {
    name: "Premium",
    monthlyPrice: 39.99,
    yearlyPrice: 31.99,
    description: "Full access with all 7 AI Tutors for the complete learning experience.",
    features: [
      "Up to 4 student profiles",
      "All 7 AI Tutors included",
      "Full Brain Clone AI customization",
      "IEP document upload & tracking",
      "Homework Helper (unlimited)",
      "Detailed progress analytics",
      "Offline mobile access",
      "Priority email support",
    ],
    cta: "Start 30-Day Free Trial",
  },
  {
    name: "Enterprise",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "For schools and districts with custom needs.",
    features: [
      "Unlimited student profiles",
      "Everything in Premium",
      "Classroom management tools",
      "SIS integration (Clever/ClassLink)",
      "District-wide analytics",
      "Custom reporting & exports",
      "Dedicated success manager",
      "24/7 phone & chat support",
      "SOC 2 Type II compliance",
    ],
    cta: "Contact Sales",
    contactSales: true,
  },
];

export const pricingFeatureMatrix = [
  { feature: "Student profiles", starter: "1", family: "Up to 4", premium: "Up to 4", enterprise: "Unlimited" },
  { feature: "Brain Clone AI", starter: "Basic", family: "Full", premium: "Full", enterprise: "Full + Custom" },
  { feature: "AI Tutor sessions", starter: "2/day", family: "Unlimited", premium: "Unlimited", enterprise: "Unlimited" },
  { feature: "AI Tutors included", starter: "—", family: "Math & ELA", premium: "All 7", enterprise: "All 7" },
  { feature: "IEP integration", starter: "—", family: "✓", premium: "✓", enterprise: "✓" },
  { feature: "Homework Helper", starter: "3/day", family: "Unlimited", premium: "Unlimited", enterprise: "Unlimited" },
  { feature: "Progress analytics", starter: "Basic", family: "Advanced", premium: "Advanced", enterprise: "Enterprise" },
  { feature: "Offline access", starter: "—", family: "—", premium: "✓", enterprise: "✓" },
  { feature: "SIS integration", starter: "—", family: "—", premium: "—", enterprise: "✓" },
  { feature: "District analytics", starter: "—", family: "—", premium: "—", enterprise: "✓" },
  { feature: "Custom reporting", starter: "—", family: "—", premium: "—", enterprise: "✓" },
  { feature: "Dedicated support", starter: "Community", family: "Email", premium: "Email", enterprise: "24/7 Phone & Chat" },
  { feature: "Gamification", starter: "Basic", family: "Full", premium: "Full", enterprise: "Full + Custom" },
];

export const pricingFaqs: PricingFaq[] = [
  {
    question: "What's included in the Starter plan?",
    answer:
      "The Starter plan ($19.99/mo) includes core features for one student, including Brain Clone AI assessment and 2 AI Tutor sessions per day. You can add individual AI Tutors as add-ons for $9.99/mo each.",
  },
  {
    question: "Can I switch plans at any time?",
    answer:
      "Absolutely. You can upgrade or downgrade at any time. If you upgrade mid-cycle, you'll be prorated. If you downgrade, the change takes effect at your next billing date.",
  },
  {
    question: "Is my child's data safe?",
    answer:
      "We are FERPA and COPPA compliant, and SOC 2 Type II certified. All student data is encrypted at rest and in transit. We never sell data to third parties.",
  },
  {
    question: "Do you offer school or district pricing?",
    answer:
      "Yes! Our Enterprise plan is designed for schools and districts. Contact our sales team for volume pricing, custom contracts, and implementation support.",
  },
  {
    question: "What if my child has an IEP?",
    answer:
      "AIVO is built for students with IEPs. Upload your child's IEP document and our AI automatically aligns content, accommodations, and progress tracking to their specific goals. IEP integration is available on Family, Premium, and Enterprise plans.",
  },
  {
    question: "How does the free trial work?",
    answer:
      "All paid plans — Starter, Family, and Premium — include a 30-day free trial. You get full access to every feature in your chosen plan. Cancel anytime during the trial and you won't be charged.",
  },
  {
    question: "Can I use AIVO offline?",
    answer:
      "The Premium and Enterprise plans include offline access through our mobile app. Lessons and tutor sessions sync automatically when you reconnect.",
  },
  {
    question: "What subjects does AIVO cover?",
    answer:
      "AIVO covers Math, English Language Arts, Science, History, Coding, Social-Emotional Learning (SEL), and Speech through our seven specialized AI Tutors.",
  },
];

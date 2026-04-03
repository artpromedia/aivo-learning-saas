export interface PricingPlan {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

export interface PricingFaq {
  question: string;
  answer: string;
}

export const pricingPlans: PricingPlan[] = [
  {
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Get started with core features for one student.",
    features: [
      "1 student profile",
      "Brain Clone AI assessment",
      "2 AI Tutor sessions/day",
      "Basic progress dashboard",
      "Community support",
    ],
    cta: "Get Started Free",
  },
  {
    name: "Pro",
    monthlyPrice: 39.99,
    yearlyPrice: 24.99,
    description: "Full access for families with advanced features.",
    features: [
      "Up to 4 student profiles",
      "Unlimited AI Tutor sessions",
      "Full Brain Clone AI customization",
      "IEP document upload & tracking",
      "Homework Helper (unlimited)",
      "Detailed progress analytics",
      "Offline mobile access",
      "Priority email support",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Premium",
    monthlyPrice: 41.99,
    yearlyPrice: 41.99,
    description: "For educators and schools with enterprise needs.",
    features: [
      "Unlimited student profiles",
      "Everything in Pro",
      "Classroom management tools",
      "SIS integration (Clever/ClassLink)",
      "District-wide analytics",
      "Custom reporting & exports",
      "Dedicated success manager",
      "24/7 phone & chat support",
      "SOC 2 Type II compliance",
    ],
    cta: "Contact Sales",
  },
];

export const pricingFeatureMatrix = [
  { feature: "Student profiles", free: "1", pro: "Up to 4", premium: "Unlimited" },
  { feature: "Brain Clone AI", free: "Basic", pro: "Full", premium: "Full + Custom" },
  { feature: "AI Tutor sessions", free: "2/day", pro: "Unlimited", premium: "Unlimited" },
  { feature: "IEP integration", free: "—", pro: "✓", premium: "✓" },
  { feature: "Homework Helper", free: "3/day", pro: "Unlimited", premium: "Unlimited" },
  { feature: "Progress analytics", free: "Basic", pro: "Advanced", premium: "Enterprise" },
  { feature: "Offline access", free: "—", pro: "✓", premium: "✓" },
  { feature: "SIS integration", free: "—", pro: "—", premium: "✓" },
  { feature: "District analytics", free: "—", pro: "—", premium: "✓" },
  { feature: "Custom reporting", free: "—", pro: "—", premium: "✓" },
  { feature: "Dedicated support", free: "Community", pro: "Email", premium: "24/7 Phone & Chat" },
  { feature: "Gamification", free: "Basic", pro: "Full", premium: "Full + Custom" },
];

export const pricingFaqs: PricingFaq[] = [
  {
    question: "Is there really a free plan?",
    answer:
      "Yes! Our Free plan gives you access to core features for one student, including Brain Clone AI assessment and 2 AI Tutor sessions per day. No credit card required.",
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
      "Yes! Our Premium plan is designed for schools and districts. Contact our sales team for volume pricing, custom contracts, and implementation support.",
  },
  {
    question: "What if my child has an IEP?",
    answer:
      "AIVO is built for students with IEPs. Upload your child's IEP document and our AI automatically aligns content, accommodations, and progress tracking to their specific goals.",
  },
  {
    question: "How does the free trial work?",
    answer:
      "The Pro plan comes with a 14-day free trial. You get full access to all Pro features. Cancel anytime during the trial and you won't be charged.",
  },
  {
    question: "Can I use AIVO offline?",
    answer:
      "Pro and Premium plans include offline access through our mobile app. Lessons and tutor sessions sync automatically when you reconnect.",
  },
  {
    question: "What subjects does AIVO cover?",
    answer:
      "AIVO covers Math, English Language Arts, Science, History, and Coding through our seven specialized AI Tutors.",
  },
];

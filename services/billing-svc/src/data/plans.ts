export interface PlanDefinition {
  id: string;
  name: string;
  price: number; // cents, 0 = contact sales
  interval: "month";
  maxLearners: number; // -1 = unlimited
  features: string[];
  stripePriceId: string;
  contactSales?: boolean;
  includedTutors?: string[];
}

export const PLANS: PlanDefinition[] = [
  {
    id: "STARTER",
    name: "Starter",
    price: 1999,
    interval: "month",
    maxLearners: 1,
    features: [
      "1 learner",
      "Core learning engine",
      "Brain Clone AI assessment",
      "Basic progress dashboard",
      "Community support",
      "AI Tutors available as add-ons ($9.99/mo each)",
    ],
    stripePriceId: process.env.STRIPE_PRICE_STARTER ?? "price_starter",
  },
  {
    id: "FAMILY",
    name: "Family",
    price: 2999,
    interval: "month",
    maxLearners: 4,
    features: [
      "Up to 4 learners",
      "Math & ELA Tutors included",
      "Full Brain Clone AI customization",
      "IEP document upload & tracking",
      "Homework Helper (unlimited)",
      "Detailed progress analytics",
      "Priority email support",
    ],
    stripePriceId: process.env.STRIPE_PRICE_FAMILY ?? "price_family",
    includedTutors: ["ADDON_TUTOR_MATH", "ADDON_TUTOR_ELA"],
  },
  {
    id: "PREMIUM",
    name: "Premium",
    price: 3999,
    interval: "month",
    maxLearners: 4,
    features: [
      "Up to 4 learners",
      "All 7 AI Tutors included",
      "Full Brain Clone AI customization",
      "IEP document upload & tracking",
      "Homework Helper (unlimited)",
      "Detailed progress analytics",
      "Offline mobile access",
      "Priority email support",
    ],
    stripePriceId: process.env.STRIPE_PRICE_PREMIUM ?? "price_premium",
    includedTutors: [
      "ADDON_TUTOR_MATH",
      "ADDON_TUTOR_ELA",
      "ADDON_TUTOR_SCIENCE",
      "ADDON_TUTOR_HISTORY",
      "ADDON_TUTOR_CODING",
      "ADDON_TUTOR_SEL",
      "ADDON_TUTOR_SPEECH",
    ],
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: 0,
    interval: "month",
    maxLearners: -1,
    contactSales: true,
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
    stripePriceId: "",
    includedTutors: [],
  },
];

export function getPlanById(planId: string): PlanDefinition | undefined {
  return PLANS.find((p) => p.id === planId);
}

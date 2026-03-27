export interface PlanDefinition {
  id: string;
  name: string;
  price: number; // cents
  interval: "month";
  maxLearners: number;
  features: string[];
  stripePriceId: string;
}

export const PLANS: PlanDefinition[] = [
  {
    id: "STARTER",
    name: "Starter",
    price: 999,
    interval: "month",
    maxLearners: 1,
    features: ["1 learner", "Core learning engine", "Limited LLM tokens", "Basic progress tracking"],
    stripePriceId: process.env.STRIPE_PRICE_STARTER ?? "price_starter",
  },
  {
    id: "FAMILY",
    name: "Family",
    price: 1999,
    interval: "month",
    maxLearners: 3,
    features: ["Up to 3 learners", "Full learning engine", "Standard LLM tokens", "Detailed progress reports", "Homework helper"],
    stripePriceId: process.env.STRIPE_PRICE_FAMILY ?? "price_family",
  },
  {
    id: "PREMIUM",
    name: "Premium",
    price: 2999,
    interval: "month",
    maxLearners: 5,
    features: ["Up to 5 learners", "Full learning engine", "Priority LLM tokens", "Advanced analytics", "Homework helper", "Priority support"],
    stripePriceId: process.env.STRIPE_PRICE_PREMIUM ?? "price_premium",
  },
];

export function getPlanById(planId: string): PlanDefinition | undefined {
  return PLANS.find((p) => p.id === planId);
}

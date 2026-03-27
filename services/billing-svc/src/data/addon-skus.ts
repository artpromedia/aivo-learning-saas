export interface AddonSku {
  sku: string;
  name: string;
  subject: string;
  price: number; // cents
  stripePriceId: string;
}

export const ADDON_SKUS: AddonSku[] = [
  { sku: "ADDON_TUTOR_MATH", name: "Math Tutor", subject: "Math", price: 499, stripePriceId: process.env.STRIPE_PRICE_TUTOR_MATH ?? "price_tutor_math" },
  { sku: "ADDON_TUTOR_ELA", name: "ELA Tutor", subject: "ELA", price: 499, stripePriceId: process.env.STRIPE_PRICE_TUTOR_ELA ?? "price_tutor_ela" },
  { sku: "ADDON_TUTOR_SCIENCE", name: "Science Tutor", subject: "Science", price: 499, stripePriceId: process.env.STRIPE_PRICE_TUTOR_SCIENCE ?? "price_tutor_science" },
  { sku: "ADDON_TUTOR_HISTORY", name: "History Tutor", subject: "History", price: 499, stripePriceId: process.env.STRIPE_PRICE_TUTOR_HISTORY ?? "price_tutor_history" },
  { sku: "ADDON_TUTOR_CODING", name: "Coding Tutor", subject: "Coding", price: 499, stripePriceId: process.env.STRIPE_PRICE_TUTOR_CODING ?? "price_tutor_coding" },
  { sku: "ADDON_TUTOR_BUNDLE", name: "Tutor Bundle (All 5)", subject: "All", price: 1499, stripePriceId: process.env.STRIPE_PRICE_TUTOR_BUNDLE ?? "price_tutor_bundle" },
];

export const BUNDLE_SUBJECTS = ["ADDON_TUTOR_MATH", "ADDON_TUTOR_ELA", "ADDON_TUTOR_SCIENCE", "ADDON_TUTOR_HISTORY", "ADDON_TUTOR_CODING"];

export function getAddonBySku(sku: string): AddonSku | undefined {
  return ADDON_SKUS.find((a) => a.sku === sku);
}

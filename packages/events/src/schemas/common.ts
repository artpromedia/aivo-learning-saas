export const FUNCTIONING_LEVELS = [
  "STANDARD", "SUPPORTED", "LOW_VERBAL", "NON_VERBAL", "PRE_SYMBOLIC"
] as const;
export type FunctioningLevel = (typeof FUNCTIONING_LEVELS)[number];

import { z } from "zod";

// ─── billing.subscription.created ───────────────────────────────────────────────
export const BillingSubscriptionCreatedSchema = z.object({
  tenantId: z.string().uuid(),
  subscriptionId: z.string().uuid(),
  planId: z.string(),
});
export type BillingSubscriptionCreated = z.infer<typeof BillingSubscriptionCreatedSchema>;

// ─── billing.subscription.cancelled ─────────────────────────────────────────────
export const BillingSubscriptionCancelledSchema = z.object({
  tenantId: z.string().uuid(),
  subscriptionId: z.string().uuid(),
  graceEndsAt: z.string().datetime(),
});
export type BillingSubscriptionCancelled = z.infer<typeof BillingSubscriptionCancelledSchema>;

// ─── billing.payment.succeeded ──────────────────────────────────────────────────
export const BillingPaymentSucceededSchema = z.object({
  tenantId: z.string().uuid(),
  amount: z.number().nonnegative(),
  invoiceId: z.string(),
});
export type BillingPaymentSucceeded = z.infer<typeof BillingPaymentSucceededSchema>;

// ─── billing.payment.failed ─────────────────────────────────────────────────────
export const BillingPaymentFailedSchema = z.object({
  tenantId: z.string().uuid(),
  invoiceId: z.string(),
  retryAt: z.string().datetime(),
});
export type BillingPaymentFailed = z.infer<typeof BillingPaymentFailedSchema>;

// ─── marketing.conversion.signup ────────────────────────────────────────────────
export const MarketingConversionSignupSchema = z.object({
  emailHash: z.string(),
  source: z.string().optional(),
  campaign: z.string().optional(),
  planType: z.string(),
});
export type MarketingConversionSignup = z.infer<typeof MarketingConversionSignupSchema>;

// ─── marketing.conversion.subscribed ────────────────────────────────────────────
export const MarketingConversionSubscribedSchema = z.object({
  tenantId: z.string().uuid(),
  planName: z.string(),
  mrr: z.number().nonnegative(),
  source: z.string().optional(),
});
export type MarketingConversionSubscribed = z.infer<typeof MarketingConversionSubscribedSchema>;

// ─── billing.subscription.grace.started ────────────────────────────────────────
export const BillingSubscriptionGraceStartedSchema = z.object({
  tenantId: z.string().uuid(),
  subscriptionId: z.string().uuid(),
  gracePeriodEndsAt: z.string().datetime().optional(),
});
export type BillingSubscriptionGraceStarted = z.infer<typeof BillingSubscriptionGraceStartedSchema>;

// ─── billing.subscription.grace.expired ────────────────────────────────────────
export const BillingSubscriptionGraceExpiredSchema = z.object({
  tenantId: z.string().uuid(),
  subscriptionId: z.string().uuid(),
});
export type BillingSubscriptionGraceExpired = z.infer<typeof BillingSubscriptionGraceExpiredSchema>;

// ─── billing.subscription.grace.warning_7day ───────────────────────────────────
export const BillingSubscriptionGraceWarning7daySchema = z.object({
  tenantId: z.string().uuid(),
  subscriptionId: z.string().uuid(),
  gracePeriodEndsAt: z.string().datetime().optional(),
});
export type BillingSubscriptionGraceWarning7day = z.infer<typeof BillingSubscriptionGraceWarning7daySchema>;

// ─── billing.subscription.reactivated ──────────────────────────────────────────
export const BillingSubscriptionReactivatedSchema = z.object({
  tenantId: z.string().uuid(),
  subscriptionId: z.string().uuid(),
});
export type BillingSubscriptionReactivated = z.infer<typeof BillingSubscriptionReactivatedSchema>;

export const BILLING_SUBJECTS = {
  "billing.subscription.created": "aivo.billing.subscription.created",
  "billing.subscription.cancelled": "aivo.billing.subscription.cancelled",
  "billing.subscription.grace.started": "aivo.billing.subscription.grace.started",
  "billing.subscription.grace.expired": "aivo.billing.subscription.grace.expired",
  "billing.subscription.grace.warning_7day": "aivo.billing.subscription.grace.warning_7day",
  "billing.subscription.reactivated": "aivo.billing.subscription.reactivated",
  "billing.payment.succeeded": "aivo.billing.payment.succeeded",
  "billing.payment.failed": "aivo.billing.payment.failed",
  "marketing.conversion.signup": "aivo.marketing.conversion.signup",
  "marketing.conversion.subscribed": "aivo.marketing.conversion.subscribed",
} as const;

export const BILLING_SCHEMAS = {
  "billing.subscription.created": BillingSubscriptionCreatedSchema,
  "billing.subscription.cancelled": BillingSubscriptionCancelledSchema,
  "billing.subscription.grace.started": BillingSubscriptionGraceStartedSchema,
  "billing.subscription.grace.expired": BillingSubscriptionGraceExpiredSchema,
  "billing.subscription.grace.warning_7day": BillingSubscriptionGraceWarning7daySchema,
  "billing.subscription.reactivated": BillingSubscriptionReactivatedSchema,
  "billing.payment.succeeded": BillingPaymentSucceededSchema,
  "billing.payment.failed": BillingPaymentFailedSchema,
  "marketing.conversion.signup": MarketingConversionSignupSchema,
  "marketing.conversion.subscribed": MarketingConversionSubscribedSchema,
} as const;

-- Add TRIALING to subscription_status enum, trial_ends_at column,
-- and trial reminder event types for free trial support.
ALTER TYPE "public"."subscription_status" ADD VALUE IF NOT EXISTS 'TRIALING' AFTER 'ACTIVE';

ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "trial_ends_at" TIMESTAMPTZ;

ALTER TYPE "public"."data_lifecycle_event_type" ADD VALUE IF NOT EXISTS 'TRIAL_REMINDER_3DAY';
ALTER TYPE "public"."data_lifecycle_event_type" ADD VALUE IF NOT EXISTS 'TRIAL_REMINDER_1DAY';

import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { learners } from "./learners";
import { tenants } from "./identity";
import { tutorSkuEnum, tutorSubscriptionStatusEnum, tutorSessionTypeEnum } from "./enums";

// ─── Tutor Subscriptions ────────────────────────────────────────────────────────
export const tutorSubscriptions = pgTable(
  "tutor_subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    learnerId: uuid("learner_id")
      .notNull()
      .references(() => learners.id, { onDelete: "cascade" }),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    sku: tutorSkuEnum("sku").notNull(),
    status: tutorSubscriptionStatusEnum("status").notNull().default("ACTIVE"),
    stripeSubscriptionItemId: varchar("stripe_subscription_item_id", { length: 255 }),
    activatedAt: timestamp("activated_at", { withTimezone: true }).notNull().defaultNow(),
    gracePeriodEndsAt: timestamp("grace_period_ends_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("tutor_subscriptions_learner_id_idx").on(t.learnerId),
    index("tutor_subscriptions_tenant_id_idx").on(t.tenantId),
    index("tutor_subscriptions_status_idx").on(t.status),
  ],
);

// ─── Tutor Sessions ─────────────────────────────────────────────────────────────
export const tutorSessions = pgTable(
  "tutor_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    learnerId: uuid("learner_id")
      .notNull()
      .references(() => learners.id, { onDelete: "cascade" }),
    tutorSku: tutorSkuEnum("tutor_sku").notNull(),
    subject: varchar("subject", { length: 128 }).notNull(),
    sessionType: tutorSessionTypeEnum("session_type").notNull(),
    brainContextSnapshot: jsonb("brain_context_snapshot").default({}),
    messages: jsonb("messages").notNull().default([]),
    masteryUpdates: jsonb("mastery_updates").default({}),
    engagementMetrics: jsonb("engagement_metrics").default({}),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("tutor_sessions_learner_id_idx").on(t.learnerId),
    index("tutor_sessions_started_at_idx").on(t.startedAt),
  ],
);

// ─── Relations ──────────────────────────────────────────────────────────────────
export const tutorSubscriptionsRelations = relations(tutorSubscriptions, ({ one }) => ({
  learner: one(learners, { fields: [tutorSubscriptions.learnerId], references: [learners.id] }),
  tenant: one(tenants, { fields: [tutorSubscriptions.tenantId], references: [tenants.id] }),
}));

export const tutorSessionsRelations = relations(tutorSessions, ({ one }) => ({
  learner: one(learners, { fields: [tutorSessions.learnerId], references: [learners.id] }),
}));

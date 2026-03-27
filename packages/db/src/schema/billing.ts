import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "./identity";
import { subscriptionStatusEnum } from "./enums";

// ─── Subscriptions ──────────────────────────────────────────────────────────────
export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    planId: varchar("plan_id", { length: 128 }).notNull(),
    stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
    status: subscriptionStatusEnum("status").notNull().default("ACTIVE"),
    currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    gracePeriodEndsAt: timestamp("grace_period_ends_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("subscriptions_tenant_id_idx").on(t.tenantId),
    index("subscriptions_status_idx").on(t.status),
  ],
);

// ─── Subscription Items ─────────────────────────────────────────────────────────
export const subscriptionItems = pgTable(
  "subscription_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    subscriptionId: uuid("subscription_id")
      .notNull()
      .references(() => subscriptions.id, { onDelete: "cascade" }),
    sku: varchar("sku", { length: 128 }).notNull(),
    stripeSubscriptionItemId: varchar("stripe_subscription_item_id", { length: 255 }),
    quantity: integer("quantity").notNull().default(1),
    status: varchar("status", { length: 64 }).notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("subscription_items_subscription_id_idx").on(t.subscriptionId),
  ],
);

// ─── Relations ──────────────────────────────────────────────────────────────────
export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  tenant: one(tenants, { fields: [subscriptions.tenantId], references: [tenants.id] }),
  items: many(subscriptionItems),
}));

export const subscriptionItemsRelations = relations(subscriptionItems, ({ one }) => ({
  subscription: one(subscriptions, { fields: [subscriptionItems.subscriptionId], references: [subscriptions.id] }),
}));

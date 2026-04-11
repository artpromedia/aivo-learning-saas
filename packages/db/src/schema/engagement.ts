import { pgTable, uuid, varchar, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { learners } from "./learners";
import { tenants } from "./tenants";

export const xpEvents = pgTable("xp_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  learnerId: uuid("learner_id").references(() => learners.id).notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  xpAmount: integer("xp_amount").notNull(),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const badges = pgTable("badges", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  learnerId: uuid("learner_id").references(() => learners.id).notNull(),
  badgeType: varchar("badge_type", { length: 100 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  rarity: varchar("rarity", { length: 20 }).default("common"),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

export const streaks = pgTable("streaks", {
  id: uuid("id").defaultRandom().primaryKey(),
  learnerId: uuid("learner_id").references(() => learners.id).notNull(),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastActivityDate: timestamp("last_activity_date"),
  freezesUsed: integer("freezes_used").default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

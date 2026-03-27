import {
  pgTable,
  uuid,
  varchar,
  integer,
  date,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { learners } from "./learners";
import { questStatusEnum } from "./enums";

// ─── Learner XP ─────────────────────────────────────────────────────────────────
export const learnerXp = pgTable(
  "learner_xp",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    learnerId: uuid("learner_id")
      .notNull()
      .references(() => learners.id, { onDelete: "cascade" }),
    totalXp: integer("total_xp").notNull().default(0),
    level: integer("level").notNull().default(1),
    currentStreakDays: integer("current_streak_days").notNull().default(0),
    longestStreakDays: integer("longest_streak_days").notNull().default(0),
    lastActivityDate: date("last_activity_date"),
    virtualCurrency: integer("virtual_currency").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("learner_xp_learner_id_idx").on(t.learnerId),
  ],
);

// ─── XP Events ──────────────────────────────────────────────────────────────────
export const xpEvents = pgTable(
  "xp_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    learnerId: uuid("learner_id")
      .notNull()
      .references(() => learners.id, { onDelete: "cascade" }),
    activity: varchar("activity", { length: 255 }).notNull(),
    xpAmount: integer("xp_amount").notNull(),
    triggerEvent: varchar("trigger_event", { length: 255 }),
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("xp_events_learner_id_idx").on(t.learnerId),
    index("xp_events_learner_id_created_at_idx").on(t.learnerId, t.createdAt),
  ],
);

// ─── Badges ─────────────────────────────────────────────────────────────────────
export const badges = pgTable(
  "badges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 128 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 1024 }),
    iconUrl: varchar("icon_url", { length: 2048 }),
    category: varchar("category", { length: 128 }),
    criteria: jsonb("criteria").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("badges_slug_idx").on(t.slug),
  ],
);

// ─── Learner Badges ─────────────────────────────────────────────────────────────
export const learnerBadges = pgTable(
  "learner_badges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    learnerId: uuid("learner_id")
      .notNull()
      .references(() => learners.id, { onDelete: "cascade" }),
    badgeId: uuid("badge_id")
      .notNull()
      .references(() => badges.id, { onDelete: "cascade" }),
    earnedAt: timestamp("earned_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("learner_badges_learner_id_idx").on(t.learnerId),
    uniqueIndex("learner_badges_compound_idx").on(t.learnerId, t.badgeId),
  ],
);

// ─── Quests ─────────────────────────────────────────────────────────────────────
export const quests = pgTable(
  "quests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 128 }).notNull(),
    title: varchar("title", { length: 512 }).notNull(),
    description: varchar("description", { length: 2048 }),
    subject: varchar("subject", { length: 128 }),
    gradeBand: varchar("grade_band", { length: 64 }),
    chapters: jsonb("chapters").notNull().default([]),
    totalXp: integer("total_xp").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("quests_slug_idx").on(t.slug),
  ],
);

// ─── Learner Quests ─────────────────────────────────────────────────────────────
export const learnerQuests = pgTable(
  "learner_quests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    learnerId: uuid("learner_id")
      .notNull()
      .references(() => learners.id, { onDelete: "cascade" }),
    questId: uuid("quest_id")
      .notNull()
      .references(() => quests.id, { onDelete: "cascade" }),
    currentChapter: integer("current_chapter").notNull().default(0),
    status: questStatusEnum("status").notNull().default("ACTIVE"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => [
    index("learner_quests_learner_id_idx").on(t.learnerId),
    uniqueIndex("learner_quests_compound_idx").on(t.learnerId, t.questId),
  ],
);

// ─── Relations ──────────────────────────────────────────────────────────────────
export const learnerXpRelations = relations(learnerXp, ({ one }) => ({
  learner: one(learners, { fields: [learnerXp.learnerId], references: [learners.id] }),
}));

export const xpEventsRelations = relations(xpEvents, ({ one }) => ({
  learner: one(learners, { fields: [xpEvents.learnerId], references: [learners.id] }),
}));

export const badgesRelations = relations(badges, ({ many }) => ({
  learnerBadges: many(learnerBadges),
}));

export const learnerBadgesRelations = relations(learnerBadges, ({ one }) => ({
  learner: one(learners, { fields: [learnerBadges.learnerId], references: [learners.id] }),
  badge: one(badges, { fields: [learnerBadges.badgeId], references: [badges.id] }),
}));

export const questsRelations = relations(quests, ({ many }) => ({
  learnerQuests: many(learnerQuests),
}));

export const learnerQuestsRelations = relations(learnerQuests, ({ one }) => ({
  learner: one(learners, { fields: [learnerQuests.learnerId], references: [learners.id] }),
  quest: one(quests, { fields: [learnerQuests.questId], references: [quests.id] }),
}));

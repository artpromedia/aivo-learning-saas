import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { learners } from "./learners";
import { functionalDomainEnum, milestoneStatusEnum } from "./enums";

// ─── Functional Milestones ──────────────────────────────────────────────────────
export const functionalMilestones = pgTable(
  "functional_milestones",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    domain: functionalDomainEnum("domain").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 2048 }),
    orderIndex: integer("order_index").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("functional_milestones_domain_idx").on(t.domain),
    index("functional_milestones_order_idx").on(t.domain, t.orderIndex),
  ],
);

// ─── Learner Milestones ─────────────────────────────────────────────────────────
export const learnerMilestones = pgTable(
  "learner_milestones",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    learnerId: uuid("learner_id")
      .notNull()
      .references(() => learners.id, { onDelete: "cascade" }),
    milestoneId: uuid("milestone_id")
      .notNull()
      .references(() => functionalMilestones.id, { onDelete: "cascade" }),
    status: milestoneStatusEnum("status").notNull().default("NOT_STARTED"),
    observations: jsonb("observations").notNull().default([]),
    lastObservedAt: timestamp("last_observed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("learner_milestones_learner_id_idx").on(t.learnerId),
    uniqueIndex("learner_milestones_compound_idx").on(t.learnerId, t.milestoneId),
  ],
);

// ─── Relations ──────────────────────────────────────────────────────────────────
export const functionalMilestonesRelations = relations(functionalMilestones, ({ many }) => ({
  learnerMilestones: many(learnerMilestones),
}));

export const learnerMilestonesRelations = relations(learnerMilestones, ({ one }) => ({
  learner: one(learners, { fields: [learnerMilestones.learnerId], references: [learners.id] }),
  milestone: one(functionalMilestones, { fields: [learnerMilestones.milestoneId], references: [functionalMilestones.id] }),
}));

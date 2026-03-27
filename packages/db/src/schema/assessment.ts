import {
  pgTable,
  uuid,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { learners } from "./learners";
import { users } from "./identity";
import { assessmentModeEnum, assessmentStatusEnum } from "./enums";

// ─── Parent Assessments ─────────────────────────────────────────────────────────
export const parentAssessments = pgTable(
  "parent_assessments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    learnerId: uuid("learner_id")
      .notNull()
      .references(() => learners.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    responses: jsonb("responses").notNull(),
    functioningLevelSignals: jsonb("functioning_level_signals").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("parent_assessments_learner_id_idx").on(t.learnerId),
  ],
);

// ─── Baseline Assessments ───────────────────────────────────────────────────────
export const baselineAssessments = pgTable(
  "baseline_assessments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    learnerId: uuid("learner_id")
      .notNull()
      .references(() => learners.id, { onDelete: "cascade" }),
    assessmentMode: assessmentModeEnum("assessment_mode").notNull(),
    status: assessmentStatusEnum("status").notNull().default("IN_PROGRESS"),
    domains: jsonb("domains").default({}),
    rawResponses: jsonb("raw_responses").default({}),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("baseline_assessments_learner_id_idx").on(t.learnerId),
  ],
);

// ─── Assessment Items ───────────────────────────────────────────────────────────
export const assessmentItems = pgTable(
  "assessment_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    baselineAssessmentId: uuid("baseline_assessment_id")
      .notNull()
      .references(() => baselineAssessments.id, { onDelete: "cascade" }),
    domain: varchar("domain", { length: 128 }).notNull(),
    skill: varchar("skill", { length: 255 }).notNull(),
    difficulty: varchar("difficulty", { length: 64 }).notNull(),
    response: jsonb("response"),
    isCorrect: boolean("is_correct"),
    responseTimeMs: integer("response_time_ms"),
    presentedAt: timestamp("presented_at", { withTimezone: true }).notNull().defaultNow(),
    respondedAt: timestamp("responded_at", { withTimezone: true }),
  },
  (t) => [
    index("assessment_items_assessment_id_idx").on(t.baselineAssessmentId),
  ],
);

// ─── Relations ──────────────────────────────────────────────────────────────────
export const parentAssessmentsRelations = relations(parentAssessments, ({ one }) => ({
  learner: one(learners, { fields: [parentAssessments.learnerId], references: [learners.id] }),
  parent: one(users, { fields: [parentAssessments.parentId], references: [users.id] }),
}));

export const baselineAssessmentsRelations = relations(baselineAssessments, ({ one, many }) => ({
  learner: one(learners, { fields: [baselineAssessments.learnerId], references: [learners.id] }),
  items: many(assessmentItems),
}));

export const assessmentItemsRelations = relations(assessmentItems, ({ one }) => ({
  assessment: one(baselineAssessments, { fields: [assessmentItems.baselineAssessmentId], references: [baselineAssessments.id] }),
}));

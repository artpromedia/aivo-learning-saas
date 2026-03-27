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
import { learningSessionTypeEnum } from "./enums";

// ─── Learning Sessions ──────────────────────────────────────────────────────────
export const learningSessions = pgTable(
  "learning_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    learnerId: uuid("learner_id")
      .notNull()
      .references(() => learners.id, { onDelete: "cascade" }),
    sessionType: learningSessionTypeEnum("session_type").notNull(),
    subject: varchar("subject", { length: 128 }).notNull(),
    skillTargets: jsonb("skill_targets").notNull().default([]),
    contentGenerated: jsonb("content_generated").default({}),
    masteryBefore: jsonb("mastery_before").default({}),
    masteryAfter: jsonb("mastery_after").default({}),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("learning_sessions_learner_id_idx").on(t.learnerId),
    index("learning_sessions_learner_id_created_at_idx").on(t.learnerId, t.createdAt),
    index("learning_sessions_subject_idx").on(t.subject),
  ],
);

// ─── Relations ──────────────────────────────────────────────────────────────────
export const learningSessionsRelations = relations(learningSessions, ({ one }) => ({
  learner: one(learners, { fields: [learningSessions.learnerId], references: [learners.id] }),
}));

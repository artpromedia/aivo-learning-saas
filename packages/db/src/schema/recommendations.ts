import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { learners } from "./learners";
import { users } from "./identity";
import { brainStates } from "./brain";
import { recommendationTypeEnum, recommendationStatusEnum } from "./enums";

// ─── Recommendations ────────────────────────────────────────────────────────────
export const recommendations = pgTable(
  "recommendations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brainStateId: uuid("brain_state_id")
      .notNull()
      .references(() => brainStates.id, { onDelete: "cascade" }),
    learnerId: uuid("learner_id")
      .notNull()
      .references(() => learners.id, { onDelete: "cascade" }),
    type: recommendationTypeEnum("type").notNull(),
    title: varchar("title", { length: 512 }).notNull(),
    description: text("description").notNull(),
    payload: jsonb("payload").notNull().default({}),
    status: recommendationStatusEnum("status").notNull().default("PENDING"),
    parentResponseText: text("parent_response_text"),
    respondedBy: uuid("responded_by")
      .references(() => users.id, { onDelete: "set null" }),
    respondedAt: timestamp("responded_at", { withTimezone: true }),
    reTriggerGapDays: integer("re_trigger_gap_days").notNull().default(14),
    previousRecommendationId: uuid("previous_recommendation_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("recommendations_learner_id_idx").on(t.learnerId),
    index("recommendations_brain_state_id_idx").on(t.brainStateId),
    index("recommendations_status_idx").on(t.status),
    index("recommendations_type_idx").on(t.type),
  ],
);

// ─── Relations ──────────────────────────────────────────────────────────────────
export const recommendationsRelations = relations(recommendations, ({ one }) => ({
  brainState: one(brainStates, { fields: [recommendations.brainStateId], references: [brainStates.id] }),
  learner: one(learners, { fields: [recommendations.learnerId], references: [learners.id] }),
  responder: one(users, { fields: [recommendations.respondedBy], references: [users.id] }),
  previousRecommendation: one(recommendations, {
    fields: [recommendations.previousRecommendationId],
    references: [recommendations.id],
    relationName: "recommendationChain",
  }),
}));

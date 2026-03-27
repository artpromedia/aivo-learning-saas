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
import { users } from "./identity";
import { iepParseStatusEnum, iepGoalStatusEnum } from "./enums";

// ─── IEP Documents ──────────────────────────────────────────────────────────────
export const iepDocuments = pgTable(
  "iep_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    learnerId: uuid("learner_id")
      .notNull()
      .references(() => learners.id, { onDelete: "cascade" }),
    uploadedBy: uuid("uploaded_by")
      .notNull()
      .references(() => users.id, { onDelete: "set null" }),
    fileUrl: varchar("file_url", { length: 2048 }).notNull(),
    fileType: varchar("file_type", { length: 64 }).notNull(),
    parsedData: jsonb("parsed_data").default({}),
    parseStatus: iepParseStatusEnum("parse_status").notNull().default("PENDING"),
    confirmedBy: uuid("confirmed_by")
      .references(() => users.id, { onDelete: "set null" }),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("iep_documents_learner_id_idx").on(t.learnerId),
  ],
);

// ─── IEP Goals ──────────────────────────────────────────────────────────────────
export const iepGoals = pgTable(
  "iep_goals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    learnerId: uuid("learner_id")
      .notNull()
      .references(() => learners.id, { onDelete: "cascade" }),
    iepDocumentId: uuid("iep_document_id")
      .references(() => iepDocuments.id, { onDelete: "set null" }),
    goalText: varchar("goal_text", { length: 4096 }).notNull(),
    domain: varchar("domain", { length: 128 }).notNull(),
    targetMetric: varchar("target_metric", { length: 255 }),
    targetValue: varchar("target_value", { length: 128 }),
    currentValue: varchar("current_value", { length: 128 }),
    status: iepGoalStatusEnum("status").notNull().default("ACTIVE"),
    metAt: timestamp("met_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("iep_goals_learner_id_idx").on(t.learnerId),
    index("iep_goals_status_idx").on(t.status),
  ],
);

// ─── Relations ──────────────────────────────────────────────────────────────────
export const iepDocumentsRelations = relations(iepDocuments, ({ one, many }) => ({
  learner: one(learners, { fields: [iepDocuments.learnerId], references: [learners.id] }),
  uploader: one(users, { fields: [iepDocuments.uploadedBy], references: [users.id], relationName: "iepUploader" }),
  confirmer: one(users, { fields: [iepDocuments.confirmedBy], references: [users.id], relationName: "iepConfirmer" }),
  goals: many(iepGoals),
}));

export const iepGoalsRelations = relations(iepGoals, ({ one }) => ({
  learner: one(learners, { fields: [iepGoals.learnerId], references: [learners.id] }),
  document: one(iepDocuments, { fields: [iepGoals.iepDocumentId], references: [iepDocuments.id] }),
}));

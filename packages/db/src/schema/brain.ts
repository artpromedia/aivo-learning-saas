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
import { cognitiveLoadEnum, snapshotTriggerEnum } from "./enums";

// ─── Brain States ───────────────────────────────────────────────────────────────
export const brainStates = pgTable(
  "brain_states",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    learnerId: uuid("learner_id")
      .notNull()
      .references(() => learners.id, { onDelete: "cascade" }),
    mainBrainVersion: varchar("main_brain_version", { length: 64 }),
    seedVersion: varchar("seed_version", { length: 64 }),
    state: jsonb("state").notNull().default({}),
    functioningLevelProfile: jsonb("functioning_level_profile").default({}),
    iepProfile: jsonb("iep_profile").default({}),
    activeTutors: jsonb("active_tutors").default([]),
    deliveryLevels: jsonb("delivery_levels").default({}),
    preferredModality: varchar("preferred_modality", { length: 64 }),
    attentionSpanMinutes: integer("attention_span_minutes"),
    cognitiveLoad: cognitiveLoadEnum("cognitive_load").default("MEDIUM"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("brain_states_learner_id_idx").on(t.learnerId),
  ],
);

// ─── Brain State Snapshots ──────────────────────────────────────────────────────
export const brainStateSnapshots = pgTable(
  "brain_state_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brainStateId: uuid("brain_state_id")
      .notNull()
      .references(() => brainStates.id, { onDelete: "cascade" }),
    snapshot: jsonb("snapshot").notNull(),
    trigger: snapshotTriggerEnum("trigger").notNull(),
    triggerMetadata: jsonb("trigger_metadata").default({}),
    versionNumber: integer("version_number").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("brain_snapshots_brain_state_id_idx").on(t.brainStateId),
    index("brain_snapshots_created_at_idx").on(t.createdAt),
  ],
);

// ─── Brain Episodes ─────────────────────────────────────────────────────────────
export const brainEpisodes = pgTable(
  "brain_episodes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brainStateId: uuid("brain_state_id")
      .notNull()
      .references(() => brainStates.id, { onDelete: "cascade" }),
    eventType: varchar("event_type", { length: 128 }).notNull(),
    payload: jsonb("payload").notNull().default({}),
    sessionId: uuid("session_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("brain_episodes_brain_state_id_created_at_idx").on(t.brainStateId, t.createdAt),
    index("brain_episodes_session_id_idx").on(t.sessionId),
  ],
);

// ─── Relations ──────────────────────────────────────────────────────────────────
export const brainStatesRelations = relations(brainStates, ({ one, many }) => ({
  learner: one(learners, { fields: [brainStates.learnerId], references: [learners.id] }),
  snapshots: many(brainStateSnapshots),
  episodes: many(brainEpisodes),
}));

export const brainStateSnapshotsRelations = relations(brainStateSnapshots, ({ one }) => ({
  brainState: one(brainStates, { fields: [brainStateSnapshots.brainStateId], references: [brainStates.id] }),
}));

export const brainEpisodesRelations = relations(brainEpisodes, ({ one }) => ({
  brainState: one(brainStates, { fields: [brainEpisodes.brainStateId], references: [brainStates.id] }),
}));

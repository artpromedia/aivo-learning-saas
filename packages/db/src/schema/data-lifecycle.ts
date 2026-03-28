import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { learners } from "./learners";

// ─── Data Lifecycle Event Types ────────────────────────────────────────────────
export const dataLifecycleEventTypeEnum = pgEnum("data_lifecycle_event_type", [
  "EXPORT_REQUESTED",
  "EXPORT_COMPLETED",
  "EXPORT_FAILED",
  "GRACE_PERIOD_STARTED",
  "GRACE_PERIOD_WARNING_7DAY",
  "GRACE_PERIOD_EXPIRED",
  "SUBSCRIPTION_REACTIVATED",
  "TUTOR_GRACE_STARTED",
  "TUTOR_GRACE_EXPIRED",
  "DATA_DELETION_STARTED",
  "DATA_DELETION_COMPLETED",
  "ERASURE_REQUESTED",
  "ERASURE_COMPLETED",
]);

// ─── Data Lifecycle Events (Compliance Audit Trail) ────────────────────────────
// This table is NEVER deleted during erasure — it is the compliance audit trail.
export const dataLifecycleEvents = pgTable(
  "data_lifecycle_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    learnerId: uuid("learner_id").notNull(),
    eventType: dataLifecycleEventTypeEnum("event_type").notNull(),
    initiatedBy: uuid("initiated_by"),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("data_lifecycle_events_learner_id_idx").on(t.learnerId),
    index("data_lifecycle_events_event_type_idx").on(t.eventType),
    index("data_lifecycle_events_created_at_idx").on(t.createdAt),
  ],
);

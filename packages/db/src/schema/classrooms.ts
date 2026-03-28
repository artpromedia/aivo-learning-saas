import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants, users } from "./identity";
import { learners } from "./learners";

// ─── Classrooms ────────────────────────────────────────────────────────────────
export const classrooms = pgTable(
  "classrooms",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    gradeBand: varchar("grade_band", { length: 64 }),
    teacherId: uuid("teacher_id")
      .references(() => users.id, { onDelete: "set null" }),
    isDeleted: boolean("is_deleted").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("classrooms_tenant_id_idx").on(t.tenantId),
    index("classrooms_teacher_id_idx").on(t.teacherId),
  ],
);

// ─── Classroom Learners (Junction) ─────────────────────────────────────────────
export const classroomLearners = pgTable(
  "classroom_learners",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    classroomId: uuid("classroom_id")
      .notNull()
      .references(() => classrooms.id, { onDelete: "cascade" }),
    learnerId: uuid("learner_id")
      .notNull()
      .references(() => learners.id, { onDelete: "cascade" }),
    enrolledAt: timestamp("enrolled_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("classroom_learners_compound_idx").on(t.classroomId, t.learnerId),
    index("classroom_learners_classroom_id_idx").on(t.classroomId),
    index("classroom_learners_learner_id_idx").on(t.learnerId),
  ],
);

// ─── Relations ──────────────────────────────────────────────────────────────────
export const classroomsRelations = relations(classrooms, ({ one, many }) => ({
  tenant: one(tenants, { fields: [classrooms.tenantId], references: [tenants.id] }),
  teacher: one(users, { fields: [classrooms.teacherId], references: [users.id] }),
  classroomLearners: many(classroomLearners),
}));

export const classroomLearnersRelations = relations(classroomLearners, ({ one }) => ({
  classroom: one(classrooms, { fields: [classroomLearners.classroomId], references: [classrooms.id] }),
  learner: one(learners, { fields: [classroomLearners.learnerId], references: [learners.id] }),
}));

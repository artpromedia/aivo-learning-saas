import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants, users } from "./identity";
import { functioningLevelEnum, communicationModeEnum, userStatusEnum } from "./enums";

// ─── Learners ───────────────────────────────────────────────────────────────────
export const learners = pgTable(
  "learners",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "set null" }),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    dateOfBirth: timestamp("date_of_birth", { mode: "date" }),
    enrolledGrade: integer("enrolled_grade"),
    schoolName: varchar("school_name", { length: 255 }),
    functioningLevel: functioningLevelEnum("functioning_level").notNull().default("STANDARD"),
    communicationMode: communicationModeEnum("communication_mode").notNull().default("VERBAL"),
    status: userStatusEnum("status").notNull().default("ACTIVE"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("learners_tenant_id_idx").on(t.tenantId),
    index("learners_parent_id_idx").on(t.parentId),
    index("learners_user_id_idx").on(t.userId),
  ],
);

// ─── Learner Caregivers ─────────────────────────────────────────────────────────
export const learnerCaregivers = pgTable(
  "learner_caregivers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    learnerId: uuid("learner_id")
      .notNull()
      .references(() => learners.id, { onDelete: "cascade" }),
    caregiverUserId: uuid("caregiver_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    relationship: varchar("relationship", { length: 64 }).notNull(),
    invitedAt: timestamp("invited_at", { withTimezone: true }).notNull().defaultNow(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("learner_caregivers_compound_idx").on(t.learnerId, t.caregiverUserId),
    index("learner_caregivers_learner_id_idx").on(t.learnerId),
  ],
);

// ─── Learner Teachers ───────────────────────────────────────────────────────────
export const learnerTeachers = pgTable(
  "learner_teachers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    learnerId: uuid("learner_id")
      .notNull()
      .references(() => learners.id, { onDelete: "cascade" }),
    teacherUserId: uuid("teacher_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    classroomId: varchar("classroom_id", { length: 128 }),
    invitedAt: timestamp("invited_at", { withTimezone: true }).notNull().defaultNow(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("learner_teachers_compound_idx").on(t.learnerId, t.teacherUserId),
    index("learner_teachers_learner_id_idx").on(t.learnerId),
  ],
);

// ─── Relations ──────────────────────────────────────────────────────────────────
export const learnersRelations = relations(learners, ({ one, many }) => ({
  tenant: one(tenants, { fields: [learners.tenantId], references: [tenants.id] }),
  user: one(users, { fields: [learners.userId], references: [users.id], relationName: "learnerUser" }),
  parent: one(users, { fields: [learners.parentId], references: [users.id], relationName: "learnerParent" }),
  caregivers: many(learnerCaregivers),
  teachers: many(learnerTeachers),
}));

export const learnerCaregiversRelations = relations(learnerCaregivers, ({ one }) => ({
  learner: one(learners, { fields: [learnerCaregivers.learnerId], references: [learners.id] }),
  caregiver: one(users, { fields: [learnerCaregivers.caregiverUserId], references: [users.id] }),
}));

export const learnerTeachersRelations = relations(learnerTeachers, ({ one }) => ({
  learner: one(learners, { fields: [learnerTeachers.learnerId], references: [learners.id] }),
  teacher: one(users, { fields: [learnerTeachers.teacherUserId], references: [users.id] }),
}));

import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { curriculumFrameworkEnum } from "./enums";

export const schoolDistricts = pgTable(
  "school_districts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    state: varchar("state", { length: 2 }).notNull(),
    ncesId: varchar("nces_id", { length: 12 }),
    curriculumFramework: curriculumFrameworkEnum("curriculum_framework").notNull().default("COMMON_CORE"),
    settings: jsonb("settings").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("school_districts_state_idx").on(t.state),
    uniqueIndex("school_districts_nces_id_idx").on(t.ncesId),
  ],
);

export const districtZipCodes = pgTable(
  "district_zip_codes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    districtId: uuid("district_id")
      .notNull()
      .references(() => schoolDistricts.id, { onDelete: "cascade" }),
    zipCode: varchar("zip_code", { length: 10 }).notNull(),
  },
  (t) => [
    uniqueIndex("district_zip_codes_zip_idx").on(t.zipCode),
    index("district_zip_codes_district_id_idx").on(t.districtId),
  ],
);

export const districtCurriculumStandards = pgTable(
  "district_curriculum_standards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    districtId: uuid("district_id")
      .notNull()
      .references(() => schoolDistricts.id, { onDelete: "cascade" }),
    subject: varchar("subject", { length: 64 }).notNull(),
    gradeBand: varchar("grade_band", { length: 16 }).notNull(),
    standards: jsonb("standards").notNull().default([]),
    alignments: jsonb("alignments").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("district_curriculum_compound_idx").on(t.districtId, t.subject, t.gradeBand),
    index("district_curriculum_district_id_idx").on(t.districtId),
  ],
);

export const schoolDistrictsRelations = relations(schoolDistricts, ({ many }) => ({
  zipCodes: many(districtZipCodes),
  curriculumStandards: many(districtCurriculumStandards),
}));

export const districtZipCodesRelations = relations(districtZipCodes, ({ one }) => ({
  district: one(schoolDistricts, { fields: [districtZipCodes.districtId], references: [schoolDistricts.id] }),
}));

export const districtCurriculumStandardsRelations = relations(districtCurriculumStandards, ({ one }) => ({
  district: one(schoolDistricts, { fields: [districtCurriculumStandards.districtId], references: [schoolDistricts.id] }),
}));

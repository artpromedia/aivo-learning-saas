CREATE TYPE "public"."parent_assessment_type" AS ENUM('STANDARD', 'STANDARD_WITH_ACCOMMODATIONS', 'MODIFIED', 'ALTERNATE');--> statement-breakpoint
ALTER TABLE "parent_assessments" ADD COLUMN "assessment_type" "parent_assessment_type" DEFAULT 'STANDARD';--> statement-breakpoint
ALTER TABLE "parent_assessments" ADD COLUMN "support_level" real;--> statement-breakpoint
ALTER TABLE "parent_assessments" ADD COLUMN "has_existing_iep" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "parent_assessments" ADD COLUMN "has_existing_504" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "parent_assessments" ADD COLUMN "disability_categories" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "parent_assessments" ADD COLUMN "current_services" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "parent_assessments" ADD COLUMN "assistive_technology" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "parent_assessments" ADD COLUMN "learning_style_notes" text;--> statement-breakpoint
ALTER TABLE "parent_assessments" ADD COLUMN "strengths_notes" text;--> statement-breakpoint
ALTER TABLE "parent_assessments" ADD COLUMN "challenges_notes" text;--> statement-breakpoint
ALTER TABLE "parent_assessments" ADD COLUMN "behavior_notes" text;--> statement-breakpoint
ALTER TABLE "parent_assessments" ADD COLUMN "recommendations" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "parent_assessments" ADD COLUMN "started_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "parent_assessments" ADD COLUMN "completed_at" timestamp with time zone;

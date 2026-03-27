CREATE TYPE "public"."assessment_mode" AS ENUM('STANDARD', 'MODIFIED', 'PICTURE_BASED', 'SWITCH_SCAN', 'EYE_GAZE', 'PARTNER_ASSISTED', 'OBSERVATIONAL');--> statement-breakpoint
CREATE TYPE "public"."assessment_status" AS ENUM('IN_PROGRESS', 'COMPLETED', 'ABANDONED');--> statement-breakpoint
CREATE TYPE "public"."cognitive_load" AS ENUM('LOW', 'MEDIUM', 'HIGH');--> statement-breakpoint
CREATE TYPE "public"."communication_mode" AS ENUM('VERBAL', 'LIMITED_VERBAL', 'NON_VERBAL_AAC', 'NON_VERBAL_PARTNER', 'PRE_INTENTIONAL');--> statement-breakpoint
CREATE TYPE "public"."functional_domain" AS ENUM('COMMUNICATION', 'SELF_CARE', 'SOCIAL_EMOTIONAL', 'PRE_ACADEMIC', 'MOTOR_SENSORY');--> statement-breakpoint
CREATE TYPE "public"."functioning_level" AS ENUM('STANDARD', 'SUPPORTED', 'LOW_VERBAL', 'NON_VERBAL', 'PRE_SYMBOLIC');--> statement-breakpoint
CREATE TYPE "public"."homework_mode" AS ENUM('PRACTICE', 'MODIFIED', 'PARENT_MEDIATED', 'PARENT_GUIDE');--> statement-breakpoint
CREATE TYPE "public"."homework_status" AS ENUM('PROCESSING', 'READY', 'IN_PROGRESS', 'COMPLETED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."iep_goal_status" AS ENUM('ACTIVE', 'MET', 'DEFERRED');--> statement-breakpoint
CREATE TYPE "public"."iep_parse_status" AS ENUM('PENDING', 'PARSING', 'PARSED', 'CONFIRMED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."learning_session_type" AS ENUM('LESSON', 'QUIZ', 'READING', 'WRITING', 'TUTOR', 'HOMEWORK');--> statement-breakpoint
CREATE TYPE "public"."milestone_status" AS ENUM('NOT_STARTED', 'EMERGING', 'DEVELOPING', 'ACHIEVED');--> statement-breakpoint
CREATE TYPE "public"."quest_status" AS ENUM('ACTIVE', 'COMPLETED', 'ABANDONED');--> statement-breakpoint
CREATE TYPE "public"."recommendation_status" AS ENUM('PENDING', 'APPROVED', 'DECLINED', 'ADJUSTED');--> statement-breakpoint
CREATE TYPE "public"."recommendation_type" AS ENUM('CURRICULUM_ADJUSTMENT', 'ACCOMMODATION_CHANGE', 'FUNCTIONING_LEVEL_CHANGE', 'TUTOR_ADDON', 'IEP_GOAL_UPDATE', 'ENGAGEMENT_BOOST', 'PARENT_MEDIATED_ACTIVITY', 'ASSESSMENT_REBASELINE', 'DIFFICULTY_ADJUSTMENT', 'MODALITY_SWITCH', 'BREAK_SUGGESTION', 'CELEBRATION', 'REGRESSION_ALERT');--> statement-breakpoint
CREATE TYPE "public"."snapshot_trigger" AS ENUM('INITIAL_CLONE', 'MAIN_BRAIN_UPGRADE', 'PARENT_APPROVED', 'MASTERY_THRESHOLD', 'REBASELINE', 'TUTOR_ADDON_ACTIVATED', 'TUTOR_ADDON_DEACTIVATED', 'FUNCTIONING_LEVEL_CHANGE', 'IEP_UPDATE');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('ACTIVE', 'PAST_DUE', 'CANCELLED', 'GRACE_PERIOD');--> statement-breakpoint
CREATE TYPE "public"."tenant_status" AS ENUM('ACTIVE', 'SUSPENDED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."tenant_type" AS ENUM('B2C_FAMILY', 'B2B_DISTRICT');--> statement-breakpoint
CREATE TYPE "public"."tutor_session_type" AS ENUM('LESSON', 'REVIEW', 'PRACTICE');--> statement-breakpoint
CREATE TYPE "public"."tutor_sku" AS ENUM('ADDON_TUTOR_MATH', 'ADDON_TUTOR_ELA', 'ADDON_TUTOR_SCIENCE', 'ADDON_TUTOR_HISTORY', 'ADDON_TUTOR_CODING', 'ADDON_TUTOR_BUNDLE');--> statement-breakpoint
CREATE TYPE "public"."tutor_subscription_status" AS ENUM('ACTIVE', 'GRACE_PERIOD', 'CANCELLED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('PARENT', 'TEACHER', 'CAREGIVER', 'LEARNER', 'DISTRICT_ADMIN', 'PLATFORM_ADMIN');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('ACTIVE', 'INVITED', 'SUSPENDED');--> statement-breakpoint
CREATE TABLE "assessment_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"baseline_assessment_id" uuid NOT NULL,
	"domain" varchar(128) NOT NULL,
	"skill" varchar(255) NOT NULL,
	"difficulty" varchar(64) NOT NULL,
	"response" jsonb,
	"is_correct" boolean,
	"response_time_ms" integer,
	"presented_at" timestamp with time zone DEFAULT now() NOT NULL,
	"responded_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "baseline_assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"assessment_mode" "assessment_mode" NOT NULL,
	"status" "assessment_status" DEFAULT 'IN_PROGRESS' NOT NULL,
	"domains" jsonb DEFAULT '{}'::jsonb,
	"raw_responses" jsonb DEFAULT '{}'::jsonb,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parent_assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"parent_id" uuid NOT NULL,
	"responses" jsonb NOT NULL,
	"functioning_level_signals" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid NOT NULL,
	"sku" varchar(128) NOT NULL,
	"stripe_subscription_item_id" varchar(255),
	"quantity" integer DEFAULT 1 NOT NULL,
	"status" varchar(64) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"plan_id" varchar(128) NOT NULL,
	"stripe_subscription_id" varchar(255),
	"status" "subscription_status" DEFAULT 'ACTIVE' NOT NULL,
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"grace_period_ends_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brain_episodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brain_state_id" uuid NOT NULL,
	"event_type" varchar(128) NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"session_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brain_state_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brain_state_id" uuid NOT NULL,
	"snapshot" jsonb NOT NULL,
	"trigger" "snapshot_trigger" NOT NULL,
	"trigger_metadata" jsonb DEFAULT '{}'::jsonb,
	"version_number" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brain_states" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"main_brain_version" varchar(64),
	"seed_version" varchar(64),
	"state" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"functioning_level_profile" jsonb DEFAULT '{}'::jsonb,
	"iep_profile" jsonb DEFAULT '{}'::jsonb,
	"active_tutors" jsonb DEFAULT '[]'::jsonb,
	"delivery_levels" jsonb DEFAULT '{}'::jsonb,
	"preferred_modality" varchar(64),
	"attention_span_minutes" integer,
	"cognitive_load" "cognitive_load" DEFAULT 'MEDIUM',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenant_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"daily_llm_token_quota" integer DEFAULT 0 NOT NULL,
	"features" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"llm_provider_override" varchar(128),
	"llm_model_override" varchar(128),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenant_usages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"usage_date" date NOT NULL,
	"tokens_used" integer DEFAULT 0 NOT NULL,
	"requests_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(128) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(1024),
	"icon_url" varchar(2048),
	"category" varchar(128),
	"criteria" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learner_badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"badge_id" uuid NOT NULL,
	"earned_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learner_quests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"quest_id" uuid NOT NULL,
	"current_chapter" integer DEFAULT 0 NOT NULL,
	"status" "quest_status" DEFAULT 'ACTIVE' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "learner_xp" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"total_xp" integer DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"current_streak_days" integer DEFAULT 0 NOT NULL,
	"longest_streak_days" integer DEFAULT 0 NOT NULL,
	"last_activity_date" date,
	"virtual_currency" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(128) NOT NULL,
	"title" varchar(512) NOT NULL,
	"description" varchar(2048),
	"subject" varchar(128),
	"grade_band" varchar(64),
	"chapters" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"total_xp" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "xp_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"activity" varchar(255) NOT NULL,
	"xp_amount" integer NOT NULL,
	"trigger_event" varchar(255),
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "functional_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"domain" "functional_domain" NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(2048),
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learner_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"milestone_id" uuid NOT NULL,
	"status" "milestone_status" DEFAULT 'NOT_STARTED' NOT NULL,
	"observations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"last_observed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "homework_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"subject" varchar(128) NOT NULL,
	"original_file_url" varchar(2048),
	"original_file_type" varchar(64),
	"extracted_text" varchar(65535),
	"extracted_problems" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"adapted_problems" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"homework_mode" "homework_mode" NOT NULL,
	"status" "homework_status" DEFAULT 'PROCESSING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "homework_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"homework_assignment_id" uuid NOT NULL,
	"learner_id" uuid NOT NULL,
	"tutor_sku" "tutor_sku",
	"messages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"completion_quality" numeric(3, 2),
	"problems_attempted" integer DEFAULT 0,
	"problems_completed" integer DEFAULT 0,
	"hints_used" integer DEFAULT 0,
	"duration_seconds" integer DEFAULT 0,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider_id" varchar(128) NOT NULL,
	"provider_account_id" varchar(512) NOT NULL,
	"access_token" varchar(4096),
	"refresh_token" varchar(4096),
	"access_token_expires_at" timestamp with time zone,
	"scope" varchar(1024),
	"id_token" varchar(4096),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(512) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_address" varchar(45),
	"user_agent" varchar(1024),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(128) NOT NULL,
	"type" "tenant_type" NOT NULL,
	"status" "tenant_status" DEFAULT 'ACTIVE' NOT NULL,
	"plan_id" varchar(128),
	"settings" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"email" varchar(320) NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" "user_role" NOT NULL,
	"avatar_url" varchar(2048),
	"status" "user_status" DEFAULT 'ACTIVE' NOT NULL,
	"email_verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "iep_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"uploaded_by" uuid NOT NULL,
	"file_url" varchar(2048) NOT NULL,
	"file_type" varchar(64) NOT NULL,
	"parsed_data" jsonb DEFAULT '{}'::jsonb,
	"parse_status" "iep_parse_status" DEFAULT 'PENDING' NOT NULL,
	"confirmed_by" uuid,
	"confirmed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "iep_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"iep_document_id" uuid,
	"goal_text" varchar(4096) NOT NULL,
	"domain" varchar(128) NOT NULL,
	"target_metric" varchar(255),
	"target_value" varchar(128),
	"current_value" varchar(128),
	"status" "iep_goal_status" DEFAULT 'ACTIVE' NOT NULL,
	"met_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learner_caregivers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"caregiver_user_id" uuid NOT NULL,
	"relationship" varchar(64) NOT NULL,
	"invited_at" timestamp with time zone DEFAULT now() NOT NULL,
	"accepted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "learner_teachers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"teacher_user_id" uuid NOT NULL,
	"classroom_id" varchar(128),
	"invited_at" timestamp with time zone DEFAULT now() NOT NULL,
	"accepted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "learners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"tenant_id" uuid NOT NULL,
	"parent_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"date_of_birth" timestamp,
	"enrolled_grade" integer,
	"school_name" varchar(255),
	"functioning_level" "functioning_level" DEFAULT 'STANDARD' NOT NULL,
	"communication_mode" "communication_mode" DEFAULT 'VERBAL' NOT NULL,
	"status" "user_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recommendations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brain_state_id" uuid NOT NULL,
	"learner_id" uuid NOT NULL,
	"type" "recommendation_type" NOT NULL,
	"title" varchar(512) NOT NULL,
	"description" text NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" "recommendation_status" DEFAULT 'PENDING' NOT NULL,
	"parent_response_text" text,
	"responded_by" uuid,
	"responded_at" timestamp with time zone,
	"re_trigger_gap_days" integer DEFAULT 14 NOT NULL,
	"previous_recommendation_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tutor_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"tutor_sku" "tutor_sku" NOT NULL,
	"subject" varchar(128) NOT NULL,
	"session_type" "tutor_session_type" NOT NULL,
	"brain_context_snapshot" jsonb DEFAULT '{}'::jsonb,
	"messages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"mastery_updates" jsonb DEFAULT '{}'::jsonb,
	"engagement_metrics" jsonb DEFAULT '{}'::jsonb,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tutor_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"sku" "tutor_sku" NOT NULL,
	"status" "tutor_subscription_status" DEFAULT 'ACTIVE' NOT NULL,
	"stripe_subscription_item_id" varchar(255),
	"activated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"grace_period_ends_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"session_type" "learning_session_type" NOT NULL,
	"subject" varchar(128) NOT NULL,
	"skill_targets" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"content_generated" jsonb DEFAULT '{}'::jsonb,
	"mastery_before" jsonb DEFAULT '{}'::jsonb,
	"mastery_after" jsonb DEFAULT '{}'::jsonb,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assessment_items" ADD CONSTRAINT "assessment_items_baseline_assessment_id_baseline_assessments_id_fk" FOREIGN KEY ("baseline_assessment_id") REFERENCES "public"."baseline_assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "baseline_assessments" ADD CONSTRAINT "baseline_assessments_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parent_assessments" ADD CONSTRAINT "parent_assessments_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parent_assessments" ADD CONSTRAINT "parent_assessments_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_items" ADD CONSTRAINT "subscription_items_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brain_episodes" ADD CONSTRAINT "brain_episodes_brain_state_id_brain_states_id_fk" FOREIGN KEY ("brain_state_id") REFERENCES "public"."brain_states"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brain_state_snapshots" ADD CONSTRAINT "brain_state_snapshots_brain_state_id_brain_states_id_fk" FOREIGN KEY ("brain_state_id") REFERENCES "public"."brain_states"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brain_states" ADD CONSTRAINT "brain_states_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_configs" ADD CONSTRAINT "tenant_configs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_usages" ADD CONSTRAINT "tenant_usages_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_badges" ADD CONSTRAINT "learner_badges_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_badges" ADD CONSTRAINT "learner_badges_badge_id_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_quests" ADD CONSTRAINT "learner_quests_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_quests" ADD CONSTRAINT "learner_quests_quest_id_quests_id_fk" FOREIGN KEY ("quest_id") REFERENCES "public"."quests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_xp" ADD CONSTRAINT "learner_xp_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xp_events" ADD CONSTRAINT "xp_events_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_milestones" ADD CONSTRAINT "learner_milestones_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_milestones" ADD CONSTRAINT "learner_milestones_milestone_id_functional_milestones_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."functional_milestones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homework_assignments" ADD CONSTRAINT "homework_assignments_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homework_sessions" ADD CONSTRAINT "homework_sessions_homework_assignment_id_homework_assignments_id_fk" FOREIGN KEY ("homework_assignment_id") REFERENCES "public"."homework_assignments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homework_sessions" ADD CONSTRAINT "homework_sessions_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iep_documents" ADD CONSTRAINT "iep_documents_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iep_documents" ADD CONSTRAINT "iep_documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iep_documents" ADD CONSTRAINT "iep_documents_confirmed_by_users_id_fk" FOREIGN KEY ("confirmed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iep_goals" ADD CONSTRAINT "iep_goals_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iep_goals" ADD CONSTRAINT "iep_goals_iep_document_id_iep_documents_id_fk" FOREIGN KEY ("iep_document_id") REFERENCES "public"."iep_documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_caregivers" ADD CONSTRAINT "learner_caregivers_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_caregivers" ADD CONSTRAINT "learner_caregivers_caregiver_user_id_users_id_fk" FOREIGN KEY ("caregiver_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_teachers" ADD CONSTRAINT "learner_teachers_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_teachers" ADD CONSTRAINT "learner_teachers_teacher_user_id_users_id_fk" FOREIGN KEY ("teacher_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learners" ADD CONSTRAINT "learners_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learners" ADD CONSTRAINT "learners_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learners" ADD CONSTRAINT "learners_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_brain_state_id_brain_states_id_fk" FOREIGN KEY ("brain_state_id") REFERENCES "public"."brain_states"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_responded_by_users_id_fk" FOREIGN KEY ("responded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutor_sessions" ADD CONSTRAINT "tutor_sessions_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutor_subscriptions" ADD CONSTRAINT "tutor_subscriptions_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutor_subscriptions" ADD CONSTRAINT "tutor_subscriptions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_sessions" ADD CONSTRAINT "learning_sessions_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assessment_items_assessment_id_idx" ON "assessment_items" USING btree ("baseline_assessment_id");--> statement-breakpoint
CREATE INDEX "baseline_assessments_learner_id_idx" ON "baseline_assessments" USING btree ("learner_id");--> statement-breakpoint
CREATE INDEX "parent_assessments_learner_id_idx" ON "parent_assessments" USING btree ("learner_id");--> statement-breakpoint
CREATE INDEX "subscription_items_subscription_id_idx" ON "subscription_items" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "subscriptions_tenant_id_idx" ON "subscriptions" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "subscriptions_status_idx" ON "subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "brain_episodes_brain_state_id_created_at_idx" ON "brain_episodes" USING btree ("brain_state_id","created_at");--> statement-breakpoint
CREATE INDEX "brain_episodes_session_id_idx" ON "brain_episodes" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "brain_snapshots_brain_state_id_idx" ON "brain_state_snapshots" USING btree ("brain_state_id");--> statement-breakpoint
CREATE INDEX "brain_snapshots_created_at_idx" ON "brain_state_snapshots" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "brain_states_learner_id_idx" ON "brain_states" USING btree ("learner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tenant_configs_tenant_id_idx" ON "tenant_configs" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tenant_usages_tenant_date_idx" ON "tenant_usages" USING btree ("tenant_id","usage_date");--> statement-breakpoint
CREATE INDEX "tenant_usages_tenant_id_idx" ON "tenant_usages" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "badges_slug_idx" ON "badges" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "learner_badges_learner_id_idx" ON "learner_badges" USING btree ("learner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "learner_badges_compound_idx" ON "learner_badges" USING btree ("learner_id","badge_id");--> statement-breakpoint
CREATE INDEX "learner_quests_learner_id_idx" ON "learner_quests" USING btree ("learner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "learner_quests_compound_idx" ON "learner_quests" USING btree ("learner_id","quest_id");--> statement-breakpoint
CREATE UNIQUE INDEX "learner_xp_learner_id_idx" ON "learner_xp" USING btree ("learner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "quests_slug_idx" ON "quests" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "xp_events_learner_id_idx" ON "xp_events" USING btree ("learner_id");--> statement-breakpoint
CREATE INDEX "xp_events_learner_id_created_at_idx" ON "xp_events" USING btree ("learner_id","created_at");--> statement-breakpoint
CREATE INDEX "functional_milestones_domain_idx" ON "functional_milestones" USING btree ("domain");--> statement-breakpoint
CREATE INDEX "functional_milestones_order_idx" ON "functional_milestones" USING btree ("domain","order_index");--> statement-breakpoint
CREATE INDEX "learner_milestones_learner_id_idx" ON "learner_milestones" USING btree ("learner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "learner_milestones_compound_idx" ON "learner_milestones" USING btree ("learner_id","milestone_id");--> statement-breakpoint
CREATE INDEX "homework_assignments_learner_id_idx" ON "homework_assignments" USING btree ("learner_id");--> statement-breakpoint
CREATE INDEX "homework_assignments_status_idx" ON "homework_assignments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "homework_sessions_assignment_id_idx" ON "homework_sessions" USING btree ("homework_assignment_id");--> statement-breakpoint
CREATE INDEX "homework_sessions_learner_id_idx" ON "homework_sessions" USING btree ("learner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_provider_compound_idx" ON "accounts" USING btree ("provider_id","provider_account_id");--> statement-breakpoint
CREATE INDEX "accounts_user_id_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_token_idx" ON "sessions" USING btree ("token");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tenants_slug_idx" ON "tenants" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_tenant_id_idx" ON "users" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "iep_documents_learner_id_idx" ON "iep_documents" USING btree ("learner_id");--> statement-breakpoint
CREATE INDEX "iep_goals_learner_id_idx" ON "iep_goals" USING btree ("learner_id");--> statement-breakpoint
CREATE INDEX "iep_goals_status_idx" ON "iep_goals" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "learner_caregivers_compound_idx" ON "learner_caregivers" USING btree ("learner_id","caregiver_user_id");--> statement-breakpoint
CREATE INDEX "learner_caregivers_learner_id_idx" ON "learner_caregivers" USING btree ("learner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "learner_teachers_compound_idx" ON "learner_teachers" USING btree ("learner_id","teacher_user_id");--> statement-breakpoint
CREATE INDEX "learner_teachers_learner_id_idx" ON "learner_teachers" USING btree ("learner_id");--> statement-breakpoint
CREATE INDEX "learners_tenant_id_idx" ON "learners" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "learners_parent_id_idx" ON "learners" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "learners_user_id_idx" ON "learners" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "recommendations_learner_id_idx" ON "recommendations" USING btree ("learner_id");--> statement-breakpoint
CREATE INDEX "recommendations_brain_state_id_idx" ON "recommendations" USING btree ("brain_state_id");--> statement-breakpoint
CREATE INDEX "recommendations_status_idx" ON "recommendations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "recommendations_type_idx" ON "recommendations" USING btree ("type");--> statement-breakpoint
CREATE INDEX "tutor_sessions_learner_id_idx" ON "tutor_sessions" USING btree ("learner_id");--> statement-breakpoint
CREATE INDEX "tutor_sessions_started_at_idx" ON "tutor_sessions" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "tutor_subscriptions_learner_id_idx" ON "tutor_subscriptions" USING btree ("learner_id");--> statement-breakpoint
CREATE INDEX "tutor_subscriptions_tenant_id_idx" ON "tutor_subscriptions" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "tutor_subscriptions_status_idx" ON "tutor_subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "learning_sessions_learner_id_idx" ON "learning_sessions" USING btree ("learner_id");--> statement-breakpoint
CREATE INDEX "learning_sessions_learner_id_created_at_idx" ON "learning_sessions" USING btree ("learner_id","created_at");--> statement-breakpoint
CREATE INDEX "learning_sessions_subject_idx" ON "learning_sessions" USING btree ("subject");
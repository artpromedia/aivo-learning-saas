-- Status Page Migration
-- Creates enums, tables, and indexes for the status-page feature

BEGIN;

-- ─── Enums ─────────────────────────────────────────────────────────────────────

CREATE TYPE "service_status" AS ENUM ('OPERATIONAL', 'DEGRADED', 'PARTIAL_OUTAGE', 'MAJOR_OUTAGE');
CREATE TYPE "incident_status" AS ENUM ('INVESTIGATING', 'IDENTIFIED', 'MONITORING', 'RESOLVED');
CREATE TYPE "incident_impact" AS ENUM ('NONE', 'MINOR', 'MAJOR', 'CRITICAL');
CREATE TYPE "maintenance_status" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- ─── Monitored Services ────────────────────────────────────────────────────────

CREATE TABLE "monitored_services" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(128) NOT NULL UNIQUE,
  "display_name" varchar(255) NOT NULL,
  "description" text,
  "group_name" varchar(64) NOT NULL,
  "health_endpoint" varchar(512) NOT NULL DEFAULT '/health',
  "port" integer NOT NULL,
  "is_critical" boolean NOT NULL DEFAULT false,
  "display_order" integer NOT NULL DEFAULT 0,
  "is_enabled" boolean NOT NULL DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX "monitored_services_group_name_idx" ON "monitored_services" ("group_name");
CREATE INDEX "monitored_services_display_order_idx" ON "monitored_services" ("display_order");

-- ─── Service Checks ────────────────────────────────────────────────────────────

CREATE TABLE "service_checks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "service_id" uuid NOT NULL REFERENCES "monitored_services"("id") ON DELETE CASCADE,
  "status" "service_status" NOT NULL,
  "response_time_ms" integer,
  "checked_at" timestamp with time zone NOT NULL DEFAULT now(),
  "error_message" text
);

CREATE INDEX "service_checks_service_id_idx" ON "service_checks" ("service_id");
CREATE INDEX "service_checks_checked_at_idx" ON "service_checks" ("checked_at");

-- ─── Incidents ─────────────────────────────────────────────────────────────────

CREATE TABLE "incidents" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" varchar(512) NOT NULL,
  "status" "incident_status" NOT NULL DEFAULT 'INVESTIGATING',
  "impact" "incident_impact" NOT NULL DEFAULT 'NONE',
  "affected_services" uuid[] NOT NULL DEFAULT '{}',
  "message" text NOT NULL,
  "alert_fingerprint" varchar(255),
  "created_by" uuid,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  "resolved_at" timestamp with time zone
);

CREATE INDEX "incidents_status_idx" ON "incidents" ("status");
CREATE INDEX "incidents_created_at_idx" ON "incidents" ("created_at");
CREATE INDEX "incidents_alert_fingerprint_idx" ON "incidents" ("alert_fingerprint");

-- ─── Incident Updates ──────────────────────────────────────────────────────────

CREATE TABLE "incident_updates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "incident_id" uuid NOT NULL REFERENCES "incidents"("id") ON DELETE CASCADE,
  "status" "incident_status" NOT NULL,
  "message" text NOT NULL,
  "created_by" uuid,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX "incident_updates_incident_id_idx" ON "incident_updates" ("incident_id");
CREATE INDEX "incident_updates_created_at_idx" ON "incident_updates" ("created_at");

-- ─── Maintenance Windows ───────────────────────────────────────────────────────

CREATE TABLE "maintenance_windows" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" varchar(512) NOT NULL,
  "description" text,
  "affected_services" uuid[] NOT NULL DEFAULT '{}',
  "scheduled_start" timestamp with time zone NOT NULL,
  "scheduled_end" timestamp with time zone NOT NULL,
  "status" "maintenance_status" NOT NULL DEFAULT 'SCHEDULED',
  "created_by" uuid,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX "maintenance_windows_status_idx" ON "maintenance_windows" ("status");
CREATE INDEX "maintenance_windows_scheduled_start_idx" ON "maintenance_windows" ("scheduled_start");

-- ─── Uptime Daily ──────────────────────────────────────────────────────────────

CREATE TABLE "uptime_daily" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "service_id" uuid NOT NULL REFERENCES "monitored_services"("id") ON DELETE CASCADE,
  "date" date NOT NULL,
  "uptime_percentage" decimal(6,3) NOT NULL,
  "total_checks" integer NOT NULL DEFAULT 0,
  "successful_checks" integer NOT NULL DEFAULT 0,
  "avg_response_time_ms" integer,
  "p50_response_time_ms" integer,
  "p95_response_time_ms" integer,
  "p99_response_time_ms" integer
);

CREATE UNIQUE INDEX "uptime_daily_service_date_idx" ON "uptime_daily" ("service_id", "date");
CREATE INDEX "uptime_daily_date_idx" ON "uptime_daily" ("date");

-- ─── Grant permissions to aivo_app ─────────────────────────────────────────────

GRANT ALL ON TABLE "monitored_services" TO "aivo_app";
GRANT ALL ON TABLE "service_checks" TO "aivo_app";
GRANT ALL ON TABLE "incidents" TO "aivo_app";
GRANT ALL ON TABLE "incident_updates" TO "aivo_app";
GRANT ALL ON TABLE "maintenance_windows" TO "aivo_app";
GRANT ALL ON TABLE "uptime_daily" TO "aivo_app";

COMMIT;

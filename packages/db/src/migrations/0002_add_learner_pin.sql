ALTER TABLE "learners" ADD COLUMN "pin_hash" varchar(255);
ALTER TABLE "learners" ADD COLUMN "pin_set_at" timestamp with time zone;

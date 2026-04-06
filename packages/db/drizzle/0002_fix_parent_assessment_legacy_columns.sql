-- Fix legacy columns on parent_assessments that may have NOT NULL constraints.
-- These columns are not tracked by Drizzle but exist in some environments from
-- the earlier platform schema. Making them nullable prevents insert failures.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parent_assessments' AND column_name = 'district_id') THEN
    ALTER TABLE parent_assessments ALTER COLUMN district_id DROP NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parent_assessments' AND column_name = 'child_id') THEN
    ALTER TABLE parent_assessments ALTER COLUMN child_id DROP NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parent_assessments' AND column_name = 'status') THEN
    ALTER TABLE parent_assessments ALTER COLUMN status DROP NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parent_assessments' AND column_name = 'assessment_mode') THEN
    ALTER TABLE parent_assessments ALTER COLUMN assessment_mode DROP NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parent_assessments' AND column_name = 'has_iep') THEN
    ALTER TABLE parent_assessments ALTER COLUMN has_iep DROP NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parent_assessments' AND column_name = 'has_504') THEN
    ALTER TABLE parent_assessments ALTER COLUMN has_504 DROP NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parent_assessments' AND column_name = 'has_other_disability') THEN
    ALTER TABLE parent_assessments ALTER COLUMN has_other_disability DROP NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parent_assessments' AND column_name = 'preferred_language') THEN
    ALTER TABLE parent_assessments ALTER COLUMN preferred_language DROP NOT NULL;
  END IF;
END $$;

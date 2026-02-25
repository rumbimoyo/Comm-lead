-- =====================================================
-- COHORT LECTURERS TABLE
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- Allows assigning lecturers to specific cohorts
-- =====================================================

-- Create cohort_lecturers table
CREATE TABLE IF NOT EXISTS cohort_lecturers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  lecturer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_lead BOOLEAN DEFAULT FALSE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cohort_id, lecturer_id)
);

-- Enable RLS
ALTER TABLE cohort_lecturers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "cohort_lecturers_select_all" ON cohort_lecturers;
DROP POLICY IF EXISTS "cohort_lecturers_admin_manage" ON cohort_lecturers;

-- Policies
CREATE POLICY "cohort_lecturers_select_all"
  ON cohort_lecturers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "cohort_lecturers_admin_manage"
  ON cohort_lecturers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_cohort_lecturers_cohort ON cohort_lecturers(cohort_id);
CREATE INDEX IF NOT EXISTS idx_cohort_lecturers_lecturer ON cohort_lecturers(lecturer_id);

-- Verify
DO $$
BEGIN
  RAISE NOTICE '✅ cohort_lecturers table created successfully!';
END $$;
